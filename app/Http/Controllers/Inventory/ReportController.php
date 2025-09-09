<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Supply\Supply as Product;
use App\Models\Supply\SupplyTransaction as Transaction;
use App\Models\Supply\SupplyStockLevel as StockLevel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    private function buildHtmlTable(string $title, array $rows): string
    {
        $headings = count($rows) ? array_keys($rows[0]) : [];
        $thead = '';
        if ($headings) {
            $thead .= '<tr>';
            foreach ($headings as $h) {
                $thead .= '<th style="border:1px solid #ddd;padding:6px;text-align:left;white-space:nowrap">' . e($h) . '</th>';
            }
            $thead .= '</tr>';
        }

        $tbody = '';
        foreach ($rows as $row) {
            $tbody .= '<tr>';
            foreach ($headings as $h) {
                $val = $row[$h] ?? '';
                if (is_float($val) || is_int($val)) {
                    $val = (string) $val;
                }
                $tbody .= '<td style="border:1px solid #ddd;padding:6px">' . e((string) $val) . '</td>';
            }
            $tbody .= '</tr>';
        }

        return '<!doctype html><html><head><meta charset="utf-8"><title>' . e($title) . '</title></head><body>' .
            '<h2 style="font-family:Arial,Helvetica,sans-serif;margin:0 0 12px 0">' . e($title) . '</h2>' .
            '<table style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:12px">' .
            '<thead style="background:#f3f4f6">' . $thead . '</thead>' .
            '<tbody>' . $tbody . '</tbody>' .
            '</table>' .
            '</body></html>';
    }
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
        $products = Product::with(['stockLevels'])
            ->withSum('stockLevels as current_stock', 'current_stock')
            ->withSum('stockLevels as available_stock', 'available_stock')
            ->get();

        $lowGroups = StockLevel::getLowStockProducts();
        $lowIds = $lowGroups->pluck('product_id')->unique()->values();
        $lowStockProducts = Product::whereIn('id', $lowIds)->get()->map(function ($p) use ($lowGroups) {
            $row = $lowGroups->firstWhere('product_id', $p->id);
            return [
                'id' => $p->id,
                'name' => $p->name,
                'code' => $p->code,
                'category' => $p->category,
                'unit_of_measure' => $p->unit_of_measure,
                'unit_cost' => (float) $p->unit_cost,
                'minimum_stock_level' => (int) ($row->min_level ?? $p->minimum_stock_level),
                'maximum_stock_level' => (int) ($p->maximum_stock_level ?? 0),
                'current_stock' => (int) ($row->total_stock ?? 0),
                'available_stock' => (int) ($row->total_stock ?? 0),
            ];
        });
        $expiringSoon = StockLevel::getExpiringSoon();
        $expiredStock = StockLevel::getExpiredStock();

        return Inertia::render('admin/inventory/reports/stock-levels', [
            'products' => $products,
            'lowStockProducts' => $lowStockProducts,
            'expiringSoon' => $expiringSoon,
            'expiredStock' => $expiredStock,
        ]);
    }

    public function exportStockLevels(Request $request)
    {
        $products = Product::with(['stockLevels'])
            ->withSum('stockLevels as current_stock', 'current_stock')
            ->withSum('stockLevels as available_stock', 'available_stock')
            ->get();

        $rows = $products->map(function ($p) {
            return [
                'Code' => $p->code,
                'Name' => $p->name,
                'Category' => $p->category,
                'Unit' => $p->unit_of_measure,
                'Current Stock' => (int) ($p->current_stock ?? 0),
                'Available Stock' => (int) ($p->available_stock ?? 0),
                'Min Level' => (int) ($p->minimum_stock_level ?? 0),
                'Max Level' => (int) ($p->maximum_stock_level ?? 0),
                'Unit Cost' => (float) ($p->unit_cost ?? 0),
                'Total Value' => (float) (($p->current_stock ?? 0) * ($p->unit_cost ?? 0)),
            ];
        })->toArray();

        $format = strtolower((string) $request->get('format', 'excel'));
        if ($format === 'pdf') {
            $html = $this->buildHtmlTable('Stock Levels', $rows);
            return \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)->download('stock-levels.pdf');
        }
        if (in_array($format, ['word', 'doc', 'docx'])) {
            $html = $this->buildHtmlTable('Stock Levels', $rows);
            return response($html)
                ->header('Content-Type', 'application/msword')
                ->header('Content-Disposition', 'attachment; filename="stock-levels.doc"');
        }
        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\ArrayExport($rows, 'Stock Levels'), 'stock-levels.xlsx');
    }

    public function exportUsedSupplies(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        $rows = Transaction::getUsedSupplies($startDate, $endDate)
            ->map(function ($t) {
                return [
                    'Date' => (string) $t->transaction_date,
                    'Code' => optional($t->product)->code,
                    'Item' => optional($t->product)->name,
                    'Quantity' => (float) abs($t->quantity ?? 0),
                    'Unit' => optional($t->product)->unit_of_measure,
                    'Cost' => (float) abs($t->total_cost ?? 0),
                    'Location' => (string) ($t->usage_location ?? ''),
                    'Purpose' => (string) ($t->usage_purpose ?? ''),
                    'User' => optional($t->user)->name,
                ];
            })
            ->toArray();

        $format = strtolower((string) $request->get('format', 'excel'));
        if ($format === 'pdf') {
            $html = $this->buildHtmlTable('Used Supplies', $rows);
            return \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)->download('used-supplies.pdf');
        }
        if (in_array($format, ['word', 'doc', 'docx'])) {
            $html = $this->buildHtmlTable('Used Supplies', $rows);
            return response($html)
                ->header('Content-Type', 'application/msword')
                ->header('Content-Disposition', 'attachment; filename="used-supplies.doc"');
        }
        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\ArrayExport($rows, 'Used Supplies'), 'used-supplies.xlsx');
    }

    public function exportRejectedSupplies(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        $rows = Transaction::getRejectedSupplies($startDate, $endDate)
            ->map(function ($t) {
                return [
                    'Date' => (string) $t->transaction_date,
                    'Code' => optional($t->product)->code,
                    'Item' => optional($t->product)->name,
                    'Quantity' => (float) abs($t->quantity ?? 0),
                    'Unit' => optional($t->product)->unit_of_measure,
                    'Cost' => (float) abs($t->total_cost ?? 0),
                    'Reason' => (string) ($t->notes ?? ''),
                    'User' => optional($t->user)->name,
                    'Approved By' => optional($t->approvedBy)->name ?? optional($t->approved_by)->name,
                ];
            })
            ->toArray();

        $format = strtolower((string) $request->get('format', 'excel'));
        if ($format === 'pdf') {
            $html = $this->buildHtmlTable('Rejected Supplies', $rows);
            return \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)->download('rejected-supplies.pdf');
        }
        if (in_array($format, ['word', 'doc', 'docx'])) {
            $html = $this->buildHtmlTable('Rejected Supplies', $rows);
            return response($html)
                ->header('Content-Type', 'application/msword')
                ->header('Content-Disposition', 'attachment; filename="rejected-supplies.doc"');
        }
        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\ArrayExport($rows, 'Rejected Supplies'), 'rejected-supplies.xlsx');
    }

    public function exportInOutSupplies(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        $incoming = Transaction::getIncomingSupplies($startDate, $endDate)->map(function ($t) {
            return [
                'Date' => (string) $t->transaction_date,
                'Type' => 'Incoming',
                'Subtype' => (string) ($t->subtype ?? ''),
                'Code' => optional($t->product)->code,
                'Item' => optional($t->product)->name,
                'Quantity' => (float) ($t->quantity ?? 0),
                'Unit' => optional($t->product)->unit_of_measure,
                'Value' => (float) ($t->total_cost ?? 0),
                'User' => optional($t->user)->name,
                'Approved By' => optional($t->approvedBy)->name ?? optional($t->approved_by)->name,
            ];
        });

        $outgoing = Transaction::getOutgoingSupplies($startDate, $endDate)->map(function ($t) {
            return [
                'Date' => (string) $t->transaction_date,
                'Type' => 'Outgoing',
                'Subtype' => (string) ($t->subtype ?? ''),
                'Code' => optional($t->product)->code,
                'Item' => optional($t->product)->name,
                'Quantity' => (float) abs($t->quantity ?? 0),
                'Unit' => optional($t->product)->unit_of_measure,
                'Value' => (float) abs($t->total_cost ?? 0),
                'User' => optional($t->user)->name,
                'Approved By' => optional($t->approvedBy)->name ?? optional($t->approved_by)->name,
            ];
        });

        $rows = $incoming->merge($outgoing)->sortBy('Date')->values()->toArray();

        $format = strtolower((string) $request->get('format', 'excel'));
        if ($format === 'pdf') {
            $html = $this->buildHtmlTable('In-Out Supplies', $rows);
            return \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)->download('in-out-supplies.pdf');
        }
        if (in_array($format, ['word', 'doc', 'docx'])) {
            $html = $this->buildHtmlTable('In-Out Supplies', $rows);
            return response($html)
                ->header('Content-Type', 'application/msword')
                ->header('Content-Disposition', 'attachment; filename="in-out-supplies.doc"');
        }
        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\ArrayExport($rows, 'In-Out Supplies'), 'in-out-supplies.xlsx');
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

    public function exportDailyConsumption(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        $rows = Transaction::where('type', 'out')
            ->whereIn('subtype', ['consumed', 'used'])
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->selectRaw('transaction_date, product_id, SUM(ABS(quantity)) as total_quantity, SUM(ABS(total_cost)) as total_cost')
            ->with('product')
            ->groupBy('transaction_date', 'product_id')
            ->orderBy('transaction_date')
            ->get()
            ->map(function ($row) {
                return [
                    'Date' => (string) $row->transaction_date,
                    'Code' => optional($row->product)->code,
                    'Item' => optional($row->product)->name,
                    'Quantity' => (float) $row->total_quantity,
                    'Unit' => optional($row->product)->unit_of_measure,
                    'Cost' => (float) $row->total_cost,
                ];
            })
            ->toArray();

        $format = strtolower((string) $request->get('format', 'excel'));
        if ($format === 'pdf') {
            $html = $this->buildHtmlTable('Daily Consumption', $rows);
            return \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)->download('daily-consumption.pdf');
        }
        if (in_array($format, ['word', 'doc', 'docx'])) {
            $html = $this->buildHtmlTable('Daily Consumption', $rows);
            return response($html)
                ->header('Content-Type', 'application/msword')
                ->header('Content-Disposition', 'attachment; filename="daily-consumption.doc"');
        }
        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\ArrayExport($rows, 'Daily Consumption'), 'daily-consumption.xlsx');
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

    public function exportUsageByLocation(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth());
        $endDate = $request->get('end_date', now()->endOfMonth());

        $rows = Transaction::where('type', 'out')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->whereNotNull('usage_location')
            ->selectRaw('usage_location, product_id, SUM(ABS(quantity)) as total_quantity, SUM(ABS(total_cost)) as total_cost')
            ->with('product')
            ->groupBy('usage_location', 'product_id')
            ->orderBy('usage_location')
            ->get()
            ->map(function ($row) {
                return [
                    'Location' => (string) $row->usage_location,
                    'Code' => optional($row->product)->code,
                    'Item' => optional($row->product)->name,
                    'Quantity' => (float) $row->total_quantity,
                    'Unit' => optional($row->product)->unit_of_measure,
                    'Cost' => (float) $row->total_cost,
                ];
            })
            ->toArray();

        $format = strtolower((string) $request->get('format', 'excel'));
        if ($format === 'pdf') {
            $html = $this->buildHtmlTable('Usage by Location', $rows);
            return \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)->download('usage-by-location.pdf');
        }
        if (in_array($format, ['word', 'doc', 'docx'])) {
            $html = $this->buildHtmlTable('Usage by Location', $rows);
            return response($html)
                ->header('Content-Type', 'application/msword')
                ->header('Content-Disposition', 'attachment; filename="usage-by-location.doc"');
        }
        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\ArrayExport($rows, 'Usage by Location'), 'usage-by-location.xlsx');
    }
}
