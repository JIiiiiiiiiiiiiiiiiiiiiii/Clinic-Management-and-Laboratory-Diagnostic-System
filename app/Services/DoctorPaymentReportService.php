<?php

namespace App\Services;

use App\Models\DoctorPayment;
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
        $query = DoctorPayment::with(['doctor'])
            ->whereBetween('payment_date', [$filters['date_from'], $filters['date_to']]);

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
        $query = DoctorPayment::with(['doctor'])
            ->whereBetween('payment_date', [$filters['date_from'], $filters['date_to']]);

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
        $query = DoctorPayment::with(['doctor'])
            ->whereBetween('payment_date', [$filters['date_from'], $filters['date_to']]);

        if ($filters['doctor_id'] !== 'all') {
            $query->where('doctor_id', $filters['doctor_id']);
        }

        if ($filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        return $this->getYearlyData($query, $filters);
    }

    /**
     * Get daily grouped data
     */
    private function getDailyData($query, $filters)
    {
        return $query->selectRaw('
                DATE(payment_date) as date,
                doctor_id,
                COUNT(*) as payment_count,
                SUM(incentives) as total_incentives,
                SUM(net_payment) as total_net_payment,
                AVG(net_payment) as average_payment
            ')
            ->groupBy('date', 'doctor_id')
            ->orderBy('date', 'desc')
            ->get()
            ->map(function ($item) {
                $doctor = Specialist::find($item->doctor_id);
                return [
                    'date' => $item->date,
                    'doctor_id' => $item->doctor_id,
                    'doctor_name' => $doctor ? $doctor->name : 'Unknown Doctor',
                    'doctor_specialization' => $doctor ? $doctor->specialization : 'N/A',
                    'payment_count' => $item->payment_count,
                    'total_incentives' => $item->total_incentives,
                    'total_net_payment' => $item->total_net_payment,
                    'average_payment' => $item->average_payment,
                ];
            });
    }

    /**
     * Get monthly grouped data
     */
    private function getMonthlyData($query, $filters)
    {
        return $query->selectRaw('
                YEAR(payment_date) as year,
                MONTH(payment_date) as month,
                doctor_id,
                COUNT(*) as payment_count,
                SUM(incentives) as total_incentives,
                SUM(net_payment) as total_net_payment,
                AVG(net_payment) as average_payment
            ')
            ->groupBy('year', 'month', 'doctor_id')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get()
            ->map(function ($item) {
                $doctor = Specialist::find($item->doctor_id);
                $date = Carbon::create($item->year, $item->month, 1);
                return [
                    'year' => $item->year,
                    'month' => $item->month,
                    'month_name' => $date->format('F Y'),
                    'doctor_id' => $item->doctor_id,
                    'doctor_name' => $doctor ? $doctor->name : 'Unknown Doctor',
                    'doctor_specialization' => $doctor ? $doctor->specialization : 'N/A',
                    'payment_count' => $item->payment_count,
                    'total_incentives' => $item->total_incentives,
                    'total_net_payment' => $item->total_net_payment,
                    'average_payment' => $item->average_payment,
                ];
            });
    }

    /**
     * Get yearly grouped data
     */
    private function getYearlyData($query, $filters)
    {
        return $query->selectRaw('
                YEAR(payment_date) as year,
                doctor_id,
                COUNT(*) as payment_count,
                SUM(incentives) as total_incentives,
                SUM(net_payment) as total_net_payment,
                AVG(net_payment) as average_payment
            ')
            ->groupBy('year', 'doctor_id')
            ->orderBy('year', 'desc')
            ->get()
            ->map(function ($item) {
                $doctor = Specialist::find($item->doctor_id);
                return [
                    'year' => $item->year,
                    'doctor_id' => $item->doctor_id,
                    'doctor_name' => $doctor ? $doctor->name : 'Unknown Doctor',
                    'doctor_specialization' => $doctor ? $doctor->specialization : 'N/A',
                    'payment_count' => $item->payment_count,
                    'total_incentives' => $item->total_incentives,
                    'total_net_payment' => $item->total_net_payment,
                    'average_payment' => $item->average_payment,
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
        $query = DoctorPayment::with(['doctor'])
            ->where('doctor_id', $filters['doctor_id'])
            ->whereBetween('payment_date', [$filters['date_from'], $filters['date_to']]);

        if ($filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('payment_date', 'desc')->get();
    }

    /**
     * Get doctor summary
     */
    public function getDoctorSummary($doctorId, $filters)
    {
        $query = DoctorPayment::where('doctor_id', $doctorId)
            ->whereBetween('payment_date', [$filters['date_from'], $filters['date_to']]);

        if ($filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        $stats = $query->selectRaw('
                COUNT(*) as total_payments,
                SUM(net_payment) as total_amount,
                SUM(CASE WHEN status = "paid" THEN net_payment ELSE 0 END) as paid_amount,
                SUM(CASE WHEN status = "pending" THEN net_payment ELSE 0 END) as pending_amount,
                AVG(net_payment) as average_payment,
                SUM(incentives) as total_incentives
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
