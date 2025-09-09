<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Supply\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('contact_person', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        // Filter by active status
        if ($request->has('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        $suppliers = $query->orderBy('name')->paginate(20);

        return Inertia::render('admin/inventory/suppliers/index', [
            'suppliers' => $suppliers,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/inventory/suppliers/create');
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'contact_person' => 'nullable|string|max:255',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:255',
                'address' => 'nullable|string',
                'tax_id' => 'nullable|string|max:255',
                'notes' => 'nullable|string',
                'is_active' => 'boolean',
            ]);

            $supplier = Supplier::create($validated);

            return redirect()->route('admin.inventory.suppliers.index')
                ->with('success', 'Supplier created successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to create supplier: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function show(Supplier $supplier)
    {
        $supplier->load(['transactions' => function ($query) {
            $query->with(['product', 'user'])->latest()->limit(20);
        }]);

        return Inertia::render('admin/inventory/suppliers/show', [
            'supplier' => $supplier,
        ]);
    }

    public function edit(Supplier $supplier)
    {
        return Inertia::render('admin/inventory/suppliers/edit', [
            'supplier' => $supplier,
        ]);
    }

    public function update(Request $request, Supplier $supplier)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'contact_person' => 'nullable|string|max:255',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:255',
                'address' => 'nullable|string',
                'tax_id' => 'nullable|string|max:255',
                'notes' => 'nullable|string',
                'is_active' => 'boolean',
            ]);

            $supplier->update($validated);

            return redirect()->route('admin.inventory.suppliers.index')
                ->with('success', 'Supplier updated successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update supplier: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(Supplier $supplier)
    {
        try {
            // Check if supplier has transactions
            if ($supplier->transactions()->count() > 0) {
                return redirect()->back()
                    ->with('error', 'Cannot delete supplier with existing transactions. Please deactivate it instead.');
            }

            $supplier->delete();

            return redirect()->route('admin.inventory.suppliers.index')
                ->with('success', 'Supplier deleted successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete supplier: ' . $e->getMessage());
        }
    }
}
