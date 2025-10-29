<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Specialist;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AppointmentReportService
{
    /**
     * Generate appointment statistics for a given date range
     */
    public function generateStatistics($dateFrom, $dateTo, $filters = [])
    {
        $query = Appointment::whereBetween('appointment_date', [$dateFrom, $dateTo]);

        // Apply filters
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['specialist_type']) && $filters['specialist_type'] !== 'all') {
            $query->where('specialist_type', $filters['specialist_type']);
        }

        if (isset($filters['source']) && $filters['source'] !== 'all') {
            $query->where('source', $filters['source']);
        }

        $appointments = $query->get();

        return [
            'total_appointments' => $appointments->count(),
            'pending_appointments' => $appointments->where('status', 'Pending')->count(),
            'confirmed_appointments' => $appointments->where('status', 'Confirmed')->count(),
            'completed_appointments' => $appointments->where('status', 'Completed')->count(),
            'cancelled_appointments' => $appointments->where('status', 'Cancelled')->count(),
            'total_revenue' => $appointments->sum('price'),
            'online_appointments' => $appointments->where('source', 'Online')->count(),
            'walk_in_appointments' => $appointments->where('source', 'Walk-in')->count(),
            'doctor_appointments' => $appointments->where('specialist_type', 'Doctor')->count(),
            'medtech_appointments' => $appointments->where('specialist_type', 'MedTech')->count(),
            'nurse_appointments' => $appointments->where('specialist_type', 'Nurse')->count(),
            'average_appointment_value' => $appointments->count() > 0 ? $appointments->avg('price') : 0,
            'completion_rate' => $appointments->count() > 0 ? 
                ($appointments->where('status', 'Completed')->count() / $appointments->count()) * 100 : 0,
        ];
    }

    /**
     * Get appointments with detailed information
     */
    public function getAppointments($dateFrom, $dateTo, $filters = [])
    {
        $query = Appointment::with(['patient', 'specialist'])
            ->whereBetween('appointment_date', [$dateFrom, $dateTo])
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc');

        // Apply filters
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['specialist_type']) && $filters['specialist_type'] !== 'all') {
            $query->where('specialist_type', $filters['specialist_type']);
        }

        if (isset($filters['source']) && $filters['source'] !== 'all') {
            $query->where('source', $filters['source']);
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
     * Get appointment trends by period
     */
    public function getTrends($reportType, $dateFrom, $dateTo)
    {
        $query = Appointment::whereBetween('appointment_date', [$dateFrom, $dateTo]);

        if ($reportType === 'daily') {
            return $query->selectRaw('appointment_date as period, COUNT(*) as count, SUM(price) as revenue')
                ->groupBy('appointment_date')
                ->orderBy('appointment_date')
                ->get();
        } elseif ($reportType === 'monthly') {
            return $query->selectRaw('DATE_FORMAT(appointment_date, "%Y-%m") as period, COUNT(*) as count, SUM(price) as revenue')
                ->groupBy(DB::raw('DATE_FORMAT(appointment_date, "%Y-%m")'))
                ->orderBy('period')
                ->get();
        } elseif ($reportType === 'yearly') {
            return $query->selectRaw('YEAR(appointment_date) as period, COUNT(*) as count, SUM(price) as revenue')
                ->groupBy(DB::raw('YEAR(appointment_date)'))
                ->orderBy('period')
                ->get();
        }

        return collect();
    }

    /**
     * Get specialist performance metrics
     */
    public function getSpecialistPerformance($dateFrom, $dateTo)
    {
        return Appointment::with('specialist')
            ->whereBetween('appointment_date', [$dateFrom, $dateTo])
            ->selectRaw('specialist_id, specialist_name, specialist_type, COUNT(*) as total_appointments, SUM(price) as total_revenue, AVG(price) as average_price')
            ->groupBy('specialist_id', 'specialist_name', 'specialist_type')
            ->orderBy('total_appointments', 'desc')
            ->get();
    }

    /**
     * Get appointment status distribution
     */
    public function getStatusDistribution($dateFrom, $dateTo)
    {
        return Appointment::whereBetween('appointment_date', [$dateFrom, $dateTo])
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');
    }

    /**
     * Get source distribution (Online vs Walk-in)
     */
    public function getSourceDistribution($dateFrom, $dateTo)
    {
        return Appointment::whereBetween('appointment_date', [$dateFrom, $dateTo])
            ->selectRaw('source, COUNT(*) as count')
            ->groupBy('source')
            ->get()
            ->pluck('count', 'source');
    }

    /**
     * Get appointment types distribution
     */
    public function getAppointmentTypesDistribution($dateFrom, $dateTo)
    {
        return Appointment::whereBetween('appointment_date', [$dateFrom, $dateTo])
            ->selectRaw('appointment_type, COUNT(*) as count')
            ->groupBy('appointment_type')
            ->orderBy('count', 'desc')
            ->get();
    }

    /**
     * Get peak hours analysis
     */
    public function getPeakHours($dateFrom, $dateTo)
    {
        return Appointment::whereBetween('appointment_date', [$dateFrom, $dateTo])
            ->selectRaw('HOUR(appointment_time) as hour, COUNT(*) as count')
            ->groupBy(DB::raw('HOUR(appointment_time)'))
            ->orderBy('hour')
            ->get();
    }

    /**
     * Get daily appointment patterns
     */
    public function getDailyPatterns($dateFrom, $dateTo)
    {
        return Appointment::whereBetween('appointment_date', [$dateFrom, $dateTo])
            ->selectRaw('DAYNAME(appointment_date) as day_name, COUNT(*) as count')
            ->groupBy(DB::raw('DAYNAME(appointment_date)'))
            ->orderBy(DB::raw('DAYOFWEEK(appointment_date)'))
            ->get();
    }

    /**
     * Generate comprehensive report data
     */
    public function generateComprehensiveReport($dateFrom, $dateTo, $filters = [])
    {
        return [
            'statistics' => $this->generateStatistics($dateFrom, $dateTo, $filters),
            'appointments' => $this->getAppointments($dateFrom, $dateTo, $filters),
            'trends' => $this->getTrends($filters['report_type'] ?? 'daily', $dateFrom, $dateTo),
            'specialist_performance' => $this->getSpecialistPerformance($dateFrom, $dateTo),
            'status_distribution' => $this->getStatusDistribution($dateFrom, $dateTo),
            'source_distribution' => $this->getSourceDistribution($dateFrom, $dateTo),
            'appointment_types' => $this->getAppointmentTypesDistribution($dateFrom, $dateTo),
            'peak_hours' => $this->getPeakHours($dateFrom, $dateTo),
            'daily_patterns' => $this->getDailyPatterns($dateFrom, $dateTo),
        ];
    }
}
