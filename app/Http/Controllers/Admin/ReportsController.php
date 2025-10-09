<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BillingTransaction;
use App\Models\DoctorPayment;
use App\Models\Expense;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\LabOrder;
use App\Models\Supply\Supply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ReportsController extends Controller
{
    /**
     * Display the main reports dashboard
     */
    public function index(): Response
    {
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

        // Get recent reports (mock data for now)
        $recentReports = [
            [
                'id' => 1,
                'name' => 'Monthly Financial Report',
                'type' => 'Financial',
                'dateRange' => 'January 2025',
                'generatedBy' => 'Admin User',
                'status' => 'Generated',
                'lastGenerated' => '2025-01-15 10:30 AM',
                'downloadUrl' => '/reports/financial-jan-2025.pdf'
            ],
            [
                'id' => 2,
                'name' => 'Patient Analytics Report',
                'type' => 'Analytics',
                'dateRange' => 'Q4 2024',
                'generatedBy' => 'Admin User',
                'status' => 'Generated',
                'lastGenerated' => '2025-01-10 2:15 PM',
                'downloadUrl' => '/reports/patient-analytics-q4-2024.pdf'
            ],
        ];

        return Inertia::render('admin/reports/index', [
            'summary' => $summary,
            'recentReports' => $recentReports,
        ]);
    }

    /**
     * Financial Reports
     */
    public function financial(Request $request): Response
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth());
        $dateTo = $request->get('date_to', now()->endOfMonth());

        $transactions = BillingTransaction::whereBetween('transaction_date', [$dateFrom, $dateTo])
            ->with(['patient', 'doctor'])
            ->orderBy('transaction_date', 'desc')
            ->paginate(20);

        $summary = [
            'total_revenue' => $transactions->sum('total_amount'),
            'total_transactions' => $transactions->count(),
            'average_transaction' => $transactions->avg('total_amount'),
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
        ];

        return Inertia::render('admin/reports/financial', [
            'transactions' => $transactions,
            'summary' => $summary,
        ]);
    }

    /**
     * Patient Reports
     */
    public function patients(Request $request): Response
    {
        $query = Patient::query();

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date_to);
        }

        if ($request->filled('sex')) {
            $query->where('sex', $request->sex);
        }

        $patients = $query->withCount(['appointments', 'labOrders'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $summary = [
            'total_patients' => $patients->count(),
            'new_patients' => $patients->where('created_at', '>=', now()->startOfMonth())->count(),
            'male_patients' => $patients->where('sex', 'Male')->count(),
            'female_patients' => $patients->where('sex', 'Female')->count(),
        ];

        return Inertia::render('admin/reports/patients', [
            'patients' => $patients,
            'summary' => $summary,
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
    public function analytics(): Response
    {
        $analytics = [
            'patients' => [
                'total' => Patient::count(),
                'new_this_month' => Patient::where('created_at', '>=', now()->startOfMonth())->count(),
                'growth_rate' => $this->calculateGrowthRate(Patient::class),
            ],
            'appointments' => [
                'total' => Appointment::count(),
                'this_month' => Appointment::where('created_at', '>=', now()->startOfMonth())->count(),
                'growth_rate' => $this->calculateGrowthRate(Appointment::class),
            ],
            'revenue' => [
                'total' => BillingTransaction::sum('total_amount'),
                'this_month' => BillingTransaction::where('transaction_date', '>=', now()->startOfMonth())->sum('total_amount'),
                'growth_rate' => $this->calculateRevenueGrowthRate(),
            ],
            'lab_orders' => [
                'total' => LabOrder::count(),
                'this_month' => LabOrder::where('created_at', '>=', now()->startOfMonth())->count(),
                'growth_rate' => $this->calculateGrowthRate(LabOrder::class),
            ],
        ];

        return Inertia::render('admin/reports/analytics', [
            'analytics' => $analytics,
        ]);
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

            // For now, return a simple success message
            // In a full implementation, this would generate the actual export
            return response()->json([
                'success' => true,
                'message' => 'Export functionality will be implemented',
                'filename' => $type . '_report_' . now()->format('Ymd_His') . '.' . $format
            ]);

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
}
