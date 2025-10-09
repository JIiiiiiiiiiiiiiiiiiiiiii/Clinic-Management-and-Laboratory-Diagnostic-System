<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Supply\Supply as Product;
use App\Models\Supply\SupplyTransaction as Transaction;
use App\Models\Supply\SupplyStockLevel as StockLevel;
use App\Models\InventoryAlert;
use App\Models\InventoryCategory;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EnhancedInventoryController extends Controller
{
    public function index(): Response
    {
        $analytics = $this->getInventoryAnalytics();
        $alerts = $this->getInventoryAlerts();
        $recentActivity = $this->getRecentActivity();
        
        return Inertia::render('Admin/Inventory/EnhancedIndex', [
            'analytics' => $analytics,
            'alerts' => $alerts,
            'recentActivity' => $recentActivity,
        ]);
    }

    public function getInventoryAnalytics(): array
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        return [
            'overview' => [
                'total_products' => Product::count(),
                'active_products' => Product::active()->count(),
                'total_value' => $this->calculateTotalInventoryValue(),
                'low_stock_items' => StockLevel::getLowStockProducts()->count(),
                'expiring_soon' => StockLevel::getExpiringSoon()->count(),
                'expired_items' => StockLevel::getExpiredStock()->count(),
            ],
            'movement' => [
                'inbound_this_month' => Transaction::where('type', 'in')
                    ->where('transaction_date', '>=', $thisMonth)
                    ->sum('quantity'),
                'outbound_this_month' => Transaction::where('type', 'out')
                    ->where('transaction_date', '>=', $thisMonth)
                    ->sum('quantity'),
                'rejected_this_month' => Transaction::where('subtype', 'rejected')
                    ->where('transaction_date', '>=', $thisMonth)
                    ->sum('quantity'),
                'waste_this_month' => Transaction::where('subtype', 'waste')
                    ->where('transaction_date', '>=', $thisMonth)
                    ->sum('quantity'),
            ],
            'categories' => $this->getCategoryBreakdown(),
            'suppliers' => $this->getSupplierBreakdown(),
            'trends' => $this->getInventoryTrends(),
        ];
    }

    public function getInventoryAlerts(): array
    {
        return [
            'low_stock' => StockLevel::getLowStockProducts()
                ->with('product')
                ->limit(10)
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->product_id,
                        'name' => $item->product->name ?? 'Unknown',
                        'current_stock' => $item->total_stock,
                        'min_level' => $item->min_level,
                        'category' => $item->product->category ?? 'Uncategorized',
                    ];
                }),
            'expiring_soon' => StockLevel::getExpiringSoon()
                ->with('product')
                ->limit(10)
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->product_id,
                        'name' => $item->product->name ?? 'Unknown',
                        'expiry_date' => $item->expiry_date,
                        'days_until_expiry' => Carbon::parse($item->expiry_date)->diffInDays(Carbon::now()),
                        'quantity' => $item->total_stock,
                    ];
                }),
            'expired' => StockLevel::getExpiredStock()
                ->with('product')
                ->limit(10)
                ->get()
                ->map(function ($item) {
                    return [
                        'id' => $item->product_id,
                        'name' => $item->product->name ?? 'Unknown',
                        'expiry_date' => $item->expiry_date,
                        'days_expired' => Carbon::parse($item->expiry_date)->diffInDays(Carbon::now()),
                        'quantity' => $item->total_stock,
                    ];
                }),
        ];
    }

    public function getRecentActivity(): array
    {
        return Transaction::with(['product', 'user', 'approvedBy'])
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'product_name' => $transaction->product->name ?? 'Unknown',
                    'type' => $transaction->type,
                    'subtype' => $transaction->subtype,
                    'quantity' => $transaction->quantity,
                    'user_name' => $transaction->user->name ?? 'Unknown',
                    'transaction_date' => $transaction->transaction_date,
                    'status' => $transaction->status,
                    'notes' => $transaction->notes,
                ];
            });
    }

    public function getDetailedReport(Request $request): Response
    {
        $query = Product::query();

        // Apply filters
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('supplier')) {
            $query->where('supplier_id', $request->supplier);
        }

        if ($request->filled('status')) {
            if ($request->status === 'low_stock') {
                $query->whereHas('stockLevel', function ($q) {
                    $q->whereRaw('total_stock <= min_level');
                });
            } elseif ($request->status === 'expiring') {
                $query->whereHas('stockLevel', function ($q) {
                    $q->where('expiry_date', '<=', Carbon::now()->addDays(30));
                });
            }
        }

        $products = $query->with(['stockLevel', 'supplier', 'transactions' => function ($q) {
            $q->latest()->limit(5);
        }])
        ->orderBy('name')
        ->paginate(20);

        $summary = [
            'total_products' => $products->total(),
            'low_stock_count' => $products->where('stockLevel.total_stock', '<=', 'stockLevel.min_level')->count(),
            'expiring_count' => $products->where('stockLevel.expiry_date', '<=', Carbon::now()->addDays(30))->count(),
            'total_value' => $products->sum(function ($product) {
                return $product->stockLevel->total_stock * $product->price;
            }),
        ];

        return Inertia::render('Admin/Inventory/DetailedReport', [
            'products' => $products,
            'summary' => $summary,
            'filters' => $request->only(['category', 'supplier', 'status']),
        ]);
    }

    public function getUsageReport(Request $request): Response
    {
        $query = Transaction::where('type', 'out');

        if ($request->filled('date_from')) {
            $query->where('transaction_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('transaction_date', '<=', $request->date_to);
        }

        if ($request->filled('subtype')) {
            $query->where('subtype', $request->subtype);
        }

        $transactions = $query->with(['product', 'user'])
            ->orderBy('transaction_date', 'desc')
            ->paginate(20);

        $summary = [
            'total_usage' => $transactions->sum('quantity'),
            'used_items' => $transactions->where('subtype', 'used')->sum('quantity'),
            'rejected_items' => $transactions->where('subtype', 'rejected')->sum('quantity'),
            'waste_items' => $transactions->where('subtype', 'waste')->sum('quantity'),
        ];

        return Inertia::render('Admin/Inventory/UsageReport', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $request->only(['date_from', 'date_to', 'subtype']),
        ]);
    }

    public function getSupplierReport(Request $request): Response
    {
        $query = Supplier::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $suppliers = $query->withCount(['products', 'transactions'])
            ->with(['products' => function ($q) {
                $q->with('stockLevel');
            }])
            ->orderBy('name')
            ->paginate(20);

        $summary = [
            'total_suppliers' => $suppliers->total(),
            'active_suppliers' => $suppliers->where('is_active', true)->count(),
            'total_products' => $suppliers->sum('products_count'),
        ];

        return Inertia::render('Admin/Inventory/SupplierReport', [
            'suppliers' => $suppliers,
            'summary' => $summary,
            'filters' => $request->only(['search']),
        ]);
    }

    public function getInOutFlowReport(Request $request): Response
    {
        $query = Transaction::query();

        if ($request->filled('date_from')) {
            $query->where('transaction_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('transaction_date', '<=', $request->date_to);
        }

        $transactions = $query->with(['product', 'user'])
            ->orderBy('transaction_date', 'desc')
            ->paginate(20);

        $summary = [
            'total_inbound' => $transactions->where('type', 'in')->sum('quantity'),
            'total_outbound' => $transactions->where('type', 'out')->sum('quantity'),
            'net_movement' => $transactions->where('type', 'in')->sum('quantity') - $transactions->where('type', 'out')->sum('quantity'),
        ];

        return Inertia::render('Admin/Inventory/InOutFlowReport', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $request->only(['date_from', 'date_to']),
        ]);
    }

    public function exportReport(Request $request, string $type)
    {
        $format = $request->get('format', 'excel');
        
        switch ($type) {
            case 'detailed':
                return $this->exportDetailedReport($request, $format);
            case 'usage':
                return $this->exportUsageReport($request, $format);
            case 'supplier':
                return $this->exportSupplierReport($request, $format);
            case 'inoutflow':
                return $this->exportInOutFlowReport($request, $format);
            default:
                abort(404, 'Report type not found');
        }
    }

    private function calculateTotalInventoryValue(): float
    {
        return Product::with('stockLevel')
            ->get()
            ->sum(function ($product) {
                return $product->stockLevel->total_stock * $product->price;
            });
    }

    private function getCategoryBreakdown(): array
    {
        return Product::select('category', DB::raw('count(*) as count'), DB::raw('sum(price * stock_levels.total_stock) as total_value'))
            ->join('stock_levels', 'products.id', '=', 'stock_levels.product_id')
            ->groupBy('category')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->category => [
                    'count' => $item->count,
                    'total_value' => $item->total_value,
                ]];
            });
    }

    private function getSupplierBreakdown(): array
    {
        return Supplier::withCount('products')
            ->with(['products' => function ($q) {
                $q->with('stockLevel');
            }])
            ->get()
            ->mapWithKeys(function ($supplier) {
                $totalValue = $supplier->products->sum(function ($product) {
                    return $product->stockLevel->total_stock * $product->price;
                });
                
                return [$supplier->name => [
                    'products_count' => $supplier->products_count,
                    'total_value' => $totalValue,
                ]];
            });
    }

    private function getInventoryTrends(): array
    {
        $last6Months = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $last6Months[] = [
                'month' => $month->format('M Y'),
                'inbound' => Transaction::where('type', 'in')
                    ->whereMonth('transaction_date', $month->month)
                    ->whereYear('transaction_date', $month->year)
                    ->sum('quantity'),
                'outbound' => Transaction::where('type', 'out')
                    ->whereMonth('transaction_date', $month->month)
                    ->whereYear('transaction_date', $month->year)
                    ->sum('quantity'),
            ];
        }
        
        return $last6Months;
    }

    private function exportDetailedReport(Request $request, string $format)
    {
        // Implementation for detailed report export
        return response()->json(['message' => 'Detailed report export functionality']);
    }

    private function exportUsageReport(Request $request, string $format)
    {
        // Implementation for usage report export
        return response()->json(['message' => 'Usage report export functionality']);
    }

    private function exportSupplierReport(Request $request, string $format)
    {
        // Implementation for supplier report export
        return response()->json(['message' => 'Supplier report export functionality']);
    }

    private function exportInOutFlowReport(Request $request, string $format)
    {
        // Implementation for in/out flow report export
        return response()->json(['message' => 'In/Out flow report export functionality']);
    }
}
