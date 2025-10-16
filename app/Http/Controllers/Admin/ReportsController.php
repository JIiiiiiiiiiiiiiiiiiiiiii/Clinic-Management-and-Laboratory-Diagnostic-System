<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BillingTransaction;
use App\Models\DoctorPayment;
use App\Models\Expense;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\LabOrder;
use App\Models\LabResult;
use App\Models\Supply\Supply;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportsController extends Controller
{
    /**
     * Display the main reports dashboard
     */
    public function index(): Response
    {
        $user = Auth::user();

        try {
            // Get summary statistics with proper error handling
            $summary = [
                'total_patients' => Patient::count(),
                'total_appointments' => Appointment::count(),
                'total_transactions' => BillingTransaction::count(),
                'total_revenue' => BillingTransaction::sum('total_amount') ?? 0,
                'total_expenses' => Expense::sum('amount') ?? 0,
                'total_lab_orders' => LabOrder::count(),
                'total_products' => Supply::count(),
            ];

            // Get filter options for dropdowns
            $filterOptions = $this->getFilterOptions();

            // Get recent reports
            $recentReports = $this->getRecentReports();

            // Chart data from database with error handling
            $chartData = $this->getChartData();

            return Inertia::render('admin/reports/index', [
                'summary' => $summary,
                'recentReports' => $recentReports,
                'filterOptions' => $filterOptions,
                'user' => $user,
                'metadata' => $this->getReportMetadata(),
                'chartData' => $chartData,
            ]);
        } catch (\Exception $e) {
            Log::error('Reports index error: ' . $e->getMessage());
            
            return Inertia::render('admin/reports/index', [
                'summary' => [
                    'total_patients' => 0,
                    'total_appointments' => 0,
                    'total_transactions' => 0,
                    'total_revenue' => 0,
                    'total_expenses' => 0,
                    'total_lab_orders' => 0,
                    'total_products' => 0,
                ],
                'recentReports' => [],
                'filterOptions' => $this->getFilterOptions(),
                'user' => $user,
                'metadata' => $this->getReportMetadata(),
                'chartData' => [],
                'error' => 'Unable to load report data. Please try again.'
            ]);
        }
    }

    /**
     * Financial Reports
     */
    public function financial(Request $request): Response
    {
        if (!$this->checkReportAccess('financial')) {
            abort(403, 'You do not have permission to access financial reports.');
        }

        try {
            $query = BillingTransaction::query();

            // Apply filters with proper error handling
            $this->applyCommonFilters($query, $request, 'transaction_date');

            if ($request->filled('doctor_id')) {
                $query->where('doctor_id', $request->doctor_id);
            }

            if ($request->filled('payment_method')) {
                $query->where('payment_method', $request->payment_method);
            }

            if ($request->filled('hmo_provider')) {
                $query->where('hmo_provider', $request->hmo_provider);
            }

            $transactions = $query->with(['patient', 'orderedBy'])
                ->orderBy('transaction_date', 'desc')
                ->paginate(20);

            // Calculate summary with null checks
            $summary = [
                'total_revenue' => $transactions->sum('total_amount') ?? 0,
                'total_transactions' => $transactions->count(),
                'average_transaction' => $transactions->avg('total_amount') ?? 0,
                'cash_payments' => $transactions->where('payment_method', 'Cash')->sum('total_amount') ?? 0,
                'hmo_payments' => $transactions->where('payment_method', 'HMO')->sum('total_amount') ?? 0,
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
            ];

            // Get chart data
            $chartData = $this->getFinancialChartData($request);

            return Inertia::render('admin/reports/financial', [
                'transactions' => $transactions,
                'summary' => $summary,
                'chartData' => $chartData,
                'filterOptions' => $this->getFilterOptions(),
                'metadata' => $this->getReportMetadata(),
            ]);
        } catch (\Exception $e) {
            Log::error('Financial reports error: ' . $e->getMessage());
            return Inertia::render('admin/reports/financial', [
                'transactions' => collect(),
                'summary' => [
                    'total_revenue' => 0,
                    'total_transactions' => 0,
                    'average_transaction' => 0,
                    'cash_payments' => 0,
                    'hmo_payments' => 0,
                ],
                'chartData' => [],
                'filterOptions' => $this->getFilterOptions(),
                'metadata' => $this->getReportMetadata(),
                'error' => 'Unable to load financial report data.'
            ]);
        }
    }

    /**
     * Patient Reports
     */
    public function patients(Request $request): Response
    {
        if (!$this->checkReportAccess('patients')) {
            abort(403, 'You do not have permission to access patient reports.');
        }

        try {
            $query = Patient::query();

            // Apply filters
            $this->applyCommonFilters($query, $request);

            if ($request->filled('sex')) {
                $query->where('sex', $request->sex);
            }

            if ($request->filled('age_range')) {
                $ageRange = explode('-', $request->age_range);
                if (count($ageRange) == 2) {
                    $query->whereBetween('age', [$ageRange[0], $ageRange[1]]);
                }
            }

            $patients = $query->withCount(['appointments', 'labOrders'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            $summary = [
                'total_patients' => $patients->count(),
                'new_patients' => $patients->where('created_at', '>=', now()->startOfMonth())->count(),
                'male_patients' => $patients->where('sex', 'Male')->count(),
                'female_patients' => $patients->where('sex', 'Female')->count(),
                'age_groups' => $this->getAgeGroupDistribution($patients),
            ];

            // Get chart data
            $chartData = $this->getPatientChartData($request);

            return Inertia::render('admin/reports/patients', [
                'patients' => $patients,
                'summary' => $summary,
                'chartData' => $chartData,
                'filterOptions' => $this->getFilterOptions(),
                'metadata' => $this->getReportMetadata(),
            ]);
        } catch (\Exception $e) {
            Log::error('Patient reports error: ' . $e->getMessage());
            return Inertia::render('admin/reports/patients', [
                'patients' => collect(),
                'summary' => [
                    'total_patients' => 0,
                    'new_patients' => 0,
                    'male_patients' => 0,
                    'female_patients' => 0,
                    'age_groups' => [],
                ],
                'chartData' => [],
                'filterOptions' => $this->getFilterOptions(),
                'metadata' => $this->getReportMetadata(),
                'error' => 'Unable to load patient report data.'
            ]);
        }
    }

    /**
     * Laboratory Reports
     */
    public function laboratory(Request $request): Response
    {
        try {
            $query = LabOrder::query();

            if ($request->filled('date_from')) {
                $query->where('created_at', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->where('created_at', '<=', $request->date_to);
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            $labOrders = $query->with(['patient', 'orderedBy'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            $summary = [
                'total_orders' => $labOrders->count(),
                'pending_orders' => $labOrders->where('status', 'pending')->count(),
                'completed_orders' => $labOrders->where('status', 'completed')->count(),
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
            ];

            return Inertia::render('admin/reports/laboratory', [
                'labOrders' => $labOrders,
                'summary' => $summary,
                'filterOptions' => $this->getFilterOptions(),
                'metadata' => $this->getReportMetadata(),
            ]);
        } catch (\Exception $e) {
            Log::error('Laboratory reports error: ' . $e->getMessage());
            return Inertia::render('admin/reports/laboratory', [
                'labOrders' => collect(),
                'summary' => [
                    'total_orders' => 0,
                    'pending_orders' => 0,
                    'completed_orders' => 0,
                ],
                'filterOptions' => $this->getFilterOptions(),
                'metadata' => $this->getReportMetadata(),
                'error' => 'Unable to load laboratory report data.'
            ]);
        }
    }

    /**
     * Inventory Reports
     */
    public function inventory(Request $request): Response
    {
        try {
            $query = Supply::query();

            if ($request->filled('category')) {
                $query->where('category', $request->category);
            }

            if ($request->filled('low_stock')) {
                $query->where('minimum_stock_level', '>', 0);
            }

            $supplies = $query->with('stockLevels')
                ->orderBy('name')
                ->paginate(20);

            $summary = [
                'total_products' => $supplies->count(),
                'low_stock_items' => $supplies->filter(function($supply) {
                    return $supply->current_stock <= $supply->minimum_stock_level;
                })->count(),
                'out_of_stock' => $supplies->filter(function($supply) {
                    return $supply->current_stock <= 0;
                })->count(),
                'total_value' => $supplies->sum('total_value') ?? 0,
            ];

            return Inertia::render('admin/reports/inventory', [
                'products' => $supplies,
                'summary' => $summary,
                'filterOptions' => $this->getFilterOptions(),
                'metadata' => $this->getReportMetadata(),
            ]);
        } catch (\Exception $e) {
            Log::error('Inventory reports error: ' . $e->getMessage());
            return Inertia::render('admin/reports/inventory', [
                'products' => collect(),
                'summary' => [
                    'total_products' => 0,
                    'low_stock_items' => 0,
                    'out_of_stock' => 0,
                    'total_value' => 0,
                ],
                'filterOptions' => $this->getFilterOptions(),
                'metadata' => $this->getReportMetadata(),
                'error' => 'Unable to load inventory report data.'
            ]);
        }
    }

    /**
     * Analytics Dashboard
     */
    public function analytics(Request $request): Response
    {
        if (!$this->checkReportAccess('analytics')) {
            abort(403, 'You do not have permission to access analytics reports.');
        }

        try {
            // Get comprehensive analytics data
            $analytics = [
                'revenue_analytics' => $this->getRevenueAnalytics($request),
                'patient_analytics' => $this->getPatientAnalytics($request),
                'appointment_analytics' => $this->getAppointmentAnalytics($request),
                'lab_analytics' => $this->getLabAnalytics($request),
                'inventory_analytics' => $this->getInventoryAnalytics($request),
            ];

            // Get chart data
            $chartData = $this->getChartData();

            return Inertia::render('admin/reports/analytics', [
                'analytics' => $analytics,
                'chartData' => $chartData,
                'filterOptions' => $this->getFilterOptions(),
                'metadata' => $this->getReportMetadata(),
            ]);
        } catch (\Exception $e) {
            Log::error('Analytics reports error: ' . $e->getMessage());
            return Inertia::render('admin/reports/analytics', [
                'analytics' => [],
                'chartData' => [],
                'filterOptions' => $this->getFilterOptions(),
                'metadata' => $this->getReportMetadata(),
                'error' => 'Unable to load analytics data.'
            ]);
        }
    }

    /**
     * Export reports in various formats
     */
    public function export(Request $request)
    {
        try {
            $type = $request->get('type', 'all');
            $format = $request->get('format', 'excel');
            $dateFrom = $request->get('date_from');
            $dateTo = $request->get('date_to');

            if (!$this->checkReportAccess($type)) {
                abort(403, 'You do not have permission to export this report type.');
            }

            $filename = $type . '_report_' . now()->format('Ymd_His');

            switch ($format) {
                case 'excel':
                    return $this->exportToExcel($type, $request, $filename);
                case 'pdf':
                    return $this->exportToPdf($type, $request, $filename);
                case 'csv':
                    return $this->exportToCsv($type, $request, $filename);
                default:
                    return response()->json(['error' => 'Unsupported format'], 400);
            }

        } catch (\Exception $e) {
            Log::error('Report export failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Export failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate growth rate for a model
     */
    private function calculateGrowthRate($model)
    {
        try {
            $currentMonth = $model::where('created_at', '>=', now()->startOfMonth())->count();
            $lastMonth = $model::whereBetween('created_at', [
                now()->subMonth()->startOfMonth(),
                now()->subMonth()->endOfMonth()
            ])->count();

            if ($lastMonth == 0) {
                return $currentMonth > 0 ? 100 : 0;
            }

            return round((($currentMonth - $lastMonth) / $lastMonth) * 100, 2);
        } catch (\Exception $e) {
            Log::error('Growth rate calculation error: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Calculate revenue growth rate
     */
    private function calculateRevenueGrowthRate()
    {
        try {
            $currentMonth = BillingTransaction::where('transaction_date', '>=', now()->startOfMonth())->sum('total_amount') ?? 0;
            $lastMonth = BillingTransaction::whereBetween('transaction_date', [
                now()->subMonth()->startOfMonth(),
                now()->subMonth()->endOfMonth()
            ])->sum('total_amount') ?? 0;

            if ($lastMonth == 0) {
                return $currentMonth > 0 ? 100 : 0;
            }

            return round((($currentMonth - $lastMonth) / $lastMonth) * 100, 2);
        } catch (\Exception $e) {
            Log::error('Revenue growth rate calculation error: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get filter options for dropdowns
     */
    private function getFilterOptions()
    {
        try {
            return [
                'doctors' => User::where('role', 'doctor')->select('id', 'name')->get(),
                'departments' => ['General Medicine', 'Cardiology', 'Pediatrics', 'Orthopedics', 'Laboratory'],
                'statuses' => ['Completed', 'Pending', 'Cancelled', 'In Progress'],
                'payment_methods' => ['Cash', 'Credit Card', 'HMO', 'Insurance'],
                'hmo_providers' => ['Maxicare', 'PhilHealth', 'Intellicare', 'MediCard'],
            ];
        } catch (\Exception $e) {
            Log::error('Filter options error: ' . $e->getMessage());
            return [
                'doctors' => [],
                'departments' => [],
                'statuses' => [],
                'payment_methods' => [],
                'hmo_providers' => [],
            ];
        }
    }

    /**
     * Get recent reports
     */
    private function getRecentReports()
    {
        $user = Auth::user();

        return [
            [
                'id' => 1,
                'name' => 'Monthly Financial Report',
                'type' => 'Financial',
                'dateRange' => 'January 2025',
                'generatedBy' => $user->name,
                'status' => 'Generated',
                'lastGenerated' => now()->format('Y-m-d H:i A'),
                'downloadUrl' => '/reports/financial-jan-2025.pdf'
            ],
            [
                'id' => 2,
                'name' => 'Patient Analytics Report',
                'type' => 'Analytics',
                'dateRange' => 'Q4 2024',
                'generatedBy' => $user->name,
                'status' => 'Generated',
                'lastGenerated' => now()->subDays(5)->format('Y-m-d H:i A'),
                'downloadUrl' => '/reports/patient-analytics-q4-2024.pdf'
            ],
        ];
    }

    /**
     * Apply common filters to query
     */
    private function applyCommonFilters($query, Request $request, $dateField = 'created_at')
    {
        try {
            if ($request->filled('date_from')) {
                $query->where($dateField, '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->where($dateField, '<=', $request->date_to);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('patient_no', 'like', "%{$search}%");
                });
            }

            return $query;
        } catch (\Exception $e) {
            Log::error('Common filters error: ' . $e->getMessage());
            return $query;
        }
    }

    /**
     * Generate report metadata
     */
    private function getReportMetadata()
    {
        $user = Auth::user();
        return [
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'generated_by' => $user->name,
            'generated_by_role' => $user->role,
            'system_version' => '1.0.0',
        ];
    }

    /**
     * Check if user has access to specific report type
     */
    private function checkReportAccess($reportType)
    {
        $user = Auth::user();

        switch ($user->role) {
            case 'admin':
                return true; // Full access
            case 'doctor':
                return in_array($reportType, ['patients', 'laboratory', 'appointments']);
            case 'cashier':
                return in_array($reportType, ['financial', 'patients']);
            case 'laboratory_technologist':
            case 'medtech':
                return in_array($reportType, ['laboratory', 'inventory']);
            default:
                return false;
        }
    }

    /**
     * Get financial chart data
     */
    private function getFinancialChartData(Request $request)
    {
        try {
            $dateFrom = $request->get('date_from', now()->startOfMonth());
            $dateTo = $request->get('date_to', now()->endOfMonth());

            // Monthly revenue trend
            $monthlyData = BillingTransaction::whereBetween('transaction_date', [$dateFrom, $dateTo])
                ->selectRaw('DATE_FORMAT(transaction_date, "%Y-%m") as month, SUM(total_amount) as revenue')
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            // Payment method distribution
            $paymentMethods = BillingTransaction::whereBetween('transaction_date', [$dateFrom, $dateTo])
                ->selectRaw('payment_method, COUNT(*) as count, SUM(total_amount) as amount')
                ->groupBy('payment_method')
                ->get();

            return [
                'monthly_revenue' => $monthlyData,
                'payment_methods' => $paymentMethods,
            ];
        } catch (\Exception $e) {
            Log::error('Financial chart data error: ' . $e->getMessage());
            return [
                'monthly_revenue' => collect(),
                'payment_methods' => collect(),
            ];
        }
    }

    /**
     * Get patient chart data
     */
    private function getPatientChartData(Request $request)
    {
        try {
            $dateFrom = $request->get('date_from', now()->startOfMonth());
            $dateTo = $request->get('date_to', now()->endOfMonth());

            // Gender distribution
            $genderData = Patient::whereBetween('created_at', [$dateFrom, $dateTo])
                ->selectRaw('sex, COUNT(*) as count')
                ->groupBy('sex')
                ->get();

            // Age group distribution
            $ageGroups = Patient::whereBetween('created_at', [$dateFrom, $dateTo])
                ->selectRaw('
                    CASE
                        WHEN age < 18 THEN "0-17"
                        WHEN age BETWEEN 18 AND 30 THEN "18-30"
                        WHEN age BETWEEN 31 AND 50 THEN "31-50"
                        WHEN age BETWEEN 51 AND 70 THEN "51-70"
                        ELSE "70+"
                    END as age_group,
                    COUNT(*) as count
                ')
                ->groupBy('age_group')
                ->get();

            return [
                'gender_distribution' => $genderData,
                'age_groups' => $ageGroups,
            ];
        } catch (\Exception $e) {
            Log::error('Patient chart data error: ' . $e->getMessage());
            return [
                'gender_distribution' => collect(),
                'age_groups' => collect(),
            ];
        }
    }

    /**
     * Get age group distribution
     */
    private function getAgeGroupDistribution($patients)
    {
        try {
            return $patients->groupBy(function($patient) {
                if ($patient->age < 18) return '0-17';
                if ($patient->age <= 30) return '18-30';
                if ($patient->age <= 50) return '31-50';
                if ($patient->age <= 70) return '51-70';
                return '70+';
            })->map->count();
        } catch (\Exception $e) {
            Log::error('Age group distribution error: ' . $e->getMessage());
            return collect();
        }
    }

    /**
     * Export to Excel
     */
    private function exportToExcel($type, Request $request, $filename)
    {
        try {
            $data = $this->getReportData($type, $request);
            $metadata = $this->getReportMetadata();
            
            // Create export data based on type
            $exportData = [];
            
            if ($type === 'all') {
                // Export all data types
                $exportData = $this->getAllReportData($request);
            } else {
                // Export specific type
                $exportData = $this->formatDataForExport($data, $type);
            }
            
            return Excel::download(
                new \App\Exports\ArrayExport($exportData, ucfirst($type) . ' Report - ' . now()->format('Y-m-d')),
                $filename . '.xlsx'
            );
        } catch (\Exception $e) {
            Log::error('Excel export failed: ' . $e->getMessage());
            return response()->json(['error' => 'Excel export failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Export to PDF
     */
    private function exportToPdf($type, Request $request, $filename)
    {
        try {
            $data = $this->getReportData($type, $request);
            $metadata = $this->getReportMetadata();

            $pdf = Pdf::loadView("reports.{$type}", [
                'data' => $data,
                'metadata' => $metadata,
                'filters' => $request->all(),
                'title' => ucfirst($type) . ' Report',
                'dateRange' => $this->getDateRangeString($request),
            ]);

            $pdf->setPaper('A4', 'portrait');
            $pdf->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'defaultFont' => 'Arial',
            ]);

            return $pdf->download("{$filename}.pdf");

        } catch (\Exception $e) {
            Log::error("PDF export failed for {$type}: " . $e->getMessage());
            return response()->json(['error' => 'PDF generation failed'], 500);
        }
    }

    /**
     * Export to CSV
     */
    private function exportToCsv($type, Request $request, $filename)
    {
        // Implementation for CSV export
        return response()->json(['message' => 'CSV export not yet implemented']);
    }

    /**
     * Get report data based on type
     */
    private function getReportData($type, Request $request)
    {
        try {
            switch ($type) {
                case 'financial':
                    return $this->getFinancialReportData($request);
                case 'patients':
                    return $this->getPatientReportData($request);
                case 'laboratory':
                    return $this->getLaboratoryReportData($request);
                case 'inventory':
                    return $this->getInventoryReportData($request);
                default:
                    return [];
            }
        } catch (\Exception $e) {
            Log::error("Report data error for {$type}: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get financial report data
     */
    private function getFinancialReportData(Request $request)
    {
        try {
            $query = BillingTransaction::query();
            $this->applyCommonFilters($query, $request, 'transaction_date');

            if ($request->filled('doctor_id')) {
                $query->where('doctor_id', $request->doctor_id);
            }

            if ($request->filled('payment_method')) {
                $query->where('payment_method', $request->payment_method);
            }

            $transactions = $query->with(['patient', 'orderedBy'])->get();

            return [
                'transactions' => $transactions,
                'summary' => [
                    'total_revenue' => $transactions->sum('total_amount') ?? 0,
                    'total_transactions' => $transactions->count(),
                    'average_transaction' => $transactions->avg('total_amount') ?? 0,
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Financial report data error: ' . $e->getMessage());
            return [
                'transactions' => collect(),
                'summary' => [
                    'total_revenue' => 0,
                    'total_transactions' => 0,
                    'average_transaction' => 0,
                ]
            ];
        }
    }

    /**
     * Get patient report data
     */
    private function getPatientReportData(Request $request)
    {
        try {
            $query = Patient::query();
            $this->applyCommonFilters($query, $request);

            if ($request->filled('sex')) {
                $query->where('sex', $request->sex);
            }

            $patients = $query->withCount(['appointments', 'labOrders'])->get();

            return [
                'patients' => $patients,
                'summary' => [
                    'total_patients' => $patients->count(),
                    'male_patients' => $patients->where('sex', 'Male')->count(),
                    'female_patients' => $patients->where('sex', 'Female')->count(),
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Patient report data error: ' . $e->getMessage());
            return [
                'patients' => collect(),
                'summary' => [
                    'total_patients' => 0,
                    'male_patients' => 0,
                    'female_patients' => 0,
                ]
            ];
        }
    }

    /**
     * Get laboratory report data
     */
    private function getLaboratoryReportData(Request $request)
    {
        try {
            $query = LabOrder::query();
            $this->applyCommonFilters($query, $request, 'created_at');

            $labOrders = $query->with(['patient', 'orderedBy'])->get();

            return [
                'labOrders' => $labOrders,
                'summary' => [
                    'total_orders' => $labOrders->count(),
                    'pending' => $labOrders->where('status', 'pending')->count(),
                    'completed' => $labOrders->where('status', 'completed')->count(),
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Laboratory report data error: ' . $e->getMessage());
            return [
                'labOrders' => collect(),
                'summary' => [
                    'total_orders' => 0,
                    'pending' => 0,
                    'completed' => 0,
                ]
            ];
        }
    }

    /**
     * Get inventory report data
     */
    private function getInventoryReportData(Request $request)
    {
        try {
            $query = Supply::query();
            $this->applyCommonFilters($query, $request);

            $supplies = $query->with('stockLevels')->get();

            return [
                'supplies' => $supplies,
                'summary' => [
                    'total_products' => $supplies->count(),
                    'low_stock' => $supplies->filter(fn($s) => $s->current_stock <= $s->minimum_stock_level)->count(),
                    'out_of_stock' => $supplies->filter(fn($s) => $s->current_stock <= 0)->count(),
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Inventory report data error: ' . $e->getMessage());
            return [
                'supplies' => collect(),
                'summary' => [
                    'total_products' => 0,
                    'low_stock' => 0,
                    'out_of_stock' => 0,
                ]
            ];
        }
    }

    /**
     * Get chart data from database
     */
    private function getChartData()
    {
        try {
            // Monthly revenue data for the last 12 months
            $monthlyRevenue = [];
            for ($i = 11; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $revenue = BillingTransaction::whereYear('transaction_date', $date->year)
                    ->whereMonth('transaction_date', $date->month)
                    ->sum('total_amount') ?? 0;

                $appointments = Appointment::whereYear('appointment_date', $date->year)
                    ->whereMonth('appointment_date', $date->month)
                    ->count();

                $patients = Patient::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count();

                $monthlyRevenue[] = [
                    'month' => $date->format('M Y'),
                    'revenue' => $revenue,
                    'patients' => $patients,
                    'appointments' => $appointments,
                ];
            }

            // Patient demographics with more detailed breakdown
            $patientDemographics = [
                ['name' => 'Male', 'value' => Patient::where('sex', 'male')->count()],
                ['name' => 'Female', 'value' => Patient::where('sex', 'female')->count()],
            ];

            // Appointment status distribution with more statuses
            $appointmentStatus = [
                ['status' => 'Completed', 'count' => Appointment::where('status', 'Completed')->count()],
                ['status' => 'Confirmed', 'count' => Appointment::where('status', 'Confirmed')->count()],
                ['status' => 'Pending', 'count' => Appointment::where('status', 'Pending')->count()],
                ['status' => 'Cancelled', 'count' => Appointment::where('status', 'Cancelled')->count()],
                ['status' => 'No Show', 'count' => Appointment::where('status', 'No Show')->count()],
            ];

            // Lab test types (most common) - expanded to 10
            $labTestTypes = LabOrder::join('lab_results', 'lab_orders.id', '=', 'lab_results.lab_order_id')
                ->join('lab_tests', 'lab_results.lab_test_id', '=', 'lab_tests.id')
                ->selectRaw('lab_tests.name as test_name, COUNT(*) as count')
                ->groupBy('lab_tests.name')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($item) {
                    return [
                        'test' => $item->test_name,
                        'count' => $item->count,
                    ];
                })->toArray();

            // Enhanced age group distribution with more granular categories
            $ageGroups = Patient::selectRaw('
                CASE
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) < 5 THEN "0-4"
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 5 AND 12 THEN "5-12"
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 13 AND 17 THEN "13-17"
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 18 AND 25 THEN "18-25"
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 26 AND 35 THEN "26-35"
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 36 AND 45 THEN "36-45"
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 46 AND 55 THEN "46-55"
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 56 AND 65 THEN "56-65"
                    WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 66 AND 75 THEN "66-75"
                    ELSE "75+"
                END as age_group,
                COUNT(*) as count
            ')
            ->groupBy('age_group')
            ->orderByRaw('
                CASE age_group
                    WHEN "0-4" THEN 1
                    WHEN "5-12" THEN 2
                    WHEN "13-17" THEN 3
                    WHEN "18-25" THEN 4
                    WHEN "26-35" THEN 5
                    WHEN "36-45" THEN 6
                    WHEN "46-55" THEN 7
                    WHEN "56-65" THEN 8
                    WHEN "66-75" THEN 9
                    WHEN "75+" THEN 10
                END
            ')
            ->get()
            ->map(function ($item) {
                return [
                    'age_group' => $item->age_group,
                    'count' => $item->count,
                ];
            })->toArray();

            // Enhanced payment method distribution with fallback data
            $paymentMethods = BillingTransaction::selectRaw('payment_method, COUNT(*) as count')
                ->groupBy('payment_method')
                ->orderBy('count', 'desc')
                ->get();

            // If no payment methods data, create sample data for demonstration
            if ($paymentMethods->isEmpty()) {
                $paymentMethods = collect([
                    (object)['payment_method' => 'cash', 'count' => 0],
                    (object)['payment_method' => 'card', 'count' => 0],
                    (object)['payment_method' => 'insurance', 'count' => 0],
                    (object)['payment_method' => 'hmo', 'count' => 0],
                ]);
            }

            $paymentMethods = $paymentMethods->map(function ($item) {
                return [
                    'method' => ucfirst(str_replace('_', ' ', $item->payment_method)),
                    'count' => $item->count,
                ];
            })->toArray();

            // Additional charts data
            $dailyAppointments = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = now()->subDays($i);
                $count = Appointment::whereDate('appointment_date', $date->toDateString())->count();
                $dailyAppointments[] = [
                    'day' => $date->format('D'),
                    'appointments' => $count,
                ];
            }

            // Lab test results distribution
            $labResultsDistribution = LabResult::selectRaw('
                    CASE
                        WHEN verified_at IS NOT NULL THEN "Verified"
                        ELSE "Pending"
                    END as status,
                    COUNT(*) as count
                ')
                ->groupBy('status')
                ->get()
                ->map(function ($item) {
                    return [
                        'status' => $item->status,
                        'count' => $item->count,
                    ];
                })->toArray();

            // Doctor performance (appointments per doctor)
            // Since appointments table uses specialist_id (string) instead of doctor_id (foreign key),
            // we'll group by specialist_name and specialist_id
            $doctorPerformance = Appointment::selectRaw('specialist_name, specialist_id, COUNT(*) as appointments')
                ->where('specialist_type', 'doctor')
                ->groupBy('specialist_name', 'specialist_id')
                ->orderBy('appointments', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'doctor' => $item->specialist_name,
                        'appointments' => $item->appointments,
                    ];
                })->toArray();

            // Monthly patient registrations
            $monthlyRegistrations = [];
            for ($i = 11; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $count = Patient::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count();
                $monthlyRegistrations[] = [
                    'month' => $date->format('M'),
                    'registrations' => $count,
                ];
            }

            return [
                'monthlyRevenue' => $monthlyRevenue,
                'patientDemographics' => $patientDemographics,
                'appointmentStatus' => $appointmentStatus,
                'labTestTypes' => $labTestTypes,
                'ageGroups' => $ageGroups,
                'paymentMethods' => $paymentMethods,
                'dailyAppointments' => $dailyAppointments,
                'labResultsDistribution' => $labResultsDistribution,
                'doctorPerformance' => $doctorPerformance,
                'monthlyRegistrations' => $monthlyRegistrations,
            ];
        } catch (\Exception $e) {
            Log::error('Chart data error: ' . $e->getMessage());
            return [
                'monthlyRevenue' => [],
                'patientDemographics' => [],
                'appointmentStatus' => [],
                'labTestTypes' => [],
                'ageGroups' => [],
                'paymentMethods' => [],
                'dailyAppointments' => [],
                'labResultsDistribution' => [],
                'doctorPerformance' => [],
                'monthlyRegistrations' => [],
            ];
        }
    }

    /**
     * Get date range string for reports
     */
    private function getDateRangeString(Request $request)
    {
        $from = $request->get('date_from', now()->startOfMonth()->format('Y-m-d'));
        $to = $request->get('date_to', now()->endOfMonth()->format('Y-m-d'));

        return "From: {$from} To: {$to}";
    }

    /**
     * Get revenue analytics data
     */
    private function getRevenueAnalytics(Request $request)
    {
        try {
            $dateFrom = $request->get('date_from', now()->startOfMonth());
            $dateTo = $request->get('date_to', now()->endOfMonth());

            $transactions = BillingTransaction::whereBetween('transaction_date', [$dateFrom, $dateTo]);

            return [
                'total_revenue' => $transactions->sum('total_amount') ?? 0,
                'transaction_count' => $transactions->count(),
                'average_transaction' => $transactions->avg('total_amount') ?? 0,
                'payment_methods' => $transactions->selectRaw('payment_method, COUNT(*) as count, SUM(total_amount) as amount')
                    ->groupBy('payment_method')
                    ->get(),
            ];
        } catch (\Exception $e) {
            Log::error('Revenue analytics error: ' . $e->getMessage());
            return [
                'total_revenue' => 0,
                'transaction_count' => 0,
                'average_transaction' => 0,
                'payment_methods' => collect(),
            ];
        }
    }

    /**
     * Get patient analytics data
     */
    private function getPatientAnalytics(Request $request)
    {
        try {
            $dateFrom = $request->get('date_from', now()->startOfMonth());
            $dateTo = $request->get('date_to', now()->endOfMonth());

            $patients = Patient::whereBetween('created_at', [$dateFrom, $dateTo]);

            return [
                'total_patients' => $patients->count(),
                'new_patients' => $patients->where('created_at', '>=', now()->startOfMonth())->count(),
                'gender_distribution' => $patients->selectRaw('sex, COUNT(*) as count')->groupBy('sex')->get(),
                'age_groups' => $patients->selectRaw('
                    CASE
                        WHEN age < 18 THEN "0-17"
                        WHEN age BETWEEN 18 AND 30 THEN "18-30"
                        WHEN age BETWEEN 31 AND 50 THEN "31-50"
                        WHEN age BETWEEN 51 AND 70 THEN "51-70"
                        ELSE "70+"
                    END as age_group,
                    COUNT(*) as count
                ')->groupBy('age_group')->get(),
            ];
        } catch (\Exception $e) {
            Log::error('Patient analytics error: ' . $e->getMessage());
            return [
                'total_patients' => 0,
                'new_patients' => 0,
                'gender_distribution' => collect(),
                'age_groups' => collect(),
            ];
        }
    }

    /**
     * Get appointment analytics data
     */
    private function getAppointmentAnalytics(Request $request)
    {
        try {
            $dateFrom = $request->get('date_from', now()->startOfMonth());
            $dateTo = $request->get('date_to', now()->endOfMonth());

            $appointments = Appointment::whereBetween('appointment_date', [$dateFrom, $dateTo]);

            return [
                'total_appointments' => $appointments->count(),
                'status_distribution' => $appointments->selectRaw('status, COUNT(*) as count')->groupBy('status')->get(),
                'daily_appointments' => $appointments->selectRaw('DATE(appointment_date) as date, COUNT(*) as count')
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get(),
            ];
        } catch (\Exception $e) {
            Log::error('Appointment analytics error: ' . $e->getMessage());
            return [
                'total_appointments' => 0,
                'status_distribution' => collect(),
                'daily_appointments' => collect(),
            ];
        }
    }

    /**
     * Get lab analytics data
     */
    private function getLabAnalytics(Request $request)
    {
        try {
            $dateFrom = $request->get('date_from', now()->startOfMonth());
            $dateTo = $request->get('date_to', now()->endOfMonth());

            $labOrders = LabOrder::whereBetween('created_at', [$dateFrom, $dateTo]);

            return [
                'total_orders' => $labOrders->count(),
                'status_distribution' => $labOrders->selectRaw('status, COUNT(*) as count')->groupBy('status')->get(),
                'test_types' => $labOrders->join('lab_results', 'lab_orders.id', '=', 'lab_results.lab_order_id')
                    ->join('lab_tests', 'lab_results.lab_test_id', '=', 'lab_tests.id')
                    ->selectRaw('lab_tests.name as test_name, COUNT(*) as count')
                    ->groupBy('lab_tests.name')
                    ->orderBy('count', 'desc')
                    ->limit(10)
                    ->get(),
            ];
        } catch (\Exception $e) {
            Log::error('Lab analytics error: ' . $e->getMessage());
            return [
                'total_orders' => 0,
                'status_distribution' => collect(),
                'test_types' => collect(),
            ];
        }
    }

    /**
     * Get inventory analytics data
     */
    private function getInventoryAnalytics(Request $request)
    {
        try {
            $supplies = Supply::all();

            return [
                'total_products' => $supplies->count(),
                'low_stock_items' => $supplies->filter(function($supply) {
                    return $supply->current_stock <= $supply->minimum_stock_level;
                })->count(),
                'out_of_stock' => $supplies->filter(function($supply) {
                    return $supply->current_stock <= 0;
                })->count(),
                'category_distribution' => $supplies->groupBy('category')->map->count(),
            ];
        } catch (\Exception $e) {
            Log::error('Inventory analytics error: ' . $e->getMessage());
            return [
                'total_products' => 0,
                'low_stock_items' => 0,
                'out_of_stock' => 0,
                'category_distribution' => collect(),
            ];
        }
    }

    /**
     * Get all report data for comprehensive export
     */
    private function getAllReportData(Request $request)
    {
        try {
            $dateFrom = $request->get('date_from', now()->startOfMonth()->format('Y-m-d'));
            $dateTo = $request->get('date_to', now()->endOfMonth()->format('Y-m-d'));
            
            $exportData = [];
            
            // Get patients data
            $patients = Patient::whereBetween('created_at', [$dateFrom, $dateTo])->get();
            foreach ($patients as $patient) {
                $exportData[] = [
                    'Type' => 'Patient',
                    'ID' => $patient->patient_no,
                    'Name' => $patient->first_name . ' ' . $patient->last_name,
                    'Age' => $patient->age,
                    'Sex' => $patient->sex,
                    'Phone' => $patient->phone,
                    'Email' => $patient->email,
                    'Address' => $patient->address,
                    'Created Date' => $patient->created_at->format('Y-m-d H:i:s'),
                ];
            }
            
            // Get appointments data
            $appointments = Appointment::whereBetween('appointment_date', [$dateFrom, $dateTo])->get();
            foreach ($appointments as $appointment) {
                $exportData[] = [
                    'Type' => 'Appointment',
                    'ID' => $appointment->id,
                    'Patient Name' => $appointment->patient_name,
                    'Specialist' => $appointment->specialist_name,
                    'Date' => $appointment->appointment_date->format('Y-m-d H:i:s'),
                    'Status' => $appointment->status,
                    'Type' => $appointment->appointment_type,
                    'Notes' => $appointment->notes ?? 'N/A',
                ];
            }
            
            // Get transactions data
            $transactions = BillingTransaction::whereBetween('transaction_date', [$dateFrom, $dateTo])->get();
            foreach ($transactions as $transaction) {
                $exportData[] = [
                    'Type' => 'Transaction',
                    'ID' => $transaction->transaction_id,
                    'Patient' => $transaction->patient?->first_name . ' ' . $transaction->patient?->last_name ?? 'N/A',
                    'Amount' => $transaction->total_amount,
                    'Payment Method' => $transaction->payment_method,
                    'Status' => $transaction->status,
                    'Date' => $transaction->transaction_date->format('Y-m-d H:i:s'),
                    'Description' => $transaction->description ?? 'N/A',
                ];
            }
            
            // Get lab orders data
            $labOrders = LabOrder::whereBetween('created_at', [$dateFrom, $dateTo])->get();
            foreach ($labOrders as $order) {
                $exportData[] = [
                    'Type' => 'Lab Order',
                    'ID' => $order->id,
                    'Patient' => $order->patient?->first_name . ' ' . $order->patient?->last_name ?? 'N/A',
                    'Status' => $order->status,
                    'Created Date' => $order->created_at->format('Y-m-d H:i:s'),
                    'Notes' => $order->notes ?? 'N/A',
                ];
            }
            
            return $exportData;
        } catch (\Exception $e) {
            Log::error('Get all report data error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Format data for export based on type
     */
    private function formatDataForExport($data, $type)
    {
        try {
            $exportData = [];
            
            switch ($type) {
                case 'financial':
                    foreach ($data['transactions'] as $transaction) {
                        $exportData[] = [
                            'Transaction ID' => $transaction->transaction_id,
                            'Patient' => $transaction->patient?->first_name . ' ' . $transaction->patient?->last_name ?? 'N/A',
                            'Amount' => $transaction->total_amount,
                            'Payment Method' => $transaction->payment_method,
                            'Status' => $transaction->status,
                            'Date' => $transaction->transaction_date->format('Y-m-d H:i:s'),
                        ];
                    }
                    break;
                    
                case 'patients':
                    foreach ($data['patients'] as $patient) {
                        $exportData[] = [
                            'Patient ID' => $patient->patient_no,
                            'Name' => $patient->first_name . ' ' . $patient->last_name,
                            'Age' => $patient->age,
                            'Sex' => $patient->sex,
                            'Phone' => $patient->phone,
                            'Email' => $patient->email,
                            'Created Date' => $patient->created_at->format('Y-m-d H:i:s'),
                        ];
                    }
                    break;
                    
                case 'laboratory':
                    foreach ($data['labOrders'] as $order) {
                        $exportData[] = [
                            'Order ID' => $order->id,
                            'Patient' => $order->patient?->first_name . ' ' . $order->patient?->last_name ?? 'N/A',
                            'Status' => $order->status,
                            'Created Date' => $order->created_at->format('Y-m-d H:i:s'),
                        ];
                    }
                    break;
                    
                case 'inventory':
                    foreach ($data['supplies'] as $supply) {
                        $exportData[] = [
                            'Product ID' => $supply->id,
                            'Name' => $supply->name,
                            'Category' => $supply->category,
                            'Current Stock' => $supply->current_stock,
                            'Minimum Level' => $supply->minimum_stock_level,
                            'Status' => $supply->current_stock <= $supply->minimum_stock_level ? 'Low Stock' : 'Normal',
                        ];
                    }
                    break;
            }
            
            return $exportData;
        } catch (\Exception $e) {
            Log::error('Format data for export error: ' . $e->getMessage());
            return [];
        }
    }
}