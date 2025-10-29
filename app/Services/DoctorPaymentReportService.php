<?php

namespace App\Services;

use App\Models\DoctorPayment;
use App\Models\BillingTransaction;
use App\Models\Specialist;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\DoctorPaymentReportExport;

class DoctorPaymentReportService
{
    /**
     * Get report data based on filters
     */
    public function getReportData($filters)
    {
        $query = DoctorPayment::with(['doctor'])
            ->whereBetween('payment_date', [$filters['date_from'], $filters['date_to']]);

        // Apply doctor filter
        if ($filters['doctor_id'] !== 'all') {
            $query->where('doctor_id', $filters['doctor_id']);
        }

        // Apply status filter
        if ($filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        // Group by based on report type
        switch ($filters['report_type']) {
            case 'daily':
                return $this->getDailyData($query, $filters);
            case 'monthly':
                return $this->getMonthlyData($query, $filters);
            case 'yearly':
                return $this->getYearlyData($query, $filters);
            default:
                return $this->getDailyData($query, $filters);
        }
    }

    /**
     * Get daily report data
     */
    public function getDailyReport($filters)
    {
        $query = BillingTransaction::with(['doctor'])
            ->whereBetween('transaction_date', [$filters['date_from'] . ' 00:00:00', $filters['date_to'] . ' 23:59:59'])
            ->whereNotNull('doctor_id');

        if ($filters['doctor_id'] !== 'all') {
            $query->where('doctor_id', $filters['doctor_id']);
        }

        if ($filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        return $this->getDailyData($query, $filters);
    }

    /**
     * Get monthly report data
     */
    public function getMonthlyReport($filters)
    {
        $query = BillingTransaction::with(['doctor'])
            ->whereBetween('transaction_date', [$filters['date_from'] . ' 00:00:00', $filters['date_to'] . ' 23:59:59'])
            ->whereNotNull('doctor_id');

        if ($filters['doctor_id'] !== 'all') {
            $query->where('doctor_id', $filters['doctor_id']);
        }

        if ($filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        return $this->getMonthlyData($query, $filters);
    }

    /**
     * Get yearly report data
     */
    public function getYearlyReport($filters)
    {
        $query = BillingTransaction::with(['doctor'])
            ->whereBetween('transaction_date', [$filters['date_from'] . ' 00:00:00', $filters['date_to'] . ' 23:59:59'])
            ->whereNotNull('doctor_id');

        if ($filters['doctor_id'] !== 'all') {
            $query->where('doctor_id', $filters['doctor_id']);
        }

        if ($filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        return $this->getYearlyData($query, $filters);
    }

    /**
     * Get daily data - individual payment records
     */
    private function getDailyData($query, $filters)
    {
        return $query->orderBy('payment_date', 'desc')
            ->get()
            ->map(function ($payment) {
                $doctor = $payment->doctor;
                return [
                    'id' => $payment->id,
                    'date' => $payment->payment_date,
                    'payment_date' => $payment->payment_date,
                    'doctor_id' => $payment->doctor_id,
                    'doctor_name' => $doctor ? $doctor->name : 'Unknown Doctor',
                    'doctor_specialization' => $doctor ? $doctor->specialization : 'N/A',
                    'incentives' => $payment->incentives,
                    'net_payment' => $payment->net_payment,
                    'status' => $payment->status,
                    'notes' => $payment->notes,
                    'created_at' => $payment->created_at,
                ];
            });
    }

    /**
     * Get monthly data - individual payment records
     */
    private function getMonthlyData($query, $filters)
    {
        return $query->orderBy('payment_date', 'desc')
            ->get()
            ->map(function ($payment) {
                $doctor = $payment->doctor;
                $date = Carbon::parse($payment->payment_date);
                return [
                    'id' => $payment->id,
                    'year' => $date->year,
                    'month' => $date->month,
                    'month_name' => $date->format('F Y'),
                    'date' => $payment->payment_date,
                    'payment_date' => $payment->payment_date,
                    'doctor_id' => $payment->doctor_id,
                    'doctor_name' => $doctor ? $doctor->name : 'Unknown Doctor',
                    'doctor_specialization' => $doctor ? $doctor->specialization : 'N/A',
                    'incentives' => $payment->incentives,
                    'net_payment' => $payment->net_payment,
                    'status' => $payment->status,
                    'notes' => $payment->notes,
                    'created_at' => $payment->created_at,
                ];
            });
    }

    /**
     * Get yearly data - individual payment records
     */
    private function getYearlyData($query, $filters)
    {
        return $query->orderBy('payment_date', 'desc')
            ->get()
            ->map(function ($payment) {
                $doctor = $payment->doctor;
                $date = Carbon::parse($payment->payment_date);
                return [
                    'id' => $payment->id,
                    'year' => $date->year,
                    'date' => $payment->payment_date,
                    'payment_date' => $payment->payment_date,
                    'doctor_id' => $payment->doctor_id,
                    'doctor_name' => $doctor ? $doctor->name : 'Unknown Doctor',
                    'doctor_specialization' => $doctor ? $doctor->specialization : 'N/A',
                    'incentives' => $payment->incentives,
                    'net_payment' => $payment->net_payment,
                    'status' => $payment->status,
                    'notes' => $payment->notes,
                    'created_at' => $payment->created_at,
                ];
            });
    }

    /**
     * Get summary statistics
     */
    public function getSummaryStatistics($filters)
    {
        $query = DoctorPayment::whereBetween('payment_date', [$filters['date_from'], $filters['date_to']]);

        if ($filters['doctor_id'] !== 'all') {
            $query->where('doctor_id', $filters['doctor_id']);
        }

        if ($filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        $stats = $query->selectRaw('
                COUNT(*) as total_payments,
                SUM(net_payment) as total_amount,
                SUM(CASE WHEN status = "paid" THEN net_payment ELSE 0 END) as paid_amount,
                SUM(CASE WHEN status = "pending" THEN net_payment ELSE 0 END) as pending_amount,
                AVG(net_payment) as average_payment
            ')
            ->first();

        return [
            'total_payments' => $stats->total_payments ?? 0,
            'total_amount' => $stats->total_amount ?? 0,
            'paid_amount' => $stats->paid_amount ?? 0,
            'pending_amount' => $stats->pending_amount ?? 0,
            'average_payment' => $stats->average_payment ?? 0,
        ];
    }

    /**
     * Get doctor details for specific doctor
     */
    public function getDoctorDetails($filters)
    {
        $query = BillingTransaction::with(['doctor'])
            ->where('doctor_id', $filters['doctor_id'])
            ->whereBetween('transaction_date', [$filters['date_from'] . ' 00:00:00', $filters['date_to'] . ' 23:59:59']);

        if ($filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('transaction_date', 'desc')->get();
    }

    /**
     * Get doctor summary
     */
    public function getDoctorSummary($doctorId, $filters)
    {
        $query = BillingTransaction::where('doctor_id', $doctorId)
            ->whereBetween('transaction_date', [$filters['date_from'] . ' 00:00:00', $filters['date_to'] . ' 23:59:59']);

        if ($filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        $stats = $query->selectRaw('
                COUNT(*) as total_payments,
                SUM(total_amount) as total_amount,
                SUM(CASE WHEN status = "paid" THEN total_amount ELSE 0 END) as paid_amount,
                SUM(CASE WHEN status = "pending" THEN total_amount ELSE 0 END) as pending_amount,
                AVG(total_amount) as average_payment,
                SUM(total_amount) as total_incentives
            ')
            ->first();

        return [
            'total_payments' => $stats->total_payments ?? 0,
            'total_amount' => $stats->total_amount ?? 0,
            'paid_amount' => $stats->paid_amount ?? 0,
            'pending_amount' => $stats->pending_amount ?? 0,
            'average_payment' => $stats->average_payment ?? 0,
            'total_incentives' => $stats->total_incentives ?? 0,
        ];
    }

    /**
     * Export report
     */
    public function exportReport($filters)
    {
        $reportData = $this->getReportData($filters);
        $summary = $this->getSummaryStatistics($filters);

        $export = new DoctorPaymentReportExport($reportData, $summary, $filters);
        
        $filename = 'doctor_payment_report_' . $filters['report_type'] . '_' . 
                   $filters['date_from'] . '_to_' . $filters['date_to'] . '.' . $filters['format'];

        if ($filters['format'] === 'excel') {
            return Excel::download($export, $filename);
        } else {
            // PDF export would go here
            return response()->json(['message' => 'PDF export not implemented yet']);
        }
    }
}
