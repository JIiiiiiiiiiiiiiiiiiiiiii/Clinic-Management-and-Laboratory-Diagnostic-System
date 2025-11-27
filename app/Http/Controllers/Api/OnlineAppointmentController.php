<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Specialist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
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
                'existing_patient_id' => $request->input('existingPatientId'),
                'patient_data' => $request->input('patient'),
                'full_request' => $request->all()
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
                $existingPatientId = $request->input('existingPatientId', 0);
                
                // Check if we should use existing patient or create new one
                if ($existingPatientId && $existingPatientId > 0) {
                    // Use existing patient
                    $patient = \App\Models\Patient::find($existingPatientId);
                    if (!$patient) {
                        throw new \Exception('Existing patient not found');
                    }
                    
                    Log::info('Using existing patient for appointment', [
                        'patient_id' => $patient->id,
                        'patient_name' => $patient->first_name . ' ' . $patient->last_name
                    ]);
                } else {
                    // Create new patient with form data
                    $patientData = $request->input('patient', []);
                    
                    // Validate that patient data is provided
                    if (empty($patientData)) {
                        Log::error('No patient data provided for new patient creation', [
                            'request_data' => $request->all()
                        ]);
                        throw new \Exception('Patient information is required for new appointments');
                    }
                    
                    $patientData['user_id'] = $user->id;
                    
                    // Ensure we have the required fields
                    if (empty($patientData['last_name'])) {
                        Log::error('Missing last_name in patient data', [
                            'patient_data' => $patientData,
                            'request_data' => $request->all()
                        ]);
                        throw new \Exception('Last name is required for patient creation');
                    }
                    if (empty($patientData['first_name'])) {
                        Log::error('Missing first_name in patient data', [
                            'patient_data' => $patientData,
                            'request_data' => $request->all()
                        ]);
                        throw new \Exception('First name is required for patient creation');
                    }
                
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
                }
                
                Log::info('Patient ready for appointment creation', [
                    'patient_id' => $patient->id,
                    'patient_no' => $patient->patient_no,
                    'patient_name' => $patient->first_name . ' ' . $patient->last_name,
                    'is_existing' => $existingPatientId > 0
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

                // Send notification to admin using centralized service
                $notificationService = app(\App\Services\NotificationService::class);
                $notificationService->notifyNewPendingAppointment($appointment);

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
        
        // Ensure required fields are not empty
        if (empty($patientData['last_name'])) {
            $patientData['last_name'] = 'Not provided';
        }
        if (empty($patientData['first_name'])) {
            $patientData['first_name'] = 'Not provided';
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

        // Remove 'id' from patientData if it exists to prevent SQL errors
        unset($patientData['id']);
        
        // Check if email column exists in database
        // If email is provided but column doesn't exist, try to add it or remove email from data
        if (isset($patientData['email']) && !Schema::hasColumn('patients', 'email')) {
            Log::info('Email column does not exist in patients table, attempting to add it');
            try {
                // Try to add the email column
                Schema::table('patients', function ($table) {
                    $table->string('email', 150)->nullable()->after('mobile_no');
                });
                Log::info('Email column added successfully to patients table');
            } catch (\Exception $schemaException) {
                // If adding column fails, remove email from patientData
                Log::warning('Failed to add email column, removing email from patientData', [
                    'error' => $schemaException->getMessage()
                ]);
                unset($patientData['email']);
            }
        }
        
        // Create new patient - patient_no will be auto-generated by model boot method
        // Use DB::table()->insertGetId() as a fallback if Patient::create() fails due to id field issues
        try {
            $newPatient = Patient::create($patientData);
        } catch (\Exception $e) {
            // If creation fails due to id field, try using DB directly
            if (str_contains($e->getMessage(), "Field 'id' doesn't have a default value")) {
                Log::warning('Patient::create() failed, trying DB::table()->insertGetId()', [
                    'error' => $e->getMessage()
                ]);
                
                // Get the next patient number
                $nextId = Patient::max('id') ?? 0;
                $nextId++;
                $patientData['patient_no'] = 'P' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
                
                // Double-check email column doesn't exist before DB insert
                if (isset($patientData['email']) && !Schema::hasColumn('patients', 'email')) {
                    Log::warning('Email column does not exist in patients table, removing email from insert data');
                    unset($patientData['email']);
                }
                
                // Ensure id is not in the data array - let MySQL AUTO_INCREMENT handle it
                unset($patientData['id']);
                
                // Insert using DB facade with explicit NULL for id to trigger AUTO_INCREMENT
                // Or use raw SQL to ensure proper handling
                try {
                    $id = \DB::table('patients')->insertGetId($patientData);
                } catch (\Exception $insertException) {
                    // If insertGetId fails, try using raw SQL
                    if (str_contains($insertException->getMessage(), "Field 'id' doesn't have a default value")) {
                        Log::warning('insertGetId failed, trying raw SQL insert', [
                            'error' => $insertException->getMessage()
                        ]);
                        
                        // Build column and value lists for raw SQL
                        $columns = array_keys($patientData);
                        $placeholders = array_fill(0, count($columns), '?');
                        $values = array_values($patientData);
                        
                        $sql = "INSERT INTO `patients` (`" . implode('`, `', $columns) . "`) VALUES (" . implode(', ', $placeholders) . ")";
                        \DB::insert($sql, $values);
                        $id = \DB::getPdo()->lastInsertId();
                    } else {
                        throw $insertException;
                    }
                }
                
                $newPatient = Patient::find($id);
                
                if (!$newPatient) {
                    throw new \Exception('Failed to create patient record');
                }
            } elseif (str_contains($e->getMessage(), "Unknown column 'email'")) {
                // If email column doesn't exist, remove it and try again
                Log::warning('Email column does not exist, removing email from patientData and retrying', [
                    'error' => $e->getMessage()
                ]);
                
                unset($patientData['email']);
                
                // Try creating again without email
                try {
                    $newPatient = Patient::create($patientData);
                } catch (\Exception $retryException) {
                    // If still fails, try DB insert
                    if (str_contains($retryException->getMessage(), "Field 'id' doesn't have a default value")) {
                        $nextId = Patient::max('id') ?? 0;
                        $nextId++;
                        $patientData['patient_no'] = 'P' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
                        
                        // Ensure email is removed before DB insert
                        unset($patientData['email']);
                        unset($patientData['id']);
                        
                        try {
                            $id = \DB::table('patients')->insertGetId($patientData);
                        } catch (\Exception $insertException) {
                            // If insertGetId fails, try using raw SQL
                            if (str_contains($insertException->getMessage(), "Field 'id' doesn't have a default value")) {
                                $columns = array_keys($patientData);
                                $placeholders = array_fill(0, count($columns), '?');
                                $values = array_values($patientData);
                                
                                $sql = "INSERT INTO `patients` (`" . implode('`, `', $columns) . "`) VALUES (" . implode(', ', $placeholders) . ")";
                                \DB::insert($sql, $values);
                                $id = \DB::getPdo()->lastInsertId();
                            } else {
                                throw $insertException;
                            }
                        }
                        
                        $newPatient = Patient::find($id);
                        
                        if (!$newPatient) {
                            throw new \Exception('Failed to create patient record');
                        }
                    } else {
                        throw $retryException;
                    }
                }
            } else {
                throw $e;
            }
        }
        
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
            'consultation' => 350,
            'general_consultation' => 350,
            'checkup' => 300,
            'fecalysis' => 90,
            'fecalysis_test' => 90,
            'cbc' => 245,
            'urinalysis' => 140,
            'urinarysis_test' => 140,
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