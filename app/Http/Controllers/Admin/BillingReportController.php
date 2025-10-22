<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BillingTransaction;
use App\Models\DoctorPayment;
use App\Models\DailyTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BillingReportController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Get date range from request or default to current month
            $dateFrom = $request->get('date_from', now()->startOfMonth()->format('Y-m-d'));
            $dateTo = $request->get('date_to', now()->endOfMonth()->format('Y-m-d'));
            
            // Get revenue data (billing transactions)
            // Convert date strings to datetime range for proper filtering
            $startDateTime = $dateFrom . ' 00:00:00';
            $endDateTime = $dateTo . ' 23:59:59';
            
            $revenueData = BillingTransaction::whereBetween('transaction_date', [$startDateTime, $endDateTime])
                ->with(['patient', 'doctor'])
                ->orderBy('transaction_date', 'desc')
                ->get();
            
            
            // Get doctor payment data
            $doctorPaymentData = DoctorPayment::whereBetween('payment_date', [$dateFrom, $dateTo])
                ->with(['doctor'])
                ->orderBy('payment_date', 'desc')
                ->get();
            
            // Calculate summary
            $summary = [
                'total_revenue' => $revenueData->sum('total_amount'),
                'total_doctor_payments' => $doctorPaymentData->sum('amount_paid'),
                'net_profit' => $revenueData->sum('total_amount') - $doctorPaymentData->sum('amount_paid'),
                'revenue_count' => $revenueData->count(),
            ];
            
            // Get filters
            $filters = [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'report_type' => $request->get('report_type', 'daily'),
            ];
            
            return inertia('admin/billing/reports', [
                'revenueData' => $revenueData,
                'expenseData' => collect(),
                'doctorPaymentData' => $doctorPaymentData,
                'summary' => $summary,
                'filters' => $filters,
            ]);
        } catch (\Exception $e) {
            Log::error('Billing reports index error: ' . $e->getMessage());
            
            return inertia('admin/billing/reports', [
                'revenueData' => collect(),
                'expenseData' => collect(),
                'doctorPaymentData' => collect(),
                'summary' => [
                    'total_revenue' => 0,
                    'total_expenses' => 0,
                    'total_doctor_payments' => 0,
                    'net_profit' => 0,
                    'revenue_count' => 0,
                    'expense_count' => 0,
                ],
                'filters' => [
                    'date_from' => now()->startOfMonth()->format('Y-m-d'),
                    'date_to' => now()->endOfMonth()->format('Y-m-d'),
                    'report_type' => 'daily',
                ],
                'error' => 'Unable to load billing report data. Please try again.'
            ]);
        }
    }

    public function exportReport(Request $request)
    {
        $format = $request->get('format', 'excel');
        $type = $request->get('type', 'all');

        // Redirect to appropriate export method based on type
        switch ($type) {
            case 'daily':
                return $this->exportDailyReport($request);
            case 'monthly':
                return $this->exportMonthlyReport($request);
            case 'yearly':
                return $this->exportYearlyReport($request);
            case 'all':
            default:
                return $this->exportAll($request);
        }
    }

    public function dailyReport(Request $request)
    {
        try {
            $date = $request->get('date', now()->format('Y-m-d'));

            Log::info('Generating daily report', [
                'date' => $date,
                'user_id' => auth()->id(),
                'current_date' => now()->format('Y-m-d'),
                'request_all' => $request->all()
            ]);

            // Validate date format
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
                throw new \InvalidArgumentException('Invalid date format. Expected YYYY-MM-DD');
            }

            // First, sync the daily transactions table to ensure it's up to date
            $this->syncDailyTransactions($date);
            
            // Get all transactions from the daily_transactions table
            $dailyTransactions = DailyTransaction::whereDate('transaction_date', $date)
                ->orderBy('created_at', 'asc')
                ->get();

        // Get expenses separately for the expenses table (removed - Expense model deleted)
        $expenses = collect();

        // Convert daily transactions to the format expected by the frontend
        $allTransactions = $dailyTransactions->map(function ($transaction) {
            return (object) [
                'id' => $transaction->id,
                'type' => $transaction->transaction_type,
                'transaction_id' => $transaction->transaction_id,
                'patient_name' => $transaction->patient_name,
                'specialist_name' => $transaction->specialist_name,
                'amount' => $transaction->amount,
                'payment_method' => $transaction->payment_method,
                'status' => $transaction->status,
                'description' => $transaction->description,
                'time' => $transaction->transaction_date,
                'items_count' => $transaction->items_count,
                'appointments_count' => $transaction->appointments_count,
            ];
        });

        // Calculate summary from daily transactions
        $billingTransactions = $dailyTransactions->where('transaction_type', 'billing');
        $doctorPayments = $dailyTransactions->where('transaction_type', 'doctor_payment');
        $expenseTransactions = $dailyTransactions->where('transaction_type', 'expense');

        $summary = [
            'total_revenue' => $billingTransactions->sum('amount'),
            'total_doctor_payments' => abs($doctorPayments->sum('amount')), // Doctor payments are negative
            'total_expenses' => abs($expenseTransactions->sum('amount')), // Expenses are negative
            'net_profit' => $billingTransactions->sum('amount') + $doctorPayments->sum('amount') + $expenseTransactions->sum('amount'),
            'transaction_count' => $billingTransactions->count(),
            'expense_count' => $expenseTransactions->count(),
            'doctor_payment_count' => $doctorPayments->count(),
        ];

        Log::info('Daily report generated successfully', [
            'date' => $date,
            'transaction_count' => $allTransactions->count(),
            'summary' => $summary
        ]);

        return inertia('admin/billing/daily-report', [
            'transactions' => $allTransactions->values(),
            'expenses' => collect(), // Expense model removed
            'summary' => $summary,
            'date' => $date,
        ]);
        } catch (\Exception $e) {
            Log::error('Daily report generation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'date' => $date ?? 'unknown',
                'user_id' => auth()->id()
            ]);

            return back()->with('error', 'Failed to generate daily report: ' . $e->getMessage());
        }
    }

    public function monthlyReport(Request $request)
    {
        $month = $request->get('month', now()->format('Y-m'));

        // Get all transactions for the month, but only the LATEST transaction for each appointment
        $billingTransactions = BillingTransaction::whereYear('transaction_date', substr($month, 0, 4))
            ->whereMonth('transaction_date', substr($month, 5, 2))
            ->with(['patient', 'doctor', 'appointmentLinks.appointment', 'items'])
            ->get()
            ->groupBy('appointment_id')
            ->map(function ($transactions) {
                // Return only the latest transaction for each appointment
                return $transactions->sortByDesc('created_at')->first();
            })
            ->filter() // Remove null values
            ->values();

        $doctorPayments = DoctorPayment::whereYear('payment_date', substr($month, 0, 4))
            ->whereMonth('payment_date', substr($month, 5, 2))
            ->with(['doctor'])
            ->get();

        $expenses = collect(); // Expense model removed

        // Group transactions by patient and specialist to consolidate duplicates
        $consolidatedTransactions = [];
        
        foreach ($billingTransactions as $transaction) {
            $key = $transaction->patient_id . '_' . $transaction->doctor_id;
            
            if (!isset($consolidatedTransactions[$key])) {
                $consolidatedTransactions[$key] = [
                    'transaction' => $transaction,
                    'total_amount' => 0,
                    'items_count' => 0,
                    'appointments_count' => 0,
                    'all_transactions' => []
                ];
            }
            
            $consolidatedTransactions[$key]['total_amount'] += $transaction->total_amount;
            $consolidatedTransactions[$key]['items_count'] += $transaction->items->count();
            $consolidatedTransactions[$key]['appointments_count'] += $transaction->appointmentLinks->count();
            $consolidatedTransactions[$key]['all_transactions'][] = $transaction;
        }

        // Combine all transactions
        $allTransactions = collect();

        // Add consolidated billing transactions
        foreach ($consolidatedTransactions as $key => $consolidated) {
            $primaryTransaction = $consolidated['transaction'];
            
            // Use the most recent transaction ID as the primary one
            $latestTransaction = collect($consolidated['all_transactions'])
                ->sortByDesc('created_at')
                ->first();
            
            $allTransactions->push((object) [
                'id' => $latestTransaction->id,
                'type' => 'billing',
                'transaction_id' => $latestTransaction->transaction_id,
                'patient_name' => $this->getPatientName($primaryTransaction),
                'specialist_name' => $this->getSpecialistName($primaryTransaction),
                'amount' => $consolidated['total_amount'],
                'payment_method' => $primaryTransaction->payment_method,
                'status' => $primaryTransaction->status,
                'description' => $primaryTransaction->description ?: 'Payment for ' . $consolidated['appointments_count'] . ' appointment(s)',
                'time' => $primaryTransaction->transaction_date,
                'items_count' => $consolidated['items_count'],
                'appointments_count' => $consolidated['appointments_count'],
            ]);
        }

        // Add doctor payments
        foreach ($doctorPayments as $payment) {
            $allTransactions->push((object) [
                'id' => $payment->id,
                'type' => 'doctor_payment',
                'transaction_id' => 'DP-' . $payment->id,
                'patient_name' => 'Doctor Payment',
                'specialist_name' => $payment->doctor ? $payment->doctor->name : 'Unknown Doctor',
                'amount' => -$payment->amount_paid,
                'payment_method' => $payment->payment_method,
                'status' => $payment->status,
                'description' => 'Doctor Payment - ' . $payment->description,
                'time' => $payment->payment_date,
                'items_count' => 0,
                'appointments_count' => 0,
            ]);
        }

        // Add expenses (removed - Expense model deleted)

        // Sort by time
        $allTransactions = $allTransactions->sortBy('time');

        // Calculate summary using filtered transactions
        $summary = [
            'total_revenue' => $billingTransactions->sum('total_amount'),
            'total_doctor_payments' => $doctorPayments->sum('amount_paid'),
            'total_expenses' => 0, // Expense model removed
            'net_profit' => $billingTransactions->sum('total_amount') - $doctorPayments->sum('amount_paid'), // Expenses removed
            'transaction_count' => $billingTransactions->count(),
            'expense_count' => 0, // Expense model removed
            'doctor_payment_count' => $doctorPayments->count(),
        ];

        return inertia('admin/billing/monthly-report', [
            'transactions' => $allTransactions->values(),
            'expenses' => collect(), // Expense model removed
            'summary' => $summary,
            'month' => $month,
        ]);
    }

    public function yearlyReport(Request $request)
    {
        $year = $request->get('year', now()->format('Y'));

        // Get all transactions for the year, but only the LATEST transaction for each appointment
        $billingTransactions = BillingTransaction::whereYear('transaction_date', $year)
            ->with(['patient', 'doctor', 'appointmentLinks.appointment', 'items'])
            ->get()
            ->groupBy('appointment_id')
            ->map(function ($transactions) {
                // Return only the latest transaction for each appointment
                return $transactions->sortByDesc('created_at')->first();
            })
            ->filter() // Remove null values
            ->values();

        $doctorPayments = DoctorPayment::whereYear('payment_date', $year)
            ->with(['doctor'])
            ->get();

        $expenses = collect(); // Expense model removed

        // Group transactions by patient and specialist to consolidate duplicates
        $consolidatedTransactions = [];
        
        foreach ($billingTransactions as $transaction) {
            $key = $transaction->patient_id . '_' . $transaction->doctor_id;
            
            if (!isset($consolidatedTransactions[$key])) {
                $consolidatedTransactions[$key] = [
                    'transaction' => $transaction,
                    'total_amount' => 0,
                    'items_count' => 0,
                    'appointments_count' => 0,
                    'all_transactions' => []
                ];
            }
            
            $consolidatedTransactions[$key]['total_amount'] += $transaction->total_amount;
            $consolidatedTransactions[$key]['items_count'] += $transaction->items->count();
            $consolidatedTransactions[$key]['appointments_count'] += $transaction->appointmentLinks->count();
            $consolidatedTransactions[$key]['all_transactions'][] = $transaction;
        }

        // Combine all transactions
        $allTransactions = collect();

        // Add consolidated billing transactions
        foreach ($consolidatedTransactions as $key => $consolidated) {
            $primaryTransaction = $consolidated['transaction'];
            
            // Use the most recent transaction ID as the primary one
            $latestTransaction = collect($consolidated['all_transactions'])
                ->sortByDesc('created_at')
                ->first();
            
            $allTransactions->push((object) [
                'id' => $latestTransaction->id,
                'type' => 'billing',
                'transaction_id' => $latestTransaction->transaction_id,
                'patient_name' => $this->getPatientName($primaryTransaction),
                'specialist_name' => $this->getSpecialistName($primaryTransaction),
                'amount' => $consolidated['total_amount'],
                'payment_method' => $primaryTransaction->payment_method,
                'status' => $primaryTransaction->status,
                'description' => $primaryTransaction->description ?: 'Payment for ' . $consolidated['appointments_count'] . ' appointment(s)',
                'time' => $primaryTransaction->transaction_date,
                'items_count' => $consolidated['items_count'],
                'appointments_count' => $consolidated['appointments_count'],
            ]);
        }

        // Add doctor payments
        foreach ($doctorPayments as $payment) {
            $allTransactions->push((object) [
                'id' => $payment->id,
                'type' => 'doctor_payment',
                'transaction_id' => 'DP-' . $payment->id,
                'patient_name' => 'Doctor Payment',
                'specialist_name' => $payment->doctor ? $payment->doctor->name : 'Unknown Doctor',
                'amount' => -$payment->amount_paid,
                'payment_method' => $payment->payment_method,
                'status' => $payment->status,
                'description' => 'Doctor Payment - ' . $payment->description,
                'time' => $payment->payment_date,
                'items_count' => 0,
                'appointments_count' => 0,
            ]);
        }

        // Add expenses (removed - Expense model deleted)

        // Sort by time
        $allTransactions = $allTransactions->sortBy('time');

        // Calculate summary using filtered transactions
        $summary = [
            'total_revenue' => $billingTransactions->sum('total_amount'),
            'total_doctor_payments' => $doctorPayments->sum('amount_paid'),
            'total_expenses' => 0, // Expense model removed
            'net_profit' => $billingTransactions->sum('total_amount') - $doctorPayments->sum('amount_paid'), // Expenses removed
            'transaction_count' => $billingTransactions->count(),
            'expense_count' => 0, // Expense model removed
            'doctor_payment_count' => $doctorPayments->count(),
        ];

        return inertia('admin/billing/yearly-report', [
            'transactions' => $allTransactions->values(),
            'expenses' => collect(), // Expense model removed
            'summary' => $summary,
            'year' => $year,
        ]);
    }

    public function transactionReport(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->subDays(30)->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));
        $status = $request->get('status', 'all');
        $paymentMethod = $request->get('payment_method', 'all');
        $doctorId = $request->get('doctor_id', 'all');

        // Build query
        // Convert date strings to datetime range for proper filtering
        $startDateTime = $dateFrom . ' 00:00:00';
        $endDateTime = $dateTo . ' 23:59:59';
        
        $query = BillingTransaction::whereBetween('transaction_date', [$startDateTime, $endDateTime])
            ->with(['patient', 'doctor', 'appointmentLinks.appointment']);

        // Apply filters
        if ($status !== 'all') {
            $query->where('status', $status);
        }
        if ($paymentMethod !== 'all') {
            $query->where('payment_method', $paymentMethod);
        }
        if ($doctorId !== 'all') {
            $query->where('doctor_id', $doctorId);
        }

        $transactions = $query->get();

        // Calculate summary
        $summary = [
            'total_revenue' => $transactions->sum('total_amount'),
            'total_transactions' => $transactions->count(),
            'paid_transactions' => $transactions->where('status', 'paid')->count(),
            'pending_transactions' => $transactions->where('status', 'pending')->count(),
        ];

        return inertia('admin/billing/transaction-report', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'status' => $status,
                'payment_method' => $paymentMethod,
                'doctor_id' => $doctorId,
            ]
        ]);
    }

    public function doctorSummary(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->subDays(30)->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));
        $doctorId = $request->get('doctor_id', 'all');

        // Get doctor payments
        $query = DoctorPayment::whereBetween('payment_date', [$dateFrom, $dateTo])
            ->with(['doctor']);

        if ($doctorId !== 'all') {
            $query->where('doctor_id', $doctorId);
        }

        $doctorPayments = $query->get();

        // Get revenue by doctor
        // Convert date strings to datetime range for proper filtering
        $startDateTime = $dateFrom . ' 00:00:00';
        $endDateTime = $dateTo . ' 23:59:59';
        
        $revenueQuery = BillingTransaction::whereBetween('transaction_date', [$startDateTime, $endDateTime])
            ->where('status', 'paid')
            ->with(['doctor']);

        if ($doctorId !== 'all') {
            $revenueQuery->where('doctor_id', $doctorId);
        }

        $revenueByDoctor = $revenueQuery->get()
            ->groupBy('doctor_id')
            ->map(function ($transactions, $doctorId) {
                $doctor = $transactions->first()->doctor;
                return [
                    'doctor_id' => $doctorId,
                    'doctor_name' => $doctor ? $doctor->name : 'Unknown',
                    'total_revenue' => $transactions->sum('total_amount'),
                    'transaction_count' => $transactions->count(),
                ];
            });

        // Calculate summary
        $summary = [
            'total_doctor_payments' => $doctorPayments->sum('amount_paid'),
            'total_doctor_revenue' => $revenueByDoctor->sum('total_revenue'),
            'doctors_count' => $doctorPayments->groupBy('doctor_id')->count(),
        ];

        // Get all doctors for filter
        $doctors = \App\Models\User::where('role', 'doctor')->get(['id', 'name']);

        return inertia('admin/billing/doctor-summary', [
            'doctorPayments' => $doctorPayments,
            'revenueByDoctor' => $revenueByDoctor,
            'summary' => $summary,
            'doctors' => $doctors,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'doctor_id' => $doctorId,
            ]
        ]);
    }

    public function hmoReport(Request $request)
    {
        // Redirect to the enhanced HMO report with the same parameters
        $queryParams = $request->query();
        return redirect()->route('admin.billing.enhanced-hmo-report.index', $queryParams);
    }

    public function exportAll(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->subDays(30)->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));
        $format = $request->get('format', 'excel');

        // Get all data
        // Convert date strings to datetime range for proper filtering
        $startDateTime = $dateFrom . ' 00:00:00';
        $endDateTime = $dateTo . ' 23:59:59';
        
        $billingTransactions = BillingTransaction::whereBetween('transaction_date', [$startDateTime, $endDateTime])
            ->with(['patient', 'doctor', 'appointmentLinks.appointment'])
            ->get();

        $doctorPayments = DoctorPayment::whereBetween('payment_date', [$dateFrom, $dateTo])
            ->with(['doctor'])
            ->get();

        $expenses = collect(); // Expense model removed

        // Prepare comprehensive export data
        $exportData = [];

        // Add billing transactions
        foreach ($billingTransactions as $transaction) {
            $exportData[] = [
                'Type' => 'Billing Transaction',
                'Transaction ID' => $transaction->transaction_id,
                'Patient Name' => $this->getPatientName($transaction),
                'Specialist' => $this->getSpecialistName($transaction),
                'Amount' => $transaction->total_amount,
                'Payment Method' => $transaction->payment_method,
                'HMO Provider' => $transaction->hmo_provider ?? 'N/A',
                'Status' => $transaction->status,
                'Description' => $transaction->description ?: 'Payment for ' . $transaction->appointmentLinks->count() . ' appointment(s)',
                'Date' => $transaction->transaction_date->format('Y-m-d'),
                'Time' => $transaction->transaction_date->format('H:i:s'),
                'Items Count' => $transaction->appointmentLinks->count(), // Use appointmentLinks instead of items
                'Appointments Count' => $transaction->appointmentLinks->count(),
            ];
        }

        // Add doctor payments
        foreach ($doctorPayments as $payment) {
            $exportData[] = [
                'Type' => 'Doctor Payment',
                'Transaction ID' => 'DP-' . $payment->id,
                'Patient Name' => 'Doctor Payment',
                'Specialist' => $payment->doctor ? $payment->doctor->name : 'Unknown Doctor',
                'Amount' => -$payment->amount_paid,
                'Payment Method' => $payment->payment_method,
                'HMO Provider' => 'N/A',
                'Status' => $payment->status,
                'Description' => 'Doctor Payment - ' . $payment->description,
                'Date' => $payment->payment_date->format('Y-m-d'),
                'Time' => $payment->payment_date->format('H:i:s'),
                'Items Count' => 0,
                'Appointments Count' => 0,
            ];
        }

        // Add expenses (removed - Expense model deleted)

        // Sort by date
        usort($exportData, function($a, $b) {
            return strtotime($a['Date'] . ' ' . $a['Time']) - strtotime($b['Date'] . ' ' . $b['Time']);
        });

        // Generate filename
        $extension = match($format) {
            'excel' => 'xlsx',
            'pdf' => 'pdf',
            default => 'xlsx'
        };
        $filename = 'comprehensive-report-' . $dateFrom . '-to-' . $dateTo . '.' . $extension;

        try {
            if ($format === 'pdf') {
                $html = $this->buildHtmlTable('Comprehensive Report - ' . $dateFrom . ' to ' . $dateTo, $exportData);
                return \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)->download($filename);
            }

            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\ArrayExport($exportData, 'Comprehensive Report - ' . $dateFrom . ' to ' . $dateTo),
                $filename,
                \Maatwebsite\Excel\Excel::XLSX
            );
        } catch (\Exception $e) {
            Log::error('Export All Report Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'format' => $format
            ]);

            return back()->with('error', 'Export failed: ' . $e->getMessage());
        }
    }

    private function getPatientName($transaction)
    {
        // Try to get patient name from patient relationship
        if ($transaction->patient) {
            return trim($transaction->patient->first_name . ' ' . $transaction->patient->last_name);
        }

        // Try to get patient name from appointment data
        if ($transaction->appointmentLinks->isNotEmpty()) {
            $appointment = $transaction->appointmentLinks->first()->appointment;
            if ($appointment) {
                return $appointment->patient_name;
            }
        }

        return 'Unknown Patient';
    }

    private function getSpecialistName($transaction)
    {
        // Try to get specialist name from doctor relationship
        if ($transaction->doctor) {
            return $transaction->doctor->name;
        }

        // Try to get specialist name from appointment data
        if ($transaction->appointmentLinks->isNotEmpty()) {
            $appointment = $transaction->appointmentLinks->first()->appointment;
            if ($appointment) {
                return $appointment->specialist_name;
            }
        }

        return 'Unknown Specialist';
    }

    private function syncDailyTransactions($date)
    {
        Log::info('Syncing daily transactions', [
            'date' => $date,
            'current_time' => now()->format('Y-m-d H:i:s')
        ]);

        // Clear existing records for the date
        DailyTransaction::where('transaction_date', $date)->delete();

        // Get all billing transactions for the date (including doctor payments)
        $billingTransactions = BillingTransaction::whereDate('transaction_date', $date)
            ->with(['patient', 'doctor', 'appointmentLinks.appointment', 'items'])
            ->get();

        Log::info('Found billing transactions for sync', [
            'date' => $date,
            'count' => $billingTransactions->count(),
            'transactions' => $billingTransactions->map(function($txn) {
                return [
                    'id' => $txn->transaction_id,
                    'date' => $txn->transaction_date,
                    'amount' => $txn->total_amount,
                    'payment_type' => $txn->payment_type
                ];
            })->toArray()
        ]);

        $expenses = collect(); // Expense model removed

        // Create daily transactions from billing transactions
        foreach ($billingTransactions as $transaction) {
            $transactionType = $transaction->payment_type === 'doctor_payment' ? 'doctor_payment' : 'billing';
            $amount = $transaction->payment_type === 'doctor_payment' ? -$transaction->total_amount : $transaction->total_amount;
            
            DailyTransaction::create([
                'transaction_date' => $date,
                'transaction_type' => $transactionType,
                'transaction_id' => $transaction->transaction_id,
                'patient_name' => $transaction->payment_type === 'doctor_payment' ? 'Doctor Payment' : $this->getPatientName($transaction),
                'specialist_name' => $this->getSpecialistName($transaction),
                'amount' => $amount,
                'payment_method' => $transaction->payment_method,
                'status' => $transaction->status,
                'description' => $transaction->description ?: ($transaction->payment_type === 'doctor_payment' ? 'Doctor Payment - Incentives' : 'Payment for ' . $transaction->appointmentLinks->count() . ' appointment(s)'),
                'items_count' => $transaction->items->count(),
                'appointments_count' => $transaction->appointmentLinks->count(),
                'original_transaction_id' => $transaction->id,
                'original_table' => 'billing_transactions',
            ]);
        }

        // Sync expenses (removed - Expense model deleted)
    }

    public function exportDailyReport(Request $request)
    {
        $date = $request->get('date', now()->format('Y-m-d'));
        $format = $request->get('format', 'excel');

        // Debug: Log the export request
        Log::info('Export Daily Report Request', [
            'date' => $date,
            'format' => $format,
            'user' => auth()->user()?->name ?? 'Guest'
        ]);

        // Get all transactions for the date
        $billingTransactions = BillingTransaction::whereDate('transaction_date', $date)
            ->with(['patient', 'doctor', 'appointmentLinks.appointment'])
            ->get();

        $doctorPayments = DoctorPayment::whereDate('payment_date', $date)
            ->with(['doctor'])
            ->get();

        $expenses = collect(); // Expense model removed

        // Prepare data for export
        $exportData = [];

        // Add billing transactions
        foreach ($billingTransactions as $transaction) {
            $exportData[] = [
                'Type' => 'Billing Transaction',
                'Transaction ID' => $transaction->transaction_id,
                'Patient Name' => $this->getPatientName($transaction),
                'Specialist' => $this->getSpecialistName($transaction),
                'Amount' => $transaction->total_amount,
                'Payment Method' => $transaction->payment_method,
                'Status' => $transaction->status,
                'Description' => $transaction->description ?: 'Payment for ' . $transaction->appointmentLinks->count() . ' appointment(s)',
                'Date' => $transaction->transaction_date_only ?? $transaction->transaction_date->format('Y-m-d'),
                'Time' => $transaction->transaction_time_only ?? $transaction->transaction_date->format('H:i:s'),
                'Full DateTime' => $transaction->transaction_date->format('Y-m-d H:i:s'),
                'Items Count' => $transaction->appointmentLinks->count(), // Use appointmentLinks instead of items
                'Appointments Count' => $transaction->appointmentLinks->count(),
            ];
        }

        // Add doctor payments
        foreach ($doctorPayments as $payment) {
            $exportData[] = [
                'Type' => 'Doctor Payment',
                'Transaction ID' => 'DP-' . $payment->id,
                'Patient Name' => 'Doctor Payment',
                'Specialist' => $payment->doctor ? $payment->doctor->name : 'Unknown Doctor',
                'Amount' => -$payment->amount_paid,
                'Payment Method' => $payment->payment_method,
                'Status' => $payment->status,
                'Description' => 'Doctor Payment - ' . $payment->description,
                'Date' => $payment->payment_date->format('Y-m-d'),
                'Time' => $payment->payment_date->format('H:i:s'),
                'Full DateTime' => $payment->payment_date->format('Y-m-d H:i:s'),
                'Items Count' => 0,
                'Appointments Count' => 0,
            ];
        }

        // Add expenses (removed - Expense model deleted)

        // Sort by time
        usort($exportData, function($a, $b) {
            return strtotime($a['Time']) - strtotime($b['Time']);
        });

        // Generate filename with proper extensions
        $extension = match($format) {
            'excel' => 'xlsx',
            'pdf' => 'pdf',
            'word', 'doc', 'docx' => 'doc',
            default => $format
        };
        $filename = 'daily-report-' . $date . '.' . $extension;

        try {
            if ($format === 'pdf') {
                $html = $this->buildHtmlTable('Daily Report - ' . $date, $exportData);
                return \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)->download($filename);
            }

            if (in_array($format, ['word', 'doc', 'docx'])) {
                $html = $this->buildHtmlTable('Daily Report - ' . $date, $exportData);
                return response($html)
                    ->header('Content-Type', 'application/msword')
                    ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
            }

            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\ArrayExport($exportData, 'Daily Report - ' . $date),
                $filename,
                \Maatwebsite\Excel\Excel::XLSX
            );
        } catch (\Exception $e) {
            Log::error('Export Daily Report Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'date' => $date,
                'format' => $format
            ]);

            return back()->with('error', 'Export failed: ' . $e->getMessage());
        }
    }

    public function exportMonthlyReport(Request $request)
    {
        $month = $request->get('month', now()->format('Y-m'));
        $format = $request->get('format', 'excel');

        // Get all transactions for the month
        $billingTransactions = BillingTransaction::whereYear('transaction_date', substr($month, 0, 4))
            ->whereMonth('transaction_date', substr($month, 5, 2))
            ->with(['patient', 'doctor', 'appointmentLinks.appointment'])
            ->get();

        $doctorPayments = DoctorPayment::whereYear('payment_date', substr($month, 0, 4))
            ->whereMonth('payment_date', substr($month, 5, 2))
            ->with(['doctor'])
            ->get();

        $expenses = collect(); // Expense model removed

        // Prepare data for export
        $exportData = [];

        // Add billing transactions
        foreach ($billingTransactions as $transaction) {
            $exportData[] = [
                'Type' => 'Billing Transaction',
                'Transaction ID' => $transaction->transaction_id,
                'Patient Name' => $this->getPatientName($transaction),
                'Specialist' => $this->getSpecialistName($transaction),
                'Amount' => $transaction->total_amount,
                'Payment Method' => $transaction->payment_method,
                'Status' => $transaction->status,
                'Description' => $transaction->description ?: 'Payment for ' . $transaction->appointmentLinks->count() . ' appointment(s)',
                'Date' => $transaction->transaction_date_only ?? $transaction->transaction_date->format('Y-m-d'),
                'Time' => $transaction->transaction_time_only ?? $transaction->transaction_date->format('H:i:s'),
                'Full DateTime' => $transaction->transaction_date->format('Y-m-d H:i:s'),
                'Items Count' => $transaction->appointmentLinks->count(), // Use appointmentLinks instead of items
                'Appointments Count' => $transaction->appointmentLinks->count(),
            ];
        }

        // Add doctor payments
        foreach ($doctorPayments as $payment) {
            $exportData[] = [
                'Type' => 'Doctor Payment',
                'Transaction ID' => 'DP-' . $payment->id,
                'Patient Name' => 'Doctor Payment',
                'Specialist' => $payment->doctor ? $payment->doctor->name : 'Unknown Doctor',
                'Amount' => -$payment->amount_paid,
                'Payment Method' => $payment->payment_method,
                'Status' => $payment->status,
                'Description' => 'Doctor Payment - ' . $payment->description,
                'Date' => $payment->payment_date->format('Y-m-d'),
                'Time' => $payment->payment_date->format('H:i:s'),
                'Full DateTime' => $payment->payment_date->format('Y-m-d H:i:s'),
                'Items Count' => 0,
                'Appointments Count' => 0,
            ];
        }

        // Add expenses (removed - Expense model deleted)

        // Sort by time
        usort($exportData, function($a, $b) {
            return strtotime($a['Time']) - strtotime($b['Time']);
        });

        // Generate filename with proper extensions
        $extension = match($format) {
            'excel' => 'xlsx',
            'pdf' => 'pdf',
            'word', 'doc', 'docx' => 'doc',
            default => $format
        };
        $filename = 'monthly-report-' . $month . '.' . $extension;

        if ($format === 'pdf') {
            $html = $this->buildHtmlTable('Monthly Report - ' . $month, $exportData);
            return \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)->download($filename);
        }

        if (in_array($format, ['word', 'doc', 'docx'])) {
            $html = $this->buildHtmlTable('Monthly Report - ' . $month, $exportData);
            return response($html)
                ->header('Content-Type', 'application/msword')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
        }

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\ArrayExport($exportData, 'Monthly Report - ' . $month),
            $filename,
            \Maatwebsite\Excel\Excel::XLSX
        );
    }

    public function exportYearlyReport(Request $request)
    {
        $year = $request->get('year', now()->format('Y'));
        $format = $request->get('format', 'excel');

        // Get all transactions for the year
        $billingTransactions = BillingTransaction::whereYear('transaction_date', $year)
            ->with(['patient', 'doctor', 'appointmentLinks.appointment'])
            ->get();

        $doctorPayments = DoctorPayment::whereYear('payment_date', $year)
            ->with(['doctor'])
            ->get();

        $expenses = collect(); // Expense model removed

        // Prepare data for export
        $exportData = [];

        // Add billing transactions
        foreach ($billingTransactions as $transaction) {
            $exportData[] = [
                'Type' => 'Billing Transaction',
                'Transaction ID' => $transaction->transaction_id,
                'Patient Name' => $this->getPatientName($transaction),
                'Specialist' => $this->getSpecialistName($transaction),
                'Amount' => $transaction->total_amount,
                'Payment Method' => $transaction->payment_method,
                'Status' => $transaction->status,
                'Description' => $transaction->description ?: 'Payment for ' . $transaction->appointmentLinks->count() . ' appointment(s)',
                'Date' => $transaction->transaction_date_only ?? $transaction->transaction_date->format('Y-m-d'),
                'Time' => $transaction->transaction_time_only ?? $transaction->transaction_date->format('H:i:s'),
                'Full DateTime' => $transaction->transaction_date->format('Y-m-d H:i:s'),
                'Items Count' => $transaction->appointmentLinks->count(), // Use appointmentLinks instead of items
                'Appointments Count' => $transaction->appointmentLinks->count(),
            ];
        }

        // Add doctor payments
        foreach ($doctorPayments as $payment) {
            $exportData[] = [
                'Type' => 'Doctor Payment',
                'Transaction ID' => 'DP-' . $payment->id,
                'Patient Name' => 'Doctor Payment',
                'Specialist' => $payment->doctor ? $payment->doctor->name : 'Unknown Doctor',
                'Amount' => -$payment->amount_paid,
                'Payment Method' => $payment->payment_method,
                'Status' => $payment->status,
                'Description' => 'Doctor Payment - ' . $payment->description,
                'Date' => $payment->payment_date->format('Y-m-d'),
                'Time' => $payment->payment_date->format('H:i:s'),
                'Full DateTime' => $payment->payment_date->format('Y-m-d H:i:s'),
                'Items Count' => 0,
                'Appointments Count' => 0,
            ];
        }

        // Add expenses (removed - Expense model deleted)

        // Sort by time
        usort($exportData, function($a, $b) {
            return strtotime($a['Time']) - strtotime($b['Time']);
        });

        // Generate filename with proper extensions
        $extension = match($format) {
            'excel' => 'xlsx',
            'pdf' => 'pdf',
            'word', 'doc', 'docx' => 'doc',
            default => $format
        };
        $filename = 'yearly-report-' . $year . '.' . $extension;

        if ($format === 'pdf') {
            $html = $this->buildHtmlTable('Yearly Report - ' . $year, $exportData);
            return \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)->download($filename);
        }

        if (in_array($format, ['word', 'doc', 'docx'])) {
            $html = $this->buildHtmlTable('Yearly Report - ' . $year, $exportData);
            return response($html)
                ->header('Content-Type', 'application/msword')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
        }

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\ArrayExport($exportData, 'Yearly Report - ' . $year),
            $filename,
            \Maatwebsite\Excel\Excel::XLSX
        );
    }

    private function buildHtmlTable($title, $data)
    {
        $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>' . $title . '</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        
        .hospital-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2d5a27;
            padding-bottom: 20px;
        }
        
        .hospital-logo {
            display: inline-block;
            vertical-align: top;
            margin-right: 20px;
        }
        
        .hospital-info {
            display: inline-block;
            text-align: left;
            vertical-align: top;
        }
        
        .hospital-name {
            font-size: 24px;
            font-weight: bold;
            color: #2d5a27;
            margin: 0 0 5px 0;
        }
        
        .hospital-address {
            font-size: 12px;
            color: #333;
            margin: 0 0 3px 0;
        }
        
        .hospital-slogan {
            font-size: 14px;
            font-style: italic;
            color: #1e40af;
            margin: 0 0 5px 0;
        }
        
        .hospital-motto {
            font-size: 16px;
            font-weight: bold;
            color: #2d5a27;
            margin: 0 0 5px 0;
        }
        
        .hospital-contact {
            font-size: 10px;
            color: #666;
            margin: 0;
        }
        
        .report-title {
            text-align: center;
            margin: 20px 0;
            font-size: 18px;
            font-weight: bold;
            color: #2d5a27;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .data-table th,
        .data-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        
        .data-table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #64748b;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="hospital-header">
        <div class="hospital-logo">
            <img src="' . public_path('st-james-logo.png') . '" alt="St. James Hospital Logo" style="width: 80px; height: 80px;">
        </div>
        <div class="hospital-info">
            <div class="hospital-name">St. James Hospital Clinic, Inc.</div>
            <div class="hospital-address">San Isidro City of Cabuyao Laguna</div>
            <div class="hospital-slogan">Santa Rosa\'s First in Quality Healthcare Service</div>
            <div class="hospital-motto">PASYENTE MUNA</div>
            <div class="hospital-contact">
                Tel. Nos. 02.85844533; 049.5341254; 049.5020058; Fax No.: local 307<br>
                email add: info@stjameshospital.com.ph
            </div>
        </div>
    </div>
    
    <div class="report-title">' . $title . '</div>
    <div style="text-align: center; margin-bottom: 20px; font-size: 12px; color: #666;">
        Generated on: ' . now()->format('M d, Y H:i A') . '
    </div>
    
    <table class="data-table">';
        if (!empty($data)) {
            // Add headers
            $html .= '<tr>';
            foreach (array_keys($data[0]) as $header) {
                $html .= '<th>' . $header . '</th>';
            }
            $html .= '</tr>';

            // Add data rows
            foreach ($data as $row) {
                $html .= '<tr>';
                foreach ($row as $cell) {
                    $html .= '<td>' . $cell . '</td>';
                }
                $html .= '</tr>';
            }
        }
        
        $html .= '</table>
    
    <div class="footer">
        <p>This report was generated automatically by the Clinic Management System</p>
        <p>For questions or support, please contact the system administrator</p>
    </div>
</body>
</html>';
        return $html;
    }
}
