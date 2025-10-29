<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\User;
use App\Models\Appointment;
use App\Models\PendingAppointment;
use App\Models\Notification;
use App\Services\PatientService;
use App\Services\AppointmentCreationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class OnlineAppointmentController extends Controller
{
    protected $patientService;
    protected $appointmentService;

    public function __construct(PatientService $patientService, AppointmentCreationService $appointmentService)
    {
        $this->patientService = $patientService;
        $this->appointmentService = $appointmentService;
    }

    /**
     * Show the online appointment form
     */
    public function show()
    {
        $user = auth()->user();
        
        // Try to find patient by user_id
        $patient = Patient::where('user_id', $user->id)->first();
        
            \Log::info('Online appointment form accessed', [
            'user_id' => $user->id,
            'has_patient' => $patient !== null,
            'patient_id' => $patient ? $patient->id : null,
            'patient_no' => $patient ? $patient->patient_no : null
        ]);

        // Get available doctors and medtechs with schedule data
        $doctors = \App\Models\Specialist::where('role', 'Doctor')
            ->when(Schema::hasColumn('specialists', 'status'), function($query) {
                return $query->where('status', 'Active');
            })
            ->select('specialist_id as id', 'name', 'specialization', 'specialist_code as employee_id', 'schedule_data')
            ->get()
            ->map(function ($doctor) {
                return [
                    'id' => $doctor->id,
                    'name' => $doctor->name,
                    'specialization' => $doctor->specialization ?? 'General Medicine',
                    'employee_id' => $doctor->employee_id,
                    'availability' => 'Mon-Fri 9AM-5PM',
                    'rating' => 4.8,
                    'experience' => '10+ years',
                    'nextAvailable' => now()->addDays(1)->format('M d, Y g:i A'),
                    'schedule_data' => $doctor->schedule_data,
                ];
            });

        $medtechs = \App\Models\Specialist::where('role', 'MedTech')
            ->when(Schema::hasColumn('specialists', 'status'), function($query) {
                return $query->where('status', 'Active');
            })
            ->select('specialist_id as id', 'name', 'specialization', 'specialist_code as employee_id', 'schedule_data')
            ->get()
            ->map(function ($medtech) {
                return [
                    'id' => $medtech->id,
                    'name' => $medtech->name,
                    'specialization' => $medtech->specialization ?? 'Medical Technology',
                    'employee_id' => $medtech->employee_id,
                    'availability' => 'Mon-Fri 8AM-6PM',
                    'rating' => 4.9,
                    'experience' => '8+ years',
                    'nextAvailable' => now()->addDays(1)->format('M d, Y g:i A'),
                    'schedule_data' => $medtech->schedule_data,
                ];
            });

        $appointmentTypes = [
            'general_consultation' => 'General Consultation',
            'cbc' => 'CBC',
            'fecalysis_test' => 'Fecalysis Test',
            'urinarysis_test' => 'Urinarysis Test',
        ];

        // Get notifications for the user
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'read' => $notification->read,
                    'created_at' => $notification->created_at->format('M d, Y H:i'),
                    'data' => $notification->data,
                ];
            });

        $unreadCount = Notification::where('user_id', $user->id)
            ->where('read', false)
            ->count();

        return Inertia::render('patient/online-appointment', [
            'user' => $user,
            'patient' => $patient,
            'doctors' => $doctors,
            'medtechs' => $medtechs,
            'appointmentTypes' => $appointmentTypes,
            'isExistingPatient' => $patient !== null, // Use existing patient if available
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
            'cache_bust' => time(), // Force refresh to prevent caching issues
        ]);
    }

    /**
     * Store online appointment request
     */
    public function store(Request $request)
    {
        \Log::info('OnlineAppointmentController@store called', [
            'user_id' => auth()->id(),
            'request_data' => $request->all(),
            'last_name' => $request->last_name,
            'first_name' => $request->first_name,
            'has_last_name' => !empty($request->last_name),
            'has_first_name' => !empty($request->first_name)
        ]);
        
        $user = auth()->user();
        
        // For online appointments, always use the form data provided
        // Don't check for existing patient to ensure correct data is used
        $patient = null;

        \Log::info('Online appointment store called', [
            'user_id' => $user->id,
            'using_form_data' => true,
            'request_data' => $request->all()
        ]);

        // Validate appointment data
        $appointmentValidator = Validator::make($request->all(), [
            'appointment_type' => 'required|string|in:general_consultation,cbc,fecalysis_test,urinarysis_test',
            'specialist_type' => 'required|string|in:doctor,medtech',
            'specialist_id' => 'required|string',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|string',
            'notes' => 'nullable|string|max:500',
            'special_requirements' => 'nullable|string|max:500',
            // Patient data validation
            'last_name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'birthdate' => 'required|date|before:today',
            'age' => 'required|integer|min:0|max:150',
            'sex' => 'required|in:male,female',
            'civil_status' => 'required|in:single,married,widowed,divorced,separated',
            'nationality' => 'nullable|string|max:255',
            'mobile_no' => 'required|string|max:20',
        ]);

        if ($appointmentValidator->fails()) {
            return back()->withErrors($appointmentValidator)->withInput();
        }

        try {
            // Get specialist
            $specialist = \App\Models\Specialist::find($request->specialist_id);
            if (!$specialist) {
                return back()->withErrors(['specialist_id' => 'Selected specialist not found.']);
            }

            // Check for time conflicts
            $conflictCheck = Appointment::where('specialist_id', $request->specialist_id)
                ->where('appointment_date', $request->appointment_date)
                ->where('appointment_time', $this->formatTimeForDatabase($request->appointment_time))
                ->where('status', '!=', 'Cancelled')
                ->exists();

            if ($conflictCheck) {
                return back()->withErrors(['appointment_time' => 'This time slot is already booked. Please choose another time.']);
            }

            // Get specialist information
            $specialistName = $specialist ? $specialist->name : 'Unknown Specialist';

            // Prepare appointment data
            $appointmentData = [
                'appointment_type' => $request->appointment_type,
                'specialist_type' => $request->specialist_type,
                'specialist_id' => $request->specialist_id,
                'specialist_name' => $specialistName, // Add specialist name
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $this->formatTimeForDatabase($request->appointment_time),
                'duration' => '30 min',
                'status' => 'Pending',
                'additional_info' => $request->notes,
                'source' => 'Online',
            ];

            // Calculate price
            $tempAppointment = new Appointment($appointmentData);
            $appointmentData['price'] = $tempAppointment->calculatePrice();

            // Always create a new patient with the form data to ensure correct information
            $patientData = [
                'user_id' => $user->id,
                'first_name' => $request->first_name ?? 'Not provided',
                'last_name' => $request->last_name ?? 'Not provided',
                'middle_name' => $request->middle_name ?? '',
                'birthdate' => $request->birthdate,
                'age' => $request->age ?? 0,
                'sex' => $request->sex ?? 'male',
                'civil_status' => $request->civil_status ?? 'single',
                'nationality' => $request->nationality ?? 'Filipino',
                'present_address' => $request->present_address ?? $request->address ?? 'To be completed',
                'address' => $request->present_address ?? $request->address ?? 'To be completed',
                'telephone_no' => $request->telephone_no ?? '',
                'mobile_no' => $request->mobile_no ?? '',
                'informant_name' => $request->informant_name ?? $request->emergency_name ?? 'Not provided',
                'relationship' => $request->relationship ?? $request->emergency_relation ?? 'Not provided',
                'company_name' => $request->company_name ?? $request->insurance_company ?? '',
                'hmo_name' => $request->hmo_name ?? '',
                'hmo_company_id_no' => $request->hmo_company_id_no ?? $request->hmo_id_no ?? '',
                'validation_approval_code' => $request->validation_approval_code ?? $request->approval_code ?? '',
                'validity' => $request->validity ?? '',
                'drug_allergies' => $request->drug_allergies ?? 'NONE',
                'food_allergies' => $request->food_allergies ?? 'NONE',
                'past_medical_history' => $request->past_medical_history ?? '',
                'family_history' => $request->family_history ?? '',
                'social_personal_history' => $request->social_personal_history ?? $request->social_history ?? '',
                'obstetrics_gynecology_history' => $request->obstetrics_gynecology_history ?? $request->obgyn_history ?? '',
            ];

            // Ensure required fields are not empty
            if (empty($patientData['last_name']) || $patientData['last_name'] === 'Not provided') {
                return back()->withErrors(['last_name' => 'Last name is required.'])->withInput();
            }
            if (empty($patientData['first_name']) || $patientData['first_name'] === 'Not provided') {
                return back()->withErrors(['first_name' => 'First name is required.'])->withInput();
            }

            // Create new patient with form data
            $appointmentService = app(\App\Services\AppointmentCreationService::class);
            $finalPatient = $appointmentService->createOrFindPatient($patientData);
            
            \Log::info('New patient created for online appointment with form data', [
                'patient_id' => $finalPatient->id,
                'patient_no' => $finalPatient->patient_no,
                'patient_name' => $finalPatient->first_name . ' ' . $finalPatient->last_name,
                'user_id' => $user->id
            ]);

            // Ensure we have a valid patient
            if (!$finalPatient) {
                \Log::error('Failed to create patient for online appointment', [
                    'user_id' => $user->id,
                    'form_data_provided' => !empty($patientData)
                ]);
                return back()->withErrors(['patient' => 'Failed to create patient. Please try again.']);
            }

            // Create appointment in PendingAppointment table (waiting for admin approval)
            $pendingAppointmentData = [
                'patient_id' => (string) $finalPatient->id,
                'patient_name' => $finalPatient->first_name . ' ' . $finalPatient->last_name,
                'contact_number' => $finalPatient->mobile_no ?? $finalPatient->telephone_no ?? '',
                'specialist_id' => (string) $request->specialist_id,
                'specialist_name' => $specialistName,
                'appointment_type' => $request->appointment_type,
                'specialist_type' => $request->specialist_type,
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $this->formatTimeForDatabase($request->appointment_time),
                'duration' => '30 min',
                'price' => $this->calculatePrice($request->appointment_type),
                'notes' => $request->notes,
                'special_requirements' => $request->special_requirements,
                'booking_method' => 'Online',
                'status' => 'Pending Approval',
                'status_approval' => 'pending',
            ];

            $appointment = \App\Models\PendingAppointment::create($pendingAppointmentData);

            \Log::info('Online appointment created successfully', [
                'appointment_id' => $appointment->id,
                'patient_id' => $finalPatient ? $finalPatient->id : 'not created',
                'patient_no' => $finalPatient ? $finalPatient->patient_no : 'TBD',
                'user_id' => $user->id
            ]);

            // Send notification to admin for approval using centralized service
            $notificationService = app(\App\Services\NotificationService::class);
            $notificationService->notifyNewPendingAppointment($appointment);

            return redirect()->route('patient.appointments')
                ->with('success', 'Online appointment request submitted successfully! Your appointment is pending admin approval. You will be notified once it\'s approved.')
                ->with('appointment_id', $appointment->id)
                ->with('appointment_status', 'pending');

        } catch (\Exception $e) {
            \Log::error('Failed to create online appointment', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'request_data' => $request->all()
            ]);

            return back()
                ->with('error', 'Failed to submit appointment request: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Handle duplicate patient creation
     */
    public function forceCreate(Request $request)
    {
        $request->merge(['force_create' => true]);
        return $this->store($request);
    }

    /**
     * Create patient from request data
     */
    private function createPatientFromRequest(Request $request)
    {
        // Validate patient data
        $patientValidator = Validator::make($request->all(), [
            // Patient Identification
            'last_name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'birthdate' => 'required|date|before:today',
            'age' => 'required|integer|min:0|max:150',
            'sex' => 'required|in:male,female',

            // Demographics
            'occupation' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'civil_status' => 'required|in:single,married,widowed,divorced,separated',
            'nationality' => 'nullable|string|max:255',

            // Contact Information (accepting both old and new field names)
            'present_address' => 'nullable|string|max:500',
            'address' => 'nullable|string|max:500',
            'telephone_no' => 'nullable|string|max:20',
            'mobile_no' => 'required|string|max:20',

            // Emergency Contact (accepting both old and new field names)
            'informant_name' => 'nullable|string|max:255',
            'emergency_name' => 'nullable|string|max:255',
            'relationship' => 'nullable|string|max:255',
            'emergency_relation' => 'nullable|string|max:255',

            // Financial/Insurance (accepting both old and new field names)
            'company_name' => 'nullable|string|max:255',
            'insurance_company' => 'nullable|string|max:255',
            'hmo_name' => 'nullable|string|max:255',
            'hmo_company_id_no' => 'nullable|string|max:255',
            'hmo_id_no' => 'nullable|string|max:255',
            'validation_approval_code' => 'nullable|string|max:255',
            'approval_code' => 'nullable|string|max:255',
            'validity' => 'nullable|string|max:255',

            // Medical History & Allergies (accepting both old and new field names)
            'drug_allergies' => 'nullable|string|max:500',
            'food_allergies' => 'nullable|string|max:500',
            'past_medical_history' => 'nullable|string|max:1000',
            'family_history' => 'nullable|string|max:1000',
            'social_personal_history' => 'nullable|string|max:1000',
            'social_history' => 'nullable|string|max:1000',
            'obstetrics_gynecology_history' => 'nullable|string|max:1000',
            'obgyn_history' => 'nullable|string|max:1000',
        ]);

        if ($patientValidator->fails()) {
            return null;
        }

        try {
            // Check for duplicate patient
            $duplicatePatient = $this->patientService->findDuplicate($request->all());
            if ($duplicatePatient && !$request->boolean('force_create')) {
                return back()
                    ->with('error', 'A possible duplicate patient was found.')
                    ->with('duplicate_patient', [
                        'id' => $duplicatePatient->id,
                        'patient_no' => $duplicatePatient->patient_no,
                        'last_name' => $duplicatePatient->last_name,
                        'first_name' => $duplicatePatient->first_name,
                        'birthdate' => $duplicatePatient->birthdate ? (is_string($duplicatePatient->birthdate) ? $duplicatePatient->birthdate : \Carbon\Carbon::parse($duplicatePatient->birthdate)->format('Y-m-d')) : null,
                        'mobile_no' => $duplicatePatient->mobile_no,
                    ])
                    ->withInput();
            }

            // Create patient record with correct column names
            $patientData = [
                'user_id' => auth()->user()->id,
                'last_name' => $request->last_name,
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'birthdate' => $request->birthdate,
                'age' => $request->age,
                'sex' => $request->sex,
                'occupation' => $request->occupation,
                'religion' => $request->religion,
                'civil_status' => $request->civil_status,
                'nationality' => $request->nationality,
                'present_address' => $request->present_address,
                'telephone_no' => $request->telephone_no,
                'mobile_no' => $request->mobile_no,
                'informant_name' => $request->informant_name,
                'relationship' => $request->relationship,
                'company_name' => $request->company_name,
                'hmo_name' => $request->hmo_name,
                'hmo_company_id_no' => $request->hmo_company_id_no,
                'validation_approval_code' => $request->validation_approval_code,
                'validity' => $request->validity,
                'drug_allergies' => $request->drug_allergies,
                'food_allergies' => $request->food_allergies,
                'past_medical_history' => $request->past_medical_history,
                'family_history' => $request->family_history,
                'social_personal_history' => $request->social_personal_history,
                'obstetrics_gynecology_history' => $request->obstetrics_gynecology_history,
            ];

            return $this->patientService->createPatient($patientData);

        } catch (\Exception $e) {
            \Log::error('Failed to create patient in online appointment', [
                'error' => $e->getMessage(),
                'user_id' => auth()->user()->id,
                'request_data' => $request->all()
            ]);
            return null;
        }
    }

    /**
     * Format time for database storage
     */
    private function formatTimeForDatabase($timeString)
    {
        // Convert from "10:00 AM" format to "10:00:00" format
        try {
            $time = \Carbon\Carbon::createFromFormat('g:i A', $timeString);
            return $time->format('H:i:s');
        } catch (\Exception $e) {
            // If parsing fails, try to parse as is
            return $timeString;
        }
    }


    /**
     * Get available staff members for appointment booking
     */
    public function getStaff()
    {
        try {
            $staff = \App\Models\Specialist::when(Schema::hasColumn('specialists', 'status'), function($query) {
                    return $query->where('status', 'Active');
                })
                ->orderBy('role')
                ->orderBy('name')
                ->get()
                ->map(function ($member) {
                    return [
                        'staff_id' => $member->specialist_id,
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
            \Log::error('Failed to get staff', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve staff'
            ], 500);
        }
    }
}
