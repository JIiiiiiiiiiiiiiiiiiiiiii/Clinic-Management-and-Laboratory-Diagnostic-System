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
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        HmoProvider::create($request->all());

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
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $hmoProvider->update($request->all());

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

        $hmoProvider->update([
            'is_active' => $request->is_active,
        ]);

        return back()->with('success', 'HMO provider status updated successfully.');
    }
}
