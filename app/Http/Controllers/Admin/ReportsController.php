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
use App\Models\PatientVisit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
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

        // Get summary statistics
        $summary = [
            'total_patients' => Patient::count(),
            'total_appointments' => Appointment::count(),
            'total_transactions' => BillingTransaction::count(),
            'total_revenue' => BillingTransaction::sum('total_amount'),
            'total_expenses' => Expense::sum('amount'),
            'total_lab_orders' => LabOrder::count(),
            'total_products' => Supply::count(),
        ];

        // Get filter options for dropdowns
        $filterOptions = $this->getFilterOptions();

        // Get recent reports
        $recentReports = $this->getRecentReports();

        // Chart data from database
        $chartData = $this->getChartData();

        return Inertia::render('admin/reports/index', [
            'summary' => $summary,
            'recentReports' => $recentReports,
            'filterOptions' => $filterOptions,
            'user' => $user,
            'metadata' => $this->getReportMetadata(),
            'chartData' => $chartData,
        ]);
    }

    /**
     * Financial Reports
     */
    public function financial(Request $request): Response
    {
        if (!$this->checkReportAccess('financial')) {
            abort(403, 'You do not have permission to access financial reports.');
        }

        $query = BillingTransaction::query();

        // Apply filters
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

        // Calculate summary
        $summary = [
            'total_revenue' => $transactions->sum('total_amount'),
            'total_transactions' => $transactions->count(),
            'average_transaction' => $transactions->avg('total_amount'),
            'cash_payments' => $transactions->where('payment_method', 'Cash')->sum('total_amount'),
            'hmo_payments' => $transactions->where('payment_method', 'HMO')->sum('total_amount'),
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
    }

    /**
     * Patient Reports
     */
    public function patients(Request $request): Response
    {
        if (!$this->checkReportAccess('patients')) {
            abort(403, 'You do not have permission to access patient reports.');
        }

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
    }

    /**
     * Laboratory Reports
     */
    public function laboratory(Request $request): Response
    {
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
        ]);
    }

    /**
     * Inventory Reports
     */
    public function inventory(Request $request): Response
    {
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
            'total_value' => $supplies->sum('total_value'),
        ];

        return Inertia::render('admin/reports/inventory', [
            'products' => $supplies,
            'summary' => $summary,
        ]);
    }

    /**
     * Analytics Dashboard
     */

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
        $currentMonth = $model::where('created_at', '>=', now()->startOfMonth())->count();
        $lastMonth = $model::whereBetween('created_at', [
            now()->subMonth()->startOfMonth(),
            now()->subMonth()->endOfMonth()
        ])->count();

        if ($lastMonth == 0) {
            return $currentMonth > 0 ? 100 : 0;
        }

        return round((($currentMonth - $lastMonth) / $lastMonth) * 100, 2);
    }

    /**
     * Calculate revenue growth rate
     */
    private function calculateRevenueGrowthRate()
    {
        $currentMonth = BillingTransaction::where('transaction_date', '>=', now()->startOfMonth())->sum('total_amount');
        $lastMonth = BillingTransaction::whereBetween('transaction_date', [
            now()->subMonth()->startOfMonth(),
            now()->subMonth()->endOfMonth()
        ])->sum('total_amount');

        if ($lastMonth == 0) {
            return $currentMonth > 0 ? 100 : 0;
        }

        return round((($currentMonth - $lastMonth) / $lastMonth) * 100, 2);
    }

    /**
     * Get filter options for dropdowns
     */
    private function getFilterOptions()
    {
        return [
            'doctors' => User::where('role', 'doctor')->select('id', 'name')->get(),
            'departments' => ['General Medicine', 'Cardiology', 'Pediatrics', 'Orthopedics', 'Laboratory'],
            'statuses' => ['Completed', 'Pending', 'Cancelled', 'In Progress'],
            'payment_methods' => ['Cash', 'Credit Card', 'HMO', 'Insurance'],
            'hmo_providers' => ['Maxicare', 'PhilHealth', 'Intellicare', 'MediCard'],
        ];
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
    }

    /**
     * Get patient chart data
     */
    private function getPatientChartData(Request $request)
    {
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
    }

    /**
     * Get age group distribution
     */
    private function getAgeGroupDistribution($patients)
    {
        return $patients->groupBy(function($patient) {
            if ($patient->age < 18) return '0-17';
            if ($patient->age <= 30) return '18-30';
            if ($patient->age <= 50) return '31-50';
            if ($patient->age <= 70) return '51-70';
            return '70+';
        })->map->count();
    }

    /**
     * Export to Excel
     */
    private function exportToExcel($type, Request $request, $filename)
    {
        // Implementation for Excel export
        return response()->json(['message' => 'Excel export not yet implemented']);
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
    }

    /**
     * Get financial report data
     */
    private function getFinancialReportData(Request $request)
    {
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
                'total_revenue' => $transactions->sum('total_amount'),
                'total_transactions' => $transactions->count(),
                'average_transaction' => $transactions->avg('total_amount'),
            ]
        ];
    }

    /**
     * Get patient report data
     */
    private function getPatientReportData(Request $request)
    {
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
    }

    /**
     * Get laboratory report data
     */
    private function getLaboratoryReportData(Request $request)
    {
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
    }

    /**
     * Get inventory report data
     */
    private function getInventoryReportData(Request $request)
    {
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
    }

    /**
     * Get analytics report data
     */

    /**
     * Get chart data from database
     */
    private function getChartData()
    {
        // Monthly revenue data for the last 12 months
        $monthlyRevenue = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $revenue = BillingTransaction::whereYear('transaction_date', $date->year)
                ->whereMonth('transaction_date', $date->month)
                ->sum('total_amount');

            $appointments = Appointment::whereYear('appointment_date', $date->year)
                ->whereMonth('appointment_date', $date->month)
                ->count();

            $patients = Patient::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();

            $monthlyRevenue[] = [
                'month' => $date->format('M Y'),
                'revenue' => $revenue ?? 0,
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
}
