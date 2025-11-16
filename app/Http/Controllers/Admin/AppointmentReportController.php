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
        $reportType = $request->get('report_type', 'all');
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
            // For 'all' report type or initial load, show all appointments (no date filtering)
            $dateFrom = null;
            $dateTo = null;
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
        $query = Appointment::query();
        
        // Only apply date filtering if dates are provided
        if ($dateFrom && $dateTo) {
            $query->whereBetween('appointment_date', [$dateFrom, $dateTo]);
        }

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
        // Use LEFT JOIN to get patient and specialist data directly from database
        // Check all possible specialist sources (appointments.specialist_id, visits.doctor_id, visits.nurse_id, visits.medtech_id, visits.attending_staff_id)
        $query = Appointment::query()
            ->leftJoin('visits', 'appointments.id', '=', 'visits.appointment_id')
            ->leftJoin('patients as appointment_patients', 'appointments.patient_id', '=', 'appointment_patients.id')
            ->leftJoin('patients as visit_patients', 'visits.patient_id', '=', 'visit_patients.id')
            ->leftJoin('specialists', 'appointments.specialist_id', '=', 'specialists.specialist_id')
            ->leftJoin('specialists as visit_doctor_specialists', 'visits.doctor_id', '=', 'visit_doctor_specialists.specialist_id')
            ->leftJoin('specialists as visit_nurse_specialists', 'visits.nurse_id', '=', 'visit_nurse_specialists.specialist_id')
            ->leftJoin('specialists as visit_medtech_specialists', 'visits.medtech_id', '=', 'visit_medtech_specialists.specialist_id')
            ->leftJoin('specialists as visit_attending_specialists', 'visits.attending_staff_id', '=', 'visit_attending_specialists.specialist_id')
            ->select(
                'appointments.*',
                DB::raw('COALESCE(appointment_patients.first_name, visit_patients.first_name) as patient_first_name'),
                DB::raw('COALESCE(appointment_patients.last_name, visit_patients.last_name) as patient_last_name'),
                DB::raw('COALESCE(appointment_patients.middle_name, visit_patients.middle_name) as patient_middle_name'),
                DB::raw('COALESCE(appointment_patients.mobile_no, visit_patients.mobile_no) as patient_mobile_no'),
                DB::raw('COALESCE(appointment_patients.telephone_no, visit_patients.telephone_no) as patient_telephone_no'),
                DB::raw('COALESCE(
                    specialists.name, 
                    visit_doctor_specialists.name, 
                    visit_nurse_specialists.name, 
                    visit_medtech_specialists.name, 
                    visit_attending_specialists.name
                ) as specialist_name_from_table')
            );
        
        // Only apply date filtering if dates are provided
        if ($dateFrom && $dateTo) {
            $query->whereBetween('appointments.appointment_date', [$dateFrom, $dateTo]);
        }
        
        $query->orderBy('appointments.appointment_date', 'desc')
              ->orderBy('appointments.appointment_time', 'desc');

        // Apply status filter
        if ($status !== 'all') {
            $query->where('appointments.status', $status);
        }

        // Apply specialist type filter
        if ($specialistType !== 'all') {
            $query->where('appointments.specialist_type', $specialistType);
        }

        return $query->get()->map(function ($appointment) {
            // Access joined columns from attributes
            $attributes = $appointment->getAttributes();
            
            // Get patient name from joined data
            $patientName = 'Unknown Patient';
            $patientFirstName = $attributes['patient_first_name'] ?? $appointment->patient_first_name ?? null;
            $patientMiddleName = $attributes['patient_middle_name'] ?? $appointment->patient_middle_name ?? null;
            $patientLastName = $attributes['patient_last_name'] ?? $appointment->patient_last_name ?? null;
            
            if ($patientFirstName || $patientLastName) {
                $firstName = $patientFirstName ?? '';
                $middleName = $patientMiddleName ?? '';
                $lastName = $patientLastName ?? '';
                $patientName = trim(implode(' ', array_filter([$firstName, $middleName, $lastName])));
            }
            
            // If still empty, try to load patient relationship as fallback
            if (empty(trim($patientName)) && $appointment->patient_id) {
                if (!$appointment->relationLoaded('patient')) {
                    $appointment->load('patient');
                }
                if ($appointment->patient) {
                    $firstName = $appointment->patient->first_name ?? '';
                    $middleName = $appointment->patient->middle_name ?? '';
                    $lastName = $appointment->patient->last_name ?? '';
                    $patientName = trim(implode(' ', array_filter([$firstName, $middleName, $lastName])));
                }
            }
            
            if (empty(trim($patientName))) {
                $patientName = 'Unknown Patient';
            }
            
            // Get contact number from joined data
            $contactNumber = $attributes['patient_mobile_no'] ?? $appointment->patient_mobile_no ?? $attributes['patient_telephone_no'] ?? $appointment->patient_telephone_no ?? 'N/A';
            
            // Get specialist name from joined data
            $specialistName = $attributes['specialist_name_from_table'] ?? $appointment->specialist_name_from_table ?? null;
            
            // If still null, try to get from relationships as fallback
            if (empty($specialistName) || $specialistName === 'NULL') {
                // Try appointment specialist relationship
                if ($appointment->specialist_id) {
                    if (!$appointment->relationLoaded('specialist')) {
                        $appointment->load('specialist');
                    }
                    if ($appointment->specialist) {
                        $specialistName = $appointment->specialist->name;
                    }
                }
                
                // Try visit relationships
                if (empty($specialistName) && $appointment->relationLoaded('visit') && $appointment->visit) {
                    $visit = $appointment->visit;
                    if ($visit->doctor_id) {
                        $visitDoctor = Specialist::find($visit->doctor_id);
                        if ($visitDoctor) {
                            $specialistName = $visitDoctor->name;
                        }
                    }
                }
            }
            
            // Final fallback
            if (empty($specialistName) || $specialistName === 'NULL') {
                $specialistName = 'Unknown Specialist';
            }
            
            return [
                'id' => $appointment->id,
                'appointment_code' => $appointment->appointment_code ?: 'A' . str_pad($appointment->id, 4, '0', STR_PAD_LEFT),
                'patient_name' => $patientName,
                'patient_id' => $appointment->patient_id,
                'contact_number' => $contactNumber,
                'appointment_type' => $appointment->appointment_type,
                'specialist_type' => $appointment->specialist_type,
                'specialist_name' => $specialistName,
                'specialist_id' => $appointment->specialist_id,
                'appointment_date' => $appointment->appointment_date,
                'appointment_time' => $appointment->appointment_time,
                'duration' => $appointment->duration,
                'price' => $appointment->price,
                'status' => $appointment->status,
                'source' => $appointment->source,
                'created_at' => $appointment->created_at,
                'notes' => $appointment->admin_notes ?? $appointment->additional_info ?? null,
                'special_requirements' => $appointment->additional_info ?? null,
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
            // For export without specific date range, show all appointments
            $dateFrom = null;
            $dateTo = null;
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
            // For export without specific date range, show all appointments
            $dateFrom = null;
            $dateTo = null;
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
