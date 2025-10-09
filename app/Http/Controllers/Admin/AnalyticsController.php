<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\BillingTransaction;
use App\Models\LabOrder;
use App\Models\LabResult;
use App\Models\PatientTransfer;
use App\Models\ClinicProcedure;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function index(): Response
    {
        // Get dashboard analytics
        $analytics = $this->getDashboardAnalytics();
        
        return Inertia::render('Admin/Analytics/Index', [
            'analytics' => $analytics,
        ]);
    }

    public function getDashboardAnalytics(): array
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        $thisYear = Carbon::now()->startOfYear();

        return [
            // Patient Analytics
            'patients' => [
                'total' => Patient::count(),
                'new_this_month' => Patient::where('created_at', '>=', $thisMonth)->count(),
                'new_today' => Patient::whereDate('created_at', $today)->count(),
                'growth_rate' => $this->calculateGrowthRate(
                    Patient::where('created_at', '>=', $thisMonth)->count(),
                    Patient::whereBetween('created_at', [$lastMonth, $thisMonth])->count()
                ),
            ],

            // Appointment Analytics
            'appointments' => [
                'total' => Appointment::count(),
                'today' => Appointment::whereDate('appointment_date', $today)->count(),
                'this_month' => Appointment::where('appointment_date', '>=', $thisMonth)->count(),
                'pending' => Appointment::where('status', 'Pending')->count(),
                'confirmed' => Appointment::where('status', 'Confirmed')->count(),
                'completed' => Appointment::where('status', 'Completed')->count(),
                'cancelled' => Appointment::where('status', 'Cancelled')->count(),
            ],

            // Financial Analytics
            'financial' => [
                'total_revenue' => BillingTransaction::sum('total_amount'),
                'monthly_revenue' => BillingTransaction::where('transaction_date', '>=', $thisMonth)->sum('total_amount'),
                'today_revenue' => BillingTransaction::whereDate('transaction_date', $today)->sum('total_amount'),
                'average_transaction' => BillingTransaction::avg('total_amount'),
                'payment_methods' => $this->getPaymentMethodBreakdown(),
            ],

            // Laboratory Analytics
            'laboratory' => [
                'total_orders' => LabOrder::count(),
                'pending_results' => LabOrder::whereDoesntHave('results')->count(),
                'completed_results' => LabOrder::whereHas('results')->count(),
                'this_month_orders' => LabOrder::where('created_at', '>=', $thisMonth)->count(),
                'procedure_breakdown' => $this->getProcedureBreakdown(),
            ],

            // Transfer Analytics
            'transfers' => [
                'total_transfers' => PatientTransfer::count(),
                'pending_transfers' => PatientTransfer::where('status', 'pending')->count(),
                'completed_transfers' => PatientTransfer::where('status', 'completed')->count(),
                'this_month_transfers' => PatientTransfer::where('created_at', '>=', $thisMonth)->count(),
            ],

            // Staff Analytics
            'staff' => [
                'total_staff' => User::where('role', '!=', 'patient')->count(),
                'doctors' => User::where('role', 'doctor')->count(),
                'lab_staff' => User::whereIn('role', ['laboratory_technologist', 'medtech'])->count(),
                'cashiers' => User::where('role', 'cashier')->count(),
                'admins' => User::where('role', 'admin')->count(),
            ],
        ];
    }

    public function getPatientReport(Request $request): Response
    {
        $query = Patient::query();

        // Apply filters
        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date_to);
        }

        if ($request->filled('gender')) {
            $query->where('sex', $request->gender);
        }

        $patients = $query->with(['visits', 'appointments'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $summary = [
            'total_patients' => $patients->total(),
            'new_patients' => $query->where('created_at', '>=', Carbon::now()->subMonth())->count(),
            'active_patients' => $query->whereHas('appointments', function($q) {
                $q->where('created_at', '>=', Carbon::now()->subMonth());
            })->count(),
        ];

        return Inertia::render('Admin/Analytics/PatientReport', [
            'patients' => $patients,
            'summary' => $summary,
            'filters' => $request->only(['date_from', 'date_to', 'gender']),
        ]);
    }

    public function getSpecialistReport(Request $request): Response
    {
        $query = User::whereIn('role', ['doctor', 'medtech', 'laboratory_technologist']);

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $specialists = $query->withCount(['appointments', 'labOrders'])
            ->orderBy('name')
            ->get();

        $summary = [
            'total_specialists' => $specialists->count(),
            'doctors' => $specialists->where('role', 'doctor')->count(),
            'lab_staff' => $specialists->whereIn('role', ['medtech', 'laboratory_technologist'])->count(),
        ];

        return Inertia::render('Admin/Analytics/SpecialistReport', [
            'specialists' => $specialists,
            'summary' => $summary,
            'filters' => $request->only(['role']),
        ]);
    }

    public function getProcedureReport(Request $request): Response
    {
        $query = ClinicProcedure::query();

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date_to);
        }

        $procedures = $query->withCount(['appointments', 'labOrders'])
            ->orderBy('name')
            ->get();

        $summary = [
            'total_procedures' => $procedures->count(),
            'active_procedures' => $procedures->where('is_active', true)->count(),
            'emergency_procedures' => $procedures->where('is_emergency', true)->count(),
        ];

        return Inertia::render('Admin/Analytics/ProcedureReport', [
            'procedures' => $procedures,
            'summary' => $summary,
            'filters' => $request->only(['category', 'date_from', 'date_to']),
        ]);
    }

    public function getFinancialReport(Request $request): Response
    {
        $query = BillingTransaction::query();

        if ($request->filled('date_from')) {
            $query->where('transaction_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('transaction_date', '<=', $request->date_to);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->filled('hmo_provider')) {
            $query->where('hmo_provider', $request->hmo_provider);
        }

        $transactions = $query->with(['patient', 'doctor'])
            ->orderBy('transaction_date', 'desc')
            ->paginate(20);

        $summary = [
            'total_revenue' => $transactions->sum('total_amount'),
            'total_transactions' => $transactions->count(),
            'average_transaction' => $transactions->avg('total_amount'),
            'payment_methods' => $this->getPaymentMethodBreakdown($query),
            'hmo_providers' => $this->getHMOProviderBreakdown($query),
        ];

        return Inertia::render('Admin/Analytics/FinancialReport', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $request->only(['date_from', 'date_to', 'payment_method', 'hmo_provider']),
        ]);
    }

    public function getInventoryReport(Request $request): Response
    {
        // This will be implemented when we enhance inventory management
        return Inertia::render('Admin/Analytics/InventoryReport', [
            'message' => 'Inventory reporting will be available after inventory enhancements',
        ]);
    }

    public function exportReport(Request $request, string $type)
    {
        $format = $request->get('format', 'excel');
        
        switch ($type) {
            case 'patients':
                return $this->exportPatientReport($request, $format);
            case 'specialists':
                return $this->exportSpecialistReport($request, $format);
            case 'procedures':
                return $this->exportProcedureReport($request, $format);
            case 'financial':
                return $this->exportFinancialReport($request, $format);
            default:
                abort(404, 'Report type not found');
        }
    }

    private function calculateGrowthRate($current, $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }
        return round((($current - $previous) / $previous) * 100, 2);
    }

    private function getPaymentMethodBreakdown($query = null)
    {
        $query = $query ?? BillingTransaction::query();
        
        return $query->select('payment_method', DB::raw('count(*) as count'), DB::raw('sum(total_amount) as total'))
            ->groupBy('payment_method')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->payment_method => [
                    'count' => $item->count,
                    'total' => $item->total,
                ]];
            });
    }

    private function getHMOProviderBreakdown($query = null)
    {
        $query = $query ?? BillingTransaction::query();
        
        return $query->whereNotNull('hmo_provider')
            ->select('hmo_provider', DB::raw('count(*) as count'), DB::raw('sum(total_amount) as total'))
            ->groupBy('hmo_provider')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->hmo_provider => [
                    'count' => $item->count,
                    'total' => $item->total,
                ]];
            });
    }

    private function getProcedureBreakdown()
    {
        return LabOrder::select('test_name', DB::raw('count(*) as count'))
            ->groupBy('test_name')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();
    }

    private function exportPatientReport(Request $request, string $format)
    {
        // Implementation for patient report export
        // This would use Laravel Excel or similar package
        return response()->json(['message' => 'Patient report export functionality']);
    }

    private function exportSpecialistReport(Request $request, string $format)
    {
        // Implementation for specialist report export
        return response()->json(['message' => 'Specialist report export functionality']);
    }

    private function exportProcedureReport(Request $request, string $format)
    {
        // Implementation for procedure report export
        return response()->json(['message' => 'Procedure report export functionality']);
    }

    private function exportFinancialReport(Request $request, string $format)
    {
        // Implementation for financial report export
        return response()->json(['message' => 'Financial report export functionality']);
    }
}
