<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BillingTransaction;
use App\Models\DoctorPayment;
use App\Models\Expense;
use App\Models\DailyTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BillingReportController extends Controller
{
    public function index()
    {
        return inertia('admin/billing/reports/index');
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
        $date = $request->get('date', now()->format('Y-m-d'));
        
        // Get all transactions for the date
        $billingTransactions = BillingTransaction::whereDate('transaction_date', $date)
            ->with(['patient', 'doctor', 'items', 'appointmentLinks.appointment'])
            ->get();

        $doctorPayments = DoctorPayment::whereDate('payment_date', $date)
            ->with(['doctor'])
            ->get();

        $expenses = Expense::whereDate('expense_date', $date)
            ->with(['createdBy', 'updatedBy'])
            ->get();

        // Combine all transactions
        $allTransactions = collect();
        
        // Add billing transactions
        foreach ($billingTransactions as $transaction) {
            $allTransactions->push((object) [
                'id' => $transaction->id,
                'type' => 'billing',
                'transaction_id' => $transaction->transaction_id,
                'patient_name' => $this->getPatientName($transaction),
                'specialist_name' => $this->getSpecialistName($transaction),
                'amount' => $transaction->total_amount,
                'payment_method' => $transaction->payment_method,
                'status' => $transaction->status,
                'description' => $transaction->description ?: 'Payment for ' . $transaction->appointmentLinks->count() . ' appointment(s)',
                'time' => $transaction->transaction_date,
                'items_count' => $transaction->items->count(),
                'appointments_count' => $transaction->appointmentLinks->count(),
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

        // Add expenses
        foreach ($expenses as $expense) {
            $allTransactions->push((object) [
                'id' => $expense->id,
                'type' => 'expense',
                'transaction_id' => 'EXP-' . $expense->id,
                'patient_name' => 'Expense',
                'specialist_name' => 'System',
                'amount' => -$expense->amount,
                'payment_method' => $expense->payment_method,
                'status' => $expense->status,
                'description' => $expense->description,
                'time' => $expense->expense_date,
                'items_count' => 0,
                'appointments_count' => 0,
            ]);
        }

        // Sort by time
        $allTransactions = $allTransactions->sortBy('time');

        // Calculate summary
        $summary = [
            'total_revenue' => $billingTransactions->sum('total_amount'),
            'total_doctor_payments' => $doctorPayments->sum('amount_paid'),
            'total_expenses' => $expenses->sum('amount'),
            'net_profit' => $billingTransactions->sum('total_amount') - $doctorPayments->sum('amount_paid') - $expenses->sum('amount'),
            'transaction_count' => $billingTransactions->count(),
            'expense_count' => $expenses->count(),
            'doctor_payment_count' => $doctorPayments->count(),
        ];

        // Sync to daily transactions table
        $this->syncDailyTransactions($date);

        return inertia('admin/billing/daily-report', [
            'transactions' => $allTransactions->values(),
            'expenses' => $expenses,
            'summary' => $summary,
            'date' => $date,
        ]);
    }

    public function monthlyReport(Request $request)
    {
        $month = $request->get('month', now()->format('Y-m'));
        
        // Get all transactions for the month
        $billingTransactions = BillingTransaction::whereYear('transaction_date', substr($month, 0, 4))
            ->whereMonth('transaction_date', substr($month, 5, 2))
            ->with(['patient', 'doctor', 'items', 'appointmentLinks.appointment'])
            ->get();

        $doctorPayments = DoctorPayment::whereYear('payment_date', substr($month, 0, 4))
            ->whereMonth('payment_date', substr($month, 5, 2))
            ->with(['doctor'])
            ->get();

        $expenses = Expense::whereYear('expense_date', substr($month, 0, 4))
            ->whereMonth('expense_date', substr($month, 5, 2))
            ->with(['createdBy', 'updatedBy'])
            ->get();

        // Combine all transactions
        $allTransactions = collect();
        
        // Add billing transactions
        foreach ($billingTransactions as $transaction) {
            $allTransactions->push((object) [
                'id' => $transaction->id,
                'type' => 'billing',
                'transaction_id' => $transaction->transaction_id,
                'patient_name' => $this->getPatientName($transaction),
                'specialist_name' => $this->getSpecialistName($transaction),
                'amount' => $transaction->total_amount,
                'payment_method' => $transaction->payment_method,
                'status' => $transaction->status,
                'description' => $transaction->description ?: 'Payment for ' . $transaction->appointmentLinks->count() . ' appointment(s)',
                'time' => $transaction->transaction_date,
                'items_count' => $transaction->items->count(),
                'appointments_count' => $transaction->appointmentLinks->count(),
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

        // Add expenses
        foreach ($expenses as $expense) {
            $allTransactions->push((object) [
                'id' => $expense->id,
                'type' => 'expense',
                'transaction_id' => 'EXP-' . $expense->id,
                'patient_name' => 'Expense',
                'specialist_name' => 'System',
                'amount' => -$expense->amount,
                'payment_method' => $expense->payment_method,
                'status' => $expense->status,
                'description' => $expense->description,
                'time' => $expense->expense_date,
                'items_count' => 0,
                'appointments_count' => 0,
            ]);
        }

        // Sort by time
        $allTransactions = $allTransactions->sortBy('time');

        // Calculate summary
        $summary = [
            'total_revenue' => $billingTransactions->sum('total_amount'),
            'total_doctor_payments' => $doctorPayments->sum('amount_paid'),
            'total_expenses' => $expenses->sum('amount'),
            'net_profit' => $billingTransactions->sum('total_amount') - $doctorPayments->sum('amount_paid') - $expenses->sum('amount'),
            'transaction_count' => $billingTransactions->count(),
            'expense_count' => $expenses->count(),
            'doctor_payment_count' => $doctorPayments->count(),
        ];

        return inertia('admin/billing/monthly-report', [
            'transactions' => $allTransactions->values(),
            'expenses' => $expenses,
            'summary' => $summary,
            'month' => $month,
        ]);
    }

    public function yearlyReport(Request $request)
    {
        $year = $request->get('year', now()->format('Y'));
        
        // Get all transactions for the year
        $billingTransactions = BillingTransaction::whereYear('transaction_date', $year)
            ->with(['patient', 'doctor', 'items', 'appointmentLinks.appointment'])
            ->get();

        $doctorPayments = DoctorPayment::whereYear('payment_date', $year)
            ->with(['doctor'])
            ->get();

        $expenses = Expense::whereYear('expense_date', $year)
            ->with(['createdBy', 'updatedBy'])
            ->get();

        // Combine all transactions
        $allTransactions = collect();
        
        // Add billing transactions
        foreach ($billingTransactions as $transaction) {
            $allTransactions->push((object) [
                'id' => $transaction->id,
                'type' => 'billing',
                'transaction_id' => $transaction->transaction_id,
                'patient_name' => $this->getPatientName($transaction),
                'specialist_name' => $this->getSpecialistName($transaction),
                'amount' => $transaction->total_amount,
                'payment_method' => $transaction->payment_method,
                'status' => $transaction->status,
                'description' => $transaction->description ?: 'Payment for ' . $transaction->appointmentLinks->count() . ' appointment(s)',
                'time' => $transaction->transaction_date,
                'items_count' => $transaction->items->count(),
                'appointments_count' => $transaction->appointmentLinks->count(),
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

        // Add expenses
        foreach ($expenses as $expense) {
            $allTransactions->push((object) [
                'id' => $expense->id,
                'type' => 'expense',
                'transaction_id' => 'EXP-' . $expense->id,
                'patient_name' => 'Expense',
                'specialist_name' => 'System',
                'amount' => -$expense->amount,
                'payment_method' => $expense->payment_method,
                'status' => $expense->status,
                'description' => $expense->description,
                'time' => $expense->expense_date,
                'items_count' => 0,
                'appointments_count' => 0,
            ]);
        }

        // Sort by time
        $allTransactions = $allTransactions->sortBy('time');

        // Calculate summary
        $summary = [
            'total_revenue' => $billingTransactions->sum('total_amount'),
            'total_doctor_payments' => $doctorPayments->sum('amount_paid'),
            'total_expenses' => $expenses->sum('amount'),
            'net_profit' => $billingTransactions->sum('total_amount') - $doctorPayments->sum('amount_paid') - $expenses->sum('amount'),
            'transaction_count' => $billingTransactions->count(),
            'expense_count' => $expenses->count(),
            'doctor_payment_count' => $doctorPayments->count(),
        ];

        return inertia('admin/billing/yearly-report', [
            'transactions' => $allTransactions->values(),
            'expenses' => $expenses,
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
        $query = BillingTransaction::whereBetween('transaction_date', [$dateFrom, $dateTo])
            ->with(['patient', 'doctor', 'items', 'appointmentLinks.appointment']);

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
        $revenueQuery = BillingTransaction::whereBetween('transaction_date', [$dateFrom, $dateTo])
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
        $dateFrom = $request->get('date_from', now()->subDays(30)->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));

        // Get HMO transactions
        $hmoTransactions = BillingTransaction::whereBetween('transaction_date', [$dateFrom, $dateTo])
            ->where('payment_method', 'hmo')
            ->whereNotNull('hmo_provider')
            ->with(['patient', 'doctor', 'items', 'appointmentLinks.appointment'])
            ->get();

        // Group by HMO provider
        $hmoSummary = $hmoTransactions->groupBy('hmo_provider')
            ->map(function ($transactions, $provider) {
                return [
                    'provider' => $provider,
                    'total_amount' => $transactions->sum('total_amount'),
                    'transaction_count' => $transactions->count(),
                    'paid_count' => $transactions->where('status', 'paid')->count(),
                    'pending_count' => $transactions->where('status', 'pending')->count(),
                ];
            });

        // Calculate summary
        $summary = [
            'total_hmo_revenue' => $hmoTransactions->sum('total_amount'),
            'total_hmo_transactions' => $hmoTransactions->count(),
            'hmo_providers_count' => $hmoSummary->count(),
            'paid_hmo_transactions' => $hmoTransactions->where('status', 'paid')->count(),
            'pending_hmo_transactions' => $hmoTransactions->where('status', 'pending')->count(),
        ];

        return inertia('admin/billing/hmo-report', [
            'hmoTransactions' => $hmoTransactions,
            'hmoSummary' => $hmoSummary,
            'summary' => $summary,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ]
        ]);
    }

    public function exportAll(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->subDays(30)->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));
        $format = $request->get('format', 'excel');

        // Get all data
        $billingTransactions = BillingTransaction::whereBetween('transaction_date', [$dateFrom, $dateTo])
            ->with(['patient', 'doctor', 'items', 'appointmentLinks.appointment'])
            ->get();

        $doctorPayments = DoctorPayment::whereBetween('payment_date', [$dateFrom, $dateTo])
            ->with(['doctor'])
            ->get();

        $expenses = Expense::whereBetween('expense_date', [$dateFrom, $dateTo])
            ->with(['createdBy', 'updatedBy'])
            ->get();

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
                'Items Count' => $transaction->items->count(),
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

        // Add expenses
        foreach ($expenses as $expense) {
            $exportData[] = [
                'Type' => 'Expense',
                'Transaction ID' => 'EXP-' . $expense->id,
                'Patient Name' => 'Expense',
                'Specialist' => 'System',
                'Amount' => -$expense->amount,
                'Payment Method' => $expense->payment_method,
                'HMO Provider' => 'N/A',
                'Status' => $expense->status,
                'Description' => $expense->description,
                'Date' => $expense->expense_date->format('Y-m-d'),
                'Time' => $expense->expense_date->format('H:i:s'),
                'Items Count' => 0,
                'Appointments Count' => 0,
            ];
        }

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
        // Clear existing records for the date
        DailyTransaction::where('transaction_date', $date)->delete();

        // Get all transactions for the date
        $billingTransactions = BillingTransaction::whereDate('transaction_date', $date)
            ->with(['patient', 'doctor', 'items', 'appointmentLinks.appointment'])
            ->get();

        $doctorPayments = DoctorPayment::whereDate('payment_date', $date)
            ->with(['doctor'])
            ->get();

        $expenses = Expense::whereDate('expense_date', $date)
            ->with(['createdBy', 'updatedBy'])
            ->get();

        // Sync billing transactions
        foreach ($billingTransactions as $transaction) {
            DailyTransaction::create([
                'transaction_date' => $date,
                'transaction_type' => 'billing',
                'transaction_id' => $transaction->transaction_id,
                'patient_name' => $this->getPatientName($transaction),
                'specialist_name' => $this->getSpecialistName($transaction),
                'amount' => $transaction->total_amount,
                'payment_method' => $transaction->payment_method,
                'status' => $transaction->status,
                'description' => $transaction->description ?: 'Payment for ' . $transaction->appointmentLinks->count() . ' appointment(s)',
                'items_count' => $transaction->items->count(),
                'appointments_count' => $transaction->appointmentLinks->count(),
                'original_transaction_id' => $transaction->id,
                'original_table' => 'billing_transactions',
            ]);
        }

        // Sync doctor payments
        foreach ($doctorPayments as $payment) {
            DailyTransaction::create([
                'transaction_date' => $date,
                'transaction_type' => 'doctor_payment',
                'transaction_id' => 'DP-' . $payment->id,
                'patient_name' => 'Doctor Payment',
                'specialist_name' => $payment->doctor ? $payment->doctor->name : 'Unknown Doctor',
                'amount' => -$payment->amount_paid,
                'payment_method' => $payment->payment_method,
                'status' => $payment->status,
                'description' => 'Doctor Payment - ' . $payment->description,
                'items_count' => 0,
                'appointments_count' => 0,
                'original_transaction_id' => $payment->id,
                'original_table' => 'doctor_payments',
            ]);
        }

        // Sync expenses
        foreach ($expenses as $expense) {
            DailyTransaction::create([
                'transaction_date' => $date,
                'transaction_type' => 'expense',
                'transaction_id' => 'EXP-' . $expense->id,
                'patient_name' => 'Expense',
                'specialist_name' => 'System',
                'amount' => -$expense->amount,
                'payment_method' => $expense->payment_method,
                'status' => $expense->status,
                'description' => $expense->description,
                'items_count' => 0,
                'appointments_count' => 0,
                'original_transaction_id' => $expense->id,
                'original_table' => 'expenses',
            ]);
        }
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
            ->with(['patient', 'doctor', 'items', 'appointmentLinks.appointment'])
            ->get();

        $doctorPayments = DoctorPayment::whereDate('payment_date', $date)
            ->with(['doctor'])
            ->get();

        $expenses = Expense::whereDate('expense_date', $date)
            ->with(['createdBy', 'updatedBy'])
            ->get();

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
                'Items Count' => $transaction->items->count(),
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

        // Add expenses
        foreach ($expenses as $expense) {
            $exportData[] = [
                'Type' => 'Expense',
                'Transaction ID' => 'EXP-' . $expense->id,
                'Patient Name' => 'Expense',
                'Specialist' => 'System',
                'Amount' => -$expense->amount,
                'Payment Method' => $expense->payment_method,
                'Status' => $expense->status,
                'Description' => $expense->description,
                'Date' => $expense->expense_date->format('Y-m-d'),
                'Time' => $expense->expense_date->format('H:i:s'),
                'Full DateTime' => $expense->expense_date->format('Y-m-d H:i:s'),
                'Items Count' => 0,
                'Appointments Count' => 0,
            ];
        }

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
            ->with(['patient', 'doctor', 'items', 'appointmentLinks.appointment'])
            ->get();

        $doctorPayments = DoctorPayment::whereYear('payment_date', substr($month, 0, 4))
            ->whereMonth('payment_date', substr($month, 5, 2))
            ->with(['doctor'])
            ->get();

        $expenses = Expense::whereYear('expense_date', substr($month, 0, 4))
            ->whereMonth('expense_date', substr($month, 5, 2))
            ->with(['createdBy', 'updatedBy'])
            ->get();

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
                'Items Count' => $transaction->items->count(),
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

        // Add expenses
        foreach ($expenses as $expense) {
            $exportData[] = [
                'Type' => 'Expense',
                'Transaction ID' => 'EXP-' . $expense->id,
                'Patient Name' => 'Expense',
                'Specialist' => 'System',
                'Amount' => -$expense->amount,
                'Payment Method' => $expense->payment_method,
                'Status' => $expense->status,
                'Description' => $expense->description,
                'Date' => $expense->expense_date->format('Y-m-d'),
                'Time' => $expense->expense_date->format('H:i:s'),
                'Full DateTime' => $expense->expense_date->format('Y-m-d H:i:s'),
                'Items Count' => 0,
                'Appointments Count' => 0,
            ];
        }

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
            ->with(['patient', 'doctor', 'items', 'appointmentLinks.appointment'])
            ->get();

        $doctorPayments = DoctorPayment::whereYear('payment_date', $year)
            ->with(['doctor'])
            ->get();

        $expenses = Expense::whereYear('expense_date', $year)
            ->with(['createdBy', 'updatedBy'])
            ->get();

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
                'Items Count' => $transaction->items->count(),
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

        // Add expenses
        foreach ($expenses as $expense) {
            $exportData[] = [
                'Type' => 'Expense',
                'Transaction ID' => 'EXP-' . $expense->id,
                'Patient Name' => 'Expense',
                'Specialist' => 'System',
                'Amount' => -$expense->amount,
                'Payment Method' => $expense->payment_method,
                'Status' => $expense->status,
                'Description' => $expense->description,
                'Date' => $expense->expense_date->format('Y-m-d'),
                'Time' => $expense->expense_date->format('H:i:s'),
                'Full DateTime' => $expense->expense_date->format('Y-m-d H:i:s'),
                'Items Count' => 0,
                'Appointments Count' => 0,
            ];
        }

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
        $html = '<html><head><title>' . $title . '</title></head><body>';
        $html .= '<h1>' . $title . '</h1>';
        $html .= '<table border="1" cellpadding="5" cellspacing="0">';
        
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
        
        $html .= '</table></body></html>';
        return $html;
    }
}