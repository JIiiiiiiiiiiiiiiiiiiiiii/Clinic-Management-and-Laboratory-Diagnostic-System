<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Supply\Supply as Product;
use App\Models\Supply\SupplyStockLevel as StockLevel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['stockLevels'])
            ->withSum('stockLevels as current_stock', 'current_stock')
            ->withSum('stockLevels as available_stock', 'available_stock');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('code', 'like', "%{$request->search}%")
                  ->orWhere('category', 'like', "%{$request->search}%");
            });
        }

        // Filter by category
        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }

        // Filter by stock status
        if ($request->has('stock_status')) {
            switch ($request->stock_status) {
                case 'low_stock':
                    $query->whereHas('stockLevels', function ($q) {
                        $q->whereRaw('supply_stock_levels.current_stock <= supplies.minimum_stock_level')
                          ->where('current_stock', '>', 0);
                    });
                    break;
                case 'out_of_stock':
                    $query->whereDoesntHave('stockLevels', function ($q) {
                        $q->where('current_stock', '>', 0);
                    });
                    break;
                case 'in_stock':
                    $query->whereHas('stockLevels', function ($q) {
                        $q->where('current_stock', '>', 0);
                    });
                    break;
            }
        }

        $products = $query->orderBy('name')->paginate(20);

        // Get categories for filter
        $categories = Product::distinct()->pluck('category')->filter()->sort()->values();

        return Inertia::render('admin/inventory/products/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'stock_status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/inventory/products/create');
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:255|unique:supplies,code',
                'description' => 'nullable|string',
                'category' => 'nullable|string|max:255',
                'unit_of_measure' => 'required|string|max:255',
                'unit_cost' => 'required|numeric|min:0',
                'minimum_stock_level' => 'required|integer|min:0',
                'maximum_stock_level' => 'nullable|integer|min:0',
                'requires_lot_tracking' => 'boolean',
                'requires_expiry_tracking' => 'boolean',
            ]);

            $product = Product::create($validated);

            return redirect()->route('admin.inventory.products.index')
                ->with('success', 'Product created successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to create product: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function show(Product $product)
    {
        $product->load(['stockLevels', 'transactions' => function ($query) {
            $query->with(['user', 'approvedBy', 'chargedTo'])->latest()->limit(10);
        }]);

        return Inertia::render('admin/inventory/products/show', [
            'product' => $product,
        ]);
    }

    public function edit(Product $product)
    {
        return Inertia::render('admin/inventory/products/edit', [
            'product' => $product,
        ]);
    }

    public function update(Request $request, Product $product)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:255|unique:supplies,code,' . $product->id,
                'description' => 'nullable|string',
                'category' => 'nullable|string|max:255',
                'unit_of_measure' => 'required|string|max:255',
                'unit_cost' => 'required|numeric|min:0',
                'minimum_stock_level' => 'required|integer|min:0',
                'maximum_stock_level' => 'nullable|integer|min:0',
                'requires_lot_tracking' => 'boolean',
                'requires_expiry_tracking' => 'boolean',
                'is_active' => 'boolean',
            ]);

            $product->update($validated);

            return redirect()->route('admin.inventory.products.index')
                ->with('success', 'Product updated successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update product: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(Product $product)
    {
        try {
            // Check if product has transactions
            if ($product->transactions()->count() > 0) {
                return redirect()->back()
                    ->with('error', 'Cannot delete product with existing transactions. Please deactivate it instead.');
            }

            $product->delete();

            return redirect()->route('admin.inventory.products.index')
                ->with('success', 'Product deleted successfully!');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete product: ' . $e->getMessage());
        }
    }
}
