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
            $appointmentData['sequence_number'] = $patient->sequence_number;
            $appointment = Appointment::create($appointmentData);

            Log::info('Appointment created successfully', [
                'appointment_id' => $appointment->id,
                'patient_id' => $patient->id,
                'appointment_type' => $appointment->appointment_type
            ]);

            return [
                'patient' => $patient,
                'appointment' => $appointment,
                'visit' => $appointment->visit // Visit is auto-created by the model
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
        $nextSequence = Patient::max('sequence_number') + 1;
        $patientData['sequence_number'] = $nextSequence;
        $patientData['patient_no'] = 'P' . str_pad($nextSequence, 3, '0', STR_PAD_LEFT);
        
        $patient = Patient::create($patientData);
        
        Log::info('Created new patient', [
            'patient_id' => $patient->id,
            'sequence_number' => $patient->sequence_number,
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
}
