<?php

namespace App\Services;

use App\Models\PendingAppointment;
use App\Models\Appointment;
use App\Models\Visit;
use App\Models\BillingTransaction;
use App\Models\AppointmentBillingLink;
use App\Models\Patient;
use App\Models\Specialist;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PendingAppointmentApprovalService
{
    /**
     * Approve a pending appointment and create all necessary records
     * 
     * @param PendingAppointment $pendingAppointment
     * @param array $adminData
     * @return array
     */
    public function approvePendingAppointment(PendingAppointment $pendingAppointment, array $adminData = []): array
    {
        return DB::transaction(function () use ($pendingAppointment, $adminData) {
            try {
                Log::info('Starting pending appointment approval', [
                    'pending_appointment_id' => $pendingAppointment->id,
                    'patient_name' => $pendingAppointment->patient_name,
                    'appointment_type' => $pendingAppointment->appointment_type
                ]);

                // Step 1: Find or create patient
                $patient = $this->findOrCreatePatient($pendingAppointment);

                // Step 2: Create appointment record
                $appointment = $this->createAppointmentFromPending($pendingAppointment, $patient, $adminData);

                // Step 3: Create visit record
                $visit = $this->createVisitFromAppointment($appointment);

                // Step 4: Set billing status to pending for manual processing
                $appointment->update(['billing_status' => 'pending']);

                // Step 5: Skip auto-generating billing transaction - admin will handle this manually
                // $billingTransaction = $this->createBillingTransactionFromAppointment($appointment);
                // $billingLink = $this->createBillingLink($appointment, $billingTransaction);

                // Step 6: Delete the pending appointment since it's now approved
                $pendingAppointmentId = $pendingAppointment->id;
                $pendingAppointment->delete();

                // Step 7: Notify patient
                $this->notifyPatient($appointment, $adminData['admin_notes'] ?? null);

                Log::info('Pending appointment approved successfully', [
                    'pending_appointment_id' => $pendingAppointmentId,
                    'appointment_id' => $appointment->id,
                    'visit_id' => $visit->id,
                    'note' => 'Billing transaction will be created manually by admin'
                ]);

                return [
                    'success' => true,
                    'pending_appointment_id' => $pendingAppointmentId,
                    'appointment' => $appointment,
                    'visit' => $visit,
                    'note' => 'Billing transaction will be created manually by admin'
                ];

            } catch (\Exception $e) {
                Log::error('Failed to approve pending appointment', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'pending_appointment_id' => $pendingAppointment->id
                ]);
                throw $e;
            }
        });
    }

    /**
     * Find or create patient from pending appointment
     */
    private function findOrCreatePatient(PendingAppointment $pendingAppointment): Patient
    {
        // Try to find existing patient by ID first
        if ($pendingAppointment->patient_id && $pendingAppointment->patient_id !== 'TBD') {
            $patient = Patient::find((int)$pendingAppointment->patient_id);
            if ($patient) {
                return $patient;
            }
            
            // Try by patient_no
            $patient = Patient::where('patient_no', $pendingAppointment->patient_id)->first();
            if ($patient) {
                return $patient;
            }
        }

        // Create new patient from pending appointment data
        $nameParts = explode(' ', trim($pendingAppointment->patient_name));
        $firstName = $nameParts[0] ?? 'Unknown';
        $lastName = count($nameParts) > 1 ? implode(' ', array_slice($nameParts, 1)) : 'Unknown';
        
        $patientData = [
            'first_name' => $firstName,
            'last_name' => $lastName,
            'birthdate' => $pendingAppointment->birthdate ?? '1990-01-01',
            'age' => $pendingAppointment->age ?? 30,
            'sex' => $pendingAppointment->sex ?? 'male',
            'civil_status' => $pendingAppointment->civil_status ?? 'single',
            'nationality' => $pendingAppointment->nationality ?? 'Filipino',
            'address' => $pendingAppointment->address ?? 'Not specified',
            'present_address' => $pendingAppointment->present_address ?? 'Not specified',
            'mobile_no' => $pendingAppointment->contact_number ?? 'Not specified',
            'emergency_name' => $pendingAppointment->emergency_name ?? 'Not specified',
            'emergency_relation' => $pendingAppointment->emergency_relation ?? 'Self',
            'attending_physician' => $pendingAppointment->attending_physician ?? 'To be assigned',
            'arrival_date' => $pendingAppointment->arrival_date ?? now()->toDateString(),
            'arrival_time' => $pendingAppointment->arrival_time ?? now()->format('H:i:s'),
            'time_seen' => $pendingAppointment->time_seen ?? now()->format('H:i:s'),
        ];

        // Generate patient number
        $maxId = Patient::max('id');
        $nextId = $maxId ? $maxId + 1 : 1;
        $patientData['patient_no'] = 'P' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
        
        // Generate patient_code if not provided
        if (!isset($patientData['patient_code']) || empty($patientData['patient_code'])) {
            $patientData['patient_code'] = 'P' . str_pad($nextId, 3, '0', STR_PAD_LEFT);
        }

        $patient = Patient::create($patientData);
        
        Log::info('Patient created during approval', [
            'patient_id' => $patient->id,
            'patient_no' => $patient->patient_no,
            'pending_appointment_id' => $pendingAppointment->id
        ]);

        return $patient;
    }

    /**
     * Create appointment from pending appointment
     */
    private function createAppointmentFromPending(PendingAppointment $pendingAppointment, Patient $patient, array $adminData): Appointment
    {
        $appointmentData = [
            'patient_name' => $pendingAppointment->patient_name,
            'patient_id' => $patient->id,
            'contact_number' => $pendingAppointment->contact_number,
            'specialist_id' => $pendingAppointment->specialist_id,
            'specialist_name' => $pendingAppointment->specialist_name,
            'appointment_type' => $pendingAppointment->appointment_type,
            'specialist_type' => $pendingAppointment->specialist_type,
            'appointment_date' => $pendingAppointment->appointment_date,
            'appointment_time' => $pendingAppointment->appointment_time,
            'duration' => $pendingAppointment->duration,
            'price' => null, // Will be calculated after creation
            'notes' => $pendingAppointment->notes,
            'special_requirements' => $pendingAppointment->special_requirements,
            'source' => 'Online',
            'status' => 'Confirmed',
            'appointment_source' => $pendingAppointment->appointment_source,
            'booking_method' => $pendingAppointment->booking_method,
        ];

        $appointment = Appointment::create($appointmentData);
        
        // Calculate and set price using the Appointment model's calculatePrice method
        $calculatedPrice = $appointment->calculatePrice();
        $appointment->update([
            'price' => $calculatedPrice,
            'final_total_amount' => $calculatedPrice, // Set final_total_amount to the same as price when no lab tests
            'total_lab_amount' => 0 // No lab tests initially
        ]);
        
        Log::info('Appointment created from pending', [
            'appointment_id' => $appointment->id,
            'patient_id' => $patient->id,
            'pending_appointment_id' => $pendingAppointment->id,
            'appointment_type' => $appointment->appointment_type,
            'calculated_price' => $calculatedPrice,
            'final_price' => $appointment->fresh()->price
        ]);

        return $appointment;
    }

    /**
     * Create visit from appointment
     */
    private function createVisitFromAppointment(Appointment $appointment): Visit
    {
        // Use the appointment's specialist_id directly if it exists
        // The specialist_id in appointments table should reference users.id
        $staffId = $appointment->specialist_id;
        
        // If specialist_id is not a user ID, try to find the corresponding user
        if (!$staffId) {
            // Try to find user by specialist name or type
            if ($appointment->specialist_type === 'doctor' || $appointment->specialist_type === 'Doctor') {
                $doctor = User::where('role', 'doctor')->first();
                $staffId = $doctor ? $doctor->id : null;
            } elseif ($appointment->specialist_type === 'medtech' || $appointment->specialist_type === 'MedTech') {
                $medtech = User::where('role', 'medtech')->first();
                $staffId = $medtech ? $medtech->id : null;
            }
        }
        
        // Fallback to current user or admin
        if (!$staffId) {
            $staffId = auth()->id();
            if (!$staffId) {
                $adminUser = User::where('role', 'admin')->first();
                $staffId = $adminUser ? $adminUser->id : 1;
            }
        }

        // Format the visit date properly - combine appointment date and time
        $appointmentDate = $appointment->appointment_date;
        $appointmentTime = $appointment->appointment_time;
        
        // Handle different date/time formats
        if (is_string($appointmentDate)) {
            $appointmentDate = date('Y-m-d', strtotime($appointmentDate));
        } else {
            $appointmentDate = $appointmentDate->format('Y-m-d');
        }
        
        if (is_string($appointmentTime)) {
            $appointmentTime = date('H:i:s', strtotime($appointmentTime));
        } else {
            $appointmentTime = $appointmentTime->format('H:i:s');
        }
        
        $visitDateTime = $appointmentDate . ' ' . $appointmentTime;
        
        $visitData = [
            'appointment_id' => $appointment->id,
            'patient_id' => $appointment->patient_id,
            'visit_date_time_time' => $visitDateTime,
            'visit_date_time' => $visitDateTime,
            'purpose' => $appointment->appointment_type,
            'status' => 'scheduled',
            'attending_staff_id' => $staffId,
        ];

        $visit = Visit::create($visitData);
        
        Log::info('Visit created from appointment', [
            'visit_id' => $visit->id,
            'appointment_id' => $appointment->id,
            'patient_id' => $appointment->patient_id
        ]);

        return $visit;
    }

    /**
     * Create billing transaction from appointment
     */
    private function createBillingTransactionFromAppointment(Appointment $appointment): BillingTransaction
    {
        // Get doctor ID based on specialist type
        $doctorId = null;
        if ($appointment->specialist_type === 'doctor') {
            $doctorId = $appointment->specialist_id;
        }

        $transactionData = [
            'appointment_id' => $appointment->id,
            'patient_id' => $appointment->patient_id,
            'doctor_id' => $doctorId,
            'total_amount' => $appointment->price,
            'amount' => $appointment->price,
            'status' => 'pending',
            'transaction_date' => now(),
            'created_by' => auth()->id() ?? 1,
            'payment_type' => 'cash',
            'payment_method' => 'cash',
            'transaction_id' => 'TXN-' . str_pad(BillingTransaction::max('id') + 1, 6, '0', STR_PAD_LEFT),
        ];

        $billingTransaction = BillingTransaction::create($transactionData);
        
        Log::info('Billing transaction created from appointment', [
            'billing_transaction_id' => $billingTransaction->id,
            'appointment_id' => $appointment->id,
            'patient_id' => $appointment->patient_id,
            'amount' => $appointment->price
        ]);

        return $billingTransaction;
    }

    /**
     * Create billing link between appointment and transaction
     */
    private function createBillingLink(Appointment $appointment, BillingTransaction $billingTransaction): AppointmentBillingLink
    {
        $billingLink = AppointmentBillingLink::create([
            'appointment_id' => $appointment->id,
            'billing_transaction_id' => $billingTransaction->id,
            'appointment_type' => $appointment->appointment_type,
            'appointment_price' => $appointment->price,
            'status' => 'pending',
        ]);

        Log::info('Billing link created', [
            'billing_link_id' => $billingLink->id,
            'appointment_id' => $appointment->id,
            'billing_transaction_id' => $billingTransaction->id
        ]);

        return $billingLink;
    }

    /**
     * Notify patient about approval
     */
    private function notifyPatient(Appointment $appointment, ?string $adminNotes = null): void
    {
        try {
            $patient = Patient::find($appointment->patient_id);
            if (!$patient || !$patient->user_id) {
                Log::warning('Patient or user not found for notification', [
                    'appointment_id' => $appointment->id,
                    'patient_id' => $appointment->patient_id
                ]);
                return;
            }

            $user = User::find($patient->user_id);
            if (!$user) {
                Log::warning('User not found for notification', [
                    'patient_id' => $patient->id,
                    'user_id' => $patient->user_id
                ]);
                return;
            }

            $message = "Your appointment for {$appointment->appointment_type} on {$appointment->appointment_date} at {$appointment->appointment_time} has been approved and confirmed.";
            if ($adminNotes) {
                $message .= " Admin notes: {$adminNotes}";
            }

            $notification = Notification::create([
                'type' => 'appointment',
                'title' => 'Appointment Approved',
                'message' => $message,
                'data' => [
                    'appointment_id' => $appointment->id,
                    'status' => 'Confirmed',
                    'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time,
                    'admin_notes' => $adminNotes,
                ],
                'user_id' => $user->id,
                'related_id' => $appointment->id,
                'related_type' => 'Appointment',
            ]);

            Log::info('Patient notification sent', [
                'notification_id' => $notification->id,
                'user_id' => $user->id,
                'appointment_id' => $appointment->id
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to notify patient', [
                'error' => $e->getMessage(),
                'appointment_id' => $appointment->id
            ]);
        }
    }
}
