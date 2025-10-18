<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\Appointment;
use Illuminate\Support\Facades\DB;

class SynchronizedIdService
{
    /**
     * Get the next synchronized ID for both patients and appointments
     * This ensures both patient and appointment get the same ID
     */
    public static function getNextSynchronizedId()
    {
        // Get the maximum ID from both tables
        $maxPatientId = Patient::max('id') ?? 0;
        $maxAppointmentId = Appointment::max('appointment_id') ?? 0;
        
        return max($maxPatientId, $maxAppointmentId) + 1;
    }

    /**
     * Create a new synchronized patient-appointment pair
     * Both will have the same ID
     */
    public static function createSynchronizedPair($patientData, $appointmentData)
    {
        return DB::transaction(function () use ($patientData, $appointmentData) {
            $nextId = self::getNextSynchronizedId();

            // Create patient with synchronized ID
            $patient = Patient::create(array_merge($patientData, [
                'patient_code' => 'P' . str_pad($nextId, 3, '0', STR_PAD_LEFT),
            ]));

            // Create appointment with synchronized ID
            $appointment = Appointment::create(array_merge($appointmentData, [
                'appointment_code' => 'A' . str_pad($nextId, 3, '0', STR_PAD_LEFT),
                'patient_id' => $patient->patient_id,
            ]));

            return [
                'patient' => $patient,
                'appointment' => $appointment
            ];
        });
    }

    /**
     * Renumber all patients and appointments with synchronized IDs
     * This is a maintenance function to ensure consistency
     */
    public static function renumberAll()
    {
        DB::transaction(function () {
            // Get all patients and appointments, ordered by ID
            $patients = Patient::orderBy('id')->get();
            $appointments = Appointment::orderBy('id')->get();
            
            // Update patient codes
            foreach ($patients as $index => $patient) {
                $patientCode = 'P' . str_pad($index + 1, 3, '0', STR_PAD_LEFT);
                $patient->update(['patient_code' => $patientCode]);
            }
            
            // Update appointment codes
            foreach ($appointments as $index => $appointment) {
                $appointmentCode = 'A' . str_pad($index + 1, 3, '0', STR_PAD_LEFT);
                $appointment->update(['appointment_code' => $appointmentCode]);
            }
        });
    }
}