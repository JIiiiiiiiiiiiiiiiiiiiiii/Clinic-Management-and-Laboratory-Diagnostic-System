<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Supply\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index()
    {
        $suppliers = Supplier::orderBy('name')
            ->paginate(20);

        return Inertia::render('admin/inventory/suppliers/index', [
            'suppliers' => $suppliers,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/inventory/suppliers/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'contact_person' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:100',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        Supplier::create([
            'name' => $request->name,
            'contact_person' => $request->contact_person,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'notes' => $request->notes,
            'is_active' => $request->is_active ?? true,
        ]);

        return redirect()->route('admin.inventory.suppliers.index')
            ->with('success', 'Supplier created successfully!');
    }

    public function show($id)
    {
        $supplier = Supplier::findOrFail($id);
        
        return Inertia::render('admin/inventory/suppliers/show', [
            'supplier' => $supplier,
        ]);
    }

    public function edit($id)
    {
        $supplier = Supplier::findOrFail($id);
        
        return Inertia::render('admin/inventory/suppliers/edit', [
            'supplier' => $supplier,
        ]);
    }

    public function update(Request $request, $id)
    {
        $supplier = Supplier::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:100',
            'contact_person' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:100',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $supplier->update([
            'name' => $request->name,
            'contact_person' => $request->contact_person,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'notes' => $request->notes,
            'is_active' => $request->is_active ?? true,
        ]);

        return redirect()->route('admin.inventory.suppliers.index')
            ->with('success', 'Supplier updated successfully!');
    }

    public function destroy($id)
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->delete();

        return redirect()->route('admin.inventory.suppliers.index')
            ->with('success', 'Supplier deleted successfully!');
    }
}
