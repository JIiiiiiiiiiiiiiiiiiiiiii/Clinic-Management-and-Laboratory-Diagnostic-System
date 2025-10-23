<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Specialist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class AppointmentReportController extends Controller
{
    /**
     * Display the appointment reports dashboard
     */
    public function index(Request $request)
    {
        // Handle new filter parameters for daily/monthly/yearly reports
        $reportType = $request->get('report_type', 'daily');
        $date = $request->get('date');
        $month = $request->get('month');
        $year = $request->get('year');
        
        // Set date range based on report type
        if ($reportType === 'daily' && $date) {
            $dateFrom = $date;
            $dateTo = $date;
        } elseif ($reportType === 'monthly' && $month) {
            $dateFrom = $month . '-01';
            $dateTo = date('Y-m-t', strtotime($month . '-01'));
        } elseif ($reportType === 'yearly' && $year) {
            $dateFrom = $year . '-01-01';
            $dateTo = $year . '-12-31';
        } else {
            // For initial load, show current date
            $dateFrom = $request->get('date_from', now()->format('Y-m-d'));
            $dateTo = $request->get('date_to', now()->format('Y-m-d'));
        }
        
        $status = $request->get('status', 'all');
        $specialistType = $request->get('specialist_type', 'all');

        // Get summary statistics
        $summary = $this->getSummaryStatistics($dateFrom, $dateTo, $status, $specialistType);
        
        // Get appointments
        $appointments = $this->getAppointments($dateFrom, $dateTo, $status, $specialistType);
        
        return Inertia::render('admin/reports/AppointmentsSimple', [
            'summary' => $summary,
            'appointments' => $appointments,
            'filters' => [
                'date' => $date,
                'month' => $month,
                'year' => $year,
                'report_type' => $reportType,
                'status' => $status,
                'specialist_type' => $specialistType,
            ]
        ]);
    }

    /**
     * Get summary statistics for appointments
     */
    private function getSummaryStatistics($dateFrom, $dateTo, $status = 'all', $specialistType = 'all')
    {
        $query = Appointment::whereBetween('appointment_date', [$dateFrom, $dateTo]);

        // Apply status filter
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // Apply specialist type filter
        if ($specialistType !== 'all') {
            $query->where('specialist_type', $specialistType);
        }

        $appointments = $query->get();

        $totalAppointments = $appointments->count();
        $completedAppointments = $appointments->where('status', 'Completed')->count();
        $totalRevenue = $appointments->sum('price');

        return [
            'total_appointments' => $totalAppointments,
            'pending_appointments' => $appointments->where('status', 'Pending')->count(),
            'confirmed_appointments' => $appointments->where('status', 'Confirmed')->count(),
            'completed_appointments' => $completedAppointments,
            'cancelled_appointments' => $appointments->where('status', 'Cancelled')->count(),
            'total_revenue' => $totalRevenue,
            'online_appointments' => $appointments->where('source', 'Online')->count(),
            'walk_in_appointments' => $appointments->where('source', 'Walk-in')->count(),
            'doctor_appointments' => $appointments->where('specialist_type', 'Doctor')->count(),
            'medtech_appointments' => $appointments->where('specialist_type', 'MedTech')->count(),
            'nurse_appointments' => $appointments->where('specialist_type', 'Nurse')->count(),
            'average_appointment_value' => $totalAppointments > 0 ? $totalRevenue / $totalAppointments : 0,
            'completion_rate' => $totalAppointments > 0 ? ($completedAppointments / $totalAppointments) * 100 : 0,
        ];
    }

    /**
     * Get appointments with filters
     */
    private function getAppointments($dateFrom, $dateTo, $status = 'all', $specialistType = 'all')
    {
        $query = Appointment::with(['patient', 'specialist'])
            ->whereBetween('appointment_date', [$dateFrom, $dateTo])
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc');

        // Apply status filter
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // Apply specialist type filter
        if ($specialistType !== 'all') {
            $query->where('specialist_type', $specialistType);
        }

        return $query->get()->map(function ($appointment) {
            return [
                'id' => $appointment->id,
                'appointment_code' => $appointment->appointment_code ?? 'A' . str_pad($appointment->id, 4, '0', STR_PAD_LEFT),
                'patient_name' => $appointment->patient_name ?? $appointment->patient?->name ?? 'N/A',
                'patient_id' => $appointment->patient_id,
                'contact_number' => $appointment->contact_number ?? $appointment->patient?->contact_number ?? 'N/A',
                'appointment_type' => $appointment->appointment_type,
                'specialist_type' => $appointment->specialist_type,
                'specialist_name' => $appointment->specialist_name ?? $appointment->specialist?->name ?? 'N/A',
                'specialist_id' => $appointment->specialist_id,
                'appointment_date' => $appointment->appointment_date,
                'appointment_time' => $appointment->appointment_time,
                'duration' => $appointment->duration,
                'price' => $appointment->price,
                'status' => $appointment->status,
                'source' => $appointment->source,
                'created_at' => $appointment->created_at,
                'notes' => $appointment->notes,
                'special_requirements' => $appointment->special_requirements,
            ];
        });
    }

    /**
     * Export appointments to Excel
     */
    public function exportExcel(Request $request)
    {
        $reportType = $request->get('report_type', 'daily');
        $format = $request->get('format', 'excel');
        
        // Set date range based on report type
        if ($reportType === 'daily' && $request->get('date')) {
            $dateFrom = $request->get('date');
            $dateTo = $request->get('date');
        } elseif ($reportType === 'monthly' && $request->get('month')) {
            $dateFrom = $request->get('month') . '-01';
            $dateTo = date('Y-m-t', strtotime($request->get('month') . '-01'));
        } elseif ($reportType === 'yearly' && $request->get('year')) {
            $dateFrom = $request->get('year') . '-01-01';
            $dateTo = $request->get('year') . '-12-31';
        } else {
            $dateFrom = now()->format('Y-m-d');
            $dateTo = now()->format('Y-m-d');
        }

        $status = $request->get('status', 'all');
        $specialistType = $request->get('specialist_type', 'all');

        $appointments = $this->getAppointments($dateFrom, $dateTo, $status, $specialistType);
        $summary = $this->getSummaryStatistics($dateFrom, $dateTo, $status, $specialistType);

        $fileName = 'appointments_report_' . $reportType . '_' . now()->format('Y-m-d_H-i-s') . '.xlsx';

        return Excel::download(new \App\Exports\AppointmentReportExport($appointments, $summary, $reportType), $fileName);
    }

    /**
     * Export appointments to PDF
     */
    public function exportPdf(Request $request)
    {
        $reportType = $request->get('report_type', 'daily');
        
        // Set date range based on report type
        if ($reportType === 'daily' && $request->get('date')) {
            $dateFrom = $request->get('date');
            $dateTo = $request->get('date');
        } elseif ($reportType === 'monthly' && $request->get('month')) {
            $dateFrom = $request->get('month') . '-01';
            $dateTo = date('Y-m-t', strtotime($request->get('month') . '-01'));
        } elseif ($reportType === 'yearly' && $request->get('year')) {
            $dateFrom = $request->get('year') . '-01-01';
            $dateTo = $request->get('year') . '-12-31';
        } else {
            $dateFrom = now()->format('Y-m-d');
            $dateTo = now()->format('Y-m-d');
        }

        $status = $request->get('status', 'all');
        $specialistType = $request->get('specialist_type', 'all');

        $appointments = $this->getAppointments($dateFrom, $dateTo, $status, $specialistType);
        $summary = $this->getSummaryStatistics($dateFrom, $dateTo, $status, $specialistType);

        $fileName = 'appointments_report_' . $reportType . '_' . now()->format('Y-m-d_H-i-s') . '.pdf';

        $pdf = Pdf::loadView('exports.appointment-report-pdf', [
            'appointments' => $appointments,
            'summary' => $summary,
            'reportType' => $reportType,
            'dateFrom' => $dateFrom,
            'dateTo' => $dateTo,
            'filters' => [
                'status' => $status,
                'specialist_type' => $specialistType,
            ]
        ]);

        return $pdf->download($fileName);
    }

    /**
     * Handle export requests (Excel or PDF)
     */
    public function export(Request $request)
    {
        $format = $request->get('format', 'excel');
        
        if ($format === 'pdf') {
            return $this->exportPdf($request);
        } else {
            return $this->exportExcel($request);
        }
    }
}
