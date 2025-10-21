<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Visit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EnhancedAppointmentCreationService
{
    /**
     * Create a new appointment with duplicate prevention
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
            } elseif (isset($appointmentData["patient_id"])) {
                // If patient_id is provided, find existing patient
                $patient = Patient::find($appointmentData["patient_id"]);
                if (!$patient) {
                    throw new \Exception("Patient not found with ID: " . $appointmentData["patient_id"]);
                }
            } else {
                throw new \Exception("Either patient data or patient_id must be provided");
            }

            // Create appointment with proper patient_id and sequence
            $appointmentData["patient_id"] = $patient->id;
            
            // Add required fields that are missing
            if (!isset($appointmentData["patient_name"])) {
                $appointmentData["patient_name"] = $patient->first_name . " " . $patient->last_name;
            }
            if (!isset($appointmentData["contact_number"])) {
                $appointmentData["contact_number"] = $patient->mobile_no ?? "Not specified";
            }
            if (!isset($appointmentData["specialist_name"])) {
                $appointmentData["specialist_name"] = "To be assigned";
            }
            
            // Check for duplicate appointments
            $duplicateCheck = $this->checkForDuplicateAppointment($appointmentData);
            if ($duplicateCheck) {
                throw new \Exception("Duplicate appointment detected. An appointment already exists for this patient, specialist, date, and time.");
            }
            
            // Create appointment
            $appointment = Appointment::create($appointmentData);
            
            Log::info("Appointment created successfully", [
                "appointment_id" => $appointment->id,
                "appointment_code" => $appointment->appointment_code,
                "patient_id" => $appointment->patient_id,
                "specialist_id" => $appointment->specialist_id
            ]);

            return [
                "appointment" => $appointment,
                "patient" => $patient,
                "success" => true,
                "message" => "Appointment created successfully"
            ];
        });
    }
    
    /**
     * Check for duplicate appointments
     */
    private function checkForDuplicateAppointment(array $appointmentData)
    {
        return Appointment::where("patient_id", $appointmentData["patient_id"])
            ->where("specialist_id", $appointmentData["specialist_id"])
            ->where("appointment_date", $appointmentData["appointment_date"])
            ->where("appointment_time", $appointmentData["appointment_time"])
            ->where("status", "!=", "Cancelled")
            ->exists();
    }
    
    /**
     * Create or find patient
     */
    private function createOrFindPatient(array $patientData)
    {
        // Check for existing patient
        $existingPatient = Patient::where("first_name", $patientData["first_name"])
            ->where("last_name", $patientData["last_name"])
            ->where("date_of_birth", $patientData["date_of_birth"])
            ->first();
            
        if ($existingPatient) {
            return $existingPatient;
        }
        
        // Create new patient
        $patient = Patient::create($patientData);
        
        Log::info("New patient created", [
            "patient_id" => $patient->id,
            "patient_no" => $patient->patient_no,
            "name" => $patient->first_name . " " . $patient->last_name
        ]);
        
        return $patient;
    }
}