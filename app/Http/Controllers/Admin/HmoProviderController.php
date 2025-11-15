<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HmoProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HmoProviderController extends Controller
{
    public function index(Request $request)
    {
        $query = HmoProvider::query();

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $hmoProviders = $query->orderBy('name')->get();

        return Inertia::render('admin/billing/hmo-providers/index', [
            'hmoProviders' => $hmoProviders,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/billing/hmo-providers/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:hmo_providers,code',
            'description' => 'nullable|string',
            'contact_person' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'status' => 'nullable|in:active,inactive,suspended',
            'is_active' => 'nullable|boolean', // Virtual attribute - will be converted to status
        ]);

        $data = $request->all();
        
        // Convert is_active to status if provided (for backward compatibility)
        if (isset($data['is_active'])) {
            $data['status'] = $data['is_active'] ? 'active' : 'inactive';
            unset($data['is_active']);
        } elseif (!isset($data['status'])) {
            // Default to 'active' if neither is provided
            $data['status'] = 'active';
        }

        HmoProvider::create($data);

        return redirect()->route('admin.billing.hmo-providers.index')
            ->with('success', 'HMO provider created successfully.');
    }

    public function show(HmoProvider $hmoProvider)
    {
        $hmoProvider->load(['billingTransactions.patient', 'claims']);
        
        return Inertia::render('admin/billing/hmo-providers/show', [
            'hmoProvider' => $hmoProvider,
        ]);
    }

    public function edit(HmoProvider $hmoProvider)
    {
        return Inertia::render('admin/billing/hmo-providers/edit', [
            'hmoProvider' => $hmoProvider,
        ]);
    }

    public function update(Request $request, HmoProvider $hmoProvider)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:hmo_providers,code,' . $hmoProvider->id,
            'description' => 'nullable|string',
            'contact_person' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'status' => 'nullable|in:active,inactive,suspended',
            'is_active' => 'nullable|boolean', // Virtual attribute - will be converted to status
        ]);

        $data = $request->all();
        
        // Convert is_active to status if provided (for backward compatibility)
        if (isset($data['is_active'])) {
            $data['status'] = $data['is_active'] ? 'active' : 'inactive';
            unset($data['is_active']);
        }

        $hmoProvider->update($data);

        return redirect()->route('admin.billing.hmo-providers.index')
            ->with('success', 'HMO provider updated successfully.');
    }

    public function destroy(HmoProvider $hmoProvider)
    {
        // Check if provider has any billing transactions
        if ($hmoProvider->billingTransactions()->count() > 0) {
            return back()->withErrors(['error' => 'Cannot delete HMO provider with existing billing transactions.']);
        }

        $hmoProvider->delete();

        return redirect()->route('admin.billing.hmo-providers.index')
            ->with('success', 'HMO provider deleted successfully.');
    }

    public function toggleStatus(Request $request, HmoProvider $hmoProvider)
    {
        $request->validate([
            'is_active' => 'required|boolean',
        ]);

        // Convert is_active to status (database column)
        $hmoProvider->update([
            'status' => $request->is_active ? 'active' : 'inactive',
        ]);

        return back()->with('success', 'HMO provider status updated successfully.');
    }
}
