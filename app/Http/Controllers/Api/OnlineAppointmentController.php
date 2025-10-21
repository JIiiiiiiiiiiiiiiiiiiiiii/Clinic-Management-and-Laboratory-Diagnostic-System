<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Specialist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class OnlineAppointmentController extends Controller
{
    /**
     * Create online appointment
     */
    public function store(Request $request)
    {
        try {
            Log::info('Online appointment API called', [
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
                'appointment.appointment_type' => 'required|string',
                'appointment.specialist_type' => 'required|in:Doctor,MedTech,doctor,medtech',
                'appointment.specialist_id' => 'required|integer',
                'appointment.date' => 'required|date|after_or_equal:today',
                'appointment.time' => 'required|string',
                'appointment.additional_info' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed for online appointment', [
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
                
                // Always create a new patient with the form data to ensure correct information
                $patientData = $request->input('patient');
                $patientData['user_id'] = $user->id;
                
                Log::info('Creating new patient with form data', [
                    'first_name' => $patientData['first_name'] ?? 'Not provided',
                    'last_name' => $patientData['last_name'] ?? 'Not provided',
                    'mobile_no' => $patientData['mobile_no'] ?? 'Not provided'
                ]);
                    
                    // Add required fields with defaults if not provided
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
                    
                    // Ensure present_address is set
                    if (!isset($patientData['present_address'])) {
                        $patientData['present_address'] = $patientData['address'] ?? 'To be completed';
                    }
                    
                    // Ensure address is set
                    if (!isset($patientData['address']) && isset($patientData['present_address'])) {
                        $patientData['address'] = $patientData['present_address'];
                    }
                    if (!isset($patientData['address'])) {
                        $patientData['address'] = 'To be completed';
                    }
                    
                    // Ensure emergency_name and emergency_relation are set for emergency contact
                    if (!isset($patientData['emergency_name']) && isset($patientData['informant_name'])) {
                        $patientData['emergency_name'] = $patientData['informant_name'];
                    }
                    if (!isset($patientData['emergency_relation']) && isset($patientData['relationship'])) {
                        $patientData['emergency_relation'] = $patientData['relationship'];
                    }
                    
                    // Ensure insurance_company is set
                    if (!isset($patientData['insurance_company']) && isset($patientData['company_name'])) {
                        $patientData['insurance_company'] = $patientData['company_name'];
                    }
                    
                    // Ensure hmo_id_no is set
                    if (!isset($patientData['hmo_id_no']) && isset($patientData['hmo_company_id_no'])) {
                        $patientData['hmo_id_no'] = $patientData['hmo_company_id_no'];
                    }
                    
                    // Ensure approval_code is set
                    if (!isset($patientData['approval_code']) && isset($patientData['validation_approval_code'])) {
                        $patientData['approval_code'] = $patientData['validation_approval_code'];
                    }
                    
                    // Ensure social_history and obgyn_history are set
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
                    
                $patient = $this->createOrFindPatient($patientData);
                
                Log::info('New patient created via API with form data', [
                    'patient_id' => $patient->id,
                    'patient_no' => $patient->patient_no,
                    'patient_name' => $patient->first_name . ' ' . $patient->last_name
                ]);

                // Create appointment
                $appointmentInput = $request->input('appointment');
                
                // Get specialist for name - use Specialist model
                $specialist = \App\Models\Specialist::find($appointmentInput['specialist_id']);
                
                // Convert appointment time from 12-hour to 24-hour format (e.g., "3:30 PM" -> "15:30:00")
                $appointmentTime = $this->formatTimeForDatabase($appointmentInput['time']);
                
                // Ensure date is in correct format (YYYY-MM-DD)
                $appointmentDate = \Carbon\Carbon::parse($appointmentInput['date'])->format('Y-m-d');
                
                // Duration can be string like "30 min" or just number
                $duration = $appointmentInput['duration'] ?? '30 min';
                
                // Create appointment in PendingAppointment table (waiting for admin approval)
                $pendingAppointmentData = [
                    'patient_id' => (string) $patient->id,
                    'patient_name' => $patient->first_name . ' ' . $patient->last_name,
                    'contact_number' => $patient->mobile_no ?? $patient->telephone_no ?? '',
                    'specialist_id' => (string) $appointmentInput['specialist_id'],
                    'specialist_name' => $specialist ? $specialist->name : 'Unknown',
                    'appointment_type' => $appointmentInput['appointment_type'],
                    'specialist_type' => strtolower($appointmentInput['specialist_type']),
                    'appointment_date' => $appointmentDate,
                    'appointment_time' => $appointmentTime,
                    'duration' => $duration,
                    'price' => $appointmentInput['price'] ?? $this->calculatePrice($appointmentInput['appointment_type']),
                    'notes' => $appointmentInput['additional_info'] ?? null,
                    'special_requirements' => $appointmentInput['additional_info'] ?? null,
                    'booking_method' => 'Online',
                    'status' => 'Pending Approval',
                    'status_approval' => 'pending',
                ];

                // Create in pending_appointments table (waiting for admin approval)
                $appointment = \App\Models\PendingAppointment::create($pendingAppointmentData);
                
                Log::info('Pending appointment created in pending_appointments table', $pendingAppointmentData);

                // Send notification to admin
                $this->notifyAdminPendingAppointment($appointment, $patient);

                Log::info('Online appointment created successfully', [
                    'pending_appointment_id' => $appointment->id,
                    'patient_id' => $patient->id,
                    'patient_no' => $patient->patient_no,
                    'appointment_type' => $appointment->appointment_type,
                    'status' => $appointment->status_approval
                ]);

                return [
                    'success' => true,
                    'pending_appointment_id' => $appointment->id,
                    'appointment_code' => 'PA' . str_pad($appointment->id, 4, '0', STR_PAD_LEFT),
                    'patient_id' => $patient->id,
                    'patient_code' => $patient->patient_no,
                    'status' => 'Pending Approval',
                    'message' => 'Appointment request submitted successfully. Waiting for admin approval.'
                ];
            });

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error('Failed to create online appointment via API', [
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
     * Create or find patient
     */
    private function createOrFindPatient(array $patientData)
    {
        // For online appointments, always create a new patient with the form data
        // This ensures the correct patient information is used
        Log::info('Creating new patient with form data for online appointment', [
            'first_name' => $patientData['first_name'] ?? 'Not provided',
            'last_name' => $patientData['last_name'] ?? 'Not provided',
            'mobile_no' => $patientData['mobile_no'] ?? 'Not provided'
        ]);

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

        // Create new patient - patient_no will be auto-generated by model boot method
        $newPatient = Patient::create($patientData);
        
        Log::info('Created new patient', [
            'patient_id' => $newPatient->id,
            'patient_no' => $newPatient->patient_no,
            'user_id' => $newPatient->user_id
        ]);
        
        return $newPatient;
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

    /**
     * Notify admin users about pending appointment
     */
    private function notifyAdminPendingAppointment($appointment, $patient)
    {
        try {
            // Get all admin users
            $adminUsers = \App\Models\User::where('role', 'admin')->get();

            Log::info('Notifying admin users about online appointment', [
                'admin_count' => $adminUsers->count(),
                'appointment_id' => $appointment->id
            ]);

            $patientName = $patient->first_name . ' ' . $patient->last_name;

            foreach ($adminUsers as $admin) {
                // Create notification
                $notification = \App\Models\Notification::create([
                    'type' => 'appointment_request',
                    'title' => 'New Online Appointment Request',
                    'message' => "Patient {$patientName} has requested an online appointment for {$appointment->appointment_type} on {$appointment->appointment_date->format('M d, Y')} at {$appointment->appointment_time->format('g:i A')}. Please review and approve.",
                    'data' => [
                        'appointment_id' => $appointment->id,
                        'patient_id' => $patient->id,
                        'patient_no' => $patient->patient_no,
                        'patient_name' => $patientName,
                        'appointment_type' => $appointment->appointment_type,
                        'appointment_date' => $appointment->appointment_date->format('Y-m-d'),
                        'appointment_time' => $appointment->appointment_time->format('H:i:s'),
                        'specialist_name' => $appointment->specialist_name,
                        'status' => $appointment->status,
                        'price' => $appointment->price,
                        'source' => $appointment->source,
                    ],
                    'user_id' => $admin->id,
                    'related_id' => $appointment->id,
                    'related_type' => 'App\\Models\\Appointment',
                    'read' => false,
                ]);

                Log::info('Online appointment notification created', [
                    'notification_id' => $notification->id,
                    'admin_id' => $admin->id,
                    'admin_name' => $admin->name,
                    'appointment_id' => $appointment->id
                ]);
            }

            Log::info('All admin notifications created successfully', [
                'total_notifications' => $adminUsers->count(),
                'appointment_id' => $appointment->id
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create admin notifications for online appointment', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'appointment_id' => $appointment->id
            ]);
            // Don't throw exception - allow appointment creation to complete even if notifications fail
        }
    }
}