<?php

namespace App\Http\Controllers;

use App\Services\CompleteAppointmentService;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Staff;
use App\Models\BillingTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CompleteAdminAppointmentController extends Controller
{
    protected $appointmentService;
    
    public function __construct(CompleteAppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }
    
    /**
     * Create walk-in appointment (admin-side)
     */
    public function createWalkIn(Request $request)
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
                'specialist_id' => 'required|integer|exists:staff,staff_id',
                'appointment_date' => 'required|date|after_or_equal:today',
                'appointment_time' => 'required|date_format:H:i',
                'duration' => 'nullable|string|max:50',
                'price' => 'required|numeric|min:0',
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
            
            // Create walk-in appointment using service
            $result = $this->appointmentService->createWalkInAppointment($data);
            
            Log::info('Walk-in appointment created successfully', $result);
            
            return response()->json([
                'success' => true,
                'message' => 'Walk-in appointment created successfully',
                'data' => $result
            ], 201);
            
        } catch (\Exception $e) {
            Log::error('Failed to create walk-in appointment', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create walk-in appointment: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get pending appointments for admin review
     */
    public function getPendingAppointments()
    {
        try {
            $pendingAppointments = Appointment::where('status', 'Pending')
                ->where('source', 'Online')
                ->with(['patient', 'specialist'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($appointment) {
                    return [
                        'appointment_id' => $appointment->appointment_id,
                        'appointment_code' => $appointment->appointment_code,
                        'patient_name' => $appointment->patient->first_name . ' ' . $appointment->patient->last_name,
                        'patient_id' => $appointment->patient_id,
                        'appointment_type' => $appointment->appointment_type,
                        'appointment_date' => $appointment->appointment_date,
                        'appointment_time' => $appointment->appointment_time,
                        'source' => $appointment->source,
                        'status' => $appointment->status,
                        'price' => $appointment->price,
                        'specialist_name' => $appointment->specialist ? $appointment->specialist->name : 'Not assigned',
                        'created_at' => $appointment->created_at
                    ];
                });
            
            return response()->json([
                'success' => true,
                'data' => $pendingAppointments
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to get pending appointments', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve pending appointments'
            ], 500);
        }
    }
    
    /**
     * Approve pending appointment
     */
    public function approveAppointment(Request $request, int $appointmentId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'specialist_id' => 'required|integer|exists:staff,staff_id',
                'admin_notes' => 'nullable|string'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $result = $this->appointmentService->approveAppointment($appointmentId, $request->all());
            
            Log::info('Appointment approved successfully', $result);
            
            return response()->json([
                'success' => true,
                'message' => 'Appointment approved successfully',
                'data' => $result
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to approve appointment', [
                'error' => $e->getMessage(),
                'appointment_id' => $appointmentId
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve appointment: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get all appointments for admin
     */
    public function getAllAppointments(Request $request)
    {
        try {
            $query = Appointment::with(['patient', 'specialist']);
            
            // Apply filters
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }
            
            if ($request->filled('source')) {
                $query->where('source', $request->source);
            }
            
            if ($request->filled('date_from')) {
                $query->whereDate('appointment_date', '>=', $request->date_from);
            }
            
            if ($request->filled('date_to')) {
                $query->whereDate('appointment_date', '<=', $request->date_to);
            }
            
            $appointments = $query->orderBy('created_at', 'desc')->get()
                ->map(function ($appointment) {
                    return [
                        'appointment_id' => $appointment->appointment_id,
                        'appointment_code' => $appointment->appointment_code,
                        'patient_name' => $appointment->patient->first_name . ' ' . $appointment->patient->last_name,
                        'patient_id' => $appointment->patient_id,
                        'appointment_type' => $appointment->appointment_type,
                        'appointment_date' => $appointment->appointment_date,
                        'appointment_time' => $appointment->appointment_time,
                        'source' => $appointment->source,
                        'status' => $appointment->status,
                        'billing_status' => $appointment->billing_status,
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
            Log::error('Failed to get all appointments', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve appointments'
            ], 500);
        }
    }
    
    /**
     * Get staff for appointment assignment
     */
    public function getStaff()
    {
        try {
            $staff = Staff::where('status', 'Active')
                ->orderBy('role')
                ->orderBy('name')
                ->get()
                ->map(function ($member) {
                    return [
                        'staff_id' => $member->staff_id,
                        'name' => $member->name,
                        'role' => $member->role,
                        'specialization' => $member->specialization
                    ];
                });
            
            return response()->json([
                'success' => true,
                'data' => $staff
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to get staff', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve staff'
            ], 500);
        }
    }
}

