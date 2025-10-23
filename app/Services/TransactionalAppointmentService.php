<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Visit;
use App\Models\BillingTransaction;
use App\Models\Staff;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class TransactionalAppointmentService
{
    /**
     * Create online appointment with proper transaction handling
     */
    public function createOnlineAppointment(array $appointmentData, array $patientData = null): array
    {
        return DB::transaction(function () use ($appointmentData, $patientData) {
            try {
                $patientId = null;
                $patientCode = null;

                // Handle patient creation or retrieval
                if (isset($appointmentData['existing_patient_id']) && $appointmentData['existing_patient_id']) {
                    // Use existing patient
                    $patient = Patient::find($appointmentData['existing_patient_id']);
                    if (!$patient) {
                        throw new Exception('Patient not found');
                    }
                    $patientId = $patient->patient_id;
                    $patientCode = $patient->patient_code;
                } elseif ($patientData) {
                    // Create new patient
                    $patient = $this->createPatient($patientData);
                    $patientId = $patient->patient_id;
                    $patientCode = $patient->patient_code;
                } else {
                    throw new Exception('Patient data is required');
                }

                // Create appointment
                $appointment = $this->createAppointment($appointmentData, $patientId, 'Online', 'Pending');
                
                // Send notification to admin using centralized service
                $notificationService = app(\App\Services\NotificationService::class);
                $notificationService->notifyNewAppointment($appointment);

                Log::info('Online appointment created successfully', [
                    'appointment_id' => $appointment->id,
                    'appointment_code' => $appointment->appointment_code,
                    'patient_id' => $patientId,
                    'patient_code' => $patientCode
                ]);

                return [
                    'success' => true,
                    'appointment' => $appointment,
                    'patient' => $patient ?? null,
                    'appointment_id' => $appointment->id,
                    'appointment_code' => $appointment->appointment_code,
                    'patient_id' => $patientId,
                    'patient_code' => $patientCode
                ];

            } catch (Exception $e) {
                Log::error('Failed to create online appointment', [
                    'error' => $e->getMessage(),
                    'appointment_data' => $appointmentData,
                    'patient_data' => $patientData
                ]);
                throw $e;
            }
        });
    }

    /**
     * Create walk-in appointment with immediate confirmation
     */
    public function createWalkInAppointment(array $appointmentData, array $patientData = null): array
    {
        return DB::transaction(function () use ($appointmentData, $patientData) {
            try {
                $patientId = null;
                $patientCode = null;

                // Handle patient creation or retrieval
                if (isset($appointmentData['existing_patient_id']) && $appointmentData['existing_patient_id']) {
                    $patient = Patient::find($appointmentData['existing_patient_id']);
                    if (!$patient) {
                        throw new Exception('Patient not found');
                    }
                    $patientId = $patient->patient_id;
                    $patientCode = $patient->patient_code;
                } elseif ($patientData) {
                    $patient = $this->createPatient($patientData);
                    $patientId = $patient->patient_id;
                    $patientCode = $patient->patient_code;
                } else {
                    throw new Exception('Patient data is required');
                }

                // Create appointment (immediately confirmed)
                $appointment = $this->createAppointment($appointmentData, $patientId, 'Walk-in', 'Confirmed');
                
                // Set billing status to pending for manual processing
                $appointment->update(['billing_status' => 'pending']);
                
                // Create visit automatically
                $visit = $this->createVisit($appointment);
                
                // Skip auto-generating billing transaction - admin will handle this manually
                // $billingTransaction = $this->createBillingTransaction($appointment);

                Log::info('Walk-in appointment created successfully', [
                    'appointment_id' => $appointment->id,
                    'appointment_code' => $appointment->appointment_code,
                    'visit_id' => $visit->id,
                    'visit_code' => $visit->visit_code,
                    'note' => 'Billing transaction will be created manually by admin'
                ]);

                return [
                    'success' => true,
                    'appointment' => $appointment,
                    'visit' => $visit,
                    'note' => 'Billing transaction will be created manually by admin',
                    'patient' => $patient ?? null,
                    'appointment_id' => $appointment->id,
                    'appointment_code' => $appointment->appointment_code,
                    'visit_id' => $visit->id,
                    'visit_code' => $visit->visit_code
                ];

            } catch (Exception $e) {
                Log::error('Failed to create walk-in appointment', [
                    'error' => $e->getMessage(),
                    'appointment_data' => $appointmentData,
                    'patient_data' => $patientData
                ]);
                throw $e;
            }
        });
    }

    /**
     * Approve pending appointment and create visit + billing
     */
    public function approveAppointment(int $appointmentId, string $adminNotes = null, int $assignedStaffId = null): array
    {
        return DB::transaction(function () use ($appointmentId, $adminNotes, $assignedStaffId) {
            try {
                // Lock appointment row to prevent double approval
                $appointment = Appointment::where('id', $appointmentId)
                    ->where('status', 'Pending')
                    ->lockForUpdate()
                    ->first();

                if (!$appointment) {
                    throw new Exception('Appointment not found or not pending');
                }

                // Update appointment status
                $appointment->update([
                    'status' => 'Confirmed',
                    'admin_notes' => $adminNotes,
                    'specialist_id' => $assignedStaffId ?? $appointment->specialist_id,
                    'billing_status' => 'pending' // Set billing status to pending for manual processing
                ]);

                // Create visit
                $visit = $this->createVisit($appointment);

                // Create billing transaction automatically
                $billingTransaction = $this->createBillingTransaction($appointment);

                // Notify patient
                $this->notifyPatientAppointmentApproved($appointment);

                Log::info('Appointment approved successfully', [
                    'appointment_id' => $appointment->id,
                    'appointment_code' => $appointment->appointment_code,
                    'visit_id' => $visit->id,
                    'visit_code' => $visit->visit_code,
                    'billing_transaction_id' => $billingTransaction->id,
                    'note' => 'Billing transaction created automatically'
                ]);

                return [
                    'success' => true,
                    'appointment' => $appointment,
                    'visit' => $visit,
                    'note' => 'Billing transaction will be created manually by admin',
                    'visit_id' => $visit->id,
                    'visit_code' => $visit->visit_code
                ];

            } catch (Exception $e) {
                Log::error('Failed to approve appointment', [
                    'error' => $e->getMessage(),
                    'appointment_id' => $appointmentId
                ]);
                throw $e;
            }
        });
    }

    /**
     * Create patient with proper code generation
     */
    private function createPatient(array $patientData): Patient
    {
        $patient = Patient::create($patientData);
        
        // Generate patient code after insert
        $patientCode = 'P' . str_pad($patient->patient_id, 4, '0', STR_PAD_LEFT);
        $patient->update(['patient_code' => $patientCode]);
        
        return $patient->fresh();
    }

    /**
     * Create appointment with proper code generation
     */
    private function createAppointment(array $appointmentData, int $patientId, string $source, string $status): Appointment
    {
        $appointment = Appointment::create([
            'patient_id' => $patientId,
            'specialist_id' => $appointmentData['specialist_id'] ?? null,
            'appointment_type' => $appointmentData['appointment_type'],
            'specialist_type' => $appointmentData['specialist_type'] ?? null,
            'appointment_date' => $appointmentData['appointment_date'],
            'appointment_time' => $appointmentData['appointment_time'],
            'duration' => $appointmentData['duration'] ?? '30 min',
            'price' => $appointmentData['price'] ?? null, // Will be calculated after creation
            'additional_info' => $appointmentData['additional_info'] ?? null,
            'source' => $source,
            'status' => $status,
            'admin_notes' => $appointmentData['admin_notes'] ?? null
        ]);

        // Generate appointment code after insert
        $appointmentCode = 'A' . str_pad($appointment->id, 4, '0', STR_PAD_LEFT);
        
        // Calculate and set price if not provided
        $calculatedPrice = $appointmentData['price'] ?? $appointment->calculatePrice();
        
        $appointment->update([
            'appointment_code' => $appointmentCode,
            'price' => $calculatedPrice
        ]);

        return $appointment->fresh();
    }

    /**
     * Create visit record
     */
    private function createVisit(Appointment $appointment): Visit
    {
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
        
        $visit = Visit::create([
            'appointment_id' => $appointment->id,
            'patient_id' => $appointment->patient_id,
            'attending_staff_id' => $appointment->specialist_id,
            'purpose' => $appointment->appointment_type,
            'status' => 'Ongoing',
            'visit_date_time_time' => $visitDateTime,
            'visit_date_time' => $visitDateTime
        ]);

        // Generate visit code after insert
        $visitCode = 'V' . str_pad($visit->id, 4, '0', STR_PAD_LEFT);
        $visit->update(['visit_code' => $visitCode]);

        return $visit->fresh();
    }

    /**
     * Create billing transaction record
     */
    private function createBillingTransaction(Appointment $appointment): BillingTransaction
    {
        $transaction = BillingTransaction::create([
            'appointment_id' => $appointment->id,
            'patient_id' => $appointment->patient_id,
            'specialist_id' => $appointment->specialist_id,
            'amount' => $appointment->price,
            'status' => 'Pending'
        ]);

        // Generate transaction code after insert
        $transactionCode = 'TXN-' . str_pad($transaction->id, 6, '0', STR_PAD_LEFT);
        $transaction->update(['transaction_code' => $transactionCode]);

        return $transaction->fresh();
    }


    /**
     * Notify patient about appointment approval
     */
    private function notifyPatientAppointmentApproved(Appointment $appointment): void
    {
        $patient = $appointment->patient;
        if ($patient && $patient->user_id) {
            Notification::create([
                'user_id' => $patient->user_id,
                'type' => 'appointment_approved',
                'title' => 'Appointment Approved',
                'message' => "Your appointment for {$appointment->appointment_type} on {$appointment->appointment_date} at {$appointment->appointment_time} has been approved.",
                'data' => [
                    'appointment_id' => $appointment->id,
                    'appointment_code' => $appointment->appointment_code
                ],
                'is_read' => false
            ]);
        }
    }

    /**
     * Process payment for billing transaction
     */
    public function processPayment(int $transactionId, string $paymentMethod, string $referenceNo = null): array
    {
        return DB::transaction(function () use ($transactionId, $paymentMethod, $referenceNo) {
            try {
                $transaction = BillingTransaction::findOrFail($transactionId);
                
                if ($transaction->status !== 'Pending') {
                    throw new Exception('Transaction is not pending');
                }

                // Update transaction
                $transaction->update([
                    'status' => 'Paid',
                    'payment_method' => $paymentMethod,
                    'reference_no' => $referenceNo
                ]);

                // Update appointment status
                $appointment = $transaction->appointment;
                $appointment->update(['status' => 'Completed']);

                // Update visit status
                $visit = Visit::where('appointment_id', $appointment->id)->first();
                if ($visit) {
                    $visit->update(['status' => 'Completed']);
                }

                Log::info('Payment processed successfully', [
                    'transaction_id' => $transaction->id,
                    'transaction_code' => $transaction->transaction_code,
                    'appointment_id' => $appointment->id,
                    'payment_method' => $paymentMethod
                ]);

                return [
                    'success' => true,
                    'transaction' => $transaction,
                    'appointment' => $appointment,
                    'visit' => $visit
                ];

            } catch (Exception $e) {
                Log::error('Failed to process payment', [
                    'error' => $e->getMessage(),
                    'transaction_id' => $transactionId
                ]);
                throw $e;
            }
        });
    }
}