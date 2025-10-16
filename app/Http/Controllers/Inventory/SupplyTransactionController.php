<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Supply\Supply;
use App\Models\Supply\SupplyTransaction;
use App\Models\Supply\SupplyStockLevel;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class SupplyTransactionController extends Controller
{
    public function index()
    {
        $transactions = SupplyTransaction::with(['product', 'user', 'approvedBy', 'chargedTo'])
            ->orderBy('transaction_date', 'desc')
            ->paginate(20);

        return Inertia::render('admin/inventory/supply-transactions/index', [
            'transactions' => $transactions,
        ]);
    }

    public function create()
    {
        $supplies = Supply::active()->orderBy('name')->get();
        $users = User::whereIn('role', ['doctor', 'nurse', 'med_tech'])->orderBy('name')->get();
        
        return Inertia::render('admin/inventory/supply-transactions/create', [
            'supplies' => $supplies,
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:supplies,id',
            'type' => 'required|in:in,out',
            'subtype' => 'required|in:purchase,return,adjustment,consumed,used,rejected,expired,damaged',
            'quantity' => 'required|integer|min:1',
            'unit_cost' => 'required|numeric|min:0',
            'lot_number' => 'nullable|string|max:100',
            'expiry_date' => 'nullable|date|after:today',
            'date_opened' => 'nullable|date',
            'notes' => 'nullable|string|max:500',
            'reference_number' => 'nullable|string|max:100',
            'transaction_date' => 'required|date',
            'usage_location' => 'nullable|string|max:100',
            'usage_purpose' => 'nullable|string|max:500',
            'charged_to' => 'nullable|exists:users,id',
        ]);

        $supply = Supply::findOrFail($request->product_id);

        // Check if it's an outgoing transaction and if there's enough stock
        if ($request->type === 'out') {
            $availableStock = $supply->available_stock;
            if ($availableStock < $request->quantity) {
                return back()->withErrors(['quantity' => 'Insufficient stock. Available: ' . $availableStock]);
            }
        }

        $transaction = SupplyTransaction::create([
            'product_id' => $request->product_id,
            'user_id' => auth()->id(),
            'type' => $request->type,
            'subtype' => $request->subtype,
            'quantity' => $request->quantity,
            'unit_cost' => $request->unit_cost,
            'total_cost' => $request->quantity * $request->unit_cost,
            'lot_number' => $request->lot_number,
            'expiry_date' => $request->expiry_date,
            'date_opened' => $request->date_opened,
            'notes' => $request->notes,
            'reference_number' => $request->reference_number,
            'transaction_date' => $request->transaction_date,
            'transaction_time' => now(),
            'remaining_quantity' => $request->quantity,
            'usage_location' => $request->usage_location,
            'usage_purpose' => $request->usage_purpose,
            'charged_to' => $request->charged_to,
        ]);

        // Update stock levels
        $this->updateStockLevels($supply, $transaction);

        return redirect()->route('admin.inventory.supply-transactions.index')
            ->with('success', 'Transaction created successfully!');
    }

    public function show($id)
    {
        $transaction = SupplyTransaction::with(['product', 'user', 'approvedBy', 'chargedTo'])
            ->findOrFail($id);
        
        return Inertia::render('admin/inventory/supply-transactions/show', [
            'transaction' => $transaction,
        ]);
    }

    public function approve($id)
    {
        $transaction = SupplyTransaction::findOrFail($id);
        
        if ($transaction->approval_status !== 'pending') {
            return back()->withErrors(['approval' => 'Transaction has already been processed.']);
        }

        $transaction->approve(auth()->id());

        return redirect()->route('admin.inventory.supply-transactions.index')
            ->with('success', 'Transaction approved successfully!');
    }

    public function reject(Request $request, $id)
    {
        $transaction = SupplyTransaction::findOrFail($id);
        
        if ($transaction->approval_status !== 'pending') {
            return back()->withErrors(['approval' => 'Transaction has already been processed.']);
        }

        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $transaction->reject(auth()->id(), $request->reason);

        return redirect()->route('admin.inventory.supply-transactions.index')
            ->with('success', 'Transaction rejected successfully!');
    }

    public function verify($id)
    {
        $transaction = SupplyTransaction::findOrFail($id);
        $transaction->markAsVerified();

        return redirect()->route('admin.inventory.supply-transactions.index')
            ->with('success', 'Transaction verified successfully!');
    }

    public function getPendingApprovals()
    {
        $pendingTransactions = SupplyTransaction::with(['product', 'user'])
            ->pendingApproval()
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($pendingTransactions);
    }

    public function getUsedSupplies(Request $request)
    {
        $startDate = $request->get('start_date', Carbon::now()->subMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->format('Y-m-d'));

        $usedSupplies = SupplyTransaction::getUsedSupplies($startDate, $endDate);

        return response()->json($usedSupplies);
    }

    public function getRejectedSupplies(Request $request)
    {
        $startDate = $request->get('start_date', Carbon::now()->subMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->format('Y-m-d'));

        $rejectedSupplies = SupplyTransaction::getRejectedSupplies($startDate, $endDate);

        return response()->json($rejectedSupplies);
    }

    private function updateStockLevels(Supply $supply, SupplyTransaction $transaction)
    {
        if ($transaction->type === 'in') {
            // Find or create stock level for this lot/expiry combination
            $stockLevel = SupplyStockLevel::firstOrCreate([
                'product_id' => $supply->id,
                'lot_number' => $transaction->lot_number,
                'expiry_date' => $transaction->expiry_date,
            ]);

            $stockLevel->updateStock($transaction->quantity, $transaction->unit_cost);
        } else {
            // For outgoing transactions, reduce stock using FIFO
            $remainingQuantity = $transaction->quantity;
            $stockLevels = SupplyStockLevel::where('product_id', $supply->id)
                ->where('current_stock', '>', 0)
                ->orderBy('expiry_date', 'asc')
                ->get();

            foreach ($stockLevels as $stockLevel) {
                if ($remainingQuantity <= 0) break;

                $availableFromThisLot = min($remainingQuantity, $stockLevel->current_stock);
                $stockLevel->updateStock(-$availableFromThisLot);
                $remainingQuantity -= $availableFromThisLot;
            }

            if ($remainingQuantity > 0) {
                // If we couldn't fulfill the full quantity, log this
                $transaction->update(['remaining_quantity' => $remainingQuantity]);
            }
        }
    }
}
