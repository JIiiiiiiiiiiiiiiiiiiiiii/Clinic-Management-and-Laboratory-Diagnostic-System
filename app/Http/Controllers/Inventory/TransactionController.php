<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryMovement;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = InventoryMovement::with(['inventoryItem', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('admin/inventory/transactions/index', [
            'transactions' => $transactions,
        ]);
    }

    public function create()
    {
        $inventoryItems = InventoryItem::orderBy('item_name')->get();
        
        return Inertia::render('admin/inventory/transactions/create', [
            'inventoryItems' => $inventoryItems,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'inventory_id' => 'required|exists:inventory_items,id',
            'movement_type' => 'required|in:IN,OUT',
            'quantity' => 'required|integer|min:1',
            'remarks' => 'nullable|string|max:255',
        ]);

        $inventoryItem = InventoryItem::findOrFail($request->inventory_id);

        // Create the movement record
        $movement = InventoryMovement::create([
            'inventory_id' => $request->inventory_id,
            'movement_type' => $request->movement_type,
            'quantity' => $request->quantity,
            'remarks' => $request->remarks,
            'created_by' => auth()->user()->name ?? 'System',
        ]);

        // Update inventory stock
        if ($request->movement_type === 'IN') {
            $inventoryItem->increment('stock', $request->quantity);
        } else {
            $inventoryItem->decrement('stock', $request->quantity);
        }

        $inventoryItem->updateStatus();

        return redirect()->route('admin.inventory.transactions.index')
            ->with('success', 'Transaction created successfully!');
    }

    public function show($id)
    {
        $transaction = InventoryMovement::with(['inventoryItem', 'user'])
            ->findOrFail($id);
        
        return Inertia::render('admin/inventory/transactions/show', [
            'transaction' => $transaction,
        ]);
    }

    public function approve($id)
    {
        $transaction = InventoryMovement::findOrFail($id);
        
        // Mark as approved (you might want to add an 'approved' field to the model)
        $transaction->update(['status' => 'approved']);
        
        return redirect()->route('admin.inventory.transactions.index')
            ->with('success', 'Transaction approved successfully!');
    }

    public function reject($id)
    {
        $transaction = InventoryMovement::findOrFail($id);
        
        // Mark as rejected
        $transaction->update(['status' => 'rejected']);
        
        return redirect()->route('admin.inventory.transactions.index')
            ->with('success', 'Transaction rejected successfully!');
    }

    public function destroy($id)
    {
        $transaction = InventoryMovement::findOrFail($id);
        $transaction->delete();

        return redirect()->route('admin.inventory.transactions.index')
            ->with('success', 'Transaction deleted successfully!');
    }
}
