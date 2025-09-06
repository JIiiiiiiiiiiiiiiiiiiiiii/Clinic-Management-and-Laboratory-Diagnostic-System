<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Inventory\Product;
use App\Models\Inventory\Transaction;
use App\Models\Inventory\StockLevel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/inventory/reports/index');
    }

    public function usedSupplies(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        $usedSupplies = Transaction::getUsedSupplies($startDate, $endDate);

        // Group by product for summary
        $summary = $usedSupplies->groupBy('product_id')->map(function ($transactions) {
            $product = $transactions->first()->product;
            $totalQuantity = $transactions->sum('quantity');
            $totalCost = $transactions->sum('total_cost');

            return [
                'product' => $product,
                'total_quantity' => abs($totalQuantity),
                'total_cost' => abs($totalCost),
                'transactions' => $transactions,
            ];
        });

        return Inertia::render('admin/inventory/reports/used-supplies', [
            'usedSupplies' => $usedSupplies,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function rejectedSupplies(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        $rejectedSupplies = Transaction::getRejectedSupplies($startDate, $endDate);

        // Group by product for summary
        $summary = $rejectedSupplies->groupBy('product_id')->map(function ($transactions) {
            $product = $transactions->first()->product;
            $totalQuantity = $transactions->sum('quantity');
            $totalCost = $transactions->sum('total_cost');

            return [
                'product' => $product,
                'total_quantity' => abs($totalQuantity),
                'total_cost' => abs($totalCost),
                'transactions' => $transactions,
            ];
        });

        return Inertia::render('admin/inventory/reports/rejected-supplies', [
            'rejectedSupplies' => $rejectedSupplies,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function inOutSupplies(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        $incomingSupplies = Transaction::getIncomingSupplies($startDate, $endDate);
        $outgoingSupplies = Transaction::getOutgoingSupplies($startDate, $endDate);

        // Group by product for summary
        $incomingSummary = $incomingSupplies->groupBy('product_id')->map(function ($transactions) {
            $product = $transactions->first()->product;
            $totalQuantity = $transactions->sum('quantity');
            $totalCost = $transactions->sum('total_cost');

            return [
                'product' => $product,
                'total_quantity' => $totalQuantity,
                'total_cost' => $totalCost,
                'transactions' => $transactions,
            ];
        });

        $outgoingSummary = $outgoingSupplies->groupBy('product_id')->map(function ($transactions) {
            $product = $transactions->first()->product;
            $totalQuantity = $transactions->sum('quantity');
            $totalCost = $transactions->sum('total_cost');

            return [
                'product' => $product,
                'total_quantity' => abs($totalQuantity),
                'total_cost' => abs($totalCost),
                'transactions' => $transactions,
            ];
        });

        return Inertia::render('admin/inventory/reports/in-out-supplies', [
            'incomingSupplies' => $incomingSupplies,
            'outgoingSupplies' => $outgoingSupplies,
            'incomingSummary' => $incomingSummary,
            'outgoingSummary' => $outgoingSummary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function stockLevels()
    {
        $products = Product::with(['stockLevels'])->get();

        $lowStockProducts = StockLevel::getLowStockProducts();
        $expiringSoon = StockLevel::getExpiringSoon();
        $expiredStock = StockLevel::getExpiredStock();

        return Inertia::render('admin/inventory/reports/stock-levels', [
            'products' => $products,
            'lowStockProducts' => $lowStockProducts,
            'expiringSoon' => $expiringSoon,
            'expiredStock' => $expiredStock,
        ]);
    }

    public function dailyConsumption(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        // Get daily consumption data
        $dailyData = Transaction::where('type', 'out')
            ->whereIn('subtype', ['consumed', 'used'])
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->selectRaw('transaction_date, product_id, SUM(ABS(quantity)) as total_quantity, SUM(ABS(total_cost)) as total_cost')
            ->with('product')
            ->groupBy('transaction_date', 'product_id')
            ->orderBy('transaction_date')
            ->get()
            ->groupBy('transaction_date');

        // Get product summary
        $productSummary = Transaction::where('type', 'out')
            ->whereIn('subtype', ['consumed', 'used'])
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->selectRaw('product_id, SUM(ABS(quantity)) as total_quantity, SUM(ABS(total_cost)) as total_cost')
            ->with('product')
            ->groupBy('product_id')
            ->get();

        return Inertia::render('admin/inventory/reports/daily-consumption', [
            'dailyData' => $dailyData,
            'productSummary' => $productSummary,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function usageByLocation(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        $usageByLocation = Transaction::where('type', 'out')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->whereNotNull('usage_location')
            ->selectRaw('usage_location, product_id, SUM(ABS(quantity)) as total_quantity, SUM(ABS(total_cost)) as total_cost')
            ->with('product')
            ->groupBy('usage_location', 'product_id')
            ->get()
            ->groupBy('usage_location');

        return Inertia::render('admin/inventory/reports/usage-by-location', [
            'usageByLocation' => $usageByLocation,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }
}
