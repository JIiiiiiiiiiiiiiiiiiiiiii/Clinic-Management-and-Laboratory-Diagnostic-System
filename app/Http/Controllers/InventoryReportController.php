<?php

namespace App\Http\Controllers;

use App\Services\InventoryReportService;
use App\Models\InventoryReport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class InventoryReportController extends Controller
{
    protected $reportService;

    public function __construct()
    {
        $this->reportService = new InventoryReportService();
    }

    public function index(Request $request)
    {
        try {
            $filter = $request->get('filter', 'daily');
            $date = $request->get('date', now()->format('Y-m-d'));
            $reportType = $request->get('report_type', 'all');
            
            \Log::info('InventoryReportController - Index Request', [
                'filter' => $filter,
                'date' => $date,
                'report_type' => $reportType
            ]);
            
            // Get paginated inventory items for the table
            $startDate = $this->getStartDate($filter, $date);
            $endDate = $this->getEndDate($filter, $date);
            
            $data = $this->getInventoryReportData($filter, $date, $reportType);
            
            \Log::info('InventoryReportController - Data Retrieved', [
                'total_products' => $data['total_products'] ?? 0,
                'supply_details_count' => count($data['supply_details'] ?? []),
                'period' => $data['period'] ?? 'Unknown'
            ]);
            
            // Get paginated inventory items
            $query = \App\Models\InventoryItem::query();
            
            // Apply date range filter based on report type
            if ($reportType === 'used_rejected' || $reportType === 'in_out') {
                // For transaction-based reports, we need to get items that have movements in the date range
                $query->whereHas('movements', function($q) use ($startDate, $endDate) {
                    $q->whereBetween('created_at', [$startDate, $endDate]);
                });
            } else {
                // For all items report, filter by created_at
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }
            
            if ($request->filled('category')) {
                $query->where('category', $request->category);
            }

            if ($request->filled('low_stock')) {
                $query->where('low_stock_alert', '>', 0);
            }

            $supplies = $query->orderBy('item_name')
                ->paginate(20);

            // Transform data to match frontend expectations
            $transformedData = $supplies->getCollection()->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->item_name,
                    'code' => $item->item_code,
                    'category' => $item->category,
                    'unit_of_measure' => $item->unit,
                    'current_stock' => $item->stock,
                    'minimum_stock_level' => $item->low_stock_alert,
                    'maximum_stock_level' => $item->max_stock ?? 0,
                    'unit_cost' => $item->unit_cost ?? 0,
                    'total_value' => $item->stock * ($item->unit_cost ?? 0),
                    'is_low_stock' => $item->stock <= $item->low_stock_alert,
                    'is_out_of_stock' => $item->stock <= 0,
                    'is_active' => $item->status === 'Active',
                    'created_at' => $item->created_at,
                ];
            });

            // Create a new paginated result with transformed data
            $supplies = new \Illuminate\Pagination\LengthAwarePaginator(
                $transformedData,
                $supplies->total(),
                $supplies->perPage(),
                $supplies->currentPage(),
                [
                    'path' => $supplies->url($supplies->currentPage()),
                    'pageName' => 'page',
                ]
            );

            $summary = [
                'total_products' => $supplies->count(),
                'low_stock_items' => $supplies->filter(function($item) {
                    return $item['current_stock'] <= $item['minimum_stock_level'];
                })->count(),
                'out_of_stock' => $supplies->filter(function($item) {
                    return $item['current_stock'] <= 0;
                })->count(),
                'total_value' => $supplies->sum('total_value') ?? 0,
            ];

            return Inertia::render('admin/reports/inventory', [
                'filter' => $filter,
                'date' => $date,
                'reportType' => $reportType,
                'data' => $data,
                'supplies' => $supplies,
                'summary' => $summary,
                'filterOptions' => $this->getFilterOptions(),
                'metadata' => $this->getReportMetadata(),
            ]);
        } catch (\Exception $e) {
            \Log::error('InventoryReportController error: ' . $e->getMessage());
            return Inertia::render('admin/reports/inventory', [
                'filter' => 'daily',
                'date' => now()->format('Y-m-d'),
                'reportType' => 'all',
                'data' => [
                    'total_products' => 0,
                    'low_stock_items' => 0,
                    'out_of_stock' => 0,
                    'total_value' => 0,
                    'category_summary' => [],
                    'supply_details' => [],
                    'period' => 'No data available',
                    'start_date' => now()->format('Y-m-d'),
                    'end_date' => now()->format('Y-m-d')
                ],
                'supplies' => collect(),
                'summary' => [
                    'total_products' => 0,
                    'low_stock_items' => 0,
                    'out_of_stock' => 0,
                    'total_value' => 0,
                ],
                'filterOptions' => [],
                'metadata' => [
                    'generated_at' => now()->format('Y-m-d H:i:s'),
                    'generated_by' => 'System',
                    'generated_by_role' => 'Admin',
                    'system_version' => '1.0.0',
                ],
                'error' => 'Unable to load inventory report data.'
            ]);
        }
    }
    
    // Helper methods from ReportsController
    private function getStartDate($filter, $date)
    {
        $dateObj = Carbon::parse($date);
        switch ($filter) {
            case 'monthly':
                return $dateObj->startOfMonth();
            case 'yearly':
                return $dateObj->startOfYear();
            default: // daily
                return $dateObj->startOfDay();
        }
    }
    
    private function getEndDate($filter, $date)
    {
        $dateObj = Carbon::parse($date);
        switch ($filter) {
            case 'monthly':
                return $dateObj->endOfMonth();
            case 'yearly':
                return $dateObj->endOfYear();
            default: // daily
                return $dateObj->endOfDay();
        }
    }
    
    private function getInventoryReportData($filter, $date, $reportType)
    {
        $startDate = $this->getStartDate($filter, $date);
        $endDate = $this->getEndDate($filter, $date);
        
        // Get inventory items for the period
        $items = \App\Models\InventoryItem::whereBetween('created_at', [$startDate, $endDate])->get();
        
        // If no items found in the date range, get all items
        if ($items->isEmpty()) {
            $items = \App\Models\InventoryItem::all();
        }
        
        // Calculate statistics
        $totalProducts = $items->count();
        $lowStockItems = $items->filter(function($item) {
            return $item->stock <= $item->low_stock_alert;
        })->count();
        $outOfStock = $items->filter(function($item) {
            return $item->stock <= 0;
        })->count();
        $totalValue = $items->sum(function($item) {
            return $item->stock * ($item->unit_cost ?? 0);
        });
        
        // Calculate category summary
        $categorySummary = $items->groupBy('category')
            ->map(function ($categoryItems) {
                return [
                    'count' => $categoryItems->count(),
                    'total_value' => $categoryItems->sum(function($item) {
                        return $item->stock * ($item->unit_cost ?? 0);
                    }),
                    'low_stock' => $categoryItems->filter(function($item) {
                        return $item->stock <= $item->low_stock_alert;
                    })->count(),
                    'out_of_stock' => $categoryItems->filter(function($item) {
                        return $item->stock <= 0;
                    })->count(),
                ];
            })->toArray();
        
        // Get item details - transform to match frontend expectations
        $itemDetails = $items->map(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->item_name,
                'code' => $item->item_code,
                'category' => $item->category,
                'unit_of_measure' => $item->unit,
                'current_stock' => $item->stock,
                'minimum_stock_level' => $item->low_stock_alert,
                'maximum_stock_level' => $item->max_stock ?? 0,
                'unit_cost' => $item->unit_cost ?? 0,
                'total_value' => $item->stock * ($item->unit_cost ?? 0),
                'is_low_stock' => $item->stock <= $item->low_stock_alert,
                'is_out_of_stock' => $item->stock <= 0,
                'is_active' => $item->status === 'Active',
                'created_at' => $item->created_at,
            ];
        });

        return [
            'total_products' => $totalProducts,
            'low_stock_items' => $lowStockItems,
            'out_of_stock' => $outOfStock,
            'total_value' => $totalValue,
            'category_summary' => $categorySummary,
            'supply_details' => $itemDetails,
            'period' => $this->getPeriodLabel($filter, $date),
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d')
        ];
    }
    
    private function getPeriodLabel($filter, $date)
    {
        $dateObj = Carbon::parse($date);
        switch ($filter) {
            case 'monthly':
                return 'Monthly Report - ' . $dateObj->format('F Y');
            case 'yearly':
                return 'Yearly Report - ' . $dateObj->format('Y');
            default:
                return 'Daily Report - ' . $dateObj->format('M d, Y');
        }
    }
    
    private function getFilterOptions()
    {
        return [];
    }
    
    private function getReportMetadata()
    {
        $user = auth()->user();
        return [
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'generated_by' => $user ? $user->name : 'System',
            'generated_by_role' => $user ? ($user->role ?? 'User') : 'System',
            'system_version' => '1.0.0',
        ];
    }

    public function usedRejectedReport(Request $request)
    {
        $filters = $request->only(['period', 'start_date', 'end_date', 'department']);
        $data = $this->reportService->generateUsedRejectedReport($filters);
        
        // Save report if requested
        if ($request->has('save_report')) {
            $report = $this->reportService->saveReport('used_rejected', $data, $filters, auth()->id());
            $data['report_id'] = $report->id;
        }

        return Inertia::render('Inventory/Reports/UsedRejected', [
            'data' => $data,
            'filters' => $filters,
        ]);
    }

    public function inOutSuppliesReport(Request $request)
    {
        try {
            $filters = $request->only(['period', 'start_date', 'end_date', 'department']);
            $data = $this->reportService->generateInOutSuppliesReport($filters);
            
            // Save report if requested
            if ($request->has('save_report')) {
                $report = $this->reportService->saveReport('in_out_supplies', $data, $filters, auth()->id());
                $data['report_id'] = $report->id;
            }

            return Inertia::render('Inventory/Reports/InOutSupplies', [
                'data' => $data,
                'filters' => $filters,
            ]);
        } catch (\Exception $e) {
            // Fallback with empty data
            return Inertia::render('Inventory/Reports/InOutSupplies', [
                'data' => [
                    'summary' => [
                        'total_movements' => 0,
                        'in_movements' => 0,
                        'out_movements' => 0,
                        'total_in_quantity' => 0,
                        'total_out_quantity' => 0,
                    ],
                    'department_stats' => [
                        'doctor_nurse' => ['in_movements' => 0, 'out_movements' => 0],
                        'med_tech' => ['in_movements' => 0, 'out_movements' => 0],
                    ],
                    'movements' => [],
                    'movement_trends' => [],
                    'date_range' => ['start' => null, 'end' => null, 'label' => 'No data'],
                ],
                'filters' => $filters,
            ]);
        }
    }

    public function stockLevelsReport(Request $request)
    {
        try {
            $filters = $request->only(['category', 'status']);
            $data = $this->reportService->generateStockLevelsReport($filters);
            
            // Save report if requested
            if ($request->has('save_report')) {
                $report = $this->reportService->saveReport('stock_levels', $data, $filters, auth()->id());
                $data['report_id'] = $report->id;
            }

            return Inertia::render('Inventory/Reports/StockLevels', [
                'data' => $data,
                'filters' => $filters,
            ]);
        } catch (\Exception $e) {
            // Fallback with empty data
            return Inertia::render('Inventory/Reports/StockLevels', [
                'data' => [
                    'summary' => [
                        'total_items' => 0,
                        'in_stock' => 0,
                        'low_stock' => 0,
                        'out_of_stock' => 0,
                        'total_value' => 0,
                    ],
                    'category_stats' => [],
                    'needs_restock' => [],
                    'all_items' => [],
                ],
                'filters' => $filters,
            ]);
        }
    }

    public function dailyConsumptionReport(Request $request)
    {
        try {
            $filters = $request->only(['period', 'start_date', 'end_date', 'item_id']);
            $data = $this->reportService->generateDailyConsumptionReport($filters);
            
            // Save report if requested
            if ($request->has('save_report')) {
                $report = $this->reportService->saveReport('daily_consumption', $data, $filters, auth()->id());
                $data['report_id'] = $report->id;
            }

            return Inertia::render('Inventory/Reports/DailyConsumption', [
                'data' => $data,
                'filters' => $filters,
            ]);
        } catch (\Exception $e) {
            // Fallback with empty data
            return Inertia::render('Inventory/Reports/DailyConsumption', [
                'data' => [
                    'daily_data' => [],
                    'item_consumption' => [],
                    'date_range' => ['start' => null, 'end' => null, 'label' => 'No data'],
                ],
                'filters' => $filters,
            ]);
        }
    }

    public function usageByLocationReport(Request $request)
    {
        try {
            $filters = $request->only(['period', 'start_date', 'end_date', 'location']);
            $data = $this->reportService->generateUsageByLocationReport($filters);
            
            // Save report if requested
            if ($request->has('save_report')) {
                $report = $this->reportService->saveReport('usage_by_location', $data, $filters, auth()->id());
                $data['report_id'] = $report->id;
            }

            return Inertia::render('Inventory/Reports/UsageByLocation', [
                'data' => $data,
                'filters' => $filters,
            ]);
        } catch (\Exception $e) {
            // Fallback with empty data
            return Inertia::render('Inventory/Reports/UsageByLocation', [
                'data' => [
                    'location_usage' => [],
                    'date_range' => ['start' => null, 'end' => null, 'label' => 'No data'],
                ],
                'filters' => $filters,
            ]);
        }
    }

    public function exportReport(Request $request, $reportId)
    {
        $report = InventoryReport::findOrFail($reportId);
        $format = $request->get('format', 'pdf');

        // Update export timestamp
        $report->update([
            'exported_at' => now(),
            'export_format' => $format,
        ]);

        if ($format === 'pdf') {
            return $this->exportReportToPdf($report);
        } else {
            return $this->exportReportToExcel($report);
        }
    }

    private function exportReportToPdf($report)
    {
        $html = view('reports.inventory-pdf', [
            'report' => $report,
            'data' => $report->detailed_data,
        ])->render();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'portrait');

        $filename = 'inventory-report-' . $report->id . '.pdf';
        return $pdf->download($filename);
    }

    private function exportReportToExcel($report)
    {
        $export = new \App\Exports\InventoryReportExport($report);
        
        $filename = 'inventory-report-' . $report->id . '.xlsx';
        return \Maatwebsite\Excel\Facades\Excel::download($export, $filename);
    }

    public function exportAllReports(Request $request)
    {
        $format = $request->get('format', 'pdf');
        
        // Get all reports
        $reports = InventoryReport::with('creator')->get();
        
        if ($format === 'pdf') {
            return $this->exportAllToPdf($reports);
        } else {
            return $this->exportAllToExcel($reports);
        }
    }

    private function exportAllToPdf($reports)
    {
        $html = view('reports.inventory-all-pdf', [
            'reports' => $reports,
        ])->render();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'portrait');

        $filename = 'all-inventory-reports.pdf';
        return $pdf->download($filename);
    }

    private function exportAllToExcel($reports)
    {
        $export = new \App\Exports\AllInventoryReportsExport($reports);
        
        $filename = 'all-inventory-reports.xlsx';
        return \Maatwebsite\Excel\Facades\Excel::download($export, $filename);
    }

    public function exportUsedRejected(Request $request)
    {
        $filters = $request->only(['period', 'start_date', 'end_date', 'department']);
        $data = $this->reportService->generateUsedRejectedReport($filters);
        $format = $request->get('format', 'pdf');

        if ($format === 'pdf') {
            return $this->exportToPdf('Used/Rejected Supplies Report', $data);
        } else {
            return $this->exportToExcel('Used/Rejected Supplies Report', $data);
        }
    }

    public function exportInOutSupplies(Request $request)
    {
        $filters = $request->only(['period', 'start_date', 'end_date', 'department']);
        $data = $this->reportService->generateInOutSuppliesReport($filters);
        $format = $request->get('format', 'pdf');

        if ($format === 'pdf') {
            return $this->exportToPdf('In/Out Supplies Report', $data);
        } else {
            return $this->exportToExcel('In/Out Supplies Report', $data);
        }
    }

    public function exportStockLevels(Request $request)
    {
        $filters = $request->only(['category', 'status']);
        $data = $this->reportService->generateStockLevelsReport($filters);
        $format = $request->get('format', 'pdf');

        if ($format === 'pdf') {
            return $this->exportToPdf('Stock Levels Report', $data);
        } else {
            return $this->exportToExcel('Stock Levels Report', $data);
        }
    }

    public function exportDailyConsumption(Request $request)
    {
        $filters = $request->only(['period', 'start_date', 'end_date', 'item_id']);
        $data = $this->reportService->generateDailyConsumptionReport($filters);
        $format = $request->get('format', 'pdf');

        if ($format === 'pdf') {
            return $this->exportToPdf('Daily Consumption Report', $data);
        } else {
            return $this->exportToExcel('Daily Consumption Report', $data);
        }
    }

    public function exportUsageByLocation(Request $request)
    {
        $filters = $request->only(['period', 'start_date', 'end_date', 'location']);
        $data = $this->reportService->generateUsageByLocationReport($filters);
        $format = $request->get('format', 'pdf');

        if ($format === 'pdf') {
            return $this->exportToPdf('Usage by Location Report', $data);
        } else {
            return $this->exportToExcel('Usage by Location Report', $data);
        }
    }

    private function exportToPdf($title, $data)
    {
        $html = view('reports.inventory-pdf', [
            'title' => $title,
            'data' => $data,
        ])->render();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'portrait');

        $filename = strtolower(str_replace([' ', '/', '\\'], ['-', '-', '-'], $title)) . '.pdf';
        return $pdf->download($filename);
    }

    private function exportToExcel($title, $data)
    {
        $export = new \App\Exports\InventoryReportExport($title, $data);
        
        $filename = strtolower(str_replace([' ', '/', '\\'], ['-', '-', '-'], $title)) . '.xlsx';
        return \Maatwebsite\Excel\Facades\Excel::download($export, $filename);
    }

    public function destroy($id)
    {
        $report = InventoryReport::findOrFail($id);
        $report->delete();

        return back()->with('success', 'Report deleted successfully.');
    }
}
