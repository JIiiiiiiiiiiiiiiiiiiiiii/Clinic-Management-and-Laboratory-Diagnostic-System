<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Inventory\Product;
use App\Models\Inventory\Transaction;
use App\Models\Inventory\StockLevel;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index()
    {
        // Get dashboard statistics
        $totalProducts = Product::count();
        $activeProducts = Product::active()->count();
        $lowStockProducts = StockLevel::getLowStockProducts()->count();
        $expiringSoon = StockLevel::getExpiringSoon()->count();
        $expiredStock = StockLevel::getExpiredStock()->count();

        // Get recent transactions
        $recentTransactions = Transaction::with(['product', 'user', 'approvedBy'])
            ->latest()
            ->limit(10)
            ->get();

        // Get pending approvals
        $pendingApprovals = Transaction::pendingApproval()
            ->with(['product', 'user'])
            ->latest()
            ->limit(5)
            ->get();

        // Get top consumed products this month
        $topConsumedProducts = Transaction::where('type', 'out')
            ->whereIn('subtype', ['consumed', 'used'])
            ->whereMonth('transaction_date', now()->month)
            ->whereYear('transaction_date', now()->year)
            ->selectRaw('product_id, SUM(ABS(quantity)) as total_quantity')
            ->with('product')
            ->groupBy('product_id')
            ->orderBy('total_quantity', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('admin/inventory/index', [
            'stats' => [
                'total_products' => $totalProducts,
                'active_products' => $activeProducts,
                'low_stock_products' => $lowStockProducts,
                'expiring_soon' => $expiringSoon,
                'expired_stock' => $expiredStock,
            ],
            'recentTransactions' => $recentTransactions,
            'pendingApprovals' => $pendingApprovals,
            'topConsumedProducts' => $topConsumedProducts,
        ]);
    }
}
