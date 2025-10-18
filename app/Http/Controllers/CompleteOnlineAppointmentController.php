<?php

namespace App\Http\Controllers;

use App\Services\CompleteAppointmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CompleteOnlineAppointmentController extends Controller
{
    protected $appointmentService;
    
    public function __construct(CompleteAppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }
    
    /**
     * Create online appointment (patient-side)
     */
    public function store(Request $request)
    {
        try {
            // Validate request
            $validator = Validator::make($request->all(), [
                // Patient data
                'last_name' => 'required|string|max:100',
                'first_name' => 'required|string|max:100',
                'middle_name' => 'nullable|string|max:100',
                'birthdate' => 'nullable|date',
                'age' => 'nullable|integer|min:0|max:150',
                'sex' => 'nullable|in:Male,Female',
                'nationality' => 'nullable|string|max:50',
                'civil_status' => 'nullable|string|max:50',
                'address' => 'nullable|string',
                'telephone_no' => 'nullable|string|max:20',
                'mobile_no' => 'nullable|string|max:20',
                'emergency_name' => 'nullable|string|max:100',
                'emergency_relation' => 'nullable|string|max:50',
                'insurance_company' => 'nullable|string|max:100',
                'hmo_name' => 'nullable|string|max:100',
                'hmo_id_no' => 'nullable|string|max:100',
                'approval_code' => 'nullable|string|max:100',
                'validity' => 'nullable|date',
                'drug_allergies' => 'nullable|string',
                'past_medical_history' => 'nullable|string',
                'family_history' => 'nullable|string',
                'social_history' => 'nullable|string',
                'obgyn_history' => 'nullable|string',
                
                // Appointment data
                'appointment_type' => 'required|string|max:100',
                'specialist_type' => 'required|in:Doctor,MedTech',
                'appointment_date' => 'required|date|after_or_equal:today',
                'appointment_time' => 'required|date_format:H:i',
                'duration' => 'nullable|string|max:50',
                'price' => 'nullable|numeric|min:0',
                'additional_info' => 'nullable|string',
                
                // Existing patient option
                'existing_patient_id' => 'nullable|integer|exists:patients,patient_id',
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            // Prepare data for service
            $data = $request->all();
            
            // If existing patient, structure data accordingly
            if ($request->filled('existing_patient_id')) {
                $data['existing_patient_id'] = $request->existing_patient_id;
                $data['patient_data'] = $request->only([
                    'last_name', 'first_name', 'middle_name', 'birthdate', 'age', 'sex',
                    'nationality', 'civil_status', 'address', 'telephone_no', 'mobile_no',
                    'emergency_name', 'emergency_relation', 'insurance_company', 'hmo_name',
                    'hmo_id_no', 'approval_code', 'validity', 'drug_allergies',
                    'past_medical_history', 'family_history', 'social_history', 'obgyn_history'
                ]);
            } else {
                $data['patient_data'] = $request->only([
                    'last_name', 'first_name', 'middle_name', 'birthdate', 'age', 'sex',
                    'nationality', 'civil_status', 'address', 'telephone_no', 'mobile_no',
                    'emergency_name', 'emergency_relation', 'insurance_company', 'hmo_name',
                    'hmo_id_no', 'approval_code', 'validity', 'drug_allergies',
                    'past_medical_history', 'family_history', 'social_history', 'obgyn_history'
                ]);
            }
            
            // Create appointment using service
            $result = $this->appointmentService->createOnlineAppointment($data);
            
            Log::info('Online appointment created successfully', $result);
            
            return response()->json([
                'success' => true,
                'message' => 'Appointment request submitted successfully',
                'data' => $result
            ], 201);
            
        } catch (\Exception $e) {
            Log::error('Failed to create online appointment', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit appointment request: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get patient appointments
     */
    public function getPatientAppointments(Request $request)
    {
        try {
            $patientId = $request->get('patient_id');
            
            if (!$patientId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Patient ID is required'
                ], 400);
            }
            
            $appointments = \App\Models\Appointment::where('patient_id', $patientId)
                ->with(['patient', 'specialist'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($appointment) {
                    return [
                        'appointment_id' => $appointment->appointment_id,
                        'appointment_code' => $appointment->appointment_code,
                        'appointment_type' => $appointment->appointment_type,
                        'appointment_date' => $appointment->appointment_date,
                        'appointment_time' => $appointment->appointment_time,
                        'status' => $appointment->status,
                        'source' => $appointment->source,
                        'price' => $appointment->price,
                        'specialist_name' => $appointment->specialist ? $appointment->specialist->name : 'Not assigned',
                        'created_at' => $appointment->created_at
                    ];
                });
            
            return response()->json([
                'success' => true,
                'data' => $appointments
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to get patient appointments', [
                'error' => $e->getMessage(),
                'patient_id' => $request->get('patient_id')
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve appointments'
            ], 500);
        }
    }
}

