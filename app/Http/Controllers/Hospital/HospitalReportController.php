<?php

namespace App\Http\Controllers\Hospital;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\BillingTransaction;
use App\Models\Supply\Supply as Inventory;
use App\Models\Supply\SupplyTransaction as InventoryTransaction;
use App\Models\PatientTransfer;
use App\Models\Report;
use App\Models\LabOrder;
use App\Models\LabResult;
use App\Models\LabTest;
use App\Models\PatientReferral;
use App\Models\DoctorPayment;
// use App\Models\Expense; // Expense model removed
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class HospitalReportController extends Controller
{
    /**
     * Display the hospital reports dashboard.
     */
    public function index(Request $request): Response
    {
        $dateRange = $this->getDateRange($request);
        $summary = $this->getSummaryStatistics($dateRange);
        $chartData = $this->getChartData($dateRange);
        $recentActivities = $this->getRecentActivities($dateRange);

        // Determine if this is an admin route
        $isAdminRoute = $request->route()->getName() && str_starts_with($request->route()->getName(), 'admin.');
        $componentPath = $isAdminRoute ? 'admin/reports/IndexSimple' : 'Hospital/Reports/IndexSimple';

        // Get the active tab from the request
        $activeTab = $request->get('period', 'daily');

        return Inertia::render($componentPath, [
            'user' => $request->user(),
            'summary' => $summary,
            'chartData' => $chartData,
            'recentActivities' => $recentActivities,
            'dateRange' => [
                'start' => $dateRange['start']->toDateString(),
                'end' => $dateRange['end']->toDateString(),
                'period' => $dateRange['period'],
                'label' => $dateRange['label']
            ],
            'activeTab' => $activeTab
        ]);
    }

    /**
     * Display patient reports.
     */
    public function patients(Request $request): Response
    {
        $dateRange = $this->getDateRange($request);
        $filters = $request->only(['sex', 'age_group', 'civil_status', 'search']);

        $query = Patient::whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);

        // Apply filters
        if (!empty($filters['sex'])) {
            $query->where('sex', $filters['sex']);
        }

        if (!empty($filters['age_group'])) {
            switch ($filters['age_group']) {
                case 'under_18':
                    $query->where('age', '<', 18);
                    break;
                case '18_30':
                    $query->whereBetween('age', [18, 30]);
                    break;
                case '31_50':
                    $query->whereBetween('age', [31, 50]);
                    break;
                case '51_70':
                    $query->whereBetween('age', [51, 70]);
                    break;
                case 'over_70':
                    $query->where('age', '>', 70);
                    break;
            }
        }

        if (!empty($filters['civil_status'])) {
            $query->where('civil_status', $filters['civil_status']);
        }

        if (!empty($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('full_name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('patient_no', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('mobile_no', 'like', '%' . $filters['search'] . '%');
            });
        }

        $patients = $query->orderBy('created_at', 'desc')->paginate(20);
        $stats = $this->getPatientStatistics($dateRange);

        return Inertia::render('Hospital/Reports/PatientsSimple', [
            'user' => $request->user(),
            'patients' => $patients,
            'stats' => $stats,
            'dateRange' => [
                'start' => $dateRange['start']->toDateString(),
                'end' => $dateRange['end']->toDateString(),
                'period' => $dateRange['period'],
                'label' => $dateRange['label']
            ],
            'filters' => $filters
        ]);
    }

    /**
     * Display appointment reports.
     */
    public function appointments(Request $request): Response
    {
        // Determine if this is an admin route
        $isAdminRoute = $request->route()->getName() && str_starts_with($request->route()->getName(), 'admin.');
        $componentPath = $isAdminRoute ? 'admin/reports/AppointmentsSimple' : 'Hospital/Reports/AppointmentsSimple';

        // Simple appointment reports with minimal data
        return Inertia::render($componentPath, [
            'user' => $request->user(),
            'appointments' => [
                'data' => [],
                'links' => [],
                'meta' => []
            ],
            'stats' => [
                'total_appointments' => 0,
                'completed_appointments' => 0,
                'pending_appointments' => 0,
                'cancelled_appointments' => 0
            ],
            'dateRange' => [
                'start' => now()->startOfMonth()->toDateString(),
                'end' => now()->endOfMonth()->toDateString()
            ],
            'filters' => []
        ]);
    }

    /**
     * Display transaction reports.
     */
    public function transactions(Request $request): Response
    {
        $dateRange = $this->getDateRange($request);

        // Get transactions with pagination
        $transactions = BillingTransaction::with(['patient'])
            ->whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']])
            ->orderBy('transaction_date', 'desc')
            ->paginate(20)
            ->through(function($transaction) {
                return [
                    'id' => $transaction->id,
                    'patient_name' => $transaction->patient ? $transaction->patient->first_name . ' ' . $transaction->patient->last_name : 'Unknown',
                    'transaction_type' => $transaction->transaction_type ?? 'Payment',
                    'amount' => $transaction->total_amount,
                    'payment_type' => $transaction->payment_type ?? 'Cash',
                    'status' => $transaction->status,
                    'transaction_date' => $transaction->transaction_date,
                    'created_by' => $transaction->createdBy?->name,
                ];
            });

        // Get statistics
        $stats = [
            'total_transactions' => BillingTransaction::whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']])->count(),
            'total_revenue' => BillingTransaction::whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']])
                ->where('status', 'completed')->sum('total_amount'),
            'pending_payments' => BillingTransaction::whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']])
                ->where('status', 'pending')->count(),
            'completed_payments' => BillingTransaction::whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']])
                ->where('status', 'completed')->count(),
        ];

        return Inertia::render('Hospital/Reports/TransactionsSimple', [
            'user' => $request->user(),
            'transactions' => $transactions,
            'stats' => $stats,
            'dateRange' => [
                'start' => $dateRange['start']->toDateString(),
                'end' => $dateRange['end']->toDateString(),
                'period' => $dateRange['period'],
                'label' => $dateRange['label']
            ],
            'filters' => $request->only(['status', 'payment_type'])
        ]);
    }

    /**
     * Display inventory reports.
     */
    public function inventory(Request $request): Response
    {
        $dateRange = $this->getDateRange($request);

        // Get inventory statistics
        $stats = [
            'total_items' => Inventory::count(),
            'low_stock_items' => DB::table('supply_stock_levels')
                ->where('current_stock', '<=', 10)
                ->count(),
            'out_of_stock_items' => DB::table('supply_stock_levels')
                ->where('current_stock', 0)
                ->count(),
            'total_value' => DB::table('supply_stock_levels')
                ->sum('total_value'),
        ];

        // Get inventory transactions
        $transactions = InventoryTransaction::with(['supply'])
            ->whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']])
            ->orderBy('transaction_date', 'desc')
            ->paginate(20)
            ->through(function($transaction) {
                return [
                    'id' => $transaction->id,
                    'supply_name' => $transaction->supply?->name || 'Unknown',
                    'type' => $transaction->type,
                    'quantity' => $transaction->quantity,
                    'unit_cost' => $transaction->unit_cost,
                    'total_cost' => $transaction->total_cost,
                    'transaction_date' => $transaction->transaction_date,
                ];
            });

        return Inertia::render('Hospital/Reports/InventorySimple', [
            'user' => $request->user(),
            'stats' => $stats,
            'transactions' => $transactions,
            'dateRange' => [
                'start' => $dateRange['start']->toDateString(),
                'end' => $dateRange['end']->toDateString(),
                'period' => $dateRange['period'],
                'label' => $dateRange['label']
            ],
            'filters' => $request->only(['type', 'supply_id'])
        ]);
    }

    /**
     * Display transfer reports.
     */
    public function transfers(Request $request): Response
    {
        $dateRange = $this->getDateRange($request);

        // Get transfers with pagination
        $transfers = PatientTransfer::with(['patient', 'transferredBy'])
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(function($transfer) {
                return [
                    'id' => $transfer->id,
                    'patient_name' => $transfer->patient ? $transfer->patient->first_name . ' ' . $transfer->patient->last_name : 'Unknown',
                    'transfer_reason' => $transfer->transfer_reason,
                    'priority' => $transfer->priority,
                    'status' => $transfer->status,
                    'created_at' => $transfer->created_at,
                    'transferred_by' => $transfer->transferredBy ? $transfer->transferredBy->name : 'Unknown',
                ];
            });

        // Get statistics
        $stats = [
            'total_transfers' => PatientTransfer::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])->count(),
            'completed_transfers' => PatientTransfer::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
                ->where('status', 'completed')->count(),
            'pending_transfers' => PatientTransfer::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
                ->where('status', 'pending')->count(),
            'cancelled_transfers' => PatientTransfer::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
                ->where('status', 'cancelled')->count(),
        ];

        return Inertia::render('Hospital/Reports/TransfersSimple', [
            'user' => $request->user(),
            'transfers' => $transfers,
            'stats' => $stats,
            'dateRange' => [
                'start' => $dateRange['start']->toDateString(),
                'end' => $dateRange['end']->toDateString(),
                'period' => $dateRange['period'],
                'label' => $dateRange['label']
            ],
            'filters' => $request->only(['status', 'priority'])
        ]);
    }

    /**
     * Display laboratory reports.
     */
    public function laboratory(Request $request): Response
    {
        $dateRange = $this->getDateRange($request);
        $filters = $request->only(['test_type', 'status', 'search']);

        $query = LabOrder::whereBetween('lab_orders.created_at', [$dateRange['start'], $dateRange['end']]);

        // Apply filters
        if (!empty($filters['test_type'])) {
            $query->whereHas('labTests', function($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['test_type'] . '%');
            });
        }

        if (!empty($filters['status'])) {
            $query->where('lab_orders.status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('lab_orders.id', 'like', '%' . $filters['search'] . '%')
                  ->orWhereHas('patient', function($patientQuery) use ($filters) {
                      $patientQuery->where('full_name', 'like', '%' . $filters['search'] . '%');
                  });
            });
        }

        $labOrders = $query->with(['patient', 'labTests', 'results'])->orderBy('created_at', 'desc')->paginate(20);
        $stats = $this->getLaboratoryStatistics($dateRange);

        // Determine if this is an admin route
        $isAdminRoute = $request->route()->getName() && str_starts_with($request->route()->getName(), 'admin.');
        $componentPath = $isAdminRoute ? 'admin/reports/LaboratorySimple' : 'Hospital/Reports/LaboratorySimple';

        return Inertia::render($componentPath, [
            'user' => $request->user(),
            'labOrders' => $labOrders,
            'stats' => $stats,
            'dateRange' => [
                'start' => $dateRange['start']->toDateString(),
                'end' => $dateRange['end']->toDateString(),
                'period' => $dateRange['period'],
                'label' => $dateRange['label']
            ],
            'filters' => $filters
        ]);
    }

    /**
     * Display specialist management reports.
     */
    public function specialistManagement(Request $request): Response
    {
        $dateRange = $this->getDateRange($request);
        $filters = $request->only(['specialist_type', 'status', 'search']);

        $query = PatientReferral::whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);

        // Apply filters
        if (!empty($filters['specialist_type'])) {
            $query->where('specialist_type', $filters['specialist_type']);
        }

        if (!empty($filters['status'])) {
            $query->where('lab_orders.status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('referral_reason', 'like', '%' . $filters['search'] . '%')
                  ->orWhereHas('patient', function($patientQuery) use ($filters) {
                      $patientQuery->where('full_name', 'like', '%' . $filters['search'] . '%');
                  });
            });
        }

        $referrals = $query->with(['patient', 'referredBy', 'approvedBy'])->orderBy('created_at', 'desc')->paginate(20);
        $stats = $this->getSpecialistManagementStatistics($dateRange);

        // Determine if this is an admin route
        $isAdminRoute = $request->route()->getName() && str_starts_with($request->route()->getName(), 'admin.');
        $componentPath = $isAdminRoute ? 'admin/reports/SpecialistManagementSimple' : 'Hospital/Reports/SpecialistManagementSimple';

        return Inertia::render($componentPath, [
            'user' => $request->user(),
            'referrals' => $referrals,
            'stats' => $stats,
            'dateRange' => [
                'start' => $dateRange['start']->toDateString(),
                'end' => $dateRange['end']->toDateString(),
                'period' => $dateRange['period'],
                'label' => $dateRange['label']
            ],
            'filters' => $filters
        ]);
    }

    /**
     * Display clinic operations reports.
     */
    public function clinicOperations(Request $request): Response
    {
        $dateRange = $this->getDateRange($request);
        $stats = $this->getClinicOperationsStatistics($dateRange);

        return Inertia::render('Hospital/Reports/ClinicOperationsSimple', [
            'user' => $request->user(),
            'stats' => $stats,
            'dateRange' => [
                'start' => $dateRange['start']->toDateString(),
                'end' => $dateRange['end']->toDateString(),
                'period' => $dateRange['period'],
                'label' => $dateRange['label']
            ]
        ]);
    }

    /**
     * Export reports.
     */
    public function export(Request $request, string $type)
    {
        // Debug logging
        \Log::info('Hospital export requested', [
            'type' => $type,
            'user_id' => auth()->id(),
            'request_params' => $request->all()
        ]);

        $dateRange = $this->getDateRange($request);

        try {
            switch ($type) {
                case 'all':
                    return $this->exportAll($dateRange);
                case 'patients':
                    return $this->exportPatients($dateRange);
                case 'laboratory':
                    return $this->exportLaboratory($dateRange);
                case 'inventory':
                    return $this->exportInventory($dateRange);
                case 'appointments':
                    return $this->exportAppointments($dateRange);
                case 'specialist_management':
                    return $this->exportSpecialistManagement($dateRange);
                case 'billing':
                case 'transactions':
                    return $this->exportTransactions($dateRange);
                case 'transfers':
                    return $this->exportTransfers($dateRange);
                default:
                    \Log::error('Invalid export type requested', ['type' => $type]);
                    return response()->json(['message' => 'Invalid export type'], 400);
            }
        } catch (\Exception $e) {
            \Log::error('Export failed', [
                'type' => $type,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get date range from request or default to current month.
     */
    private function getDateRange(Request $request): array
    {
        $period = $request->get('period', 'monthly');
        $start = $request->get('start_date');
        $end = $request->get('end_date');

        if ($start && $end) {
            return [
                'start' => Carbon::parse($start)->startOfDay(),
                'end' => Carbon::parse($end)->endOfDay(),
                'period' => 'custom',
                'label' => 'Custom Range'
            ];
        }

        $now = Carbon::now();

        switch ($period) {
            case 'daily':
                return [
                    'start' => $now->copy()->startOfDay(),
                    'end' => $now->copy()->endOfDay(),
                    'period' => 'daily',
                    'label' => 'Today (' . $now->format('M d, Y') . ')'
                ];
            case 'monthly':
                return [
                    'start' => $now->copy()->startOfMonth(),
                    'end' => $now->copy()->endOfMonth(),
                    'period' => 'monthly',
                    'label' => 'This Month (' . $now->format('M Y') . ')'
                ];
            case 'yearly':
                return [
                    'start' => $now->copy()->startOfYear(),
                    'end' => $now->copy()->endOfYear(),
                    'period' => 'yearly',
                    'label' => 'This Year (' . $now->format('Y') . ')'
                ];
            case 'last_7_days':
                return [
                    'start' => $now->copy()->subDays(7)->startOfDay(),
                    'end' => $now->copy()->endOfDay(),
                    'period' => 'last_7_days',
                    'label' => 'Last 7 Days'
                ];
            case 'last_30_days':
                return [
                    'start' => $now->copy()->subDays(30)->startOfDay(),
                    'end' => $now->copy()->endOfDay(),
                    'period' => 'last_30_days',
                    'label' => 'Last 30 Days'
                ];
            default:
                return [
                    'start' => $now->copy()->startOfMonth(),
                    'end' => $now->copy()->endOfMonth(),
                    'period' => 'monthly',
                    'label' => 'This Month (' . $now->format('M Y') . ')'
                ];
        }
    }

    /**
     * Get summary statistics for dashboard.
     */
    private function getSummaryStatistics(array $dateRange): array
    {
        return [
            'total_patients' => Patient::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])->count(),
            'total_appointments' => Appointment::whereBetween('appointment_date', [$dateRange['start'], $dateRange['end']])->count(),
            'total_transactions' => BillingTransaction::whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']])->count(),
            'total_revenue' => BillingTransaction::whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']])
                ->where('status', 'completed')
                ->sum('total_amount'),
            'completed_appointments' => Appointment::whereBetween('appointment_date', [$dateRange['start'], $dateRange['end']])
                ->where('status', 'Completed')->count(),
            'pending_appointments' => Appointment::whereBetween('appointment_date', [$dateRange['start'], $dateRange['end']])
                ->where('status', 'Pending')->count(),
        ];
    }

    /**
     * Get patient statistics.
     */
    private function getPatientStatistics(array $dateRange): array
    {
        $patients = Patient::whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);

        return [
            'total' => $patients->count(),
            'by_sex' => $patients->select('sex', DB::raw('count(*) as count'))
                ->groupBy('sex')
                ->get()
                ->pluck('count', 'sex'),
            'by_age_group' => $patients->selectRaw('
                CASE
                    WHEN age < 18 THEN "Under 18"
                    WHEN age BETWEEN 18 AND 30 THEN "18-30"
                    WHEN age BETWEEN 31 AND 50 THEN "31-50"
                    WHEN age BETWEEN 51 AND 70 THEN "51-70"
                    ELSE "Over 70"
                END as age_group,
                COUNT(*) as count
            ')->groupBy('age_group')->get()->pluck('count', 'age_group'),
        ];
    }

    /**
     * Get appointment statistics.
     */
    private function getAppointmentStatistics(array $dateRange): array
    {
        $appointments = Appointment::whereBetween('appointment_date', [$dateRange['start'], $dateRange['end']]);

        return [
            'total' => $appointments->count(),
            'by_status' => $appointments->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get()
                ->pluck('count', 'status'),
            'by_specialist_type' => $appointments->select('specialist_type', DB::raw('count(*) as count'))
                ->groupBy('specialist_type')
                ->get()
                ->pluck('count', 'specialist_type'),
            'total_revenue' => $appointments->sum('price'),
        ];
    }

    /**
     * Get transaction statistics.
     */
    private function getTransactionStatistics(array $dateRange): array
    {
        $transactions = BillingTransaction::whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']]);

        return [
            'total' => $transactions->count(),
            'total_amount' => $transactions->sum('total_amount'),
            'by_payment_type' => $transactions->select('payment_type', DB::raw('count(*) as count'))
                ->groupBy('payment_type')
                ->get()
                ->pluck('count', 'payment_type'),
            'by_status' => $transactions->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get()
                ->pluck('count', 'status'),
        ];
    }

    /**
     * Get inventory statistics.
     */
    private function getInventoryStatistics(array $dateRange): array
    {
        $transactions = InventoryTransaction::whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']]);

        return [
            'total_transactions' => $transactions->count(),
            'by_type' => $transactions->select('type', DB::raw('count(*) as count'))
                ->groupBy('type')
                ->get()
                ->pluck('count', 'type'),
            'total_value' => $transactions->sum('total_cost'),
        ];
    }

    /**
     * Export patients data.
     */
    private function exportPatients(array $dateRange)
    {
        \Log::info('Starting exportPatients', [
            'dateRange' => $dateRange,
            'start' => $dateRange['start']->format('Y-m-d H:i:s'),
            'end' => $dateRange['end']->format('Y-m-d H:i:s')
        ]);

        $patients = Patient::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->orderBy('created_at', 'desc')
            ->get();

        \Log::info('Patients found for export', [
            'count' => $patients->count(),
            'patients' => $patients->pluck('patient_no', 'id')->toArray()
        ]);

        $filename = 'patients_report_' . now()->format('Y_m_d_H_i_s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($patients) {
            \Log::info('CSV callback started', ['patient_count' => $patients->count()]);

            $file = fopen('php://output', 'w');

            // CSV headers
            fputcsv($file, [
                'Patient No', 'Full Name', 'Birthdate', 'Age', 'Sex',
                'Mobile No', 'Address', 'Occupation', 'Civil Status',
                'Registration Date'
            ]);

            foreach ($patients as $patient) {
                fputcsv($file, [
                    $patient->patient_no,
                    $patient->full_name,
                    $patient->birthdate?->format('Y-m-d'),
                    $patient->age,
                    $patient->sex,
                    $patient->mobile_no,
                    $patient->present_address,
                    $patient->occupation,
                    $patient->civil_status,
                    $patient->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
            \Log::info('CSV callback completed');
        };

        \Log::info('Returning stream response', ['filename' => $filename]);
        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export appointments data.
     */
    private function exportAppointments(array $dateRange)
    {
        $appointments = Appointment::whereBetween('appointment_date', [$dateRange['start'], $dateRange['end']])
            ->orderBy('appointment_date', 'desc')
            ->get();

        $filename = 'appointments_report_' . now()->format('Y_m_d_H_i_s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($appointments) {
            $file = fopen('php://output', 'w');

            // CSV headers
            fputcsv($file, [
                'Patient Name', 'Appointment Date', 'Appointment Time',
                'Specialist Name', 'Specialist Type', 'Appointment Type',
                'Status', 'Price'
            ]);

            foreach ($appointments as $appointment) {
                fputcsv($file, [
                    $appointment->patient_name,
                    $appointment->appointment_date?->format('Y-m-d'),
                    $appointment->appointment_time?->format('H:i:s'),
                    $appointment->specialist_name,
                    $appointment->specialist_type,
                    $appointment->appointment_type,
                    $appointment->status,
                    $appointment->price,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export transactions data.
     */
    private function exportTransactions(array $dateRange)
    {
        $transactions = BillingTransaction::with(['patient', 'doctor'])
            ->whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']])
            ->orderBy('transaction_date', 'desc')
            ->get();

        $filename = 'transactions_report_' . now()->format('Y_m_d_H_i_s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($transactions) {
            $file = fopen('php://output', 'w');

            // CSV headers
            fputcsv($file, [
                'Transaction ID', 'Patient Name', 'Doctor Name',
                'Payment Type', 'Total Amount', 'Status', 'Transaction Date'
            ]);

            foreach ($transactions as $transaction) {
                fputcsv($file, [
                    $transaction->transaction_id,
                    $transaction->patient?->full_name ?? 'N/A',
                    $transaction->doctor?->name ?? 'N/A',
                    $transaction->payment_type,
                    $transaction->total_amount,
                    $transaction->status,
                    $transaction->transaction_date?->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export inventory data.
     */
    private function exportInventory(array $dateRange)
    {
        $transactions = InventoryTransaction::with(['product', 'user'])
            ->whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']])
            ->orderBy('transaction_date', 'desc')
            ->get();

        $filename = 'inventory_report_' . now()->format('Y_m_d_H_i_s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($transactions) {
            $file = fopen('php://output', 'w');

            // CSV headers
            fputcsv($file, [
                'Product Name', 'Transaction Type', 'Quantity',
                'Unit Cost', 'Total Cost', 'Transaction Date', 'User'
            ]);

            foreach ($transactions as $transaction) {
                fputcsv($file, [
                    $transaction->product?->name ?? 'N/A',
                    $transaction->type,
                    $transaction->quantity,
                    $transaction->unit_cost,
                    $transaction->total_cost,
                    $transaction->transaction_date?->format('Y-m-d H:i:s'),
                    $transaction->user?->name ?? 'N/A',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Get chart data for dashboard.
     */
    private function getChartData(array $dateRange): array
    {
        // Patient registration trends
        $patientTrends = Patient::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->pluck('count', 'date');

        // Appointment trends
        $appointmentTrends = Appointment::whereBetween('appointment_date', [$dateRange['start'], $dateRange['end']])
            ->selectRaw('DATE(appointment_date) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->pluck('count', 'date');

        // Revenue trends
        $revenueTrends = BillingTransaction::whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']])
            ->where('status', 'completed')
            ->selectRaw('DATE(transaction_date) as date, SUM(total_amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->pluck('total', 'date');

        return [
            'patientTrends' => $patientTrends,
            'appointmentTrends' => $appointmentTrends,
            'revenueTrends' => $revenueTrends,
        ];
    }

    /**
     * Get recent activities for dashboard.
     */
    private function getRecentActivities(array $dateRange): array
    {
        $activities = collect();

        // Recent patients
        $recentPatients = Patient::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($patient) {
                return [
                    'type' => 'patient_registration',
                    'description' => "New patient registered: {$patient->full_name}",
                    'date' => $patient->created_at,
                    'icon' => 'user-plus',
                ];
            });

        // Recent appointments
        $recentAppointments = Appointment::whereBetween('appointment_date', [$dateRange['start'], $dateRange['end']])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($appointment) {
                return [
                    'type' => 'appointment',
                    'description' => "Appointment scheduled: {$appointment->patient_name} with {$appointment->specialist_name}",
                    'date' => $appointment->appointment_date,
                    'icon' => 'calendar',
                ];
            });

        // Recent transactions
        $recentTransactions = BillingTransaction::whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']])
            ->where('status', 'completed')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($transaction) {
                return [
                    'type' => 'transaction',
                    'description' => "Transaction completed: ₱" . number_format($transaction->total_amount, 2),
                    'date' => $transaction->transaction_date,
                    'icon' => 'credit-card',
                ];
            });

        return $activities
            ->merge($recentPatients)
            ->merge($recentAppointments)
            ->merge($recentTransactions)
            ->sortByDesc('date')
            ->take(10)
            ->values()
            ->toArray();
    }

    /**
     * Get transfer statistics.
     */
    private function getTransferStatistics(array $dateRange): array
    {
        $transfers = PatientTransfer::whereBetween('transfer_date', [$dateRange['start'], $dateRange['end']]);

        return [
            'total' => $transfers->count(),
            'by_status' => $transfers->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get()
                ->pluck('count', 'status'),
            'by_direction' => $transfers->selectRaw('
                CASE
                    WHEN from_clinic_id IS NULL THEN "To Clinic"
                    WHEN to_clinic_id IS NULL THEN "From Clinic"
                    ELSE "Between Clinics"
                END as direction,
                COUNT(*) as count
            ')->groupBy('direction')->get()->pluck('count', 'direction'),
        ];
    }

    /**
     * Get laboratory statistics.
     */
    private function getLaboratoryStatistics(array $dateRange): array
    {
        $labOrders = LabOrder::whereBetween('lab_orders.created_at', [$dateRange['start'], $dateRange['end']]);

        return [
            'total_orders' => $labOrders->count(),
            'completed_orders' => $labOrders->where('lab_orders.status', 'completed')->count(),
            'pending_orders' => $labOrders->where('lab_orders.status', 'pending')->count(),
            'cancelled_orders' => $labOrders->where('lab_orders.status', 'cancelled')->count(),
            'by_test_type' => $labOrders->join('lab_results', 'lab_orders.id', '=', 'lab_results.lab_order_id')
                ->join('lab_tests', 'lab_results.lab_test_id', '=', 'lab_tests.id')
                ->select('lab_tests.name', DB::raw('count(*) as count'))
                ->groupBy('lab_tests.name')
                ->get()
                ->pluck('count', 'name'),
            'average_processing_time' => 0, // TODO: Implement when completed_at field is available
        ];
    }

    /**
     * Get specialist management statistics.
     */
    private function getSpecialistManagementStatistics(array $dateRange): array
    {
        $referrals = PatientReferral::whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);

        return [
            'total_referrals' => $referrals->count(),
            'approved_referrals' => $referrals->where('status', 'approved')->count(),
            'pending_referrals' => $referrals->where('status', 'pending')->count(),
            'rejected_referrals' => $referrals->where('status', 'rejected')->count(),
            'by_specialist_type' => $referrals->select('specialist_type', DB::raw('count(*) as count'))
                ->groupBy('specialist_type')
                ->get()
                ->pluck('count', 'specialist_type'),
            'by_priority' => $referrals->select('priority', DB::raw('count(*) as count'))
                ->groupBy('priority')
                ->get()
                ->pluck('count', 'priority'),
            'average_approval_time' => $referrals->whereNotNull('approved_at')
                ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, created_at, approved_at)) as avg_hours')
                ->value('avg_hours') ?? 0,
        ];
    }

    /**
     * Get clinic operations statistics.
     */
    private function getClinicOperationsStatistics(array $dateRange): array
    {
        return [
            'total_patients' => Patient::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])->count(),
            'total_appointments' => Appointment::whereBetween('appointment_date', [$dateRange['start'], $dateRange['end']])->count(),
            'completed_appointments' => Appointment::whereBetween('appointment_date', [$dateRange['start'], $dateRange['end']])
                ->where('status', 'Completed')->count(),
            'total_revenue' => BillingTransaction::whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']])
                ->where('status', 'completed')
                ->sum('total_amount'),
            'average_appointment_duration' => 30, // This would be calculated from actual data
            'patient_satisfaction_score' => 4.5, // This would be calculated from feedback
        ];
    }

    /**
     * Export laboratory data.
     */
    private function exportLaboratory(array $dateRange)
    {
        $labOrders = LabOrder::with(['patient', 'labTests', 'results'])
            ->whereBetween('lab_orders.created_at', [$dateRange['start'], $dateRange['end']])
            ->orderBy('lab_orders.created_at', 'desc')
            ->get();

        $filename = 'laboratory_report_' . now()->format('Y_m_d_H_i_s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($labOrders) {
            $file = fopen('php://output', 'w');

            // CSV headers
            fputcsv($file, [
                'Order Number', 'Patient Name', 'Patient No', 'Test Name',
                'Test Type', 'Status', 'Created Date', 'Completed Date', 'Results'
            ]);

            foreach ($labOrders as $order) {
                $results = $order->labResults ?
                    $order->labResults->pluck('result_value')->join(', ') : 'N/A';

                fputcsv($file, [
                    $order->order_number,
                    $order->patient?->full_name ?? 'N/A',
                    $order->patient?->patient_no ?? 'N/A',
                    $order->labTests->first()?->name ?? 'N/A',
                    $order->labTests->first()?->code ?? 'N/A',
                    $order->status,
                    $order->created_at->format('Y-m-d H:i:s'),
                    'N/A', // TODO: Implement when completed_at field is available
                    $results,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export specialist management data.
     */
    private function exportSpecialistManagement(array $dateRange)
    {
        $referrals = PatientReferral::with(['patient', 'referredBy', 'approvedBy'])
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->orderBy('created_at', 'desc')
            ->get();

        $filename = 'specialist_management_report_' . now()->format('Y_m_d_H_i_s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($referrals) {
            $file = fopen('php://output', 'w');

            // CSV headers
            fputcsv($file, [
                'Patient Name', 'Patient No', 'Specialist Type', 'Priority',
                'Status', 'Referral Reason', 'Referred By', 'Approved By',
                'Created Date', 'Approved Date'
            ]);

            foreach ($referrals as $referral) {
                fputcsv($file, [
                    $referral->patient?->full_name ?? 'N/A',
                    $referral->patient?->patient_no ?? 'N/A',
                    $referral->specialist_type,
                    $referral->priority,
                    $referral->status,
                    $referral->referral_reason,
                    $referral->referredBy?->name ?? 'N/A',
                    $referral->approvedBy?->name ?? 'N/A',
                    $referral->created_at->format('Y-m-d H:i:s'),
                    $referral->approved_at?->format('Y-m-d H:i:s') ?? 'N/A',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export transfers data.
     */
    private function exportTransfers(array $dateRange)
    {
        $transfers = PatientTransfer::with(['patient', 'fromClinic', 'toClinic'])
            ->whereBetween('transfer_date', [$dateRange['start'], $dateRange['end']])
            ->orderBy('transfer_date', 'desc')
            ->get();

        $filename = 'transfers_report_' . now()->format('Y_m_d_H_i_s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($transfers) {
            $file = fopen('php://output', 'w');

            // CSV headers
            fputcsv($file, [
                'Patient Name', 'From Clinic', 'To Clinic', 'Transfer Date',
                'Status', 'Reason', 'Notes'
            ]);

            foreach ($transfers as $transfer) {
                fputcsv($file, [
                    $transfer->patient?->full_name ?? 'N/A',
                    $transfer->fromClinic?->name ?? 'Hospital',
                    $transfer->toClinic?->name ?? 'Hospital',
                    $transfer->transfer_date?->format('Y-m-d H:i:s'),
                    $transfer->status,
                    $transfer->reason ?? 'N/A',
                    $transfer->notes ?? 'N/A',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export all reports data.
     */
    private function exportAll(array $dateRange)
    {
        $filename = 'comprehensive_report_' . now()->format('Y_m_d_H_i_s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($dateRange) {
            $file = fopen('php://output', 'w');

            // Get all data
            $patients = Patient::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])->get();
            $appointments = Appointment::whereBetween('appointment_date', [$dateRange['start'], $dateRange['end']])->get();
            $transactions = BillingTransaction::whereBetween('transaction_date', [$dateRange['start'], $dateRange['end']])->get();
            $labOrders = LabOrder::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])->get();
            $transfers = PatientTransfer::whereBetween('transfer_date', [$dateRange['start'], $dateRange['end']])->get();

            // Write comprehensive report
            fputcsv($file, ['COMPREHENSIVE HOSPITAL REPORT']);
            fputcsv($file, ['Generated on: ' . now()->format('Y-m-d H:i:s')]);
            fputcsv($file, ['Date Range: ' . $dateRange['start']->format('Y-m-d') . ' to ' . $dateRange['end']->format('Y-m-d')]);
            fputcsv($file, []);

            // Summary
            fputcsv($file, ['SUMMARY']);
            fputcsv($file, ['Total Patients', $patients->count()]);
            fputcsv($file, ['Total Appointments', $appointments->count()]);
            fputcsv($file, ['Total Transactions', $transactions->count()]);
            fputcsv($file, ['Total Lab Orders', $labOrders->count()]);
            fputcsv($file, ['Total Transfers', $transfers->count()]);
            fputcsv($file, []);

            // Patients data
            fputcsv($file, ['PATIENTS DATA']);
            fputcsv($file, ['Patient ID', 'Name', 'Age', 'Sex', 'Phone', 'Created Date']);
            foreach ($patients as $patient) {
                fputcsv($file, [
                    $patient->patient_no,
                    $patient->first_name . ' ' . $patient->last_name,
                    $patient->age,
                    $patient->sex,
                    $patient->mobile_no,
                    $patient->created_at->format('Y-m-d H:i:s')
                ]);
            }
            fputcsv($file, []);

            // Appointments data
            fputcsv($file, ['APPOINTMENTS DATA']);
            fputcsv($file, ['Appointment ID', 'Patient Name', 'Specialist', 'Date', 'Status']);
            foreach ($appointments as $appointment) {
                fputcsv($file, [
                    $appointment->id,
                    $appointment->patient_name,
                    $appointment->specialist_name,
                    $appointment->appointment_date->format('Y-m-d H:i:s'),
                    $appointment->status
                ]);
            }
            fputcsv($file, []);

            // Transactions data
            fputcsv($file, ['TRANSACTIONS DATA']);
            fputcsv($file, ['Transaction ID', 'Patient', 'Amount', 'Payment Method', 'Status', 'Date']);
            foreach ($transactions as $transaction) {
                fputcsv($file, [
                    $transaction->transaction_id,
                    $transaction->patient?->first_name . ' ' . $transaction->patient?->last_name ?? 'N/A',
                    $transaction->total_amount,
                    $transaction->payment_method,
                    $transaction->status,
                    $transaction->transaction_date->format('Y-m-d H:i:s')
                ]);
            }
            fputcsv($file, []);

            // Lab orders data
            fputcsv($file, ['LAB ORDERS DATA']);
            fputcsv($file, ['Order ID', 'Patient', 'Status', 'Created Date']);
            foreach ($labOrders as $order) {
                fputcsv($file, [
                    $order->id,
                    $order->patient?->first_name . ' ' . $order->patient?->last_name ?? 'N/A',
                    $order->status,
                    $order->created_at->format('Y-m-d H:i:s')
                ]);
            }
            fputcsv($file, []);

            // Transfers data
            fputcsv($file, ['TRANSFERS DATA']);
            fputcsv($file, ['Transfer ID', 'Patient', 'From', 'To', 'Date', 'Status']);
            foreach ($transfers as $transfer) {
                fputcsv($file, [
                    $transfer->id,
                    $transfer->patient?->first_name . ' ' . $transfer->patient?->last_name ?? 'N/A',
                    $transfer->fromClinic?->name ?? 'Hospital',
                    $transfer->toClinic?->name ?? 'Hospital',
                    $transfer->transfer_date->format('Y-m-d H:i:s'),
                    $transfer->status
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
