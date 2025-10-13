<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\User;
use App\Models\Appointment;
use App\Models\PendingAppointment;
use App\Models\Notification;
use App\Services\PatientService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OnlineAppointmentController extends Controller
{
    protected $patientService;

    public function __construct(PatientService $patientService)
    {
        $this->patientService = $patientService;
    }

    /**
     * Show the online appointment form
     */
    public function show()
    {
        $user = auth()->user();
        $patient = Patient::where('user_id', $user->id)->first();

        // Get available doctors and medtechs
        $doctors = User::where('role', 'doctor')
            ->where('is_active', true)
            ->select('id', 'name', 'specialization', 'employee_id')
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
                ];
            });

        $medtechs = User::where('role', 'medtech')
            ->where('is_active', true)
            ->select('id', 'name', 'specialization', 'employee_id')
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
                ];
            });

        $appointmentTypes = [
            'general_consultation' => 'General Consultation',
            'cbc' => 'CBC',
            'fecalysis_test' => 'Fecalysis Test',
            'urinarysis_test' => 'Urinarysis Test',
        ];

        return Inertia::render('patient/online-appointment', [
            'user' => $user,
            'patient' => $patient,
            'doctors' => $doctors,
            'medtechs' => $medtechs,
            'appointmentTypes' => $appointmentTypes,
            'isExistingPatient' => $patient !== null,
        ]);
    }

    /**
     * Store online appointment request
     */
    public function store(Request $request)
    {
        \Log::info('OnlineAppointmentController@store called', [
            'user_id' => auth()->id(),
            'request_data' => $request->all()
        ]);
        
        $user = auth()->user();
        $patient = Patient::where('user_id', $user->id)->first();

        \Log::info('Online appointment store called', [
            'user_id' => $user->id,
            'has_patient' => $patient !== null,
            'request_data' => $request->all()
        ]);

        // If patient doesn't exist, create one first
        if (!$patient) {
            $patient = $this->createPatientFromRequest($request);
            if (!$patient) {
                \Log::error('Failed to create patient in online appointment', [
                    'user_id' => $user->id,
                    'request_data' => $request->all()
                ]);
                return back()->with('error', 'Failed to create patient record.')->withInput();
            }
        }

        // Validate appointment data
        $appointmentValidator = Validator::make($request->all(), [
            'appointment_type' => 'required|string|in:general_consultation,cbc,fecalysis_test,urinarysis_test',
            'specialist_type' => 'required|string|in:doctor,medtech',
            'specialist_id' => 'required|string',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|string',
            'notes' => 'nullable|string|max:500',
            'special_requirements' => 'nullable|string|max:500',
        ]);

        if ($appointmentValidator->fails()) {
            return back()->withErrors($appointmentValidator)->withInput();
        }

        try {
            DB::beginTransaction();

            // Get specialist
            $specialist = User::find($request->specialist_id);
            if (!$specialist) {
                DB::rollBack();
                return back()->withErrors(['specialist_id' => 'Selected specialist not found.']);
            }

            // Check for time conflicts
            $conflictCheck = Appointment::where('specialist_id', $request->specialist_id)
                ->where('appointment_date', $request->appointment_date)
                ->where('appointment_time', $this->formatTimeForDatabase($request->appointment_time))
                ->where('status', '!=', 'Cancelled')
                ->exists();

            if ($conflictCheck) {
                DB::rollBack();
                return back()->withErrors(['appointment_time' => 'This time slot is already booked. Please choose another time.']);
            }

            // Create pending appointment (requires admin approval)
            $pendingAppointmentData = [
                'patient_name' => $patient->first_name . ' ' . $patient->last_name,
                'patient_id' => $patient->patient_no,
                'contact_number' => $patient->mobile_no,
                'appointment_type' => $request->appointment_type,
                'specialist_type' => $request->specialist_type,
                'specialist_name' => $specialist->name,
                'specialist_id' => $request->specialist_id,
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $this->formatTimeForDatabase($request->appointment_time),
                'duration' => '30 min',
                'status' => 'Pending Approval',
                'billing_status' => 'pending',
                'notes' => $request->notes,
                'special_requirements' => $request->special_requirements,
                'booking_method' => 'Online',
                'status_approval' => 'pending',
                'appointment_source' => 'online',
            ];

            // Calculate price
            $pendingAppointment = new PendingAppointment($pendingAppointmentData);
            $pendingAppointmentData['price'] = $pendingAppointment->calculatePrice();

            $pendingAppointment = PendingAppointment::create($pendingAppointmentData);

            \Log::info('Pending appointment created', [
                'appointment_id' => $pendingAppointment->id,
                'patient_id' => $pendingAppointment->patient_id,
                'patient_no' => $patient->patient_no,
                'appointment_data' => $pendingAppointment->toArray()
            ]);

            // Send notification to admin for approval
            $this->notifyAdminPendingAppointment($pendingAppointment);

            DB::commit();

            \Log::info('Online appointment created successfully', [
                'pending_appointment_id' => $pendingAppointment->id,
                'patient_id' => $patient->id,
                'user_id' => $user->id
            ]);

            return redirect()->route('patient.dashboard')
                ->with('success', 'Online appointment request submitted successfully! You will be notified once it\'s approved by the admin.')
                ->with('pending_appointment_id', $pendingAppointment->id);

        } catch (\Exception $e) {
            DB::rollBack();
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

            // Contact Information
            'present_address' => 'required|string|max:500',
            'telephone_no' => 'nullable|string|max:20',
            'mobile_no' => 'required|string|max:20',

            // Emergency Contact
            'informant_name' => 'required|string|max:255',
            'relationship' => 'required|string|max:255',

            // Financial/Insurance
            'company_name' => 'nullable|string|max:255',
            'hmo_name' => 'nullable|string|max:255',
            'hmo_company_id_no' => 'nullable|string|max:255',
            'validation_approval_code' => 'nullable|string|max:255',
            'validity' => 'nullable|string|max:255',

            // Medical History & Allergies
            'drug_allergies' => 'nullable|string|max:500',
            'food_allergies' => 'nullable|string|max:500',
            'past_medical_history' => 'nullable|string|max:1000',
            'family_history' => 'nullable|string|max:1000',
            'social_personal_history' => 'nullable|string|max:1000',
            'obstetrics_gynecology_history' => 'nullable|string|max:1000',
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

            // Create patient record
            $patientData = $request->only([
                'last_name', 'first_name', 'middle_name', 'birthdate', 'age', 'sex',
                'occupation', 'religion', 'civil_status', 'nationality',
                'present_address', 'telephone_no', 'mobile_no',
                'informant_name', 'relationship',
                'company_name', 'hmo_name', 'hmo_company_id_no', 'validation_approval_code', 'validity',
                'drug_allergies', 'food_allergies', 'past_medical_history', 'family_history',
                'social_personal_history', 'obstetrics_gynecology_history'
            ]);

            $patientData['user_id'] = auth()->user()->id;
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
     * Notify admin users about pending appointment
     */
    private function notifyAdminPendingAppointment($pendingAppointment)
    {
        try {
            // Get all admin users
            $adminUsers = User::where('role', 'admin')->get();

            \Log::info('Sending notifications to admin users for online appointment', [
                'admin_count' => $adminUsers->count(),
                'pending_appointment_id' => $pendingAppointment->id
            ]);

            foreach ($adminUsers as $admin) {
                // Create notification
                $notification = Notification::create([
                    'type' => 'appointment_request',
                    'title' => 'New Online Appointment Request - Pending Approval',
                    'message' => "Patient {$pendingAppointment->patient_name} has requested an online appointment for {$pendingAppointment->appointment_type} on {$pendingAppointment->appointment_date} at {$pendingAppointment->appointment_time}. Please review and approve.",
                    'data' => [
                        'pending_appointment_id' => $pendingAppointment->id,
                        'patient_name' => $pendingAppointment->patient_name,
                        'appointment_type' => $pendingAppointment->appointment_type,
                        'appointment_date' => $pendingAppointment->appointment_date,
                        'appointment_time' => $pendingAppointment->appointment_time,
                        'specialist_name' => $pendingAppointment->specialist_name,
                        'status' => $pendingAppointment->status_approval,
                        'price' => $pendingAppointment->price,
                        'source' => 'online',
                    ],
                    'user_id' => $admin->id,
                    'read' => false,
                ]);

                \Log::info('Online appointment notification created successfully', [
                    'notification_id' => $notification->id,
                    'admin_id' => $admin->id,
                    'admin_name' => $admin->name
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to create admin notifications for online appointment', [
                'error' => $e->getMessage(),
                'pending_appointment_id' => $pendingAppointment->id
            ]);
        }
    }
}
