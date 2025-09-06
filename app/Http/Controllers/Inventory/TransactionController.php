<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Inventory\Product;
use App\Models\Inventory\Transaction;
use App\Models\Inventory\StockLevel;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with(['product', 'user', 'approvedBy', 'chargedTo']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('product', function ($productQuery) use ($request) {
                    $productQuery->where('name', 'like', "%{$request->search}%")
                                ->orWhere('code', 'like', "%{$request->search}%");
                })
                ->orWhere('lot_number', 'like', "%{$request->search}%")
                ->orWhere('reference_number', 'like', "%{$request->search}%");
            });
        }

        // Filter by type
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        // Filter by approval status
        if ($request->has('approval_status') && $request->approval_status) {
            $query->where('approval_status', $request->approval_status);
        }

        // Filter by date range
        if ($request->has('date_from') && $request->date_from) {
            $query->where('transaction_date', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->where('transaction_date', '<=', $request->date_to);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')
                            ->orderBy('created_at', 'desc')
                            ->paginate(20);

        return Inertia::render('admin/inventory/transactions/index', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'type', 'approval_status', 'date_from', 'date_to']),
        ]);
    }

    public function create(Request $request)
    {
        $products = Product::active()->orderBy('name')->get();
        $users = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/inventory/transactions/create', [
            'products' => $products,
            'users' => $users,
            'type' => $request->get('type', 'out'), // Default to outgoing transactions
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'product_id' => 'required|exists:inventory_products,id',
                'type' => 'required|in:in,out,adjustment',
                'subtype' => 'required|string',
                'quantity' => 'required|integer',
                'unit_cost' => 'nullable|numeric|min:0',
                'lot_number' => 'nullable|string|max:255',
                'expiry_date' => 'nullable|date',
                'date_opened' => 'nullable|date',
                'notes' => 'nullable|string',
                'reference_number' => 'nullable|string|max:255',
                'transaction_date' => 'required|date',
                'transaction_time' => 'nullable|date_format:H:i',
                'usage_location' => 'nullable|string|max:255',
                'usage_purpose' => 'nullable|string',
                'charged_to' => 'nullable|exists:users,id',
            ]);

            // Set user_id to current user
            $validated['user_id'] = auth()->id();

            // Calculate total cost
            if ($validated['unit_cost']) {
                $validated['total_cost'] = $validated['quantity'] * $validated['unit_cost'];
            }

            // For outgoing transactions, make quantity negative
            if ($validated['type'] === 'out') {
                $validated['quantity'] = -abs($validated['quantity']);
                $validated['total_cost'] = $validated['total_cost'] ? -abs($validated['total_cost']) : null;
            }

            // Set approval status based on type
            if ($validated['type'] === 'in') {
                $validated['approval_status'] = 'approved'; // Incoming supplies are auto-approved
                $validated['approved_by'] = auth()->id();
                $validated['approved_at'] = now();
            } else {
                $validated['approval_status'] = 'pending'; // Outgoing transactions need approval
            }

            $transaction = Transaction::create($validated);

            // Update stock levels
            $this->updateStockLevels($transaction);

            return redirect()->route('admin.inventory.transactions.index')
                ->with('success', 'Transaction created successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to create transaction: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function show(Transaction $transaction)
    {
        $transaction->load(['product', 'user', 'approvedBy', 'chargedTo']);

        return Inertia::render('admin/inventory/transactions/show', [
            'transaction' => $transaction,
        ]);
    }

    public function approve(Transaction $transaction)
    {
        try {
            $transaction->approve(auth()->id());

            // Update stock levels if not already done
            if (!$transaction->is_verified) {
                $this->updateStockLevels($transaction);
                $transaction->markAsVerified();
            }

            return redirect()->back()
                ->with('success', 'Transaction approved successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to approve transaction: ' . $e->getMessage());
        }
    }

    public function reject(Request $request, Transaction $transaction)
    {
        try {
            $validated = $request->validate([
                'reason' => 'required|string|max:500',
            ]);

            $transaction->reject(auth()->id(), $validated['reason']);

            return redirect()->back()
                ->with('success', 'Transaction rejected successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to reject transaction: ' . $e->getMessage());
        }
    }

    public function destroy(Transaction $transaction)
    {
        try {
            // Only allow deletion of pending transactions
            if ($transaction->approval_status !== 'pending') {
                return redirect()->back()
                    ->with('error', 'Only pending transactions can be deleted.');
            }

            $transaction->delete();

            return redirect()->route('admin.inventory.transactions.index')
                ->with('success', 'Transaction deleted successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete transaction: ' . $e->getMessage());
        }
    }

    private function updateStockLevels(Transaction $transaction)
    {
        $product = $transaction->product;

        // Find or create stock level for this product and lot
        $stockLevel = StockLevel::where('product_id', $product->id)
            ->where('lot_number', $transaction->lot_number)
            ->where('expiry_date', $transaction->expiry_date)
            ->first();

        if (!$stockLevel) {
            $stockLevel = StockLevel::create([
                'product_id' => $product->id,
                'lot_number' => $transaction->lot_number,
                'expiry_date' => $transaction->expiry_date,
                'current_stock' => 0,
                'reserved_stock' => 0,
                'available_stock' => 0,
                'average_cost' => $transaction->unit_cost ?? 0,
                'total_value' => 0,
                'is_expired' => false,
                'is_near_expiry' => false,
                'last_updated' => now(),
            ]);
        }

        // Update stock based on transaction
        $stockLevel->updateStock($transaction->quantity, $transaction->unit_cost);
    }
}
