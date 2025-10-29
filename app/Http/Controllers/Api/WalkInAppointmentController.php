<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Specialist;
use App\Services\AppointmentAutomationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class WalkInAppointmentController extends Controller
{
    protected $appointmentService;

    public function __construct(AppointmentAutomationService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }

    /**
     * Create walk-in appointment
     */
    public function store(Request $request)
    {
        try {
            Log::info('Walk-in appointment API called', [
                'user_id' => auth()->id(),
                'has_patient_data' => $request->has('patient'),
                'has_appointment_data' => $request->has('appointment'),
                'existing_patient_id' => $request->input('existingPatientId')
            ]);

            // Validate request - support both nested and flat formats
            $validator = Validator::make($request->all(), [
                'existingPatientId' => 'nullable|integer',
                'patient' => 'nullable|array',
                'patient.first_name' => 'required_without:existingPatientId|string|max:100',
                'patient.last_name' => 'required_without:existingPatientId|string|max:100',
                'patient.mobile_no' => 'required_without:existingPatientId|string|max:20',
                'appointment' => 'required|array',
                'appointment.appointment_type' => 'required|string|in:general_consultation,cbc,fecalysis_test,urinarysis_test',
                'appointment.specialist_type' => 'required|in:Doctor,MedTech,doctor,medtech',
                'appointment.specialist_id' => 'required|integer',
                'appointment.date' => 'required|date|after_or_equal:today',
                'appointment.time' => 'required|string',
                'appointment.additional_info' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed for walk-in appointment', [
                    'errors' => $validator->errors()->toArray()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $result = DB::transaction(function () use ($request) {
                $user = auth()->user();
                
                // Handle patient (existing or new)
                $patient = $this->handlePatient($request);
                
                // Create appointment data
                $appointmentInput = $request->input('appointment');
                
                // Get specialist for name - use Specialist model
                $specialist = \App\Models\Specialist::find($appointmentInput['specialist_id']);
                
                // Convert appointment time from 12-hour to 24-hour format
                $appointmentTime = $this->formatTimeForDatabase($appointmentInput['time']);
                
                // Ensure date is in correct format (YYYY-MM-DD)
                $appointmentDate = \Carbon\Carbon::parse($appointmentInput['date'])->format('Y-m-d');
                
                // Duration can be string like "30 min" or just number
                $duration = $appointmentInput['duration'] ?? '30 min';
                
                // Create appointment data for the service
                $appointmentData = [
                    'patient_id' => $patient->id,
                    'patient_name' => $patient->first_name . ' ' . $patient->last_name,
                    'contact_number' => $patient->mobile_no ?? $patient->telephone_no ?? '',
                    'specialist_id' => $appointmentInput['specialist_id'],
                    'specialist_name' => $specialist ? $specialist->name : 'Unknown',
                    'appointment_type' => $appointmentInput['appointment_type'],
                    'specialist_type' => strtolower($appointmentInput['specialist_type']),
                    'appointment_date' => $appointmentDate,
                    'appointment_time' => $appointmentTime,
                    'duration' => $duration,
                    'price' => $appointmentInput['price'] ?? $this->calculatePrice($appointmentInput['appointment_type']),
                    'additional_info' => $appointmentInput['additional_info'] ?? null,
                    'source' => 'Walk-in',
                    'status' => 'Confirmed', // Walk-in appointments are confirmed immediately
                    'billing_status' => 'pending',
                    'booking_method' => 'Walk-in',
                ];

                // Use the appointment automation service to create appointment with visit and billing
                $appointment = $this->appointmentService->createAppointment($appointmentData, 'Walk-in');
                
                // Generate appointment code
                $appointmentCode = 'A' . str_pad($appointment->id, 4, '0', STR_PAD_LEFT);
                $appointment->update(['appointment_code' => $appointmentCode]);
                
                Log::info('Walk-in appointment created successfully', [
                    'appointment_id' => $appointment->id,
                    'appointment_code' => $appointmentCode,
                    'patient_id' => $patient->id,
                    'patient_code' => $patient->patient_no,
                    'appointment_type' => $appointment->appointment_type,
                    'status' => $appointment->status
                ]);

                return [
                    'success' => true,
                    'appointment_id' => $appointment->id,
                    'appointment_code' => $appointmentCode,
                    'patient_id' => $patient->id,
                    'patient_code' => $patient->patient_no,
                    'status' => 'Confirmed',
                    'message' => 'Walk-in appointment created successfully with visit and billing.'
                ];
            });

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error('Failed to create walk-in appointment via API', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create appointment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle patient creation or retrieval
     */
    private function handlePatient(Request $request)
    {
        $existingPatientId = $request->input('existingPatientId');
        
        if ($existingPatientId) {
            // Use existing patient
            $patient = Patient::find($existingPatientId);
            if (!$patient) {
                throw new \Exception('Patient not found');
            }
            return $patient;
        }
        
        // Create new patient
        $patientData = $request->input('patient');
        $patientData['user_id'] = auth()->id();
        
        Log::info('Creating new patient with form data for walk-in appointment', [
            'first_name' => $patientData['first_name'] ?? 'Not provided',
            'last_name' => $patientData['last_name'] ?? 'Not provided',
            'mobile_no' => $patientData['mobile_no'] ?? 'Not provided'
        ]);

        // Add required fields with defaults if not provided
        $this->addRequiredPatientFields($patientData);
        
        // Create new patient - patient_no will be auto-generated by model boot method
        $newPatient = Patient::create($patientData);
        
        Log::info('Created new patient for walk-in appointment', [
            'patient_id' => $newPatient->id,
            'patient_no' => $newPatient->patient_no,
            'user_id' => $newPatient->user_id
        ]);
        
        return $newPatient;
    }

    /**
     * Add required patient fields with defaults
     */
    private function addRequiredPatientFields(array &$patientData)
    {
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
        if (!isset($patientData['sex'])) {
            $patientData['sex'] = 'male';
        }
        if (!isset($patientData['civil_status'])) {
            $patientData['civil_status'] = 'single';
        }
        if (!isset($patientData['nationality'])) {
            $patientData['nationality'] = 'Filipino';
        }
        if (!isset($patientData['drug_allergies'])) {
            $patientData['drug_allergies'] = 'NONE';
        }
        if (!isset($patientData['food_allergies'])) {
            $patientData['food_allergies'] = 'NONE';
        }
        
        // Ensure present_address is set
        if (!isset($patientData['present_address'])) {
            $patientData['present_address'] = $patientData['address'] ?? 'To be completed';
        }
        if (!isset($patientData['informant_name'])) {
            $patientData['informant_name'] = $patientData['emergency_name'] ?? 'Not provided';
        }
        if (!isset($patientData['relationship'])) {
            $patientData['relationship'] = $patientData['emergency_relation'] ?? 'Not provided';
        }
        
        // Field mapping for consistency
        if (!isset($patientData['address']) && isset($patientData['present_address'])) {
            $patientData['address'] = $patientData['present_address'];
        }
        if (!isset($patientData['address'])) {
            $patientData['address'] = 'To be completed';
        }
        
        if (!isset($patientData['emergency_name']) && isset($patientData['informant_name'])) {
            $patientData['emergency_name'] = $patientData['informant_name'];
        }
        if (!isset($patientData['emergency_relation']) && isset($patientData['relationship'])) {
            $patientData['emergency_relation'] = $patientData['relationship'];
        }
        
        if (!isset($patientData['insurance_company']) && isset($patientData['company_name'])) {
            $patientData['insurance_company'] = $patientData['company_name'];
        }
        
        if (!isset($patientData['hmo_id_no']) && isset($patientData['hmo_company_id_no'])) {
            $patientData['hmo_id_no'] = $patientData['hmo_company_id_no'];
        }
        
        if (!isset($patientData['approval_code']) && isset($patientData['validation_approval_code'])) {
            $patientData['approval_code'] = $patientData['validation_approval_code'];
        }
        
        if (!isset($patientData['social_history']) && isset($patientData['social_personal_history'])) {
            $patientData['social_history'] = $patientData['social_personal_history'];
        }
        if (!isset($patientData['obgyn_history']) && isset($patientData['obstetrics_gynecology_history'])) {
            $patientData['obgyn_history'] = $patientData['obstetrics_gynecology_history'];
        }
        
        // Convert sex to lowercase
        if (isset($patientData['sex'])) {
            $patientData['sex'] = strtolower($patientData['sex']);
        }
    }

    /**
     * Calculate appointment price
     */
    private function calculatePrice(string $appointmentType): float
    {
        $prices = [
            'consultation' => 300,
            'general_consultation' => 300,
            'checkup' => 300,
            'fecalysis' => 500,
            'fecalysis_test' => 500,
            'cbc' => 500,
            'urinalysis' => 500,
            'urinarysis_test' => 500,
            'x-ray' => 700,
            'ultrasound' => 800,
        ];

        return $prices[$appointmentType] ?? 300;
    }

    /**
     * Format time for database storage
     * Converts "3:30 PM" to "15:30:00"
     */
    private function formatTimeForDatabase($timeString)
    {
        try {
            // Try to parse as 12-hour format with AM/PM (e.g., "3:30 PM")
            $time = \Carbon\Carbon::createFromFormat('g:i A', $timeString);
            return $time->format('H:i:s');
        } catch (\Exception $e) {
            // If that fails, try 24-hour format (e.g., "15:30")
            try {
                $time = \Carbon\Carbon::createFromFormat('H:i', $timeString);
                return $time->format('H:i:s');
            } catch (\Exception $e2) {
                // If all parsing fails, log error and return current time
                Log::error('Failed to parse time format', [
                    'time_string' => $timeString,
                    'error' => $e2->getMessage()
                ]);
                return now()->format('H:i:s');
            }
        }
    }
}
