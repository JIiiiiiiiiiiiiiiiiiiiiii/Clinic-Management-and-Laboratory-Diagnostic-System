<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\Appointment;
use Illuminate\Support\Facades\DB;

class SynchronizedIdService
{
    /**
     * Get the next synchronized ID for both patient and appointment
     * This ensures both patient and appointment get the same sequence number
     */
    public static function getNextSynchronizedId()
    {
        // Get the maximum sequence number from both tables
        $maxPatientSequence = Patient::max('sequence_number') ?? 0;
        $maxAppointmentSequence = Appointment::max('sequence_number') ?? 0;
        
        return max($maxPatientSequence, $maxAppointmentSequence) + 1;
    }

    /**
     * Create a new synchronized patient-appointment pair
     * Both will have the same sequence_number
     */
    public static function createSynchronizedPair($patientData, $appointmentData)
    {
        return DB::transaction(function () use ($patientData, $appointmentData) {
            $nextId = self::getNextSynchronizedId();
            
            // Create patient with synchronized ID
            $patient = Patient::create(array_merge($patientData, [
                'sequence_number' => $nextId,
                'patient_no' => $nextId,
            ]));
            
            // Create appointment with same synchronized ID
            $appointment = Appointment::create(array_merge($appointmentData, [
                'sequence_number' => $nextId,
                'patient_id' => $patient->id,
            ]));
            
            return ['patient' => $patient, 'appointment' => $appointment];
        });
    }

    /**
     * Renumber all patients and appointments to maintain synchronized IDs
     * This is called automatically when records are deleted
     */
    public static function renumberAll()
    {
        DB::transaction(function () {
            // Get all patients and appointments, ordered by current sequence number
            $patients = Patient::orderBy('sequence_number')->get();
            $appointments = Appointment::orderBy('sequence_number')->get();
            
            // Create a mapping of patient_id to appointment for synchronization
            $patientAppointmentMap = [];
            foreach ($appointments as $appointment) {
                $patientAppointmentMap[$appointment->patient_id] = $appointment;
            }
            
            // Use a different approach: update with temporary values first
            $tempBase = 999999;
            
            // First, set all sequence numbers to temporary large values
            foreach ($patients as $index => $patient) {
                $tempValue = $tempBase + $index;
                DB::statement('UPDATE patients SET sequence_number = ?, patient_no = ? WHERE id = ?', 
                    [$tempValue, $tempValue, $patient->id]);
            }
            
            foreach ($appointments as $index => $appointment) {
                $tempValue = $tempBase + $index + 1000; // Different range for appointments
                DB::statement('UPDATE appointments SET sequence_number = ? WHERE id = ?', 
                    [$tempValue, $appointment->id]);
            }
            
            // Now renumber sequentially - only for patients that have appointments
            $newSequence = 1;
            foreach ($patients as $patient) {
                // Only renumber patients that have appointments
                if (isset($patientAppointmentMap[$patient->id])) {
                    DB::statement('UPDATE patients SET sequence_number = ?, patient_no = ? WHERE id = ?', 
                        [$newSequence, $newSequence, $patient->id]);
                    
                    // Update corresponding appointment
                    DB::statement('UPDATE appointments SET sequence_number = ? WHERE id = ?', 
                        [$newSequence, $patientAppointmentMap[$patient->id]->id]);
                    
                    $newSequence++;
                }
            }
        });
    }
}
