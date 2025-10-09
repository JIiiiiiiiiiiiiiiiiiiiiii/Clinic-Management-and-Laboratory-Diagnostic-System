<?php

namespace App\Http\Controllers\Hospital;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\BillingTransaction;
use App\Models\Supply\Supply as Inventory;
use App\Models\Supply\SupplyTransaction as InventoryTransaction;
use App\Models\PatientTransfer;
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
        // Simple reports dashboard with minimal data
        return Inertia::render('Hospital/Reports/IndexSimple', [
            'user' => $request->user(),
            'summary' => [
                'total_patients' => 0,
                'total_appointments' => 0,
                'total_transactions' => 0,
                'total_revenue' => 0
            ],
            'chartData' => [],
            'recentActivities' => [],
            'dateRange' => [
                'start' => now()->startOfMonth()->toDateString(),
                'end' => now()->endOfMonth()->toDateString()
            ]
        ]);
    }

    /**
     * Display patient reports.
     */
    public function patients(Request $request): Response
    {
        // Simple patient reports with minimal data
        return Inertia::render('Hospital/Reports/PatientsSimple', [
            'user' => $request->user(),
            'patients' => [
                'data' => [],
                'links' => [],
                'meta' => []
            ],
            'stats' => [
                'total_patients' => 0,
                'male_patients' => 0,
                'female_patients' => 0,
                'new_this_month' => 0
            ],
            'dateRange' => [
                'start' => now()->startOfMonth()->toDateString(),
                'end' => now()->endOfMonth()->toDateString()
            ],
            'filters' => []
        ]);
    }

    /**
     * Display appointment reports.
     */
    public function appointments(Request $request): Response
    {
        // Simple appointment reports with minimal data
        return Inertia::render('Hospital/Reports/AppointmentsSimple', [
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
        // Simple transaction reports with minimal data
        return Inertia::render('Hospital/Reports/TransactionsSimple', [
            'user' => $request->user(),
            'transactions' => [
                'data' => [],
                'links' => [],
                'meta' => []
            ],
            'stats' => [
                'total_transactions' => 0,
                'total_revenue' => 0,
                'completed_transactions' => 0,
                'pending_transactions' => 0
            ],
            'dateRange' => [
                'start' => now()->startOfMonth()->toDateString(),
                'end' => now()->endOfMonth()->toDateString()
            ],
            'filters' => []
        ]);
    }

    /**
     * Display inventory reports.
     */
    public function inventory(Request $request): Response
    {
        // Simple inventory reports with minimal data
        return Inertia::render('Hospital/Reports/InventorySimple', [
            'user' => $request->user(),
            'transactions' => [
                'data' => [],
                'links' => [],
                'meta' => []
            ],
            'stats' => [
                'total_transactions' => 0,
                'total_products' => 0,
                'low_stock_items' => 0,
                'out_of_stock_items' => 0
            ],
            'dateRange' => [
                'start' => now()->startOfMonth()->toDateString(),
                'end' => now()->endOfMonth()->toDateString()
            ],
            'filters' => []
        ]);
    }

    /**
     * Display transfer reports.
     */
    public function transfers(Request $request): Response
    {
        // Simple transfer reports with minimal data
        return Inertia::render('Hospital/Reports/TransfersSimple', [
            'user' => $request->user(),
            'transfers' => [
                'data' => [],
                'links' => [],
                'meta' => []
            ],
            'stats' => [
                'total_transfers' => 0,
                'completed_transfers' => 0,
                'pending_transfers' => 0,
                'cancelled_transfers' => 0
            ],
            'dateRange' => [
                'start' => now()->startOfMonth()->toDateString(),
                'end' => now()->endOfMonth()->toDateString()
            ],
            'filters' => []
        ]);
    }

    /**
     * Display clinic operations reports.
     */
    public function clinicOperations(Request $request): Response
    {
        // Simple clinic operations reports with minimal data
        return Inertia::render('Hospital/Reports/ClinicOperationsSimple', [
            'user' => $request->user(),
            'stats' => [
                'total_operations' => 0,
                'successful_operations' => 0,
                'failed_operations' => 0,
                'average_operation_time' => 0
            ],
            'dateRange' => [
                'start' => now()->startOfMonth()->toDateString(),
                'end' => now()->endOfMonth()->toDateString()
            ]
        ]);
    }

    /**
     * Export reports.
     */
    public function export(Request $request, string $type)
    {
        $dateRange = $this->getDateRange($request);
        
        switch ($type) {
            case 'patients':
                return $this->exportPatients($dateRange);
            case 'appointments':
                return $this->exportAppointments($dateRange);
            case 'transactions':
                return $this->exportTransactions($dateRange);
            case 'inventory':
                return $this->exportInventory($dateRange);
            case 'transfers':
                return $this->exportTransfers($dateRange);
            default:
                return response()->json(['message' => 'Invalid export type'], 400);
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
        $patients = Patient::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->orderBy('created_at', 'desc')
            ->get();

        $filename = 'patients_report_' . now()->format('Y_m_d_H_i_s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($patients) {
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
        };

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
}
