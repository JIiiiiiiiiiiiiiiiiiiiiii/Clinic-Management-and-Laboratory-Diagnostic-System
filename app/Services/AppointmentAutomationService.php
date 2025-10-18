<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Visit;
use App\Models\BillingTransaction;
use App\Models\Patient;
use App\Models\Staff;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AppointmentAutomationService
{
    /**
     * Generate unique code for entities
     */
    public function generatePatientCode(): string
    {
        $lastPatient = Patient::orderBy('id', 'desc')->first();
        $nextId = $lastPatient ? $lastPatient->id + 1 : 1;
        return 'P' . str_pad($nextId, 3, '0', STR_PAD_LEFT);
    }

    public function generateAppointmentCode(): string
    {
        $lastAppointment = Appointment::orderBy('id', 'desc')->first();
        $nextId = $lastAppointment ? $lastAppointment->id + 1 : 1;
        return 'A' . str_pad($nextId, 3, '0', STR_PAD_LEFT);
    }

    public function generateVisitCode(): string
    {
        $lastVisit = Visit::orderBy('id', 'desc')->first();
        $nextId = $lastVisit ? $lastVisit->id + 1 : 1;
        return 'V' . str_pad($nextId, 3, '0', STR_PAD_LEFT);
    }

    public function generateTransactionCode(): string
    {
        $lastTransaction = BillingTransaction::orderBy('id', 'desc')->first();
        $nextId = $lastTransaction ? $lastTransaction->id + 1 : 1;
        return 'TXN-' . str_pad($nextId, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Create or find patient
     */
    public function createOrFindPatient(array $patientData): Patient
    {
        // Check if patient exists by mobile number or email
        $existingPatient = Patient::where('mobile_no', $patientData['mobile_no'])
            ->orWhere('email', $patientData['email'] ?? null)
            ->first();

        if ($existingPatient) {
            return $existingPatient;
        }

        // Create new patient
        $patientData['patient_code'] = $this->generatePatientCode();
        $patientData['status'] = 'Active';
        
        return Patient::create($patientData);
    }

    /**
     * Create appointment (online or walk-in)
     */
    public function createAppointment(array $appointmentData, string $source = 'Walk-in'): Appointment
    {
        $appointmentData['appointment_code'] = $this->generateAppointmentCode();
        $appointmentData['source'] = $source;
        $appointmentData['status'] = $source === 'Online' ? 'Pending' : 'Confirmed';
        $appointmentData['billing_status'] = 'pending'; // Set billing status to pending for manual processing

        $appointment = Appointment::create($appointmentData);

        // If walk-in appointment, create visit but skip auto-billing
        if ($source === 'Walk-in') {
            $this->createVisit($appointment);
            // Skip auto-generating billing transaction - admin will handle this manually
            // $this->createBillingTransaction($appointment);
        }

        return $appointment;
    }

    /**
     * Approve online appointment
     */
    public function approveAppointment(Appointment $appointment): Appointment
    {
        $appointment->update([
            'status' => 'Confirmed',
            'source' => 'Online',
            'billing_status' => 'pending' // Set billing status to pending for manual processing
        ]);

        // Create visit
        $visit = $this->createVisit($appointment);
        
        // Skip auto-generating billing transaction - admin will handle this manually
        // $billingTransaction = $this->createBillingTransaction($appointment);
        // \App\Models\AppointmentBillingLink::create([...]);

        return $appointment;
    }

    /**
     * Create visit record
     */
    public function createVisit(Appointment $appointment): Visit
    {
        // Properly format date and time
        $appointmentDate = is_string($appointment->appointment_date) 
            ? date('Y-m-d', strtotime($appointment->appointment_date))
            : $appointment->appointment_date->format('Y-m-d');
        
        $appointmentTime = is_string($appointment->appointment_time)
            ? date('H:i:s', strtotime($appointment->appointment_time))
            : $appointment->appointment_time->format('H:i:s');
        
        // Get a valid attending staff ID - use current user or find a doctor
        $attendingStaffId = null;
        if (auth()->check()) {
            $attendingStaffId = auth()->id();
        } else {
            // Find any doctor or admin user as fallback
            $staffUser = \App\Models\User::whereIn('role', ['doctor', 'admin'])->first();
            if ($staffUser) {
                $attendingStaffId = $staffUser->id;
            }
        }
        
        $visitData = [
            'visit_date_time_time' => $appointmentDate . ' ' . $appointmentTime,
            'visit_date_time' => $appointmentDate . ' ' . $appointmentTime,
            'purpose' => $appointment->appointment_type,
            'status' => 'in_progress',
            'attending_staff_id' => $attendingStaffId, // Use valid user ID or null
        ];
        
        // Use safe visit creation to prevent duplicates
        return \App\Helpers\VisitHelper::createVisitSafely($appointment->id, $appointment->patient_id, $visitData);
    }

    /**
     * Create billing transaction
     */
        public function createBillingTransaction(Appointment $appointment): BillingTransaction
    {
        // SYSTEM-WIDE FIX: Use the comprehensive helper
        return \App\Helpers\SystemWideSpecialistBillingHelper::createBillingTransactionSafely($appointment->id, [
            "patient_id" => $appointment->patient_id,
            "total_amount" => $appointment->price,
            "status" => "pending",
            "transaction_date" => now(),
            "created_by" => 1,
        ]);
    }

    /**
     * Process payment
     */
    public function processPayment(BillingTransaction $transaction, string $paymentMethod, ?string $referenceNo = null): BillingTransaction
    {
        $transaction->update([
            'payment_method' => $paymentMethod,
            'reference_no' => $referenceNo,
            'status' => 'Paid'
        ]);

        // Update appointment and visit status
        $appointment = $transaction->appointment;
        $appointment->update(['status' => 'Completed']);
        
        $visit = $appointment->visit;
        if ($visit) {
            $visit->update(['status' => 'Completed']);
        }

        return $transaction;
    }

    /**
     * Get appointment statistics
     */
    public function getAppointmentStats(string $date = null): array
    {
        $query = Appointment::query();
        
        if ($date) {
            $query->whereDate('appointment_date', $date);
        }

        return [
            'total' => $query->count(),
            'pending' => $query->where('status', 'Pending')->count(),
            'confirmed' => $query->where('status', 'Confirmed')->count(),
            'completed' => $query->where('status', 'Completed')->count(),
            'cancelled' => $query->where('status', 'Cancelled')->count(),
        ];
    }

    /**
     * Get billing statistics
     */
    public function getBillingStats(string $date = null): array
    {
        $query = BillingTransaction::query();
        
        if ($date) {
            $query->whereDate('created_at', $date);
        }

        $totalRevenue = $query->where('status', 'Paid')->sum('amount');
        $pendingAmount = $query->where('status', 'Pending')->sum('amount');

        return [
            'total_revenue' => $totalRevenue,
            'pending_amount' => $pendingAmount,
            'total_transactions' => $query->count(),
            'paid_transactions' => $query->where('status', 'Paid')->count(),
            'pending_transactions' => $query->where('status', 'Pending')->count(),
        ];
    }

    /**
     * Get doctor summary
     */
    public function getDoctorSummary(string $date = null): array
    {
        $query = BillingTransaction::where('status', 'Paid');
        
        if ($date) {
            $query->whereDate('created_at', $date);
        }

        return $query->with('specialist')
            ->select('specialist_id', DB::raw('SUM(amount) as total_revenue'), DB::raw('COUNT(*) as total_transactions'))
            ->groupBy('specialist_id')
            ->get()
            ->map(function ($item) {
                return [
                    'specialist' => $item->specialist,
                    'total_revenue' => $item->total_revenue,
                    'total_transactions' => $item->total_transactions
                ];
            });
    }
}
