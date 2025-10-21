<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Visit;
use App\Models\BillingTransaction;
use App\Models\Staff;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CompleteAppointmentService
{
    /**
     * Create online appointment with transactional integrity
     * Handles both new and existing patients
     */
    public function createOnlineAppointment(array $data)
    {
        return DB::transaction(function () use ($data) {
            try {
                Log::info('Creating online appointment', $data);
                
                // 1. Handle patient (existing or new)
                $patientId = $this->handlePatient($data);
                
                // 2. Create appointment as PENDING with source=Online
                $appointment = $this->createAppointment($patientId, $data, 'Online', 'Pending');
                
                // 3. Generate appointment code
                $appointmentCode = 'A' . str_pad($appointment->appointment_id, 4, '0', STR_PAD_LEFT);
                $appointment->update(['appointment_code' => $appointmentCode]);
                
                Log::info('Online appointment created successfully', [
                    'appointment_id' => $appointment->appointment_id,
                    'appointment_code' => $appointmentCode,
                    'patient_id' => $patientId
                ]);
                
                return [
                    'success' => true,
                    'appointment_id' => $appointment->appointment_id,
                    'appointment_code' => $appointmentCode,
                    'patient_id' => $patientId,
                    'status' => 'Pending'
                ];
                
            } catch (\Exception $e) {
                Log::error('Failed to create online appointment', [
                    'error' => $e->getMessage(),
                    'data' => $data
                ]);
                throw $e;
            }
        });
    }
    
    /**
     * Create walk-in appointment with immediate confirmation
     */
    public function createWalkInAppointment(array $data)
    {
        return DB::transaction(function () use ($data) {
            try {
                Log::info('Creating walk-in appointment', $data);
                
                // 1. Handle patient (existing or new)
                $patientId = $this->handlePatient($data);
                
                // 2. Create appointment as CONFIRMED with source=Walk-in
                $appointment = $this->createAppointment($patientId, $data, 'Walk-in', 'Confirmed');
                
                // 3. Generate appointment code
                $appointmentCode = 'A' . str_pad($appointment->appointment_id, 4, '0', STR_PAD_LEFT);
                $appointment->update(['appointment_code' => $appointmentCode]);
                
                // 4. Create visit automatically
                $visit = $this->createVisit($appointment);
                
                // 5. Create billing transaction automatically
                $billingTransaction = $this->createBillingTransaction($appointment);
                
                Log::info('Walk-in appointment created successfully', [
                    'appointment_id' => $appointment->appointment_id,
                    'appointment_code' => $appointmentCode,
                    'visit_id' => $visit->visit_id,
                    'transaction_id' => $billingTransaction->transaction_id
                ]);
                
                return [
                    'success' => true,
                    'appointment_id' => $appointment->appointment_id,
                    'appointment_code' => $appointmentCode,
                    'visit_id' => $visit->visit_id,
                    'transaction_id' => $billingTransaction->transaction_id,
                    'status' => 'Confirmed'
                ];
                
            } catch (\Exception $e) {
                Log::error('Failed to create walk-in appointment', [
                    'error' => $e->getMessage(),
                    'data' => $data
                ]);
                throw $e;
            }
        });
    }
    
    /**
     * Approve pending appointment and create visit + billing
     */
    public function approveAppointment(int $appointmentId, array $adminData = [])
    {
        return DB::transaction(function () use ($appointmentId, $adminData) {
            try {
                Log::info('Approving appointment', ['appointment_id' => $appointmentId, 'admin_data' => $adminData]);
                
                // 1. Get and lock appointment
                $appointment = Appointment::where('appointment_id', $appointmentId)
                    ->where('status', 'Pending')
                    ->lockForUpdate()
                    ->first();
                
                if (!$appointment) {
                    throw new \Exception('Appointment not found or not pending');
                }
                
                // 2. Update appointment status
                $appointment->update([
                    'status' => 'Confirmed',
                    'admin_notes' => $adminData['admin_notes'] ?? null,
                    'specialist_id' => $adminData['specialist_id'] ?? $appointment->specialist_id
                ]);
                
                // 3. Create visit automatically
                $visit = $this->createVisit($appointment);
                
                // 4. Create billing transaction automatically
                $billingTransaction = $this->createBillingTransaction($appointment);
                
                Log::info('Appointment approved successfully', [
                    'appointment_id' => $appointment->appointment_id,
                    'visit_id' => $visit->visit_id,
                    'transaction_id' => $billingTransaction->transaction_id
                ]);
                
                return [
                    'success' => true,
                    'appointment_id' => $appointment->appointment_id,
                    'visit_id' => $visit->visit_id,
                    'transaction_id' => $billingTransaction->transaction_id,
                    'status' => 'Confirmed'
                ];
                
            } catch (\Exception $e) {
                Log::error('Failed to approve appointment', [
                    'error' => $e->getMessage(),
                    'appointment_id' => $appointmentId
                ]);
                throw $e;
            }
        });
    }
    
    /**
     * Process payment and update all related records
     */
    public function processPayment(int $transactionId, array $paymentData)
    {
        return DB::transaction(function () use ($transactionId, $paymentData) {
            try {
                Log::info('Processing payment', ['transaction_id' => $transactionId, 'payment_data' => $paymentData]);
                
                // 1. Update billing transaction
                $transaction = BillingTransaction::where('transaction_id', $transactionId)
                    ->where('status', 'Pending')
                    ->lockForUpdate()
                    ->first();
                
                if (!$transaction) {
                    throw new \Exception('Transaction not found or not pending');
                }
                
                $transaction->update([
                    'status' => 'Paid',
                    'payment_method' => $paymentData['payment_method'],
                    'reference_no' => $paymentData['reference_no'] ?? null,
                    'notes' => $paymentData['notes'] ?? null
                ]);
                
                // 2. Update appointment status
                $appointment = $transaction->appointment;
                $appointment->update([
                    'status' => 'Completed',
                    'billing_status' => 'paid'
                ]);
                
                // 3. Update visit status
                $visit = $appointment->visit;
                if ($visit) {
                    $visit->update(['status' => 'Completed']);
                }
                
                Log::info('Payment processed successfully', [
                    'transaction_id' => $transaction->transaction_id,
                    'appointment_id' => $appointment->appointment_id
                ]);
                
                return [
                    'success' => true,
                    'transaction_id' => $transaction->transaction_id,
                    'appointment_id' => $appointment->appointment_id,
                    'status' => 'Paid'
                ];
                
            } catch (\Exception $e) {
                Log::error('Failed to process payment', [
                    'error' => $e->getMessage(),
                    'transaction_id' => $transactionId
                ]);
                throw $e;
            }
        });
    }
    
    /**
     * Handle patient creation or retrieval
     */
    private function handlePatient(array $data)
    {
        // Check if existing patient ID provided
        if (isset($data['existing_patient_id']) && $data['existing_patient_id']) {
            $patient = Patient::find($data['existing_patient_id']);
            if ($patient) {
                // Update patient info if provided
                if (isset($data['patient_data'])) {
                    $patient->update($data['patient_data']);
                }
                return $patient->patient_id;
            }
        }
        
        // Create new patient
        $patientData = $data['patient_data'] ?? $data;
        $patient = Patient::create($patientData);
        
        // Generate patient code
        $patientCode = 'P' . str_pad($patient->patient_id, 4, '0', STR_PAD_LEFT);
        $patient->update(['patient_code' => $patientCode]);
        
        return $patient->patient_id;
    }
    
    /**
     * Create appointment record
     */
    private function createAppointment(int $patientId, array $data, string $source, string $status)
    {
        return Appointment::create([
            'patient_id' => $patientId,
            'specialist_id' => $data['specialist_id'] ?? null,
            'appointment_type' => $data['appointment_type'] ?? 'General Consultation',
            'specialist_type' => $data['specialist_type'] ?? 'Doctor',
            'appointment_date' => $data['appointment_date'],
            'appointment_time' => $data['appointment_time'],
            'duration' => $data['duration'] ?? '30 min',
            'price' => $data['price'] ?? 0.00,
            'additional_info' => $data['additional_info'] ?? null,
            'source' => $source,
            'status' => $status,
            'billing_status' => 'pending'
        ]);
    }
    
    /**
     * Create visit record
     */
    private function createVisit(Appointment $appointment)
    {
        // Generate visit code before creation
        $nextId = Visit::max('id') + 1;
        $visitCode = 'V' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
        
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
            'appointment_id' => $appointment->appointment_id,
            'patient_id' => $appointment->patient_id,
            'attending_staff_id' => $appointment->specialist_id,
            'purpose' => $appointment->appointment_type,
            'status' => 'Ongoing',
            'visit_date_time_time' => $visitDateTime,
            'visit_date_time' => $visitDateTime,
            'visit_code' => $visitCode,
        ]);
        
        return $visit;
    }
    
    /**
     * Create billing transaction record
     */
    private function createBillingTransaction(Appointment $appointment)
    {
        $transaction = BillingTransaction::create([
            'appointment_id' => $appointment->appointment_id,
            'patient_id' => $appointment->patient_id,
            'specialist_id' => $appointment->specialist_id,
            'amount' => $appointment->price,
            'status' => 'Pending'
        ]);
        
        // Generate transaction code
        $transactionCode = 'TXN-' . str_pad($transaction->transaction_id, 6, '0', STR_PAD_LEFT);
        $transaction->update(['transaction_code' => $transactionCode]);
        
        return $transaction;
    }
}

