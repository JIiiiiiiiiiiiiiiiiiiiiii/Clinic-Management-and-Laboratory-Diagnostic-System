<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Supply\Supply;
use App\Models\Supply\SupplyStockLevel;
use App\Models\Supply\SupplyTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class SupplyController extends Controller
{
    public function index()
    {
        $supplies = Supply::with(['stockLevels'])
            ->orderBy('name')
            ->paginate(20);

        return Inertia::render('admin/inventory/supplies/index', [
            'supplies' => $supplies,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/inventory/supplies/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:supplies,code',
            'description' => 'nullable|string',
            'category' => 'required|string|max:100',
            'unit_of_measure' => 'required|string|max:50',
            'unit_cost' => 'required|numeric|min:0',
            'minimum_stock_level' => 'required|integer|min:0',
            'maximum_stock_level' => 'required|integer|min:0',
            'requires_lot_tracking' => 'boolean',
            'requires_expiry_tracking' => 'boolean',
        ]);

        $supply = Supply::create([
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
            'category' => $request->category,
            'unit_of_measure' => $request->unit_of_measure,
            'unit_cost' => $request->unit_cost,
            'minimum_stock_level' => $request->minimum_stock_level,
            'maximum_stock_level' => $request->maximum_stock_level,
            'requires_lot_tracking' => $request->requires_lot_tracking ?? false,
            'requires_expiry_tracking' => $request->requires_expiry_tracking ?? false,
        ]);

        return redirect()->route('admin.inventory.supplies.index')
            ->with('success', 'Supply created successfully!');
    }

    public function show($id)
    {
        $supply = Supply::with(['stockLevels', 'transactions.user'])
            ->findOrFail($id);
        
        return Inertia::render('admin/inventory/supplies/show', [
            'supply' => $supply,
        ]);
    }

    public function edit($id)
    {
        $supply = Supply::findOrFail($id);
        
        return Inertia::render('admin/inventory/supplies/edit', [
            'supply' => $supply,
        ]);
    }

    public function update(Request $request, $id)
    {
        $supply = Supply::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:supplies,code,' . $id,
            'description' => 'nullable|string',
            'category' => 'required|string|max:100',
            'unit_of_measure' => 'required|string|max:50',
            'unit_cost' => 'required|numeric|min:0',
            'minimum_stock_level' => 'required|integer|min:0',
            'maximum_stock_level' => 'required|integer|min:0',
            'requires_lot_tracking' => 'boolean',
            'requires_expiry_tracking' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $supply->update([
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
            'category' => $request->category,
            'unit_of_measure' => $request->unit_of_measure,
            'unit_cost' => $request->unit_cost,
            'minimum_stock_level' => $request->minimum_stock_level,
            'maximum_stock_level' => $request->maximum_stock_level,
            'requires_lot_tracking' => $request->requires_lot_tracking ?? false,
            'requires_expiry_tracking' => $request->requires_expiry_tracking ?? false,
            'is_active' => $request->is_active ?? true,
        ]);

        return redirect()->route('admin.inventory.supplies.index')
            ->with('success', 'Supply updated successfully!');
    }

    public function destroy($id)
    {
        $supply = Supply::findOrFail($id);
        $supply->delete();

        return redirect()->route('admin.inventory.supplies.index')
            ->with('success', 'Supply deleted successfully!');
    }

    public function getStockLevels($id)
    {
        $supply = Supply::findOrFail($id);
        $stockLevels = $supply->stockLevels()
            ->orderBy('expiry_date', 'asc')
            ->get();

        return response()->json($stockLevels);
    }

    public function getTransactions($id)
    {
        $supply = Supply::findOrFail($id);
        $transactions = $supply->transactions()
            ->with(['user', 'approvedBy', 'chargedTo'])
            ->orderBy('transaction_date', 'desc')
            ->paginate(20);

        return response()->json($transactions);
    }

    public function getLowStock()
    {
        $lowStockSupplies = Supply::with(['stockLevels'])
            ->get()
            ->filter(function ($supply) {
                return $supply->current_stock <= $supply->minimum_stock_level;
            });

        return response()->json($lowStockSupplies);
    }

    public function getExpiringSoon()
    {
        $expiringSupplies = SupplyStockLevel::with(['product'])
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '>', now())
            ->where('expiry_date', '<=', now()->addDays(30))
            ->where('current_stock', '>', 0)
            ->get();

        return response()->json($expiringSupplies);
    }
}
