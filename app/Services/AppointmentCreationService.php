<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Visit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AppointmentCreationService
{
    /**
     * Create a new appointment with proper patient and visit relationships
     * 
     * @param array $appointmentData
     * @param array $patientData
     * @return array
     */
    public function createAppointmentWithPatient(array $appointmentData, array $patientData = null)
    {
        return DB::transaction(function () use ($appointmentData, $patientData) {
            $patient = null;
            
            // If patient data is provided, create or find patient
            if ($patientData) {
                $patient = $this->createOrFindPatient($patientData);
            } elseif (isset($appointmentData['patient_id'])) {
                // If patient_id is provided, find existing patient
                $patient = Patient::find($appointmentData['patient_id']);
                if (!$patient) {
                    throw new \Exception('Patient not found with ID: ' . $appointmentData['patient_id']);
                }
            } else {
                throw new \Exception('Either patient data or patient_id must be provided');
            }

            // Create appointment with proper patient_id and sequence
            $appointmentData['patient_id'] = $patient->id;
            
            // Add required fields that are missing
            if (!isset($appointmentData['patient_name'])) {
                $appointmentData['patient_name'] = $patient->first_name . ' ' . $patient->last_name;
            }
            if (!isset($appointmentData['contact_number'])) {
                $appointmentData['contact_number'] = $patient->mobile_no ?? 'Not specified';
            }
            if (!isset($appointmentData['specialist_name'])) {
                $appointmentData['specialist_name'] = 'To be assigned';
            }
            
            // Remove fields that don't exist in the appointments table
            unset($appointmentData['admin_notes']);
            unset($appointmentData['created_by']);
            
            $appointment = Appointment::create($appointmentData);

            Log::info('Appointment created successfully', [
                'appointment_id' => $appointment->id,
                'patient_id' => $patient->id,
                'appointment_type' => $appointment->appointment_type
            ]);

            // Create visit automatically
            $visit = $this->createVisit($appointment);

            // Create billing transaction and link if appointment is confirmed
            $billingTransaction = null;
            $billingLink = null;
            
            if ($appointment->status === 'Confirmed') {
                $billingTransaction = $this->createBillingTransaction($appointment);
                $billingLink = $this->createBillingLink($appointment, $billingTransaction);
            }

            return [
                'patient' => $patient,
                'appointment' => $appointment,
                'visit' => $visit,
                'billing_transaction' => $billingTransaction,
                'billing_link' => $billingLink
            ];
        });
    }

    /**
     * Create a new patient or find existing one
     * 
     * @param array $patientData
     * @return Patient
     */
    public function createOrFindPatient(array $patientData)
    {
        // Check for existing patient by name and birthdate
        $existingPatient = Patient::where('first_name', $patientData['first_name'])
            ->where('last_name', $patientData['last_name'])
            ->where('birthdate', $patientData['birthdate'])
            ->first();

        if ($existingPatient) {
            Log::info('Found existing patient', ['patient_id' => $existingPatient->id]);
            return $existingPatient;
        }

        // Create new patient with sequence number and patient number
        $maxId = Patient::max('id');
        $nextId = $maxId ? $maxId + 1 : 1;
        $patientData['patient_no'] = 'P' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
        
        // Add required fields if not provided
        if (!isset($patientData['arrival_date'])) {
            $patientData['arrival_date'] = now()->toDateString();
        }
        if (!isset($patientData['arrival_time'])) {
            $patientData['arrival_time'] = now()->format('H:i:s');
        }
        if (!isset($patientData['attending_physician'])) {
            $patientData['attending_physician'] = 'To be assigned';
        }
        if (!isset($patientData['time_seen'])) {
            $patientData['time_seen'] = now()->format('H:i:s');
        }
        if (!isset($patientData['address'])) {
            $patientData['address'] = 'Not specified';
        }
        if (!isset($patientData['emergency_name'])) {
            $patientData['emergency_name'] = 'Not specified';
        }
        if (!isset($patientData['emergency_relation'])) {
            $patientData['emergency_relation'] = 'Self';
        }
        
        $patient = Patient::create($patientData);
        
        Log::info('Created new patient', [
            'patient_id' => $patient->id,
            'patient_no' => $patient->patient_no
        ]);
        
        return $patient;
    }

    /**
     * Create appointment for existing patient
     * 
     * @param int $patientId
     * @param array $appointmentData
     * @return array
     */
    public function createAppointmentForExistingPatient(int $patientId, array $appointmentData)
    {
        $patient = Patient::findOrFail($patientId);
        
        return $this->createAppointmentWithPatient($appointmentData, null);
    }

    /**
     * Delete patient and all related records
     * 
     * @param int $patientId
     * @return bool
     */
    public function deletePatientWithCascade(int $patientId)
    {
        return DB::transaction(function () use ($patientId) {
            $patient = Patient::findOrFail($patientId);
            
            Log::info('Deleting patient with cascade', [
                'patient_id' => $patientId,
                'appointments_count' => $patient->appointments()->count(),
                'visits_count' => $patient->visits()->count()
            ]);

            // Delete patient (cascade delete will handle appointments and visits)
            $patient->delete();

            return true;
        });
    }

    /**
     * Delete appointment only (patient remains)
     * 
     * @param int $appointmentId
     * @return bool
     */
    public function deleteAppointmentOnly(int $appointmentId)
    {
        return DB::transaction(function () use ($appointmentId) {
            $appointment = Appointment::findOrFail($appointmentId);
            
            Log::info('Deleting appointment only', [
                'appointment_id' => $appointmentId,
                'patient_id' => $appointment->patient_id
            ]);

            // Delete appointment (cascade delete will handle visits)
            $appointment->delete();

            return true;
        });
    }

    /**
     * Get the next available patient number
     * 
     * @return string
     */
    public function getNextPatientNumber()
    {
        $maxPatientNo = Patient::max('patient_no');
        $numericMax = is_numeric($maxPatientNo) ? (int) $maxPatientNo : 0;
        return (string) ($numericMax + 1);
    }

    /**
     * Create a visit for an appointment
     * 
     * @param Appointment $appointment
     * @return Visit
     */
    private function createVisit(Appointment $appointment)
    {
        // Safely construct visit_date by handling different time formats
        $appointmentDate = $appointment->appointment_date;
        $appointmentTime = $appointment->appointment_time;
        
        // Extract just the date part from appointment_date if it's a datetime
        if (strpos($appointmentDate, ' ') !== false) {
            $appointmentDate = date('Y-m-d', strtotime($appointmentDate));
        }
        
        // Extract just the time part from appointment_time if it's a datetime
        if (strpos($appointmentTime, ' ') !== false) {
            $appointmentTime = date('H:i:s', strtotime($appointmentTime));
        }
        
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
            'appointment_id' => $appointment->id,
            'patient_id' => $appointment->patient_id,
            'visit_date_time_time' => $appointmentDate . ' ' . $appointmentTime,
            'visit_date_time' => $appointmentDate . ' ' . $appointmentTime,
            'purpose' => $appointment->appointment_type,
            'status' => 'in_progress',
            'attending_staff_id' => $attendingStaffId, // Use valid user ID or null
        ];
        
        $visit = Visit::create($visitData);
        
        Log::info('Visit created successfully', [
            'visit_id' => $visit->id,
            'visit_code' => $visit->visit_code,
            'appointment_id' => $appointment->id,
            'patient_id' => $appointment->patient_id
        ]);
        
        return $visit;
    }

    /**
     * Create a billing transaction for an appointment
     * 
     * @param Appointment $appointment
     * @return BillingTransaction
     */
        private function createBillingTransaction(Appointment $appointment)
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
     * Create a billing link between appointment and transaction
     * 
     * @param Appointment $appointment
     * @param \App\Models\BillingTransaction $billingTransaction
     * @return AppointmentBillingLink
     */
    private function createBillingLink(Appointment $appointment, \App\Models\BillingTransaction $billingTransaction)
    {
        $billingLink = \App\Models\AppointmentBillingLink::create([
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
}
