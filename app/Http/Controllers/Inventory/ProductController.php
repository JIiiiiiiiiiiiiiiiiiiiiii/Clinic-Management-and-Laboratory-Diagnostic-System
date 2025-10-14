<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $products = InventoryItem::with('movements')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('admin/inventory/products/index', [
            'products' => $products,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/inventory/products/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'item_name' => 'required|string|max:100',
            'item_code' => 'required|string|max:50|unique:inventory_items,item_code',
            'category' => 'required|string|max:50',
            'unit' => 'required|string|max:20',
            'assigned_to' => 'required|in:Doctor & Nurse,Med Tech',
            'stock' => 'required|integer|min:0',
            'low_stock_alert' => 'integer|min:0',
        ]);

        $product = InventoryItem::create([
            'item_name' => $request->item_name,
            'item_code' => $request->item_code,
            'category' => $request->category,
            'unit' => $request->unit,
            'assigned_to' => $request->assigned_to,
            'stock' => $request->stock,
            'low_stock_alert' => $request->low_stock_alert ?? 10,
        ]);

        $product->updateStatus();

        return redirect()->route('admin.inventory.products.index')
            ->with('success', 'Product created successfully!');
    }

    public function show($id)
    {
        $product = InventoryItem::with('movements')->findOrFail($id);
        
        return Inertia::render('admin/inventory/products/show', [
            'product' => $product,
        ]);
    }

    public function edit($id)
    {
        $product = InventoryItem::findOrFail($id);
        
        return Inertia::render('admin/inventory/products/edit', [
            'product' => $product,
        ]);
    }

    public function update(Request $request, $id)
    {
        $product = InventoryItem::findOrFail($id);

        $request->validate([
            'item_name' => 'required|string|max:100',
            'item_code' => 'required|string|max:50|unique:inventory_items,item_code,' . $id,
            'category' => 'required|string|max:50',
            'unit' => 'required|string|max:20',
            'assigned_to' => 'required|in:Doctor & Nurse,Med Tech',
            'low_stock_alert' => 'integer|min:0',
        ]);

        $product->update([
            'item_name' => $request->item_name,
            'item_code' => $request->item_code,
            'category' => $request->category,
            'unit' => $request->unit,
            'assigned_to' => $request->assigned_to,
            'low_stock_alert' => $request->low_stock_alert ?? 10,
        ]);

        $product->updateStatus();

        return redirect()->route('admin.inventory.products.index')
            ->with('success', 'Product updated successfully!');
    }

    public function destroy($id)
    {
        $product = InventoryItem::findOrFail($id);
        $product->delete();

        return redirect()->route('admin.inventory.products.index')
            ->with('success', 'Product deleted successfully!');
    }
}
