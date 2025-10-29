<?php

namespace App\Http\Controllers;

use App\Models\LabOrder;
use App\Models\LaboratoryReport;
use App\Models\LabTest;
use App\Exports\LaboratoryReportExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class LaboratoryReportController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->get('filter', 'daily');
        $date = $request->get('date', now()->format('Y-m-d'));
        
        $data = $this->getReportData($filter, $date);
        
        return inertia('admin/reports/laboratory', [
            'filter' => $filter,
            'date' => $date,
            'data' => $data,
            'availableTests' => LabTest::active()->get(['id', 'name', 'code'])
        ]);
    }

    public function getReportData($filter, $date)
    {
        $startDate = $this->getStartDate($filter, $date);
        $endDate = $this->getEndDate($filter, $date);
        
        // Debug logging
        \Log::info('Laboratory Report Debug:', [
            'filter' => $filter,
            'date' => $date,
            'startDate' => $startDate->format('Y-m-d H:i:s'),
            'endDate' => $endDate->format('Y-m-d H:i:s'),
            'startDate_timestamp' => $startDate->timestamp,
            'endDate_timestamp' => $endDate->timestamp,
        ]);
        
        // Get lab orders for the period
        $labOrders = LabOrder::with(['patient', 'results.test', 'results'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();
            
        // Debug the actual orders found
        \Log::info('Lab Orders Found:', [
            'count' => $labOrders->count(),
            'orders' => $labOrders->map(function($order) {
                return [
                    'id' => $order->id,
                    'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                    'created_at_timestamp' => $order->created_at->timestamp,
                ];
            })->toArray()
        ]);

        // Calculate statistics
        $totalOrders = $labOrders->count();
        $pendingOrders = $labOrders->where('status', 'ordered')->count();
        $completedOrders = $labOrders->where('status', 'completed')->count();
        
        // Get test summary
        $testSummary = $this->getTestSummary($labOrders);
        
        // Get order details
        $orderDetails = $labOrders->map(function ($order) {
            return [
                'order_id' => $order->id,
                'patient_name' => $order->patient ? $order->patient->last_name . ', ' . $order->patient->first_name : 'N/A',
                'patient_id' => $order->patient_id,
                'tests_ordered' => $order->results->map(function ($result) {
                    return $result->test?->name;
                })->filter()->join(', '),
                'status' => $order->status,
                'ordered_at' => $order->created_at->format('Y-m-d H:i:s'),
                'ordered_by' => $order->orderedBy ? $order->orderedBy->name : 'N/A'
            ];
        });

        $result = [
            'total_orders' => $totalOrders,
            'pending_orders' => $pendingOrders,
            'completed_orders' => $completedOrders,
            'completion_rate' => $totalOrders > 0 ? round(($completedOrders / $totalOrders) * 100, 2) : 0,
            'test_summary' => $testSummary,
            'order_details' => $orderDetails,
            'period' => $this->getPeriodLabel($filter, $date),
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d')
        ];
        
        // Debug the result
        \Log::info('Laboratory Report Result:', [
            'total_orders' => $totalOrders,
            'order_details_count' => $orderDetails->count(),
            'order_details_sample' => $orderDetails->take(3)->toArray()
        ]);
        
        return $result;
    }

    private function getStartDate($filter, $date)
    {
        $carbonDate = Carbon::parse($date);
        
        switch ($filter) {
            case 'daily':
                return $carbonDate->startOfDay();
            case 'monthly':
                return $carbonDate->startOfMonth();
            case 'yearly':
                return $carbonDate->startOfYear();
            default:
                return $carbonDate->startOfDay();
        }
    }

    private function getEndDate($filter, $date)
    {
        $carbonDate = Carbon::parse($date);
        
        switch ($filter) {
            case 'daily':
                return $carbonDate->endOfDay();
            case 'monthly':
                return $carbonDate->endOfMonth();
            case 'yearly':
                return $carbonDate->endOfYear();
            default:
                return $carbonDate->endOfDay();
        }
    }

    private function getTestSummary($labOrders)
    {
        $testCounts = [];
        
        foreach ($labOrders as $order) {
            foreach ($order->results as $result) {
                $test = $result->test;
                if (!$test) continue;
                $testName = strtolower($test->name);
                
                // Categorize tests
                if (strpos($testName, 'fecal') !== false || strpos($testName, 'stool') !== false) {
                    $testCounts['Fecalysis'] = ($testCounts['Fecalysis'] ?? 0) + 1;
                } elseif (strpos($testName, 'cbc') !== false || strpos($testName, 'complete blood') !== false) {
                    $testCounts['CBC'] = ($testCounts['CBC'] ?? 0) + 1;
                } elseif (strpos($testName, 'urine') !== false || strpos($testName, 'urinalysis') !== false) {
                    $testCounts['Urinary'] = ($testCounts['Urinary'] ?? 0) + 1;
                } else {
                    $testCounts['Other'] = ($testCounts['Other'] ?? 0) + 1;
                }
            }
        }
        
        return $testCounts;
    }

    private function getPeriodLabel($filter, $date)
    {
        $carbonDate = Carbon::parse($date);
        
        switch ($filter) {
            case 'daily':
                return $carbonDate->format('F d, Y');
            case 'monthly':
                return $carbonDate->format('F Y');
            case 'yearly':
                return $carbonDate->format('Y');
            default:
                return $carbonDate->format('F d, Y');
        }
    }

    public function exportExcel(Request $request)
    {
        $filter = $request->get('filter', 'daily');
        $date = $request->get('date', now()->format('Y-m-d'));
        
        $data = $this->getReportData($filter, $date);
        
        $export = new LaboratoryReportExport($data, $filter, $date);
        
        $filename = 'laboratory-report-' . $filter . '-' . $date . '-' . now()->format('Y-m-d-H-i-s') . '.xlsx';
        
        return Excel::download($export, $filename);
    }

    public function exportPdf(Request $request)
    {
        $filter = $request->get('filter', 'daily');
        $date = $request->get('date', now()->format('Y-m-d'));
        
        $data = $this->getReportData($filter, $date);
        
        $pdf = Pdf::loadView('reports.laboratory-pdf', [
            'data' => $data,
            'filter' => $filter,
            'date' => $date
        ]);
        
        $filename = 'laboratory-report-' . $filter . '-' . $date . '-' . now()->format('Y-m-d-H-i-s') . '.pdf';
        
        return $pdf->download($filename);
    }
}
