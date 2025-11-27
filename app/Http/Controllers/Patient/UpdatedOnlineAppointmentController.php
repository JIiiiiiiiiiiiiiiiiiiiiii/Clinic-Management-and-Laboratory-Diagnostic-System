<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\User;
use App\Models\Staff;
use App\Services\TransactionalAppointmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class UpdatedOnlineAppointmentController extends Controller
{
    protected $appointmentService;

    public function __construct(TransactionalAppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }

    /**
     * Show the online appointment form
     */
    public function show()
    {
        $user = auth()->user();
        $patient = Patient::where('user_id', $user->id)->first();

        // Get available doctors and medtechs from staff table
        $doctors = Staff::where('role', 'Doctor')->where('status', 'Active')->get();
        $medtechs = Staff::where('role', 'MedTech')->where('status', 'Active')->get();

        $appointmentTypes = [
            'general_consultation' => 'General Consultation',
            'cbc' => 'Complete Blood Count (CBC)',
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
            'cache_bust' => time(),
        ]);
    }

    /**
     * Store online appointment request
     */
    public function store(Request $request)
    {
        \Log::info('UpdatedOnlineAppointmentController@store called', [
            'user_id' => auth()->id(),
            'request_data' => $request->all()
        ]);

        $user = auth()->user();
        $patient = Patient::where('user_id', $user->id)->first();

        // Validate appointment data
        $appointmentValidator = Validator::make($request->all(), [
            'appointment_type' => 'required|string|in:general_consultation,cbc,fecalysis_test,urinarysis_test',
            'specialist_type' => 'required|string|in:doctor,medtech',
            'specialist_id' => 'required|integer',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|string',
            'notes' => 'nullable|string|max:500',
            'special_requirements' => 'nullable|string|max:500',
        ]);

        if ($appointmentValidator->fails()) {
            return back()->withErrors($appointmentValidator)->withInput();
        }

        try {
            // Get specialist
            $specialist = Staff::find($request->specialist_id);
            if (!$specialist) {
                return back()->withErrors(['specialist_id' => 'Selected specialist not found.']);
            }

            // Check for time conflicts
            $conflictCheck = \App\Models\Appointment::where('specialist_id', $request->specialist_id)
                ->where('appointment_date', $request->appointment_date)
                ->where('appointment_time', $this->formatTimeForDatabase($request->appointment_time))
                ->where('status', '!=', 'Cancelled')
                ->exists();

            if ($conflictCheck) {
                return back()->withErrors(['appointment_time' => 'This time slot is already booked. Please choose another time.']);
            }

            // Prepare appointment data
            $appointmentData = [
                'appointment_type' => $request->appointment_type,
                'specialist_type' => ucfirst($request->specialist_type),
                'specialist_id' => $request->specialist_id,
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $this->formatTimeForDatabase($request->appointment_time),
                'duration' => '30 min',
                'price' => $this->calculatePrice($request->appointment_type),
                'additional_info' => $request->notes,
            ];

            // Prepare patient data if patient doesn't exist
            $patientData = null;
            if (!$patient) {
                $patientData = [
                    'user_id' => $user->id,
                    'last_name' => $request->last_name,
                    'first_name' => $request->first_name,
                    'middle_name' => $request->middle_name,
                    'birthdate' => $request->birthdate,
                    'age' => $request->age,
                    'sex' => $request->sex,
                    'nationality' => $request->nationality,
                    'civil_status' => $request->civil_status,
                    'address' => $request->address,
                    'telephone_no' => $request->telephone_no,
                    'mobile_no' => $request->mobile_no,
                    'emergency_name' => $request->emergency_name,
                    'emergency_relation' => $request->emergency_relation,
                    'insurance_company' => $request->insurance_company,
                    'hmo_name' => $request->hmo_name,
                    'hmo_id_no' => $request->hmo_id_no,
                    'approval_code' => $request->approval_code,
                    'validity' => $request->validity,
                    'drug_allergies' => $request->drug_allergies,
                    'past_medical_history' => $request->past_medical_history,
                    'family_history' => $request->family_history,
                    'social_history' => $request->social_history,
                    'obgyn_history' => $request->obgyn_history,
                    'status' => 'Active',
                ];
            } else {
                $appointmentData['existing_patient_id'] = $patient->patient_id;
            }

            // Create online appointment using transactional service
            $result = $this->appointmentService->createOnlineAppointment($appointmentData, $patientData);

            \Log::info('Online appointment created successfully', [
                'appointment_id' => $result['appointment_id'],
                'appointment_code' => $result['appointment_code'],
                'patient_id' => $result['patient_id'],
                'patient_code' => $result['patient_code']
            ]);

            return redirect()->route('patient.appointments')
                ->with('success', 'Online appointment request submitted successfully! Your appointment is pending admin approval. You will be notified once it\'s approved.')
                ->with('appointment_id', $result['appointment_id'])
                ->with('appointment_code', $result['appointment_code'])
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
     * Format time for database storage
     */
    private function formatTimeForDatabase($time)
    {
        return date('H:i:s', strtotime($time));
    }

    /**
     * Calculate price based on appointment type
     */
    private function calculatePrice($appointmentType)
    {
        return match($appointmentType) {
            'general_consultation' => 350.00,
            'consultation' => 350.00,
            'cbc' => 245.00,
            'fecalysis_test' => 90.00,
            'fecalysis' => 90.00,
            'urinarysis_test' => 140.00,
            'urinalysis' => 140.00,
            default => 0.00
        };
    }
}

