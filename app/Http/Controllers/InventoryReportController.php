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

    public function index()
    {
        try {
            $reports = InventoryReport::with('creator')
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return Inertia::render('Inventory/Reports', [
                'reports' => $reports,
            ]);
        } catch (\Exception $e) {
            // Fallback if there are no reports yet
            return Inertia::render('Inventory/Reports', [
                'reports' => [
                    'data' => [],
                    'links' => [],
                    'meta' => []
                ],
            ]);
        }
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
