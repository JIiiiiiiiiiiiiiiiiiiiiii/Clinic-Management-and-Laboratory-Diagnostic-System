<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Specialist;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OnlineAppointmentService
{
    /**
     * Create an online appointment (handles new or existing patient)
     * 
     * @param array $data
     * @return array
     */
    public function createOnlineAppointment(array $data): array
    {
        return DB::transaction(function () use ($data) {
            try {
                // Extract data
                $existingPatientId = $data['existingPatientId'] ?? null;
                $patientData = $data['patient'] ?? [];
                $appointmentData = $data['appointment'] ?? [];

                // Handle patient creation or retrieval
                if ($existingPatientId && $existingPatientId > 0) {
                    $patient = Patient::findOrFail($existingPatientId);
                    $patientId = $patient->patient_id;
                    $patientCode = $patient->patient_code;
                } else {
                    // Create new patient with proper validation
                    try {
                        $patient = Patient::create([
                            'user_id' => auth()->id(),
                            'last_name' => $patientData['last_name'],
                            'first_name' => $patientData['first_name'],
                            'middle_name' => $patientData['middle_name'] ?? null,
                            'birthdate' => $patientData['birthdate'] ?? null,
                            'mobile_no' => $patientData['mobile_no'] ?? null,
                            'email' => $patientData['email'] ?? null,
                            'present_address' => $patientData['address'] ?? null,
                            'telephone_no' => $patientData['telephone_no'] ?? null,
                            'emergency_name' => $patientData['emergency_name'] ?? $patientData['informant_name'] ?? null,
                            'emergency_relation' => $patientData['emergency_relation'] ?? $patientData['relationship'] ?? null,
                            'company_name' => $patientData['insurance_company'] ?? null,
                            'hmo_name' => $patientData['hmo_name'] ?? null,
                            'hmo_company_id_no' => $patientData['hmo_id_no'] ?? null,
                            'validation_approval_code' => $patientData['approval_code'] ?? null,
                            'validity' => $patientData['validity'] ?? null,
                            'drug_allergies' => $patientData['drug_allergies'] ?? null,
                            'past_medical_history' => $patientData['past_medical_history'] ?? null,
                            'family_history' => $patientData['family_history'] ?? null,
                            'social_personal_history' => $patientData['social_history'] ?? null,
                            'obstetrics_gynecology_history' => $patientData['obgyn_history'] ?? null,
                            'attending_physician' => 'To be assigned',
                            'arrival_date' => now()->toDateString(),
                            'arrival_time' => now()->format('H:i:s'),
                            'time_seen' => now()->format('H:i:s'),
                        ]);
                        
                        $patientId = $patient->patient_id;
                        $patientCode = $patient->patient_code;
                        
                        Log::info('Patient created successfully', [
                            'patient_id' => $patientId,
                            'patient_code' => $patientCode,
                            'user_id' => auth()->id()
                        ]);
                    } catch (\Exception $e) {
                        Log::error('Failed to create patient', [
                            'error' => $e->getMessage(),
                            'patient_data' => $patientData,
                            'user_id' => auth()->id()
                        ]);
                        throw new \Exception('Failed to create patient record: ' . $e->getMessage());
                    }
                }

                // Convert time format from "4:00 PM" to "16:00:00"
                $timeFormatted = $this->convertTimeFormat($appointmentData['time']);

                // Create appointment
                $appointment = Appointment::create([
                    'patient_id' => $patientId,
                    'specialist_id' => $appointmentData['specialist_id'] ?? null,
                    'appointment_type' => $appointmentData['appointment_type'],
                    'specialist_type' => $appointmentData['specialist_type'],
                    'appointment_date' => $appointmentData['date'],
                    'appointment_time' => $timeFormatted,
                    'duration' => $appointmentData['duration'] ?? '30 min',
                    'price' => $appointmentData['price'] ?? null, // Will be calculated after creation
                    'additional_info' => $appointmentData['additional_info'] ?? null,
                    'source' => 'Online',
                    'status' => 'Pending',
                    'created_by' => auth()->id(),
                ]);

                // Calculate and set price using the model's calculatePrice method
                $calculatedPrice = $appointmentData['price'] ?? $appointment->calculatePrice();
                $appointment->update([
                    'price' => $calculatedPrice,
                    'final_total_amount' => $calculatedPrice, // Set final_total_amount to the same as price when no lab tests
                    'total_lab_amount' => 0 // No lab tests initially
                ]);

                $appointmentId = $appointment->appointment_id;
                $appointmentCode = $appointment->appointment_code;

                // Create notification for admin
                Notification::create([
                    'ref_table' => 'appointments',
                    'ref_id' => $appointmentId,
                    'user_role' => 'Admin',
                    'title' => 'New Online Appointment',
                    'body' => "Appointment {$appointmentCode} needs verification",
                    'is_read' => false,
                ]);

                Log::info('Online appointment created successfully', [
                    'patient_id' => $patientId,
                    'patient_code' => $patientCode,
                    'appointment_id' => $appointmentId,
                    'appointment_code' => $appointmentCode,
                ]);

                return [
                    'success' => true,
                    'patient_id' => $patientId,
                    'patient_code' => $patientCode,
                    'appointment_id' => $appointmentId,
                    'appointment_code' => $appointmentCode,
                    'message' => 'Appointment request created and sent to admin'
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
     * Get available specialists by type
     * 
     * @param string $specialistType
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAvailableSpecialists(string $specialistType)
    {
        return Specialist::where('role', $specialistType)
            ->where('status', 'Active')
            ->orderBy('name')
            ->get();
    }

    /**
     * Get appointment types with their default prices
     * 
     * @return array
     */
    public function getAppointmentTypes(): array
    {
        return [
            'consultation' => ['label' => 'General Consultation', 'price' => 300, 'specialist_type' => 'Doctor'],
            'general_consultation' => ['label' => 'General Consultation', 'price' => 300, 'specialist_type' => 'Doctor'],
            'checkup' => ['label' => 'Checkup', 'price' => 300, 'specialist_type' => 'Doctor'],
            'fecalysis' => ['label' => 'Fecalysis Test', 'price' => 500, 'specialist_type' => 'MedTech'],
            'fecalysis_test' => ['label' => 'Fecalysis Test', 'price' => 500, 'specialist_type' => 'MedTech'],
            'cbc' => ['label' => 'Complete Blood Count', 'price' => 500, 'specialist_type' => 'MedTech'],
            'urinalysis' => ['label' => 'Urinalysis Test', 'price' => 500, 'specialist_type' => 'MedTech'],
            'urinarysis_test' => ['label' => 'Urinalysis Test', 'price' => 500, 'specialist_type' => 'MedTech'],
            'x-ray' => ['label' => 'X-Ray', 'price' => 700, 'specialist_type' => 'MedTech'],
            'ultrasound' => ['label' => 'Ultrasound', 'price' => 800, 'specialist_type' => 'MedTech'],
        ];
    }

    /**
     * Get patient's existing appointments
     * 
     * @param int $patientId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getPatientAppointments(int $patientId)
    {
        return Appointment::with(['specialist', 'patient'])
            ->where('patient_id', $patientId)
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc')
            ->get();
    }

    /**
     * Check if appointment time slot is available
     * 
     * @param string $date
     * @param string $time
     * @param int|null $specialistId
     * @return bool
     */
    public function isTimeSlotAvailable(string $date, string $time, ?int $specialistId = null): bool
    {
        $query = Appointment::where('appointment_date', $date)
            ->where('appointment_time', $time)
            ->whereIn('status', ['Pending', 'Confirmed']);

        if ($specialistId) {
            $query->where('specialist_id', $specialistId);
        }

        return $query->count() === 0;
    }

    /**
     * Convert time format from "4:00 PM" to "16:00:00"
     * 
     * @param string $time
     * @return string
     */
    private function convertTimeFormat(string $time): string
    {
        try {
            // If already in 24-hour format, return as is
            if (preg_match('/^\d{1,2}:\d{2}$/', $time)) {
                return $time . ':00';
            }
            
            // If in 12-hour format, convert to 24-hour
            $dateTime = \DateTime::createFromFormat('g:i A', $time);
            if ($dateTime) {
                return $dateTime->format('H:i:s');
            }
            
            // Try alternative formats
            $dateTime = \DateTime::createFromFormat('g:i A', strtoupper($time));
            if ($dateTime) {
                return $dateTime->format('H:i:s');
            }
            
            // If all else fails, try to parse with Carbon
            $carbon = \Carbon\Carbon::createFromFormat('g:i A', $time);
            return $carbon->format('H:i:s');
            
        } catch (\Exception $e) {
            Log::warning('Failed to convert time format', [
                'original_time' => $time,
                'error' => $e->getMessage()
            ]);
            
            // Fallback: return the original time if conversion fails
            return $time;
        }
    }
}