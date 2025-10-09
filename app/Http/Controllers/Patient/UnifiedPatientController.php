<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\PendingAppointment;
use App\Models\User;
use App\Services\PatientService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class UnifiedPatientController extends Controller
{
    public function create()
    {
        $user = auth()->user();
        
        // Get doctors and medtechs
        $doctors = User::where('role', 'doctor')
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'specialization' => $user->specialization ?? 'General Practice',
                    'employee_id' => $user->employee_id ?? 'N/A',
                    'availability' => $user->availability ?? 'Mon-Fri 9AM-5PM',
                    'rating' => $user->rating ?? 4.5,
                    'experience' => $user->experience ?? '5+ years',
                    'nextAvailable' => $user->nextAvailable ?? 'Tomorrow 9:00 AM'
                ];
            });

        $medtechs = User::where('role', 'medtech')
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'specialization' => $user->specialization ?? 'Medical Technology',
                    'employee_id' => $user->employee_id ?? 'N/A',
                    'availability' => $user->availability ?? 'Mon-Fri 8AM-5PM',
                    'rating' => $user->rating ?? 4.5,
                    'experience' => $user->experience ?? '3+ years',
                    'nextAvailable' => $user->nextAvailable ?? 'Tomorrow 8:00 AM'
                ];
            });

        return Inertia::render('patient/UnifiedPatientRegistration', [
            'user' => $user,
            'doctors' => $doctors,
            'medtechs' => $medtechs,
        ]);
    }

    public function store(Request $request, PatientService $patientService, NotificationService $notificationService)
    {
        try {
            // Validate the request data
            $validator = Validator::make($request->all(), [
                // Patient information validation
                'last_name' => 'required|string|max:255',
                'first_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'birthdate' => 'required|date',
                'age' => 'required|integer|min:0|max:150',
                'sex' => 'required|in:male,female',
                'civil_status' => 'required|string|max:50',
                'nationality' => 'nullable|string|max:100',
                'present_address' => 'required|string|max:500',
                'telephone_no' => 'nullable|string|max:20',
                'mobile_no' => 'required|string|max:20',
                'informant_name' => 'required|string|max:255',
                'relationship' => 'required|string|max:100',
                'company_name' => 'nullable|string|max:255',
                'hmo_name' => 'nullable|string|max:255',
                'hmo_company_id_no' => 'nullable|string|max:100',
                'validation_approval_code' => 'nullable|string|max:100',
                'validity' => 'nullable|string|max:100',
                'drug_allergies' => 'nullable|string|max:500',
                'food_allergies' => 'nullable|string|max:500',
                'past_medical_history' => 'nullable|string|max:1000',
                'family_history' => 'nullable|string|max:1000',
                'social_personal_history' => 'nullable|string|max:1000',
                'obstetrics_gynecology_history' => 'nullable|string|max:1000',
                
                // Appointment information validation
                'appointment_type' => 'required|string|in:consultation,checkup,fecalysis,cbc,urinalysis,x-ray,ultrasound',
                'specialist_type' => 'required|string|in:doctor,medtech',
                'specialist_id' => 'required|string',
                'appointment_date' => 'required|date|after_or_equal:today',
                'appointment_time' => 'required|string',
                'duration' => 'nullable|string|max:20',
                'notes' => 'nullable|string|max:500',
                'special_requirements' => 'nullable|string|max:500',
                'price' => 'required|numeric|min:0',
            ]);

            if ($validator->fails()) {
                return back()->withErrors($validator)->withInput();
            }

            $validated = $validator->validated();

            // Check for duplicate patient
            $duplicatePatient = $patientService->findDuplicate($validated);
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

            DB::beginTransaction();

            try {
                // Create the patient
                $patient = $patientService->createPatient($validated);

                // Get specialist information
                $specialist = User::find($validated['specialist_id']);
                if (!$specialist) {
                    throw new \Exception('Selected specialist not found.');
                }

                // Check for time conflicts in both confirmed appointments and pending appointments
                $conflictCheck = Appointment::where('specialist_id', $validated['specialist_id'])
                    ->where('appointment_date', $validated['appointment_date'])
                    ->where('appointment_time', $validated['appointment_time'])
                    ->where('status', '!=', 'cancelled')
                    ->exists();

                $pendingConflictCheck = PendingAppointment::where('specialist_id', $validated['specialist_id'])
                    ->where('appointment_date', $validated['appointment_date'])
                    ->where('appointment_time', $validated['appointment_time'])
                    ->where('status_approval', '!=', 'rejected')
                    ->exists();

                if ($conflictCheck || $pendingConflictCheck) {
                    throw new \Exception('The selected time slot is already booked. Please choose a different time.');
                }

                // Create the pending appointment (waiting for admin approval)
                $pendingAppointment = PendingAppointment::create([
                    'patient_name' => $patient->first_name . ' ' . $patient->last_name,
                    'patient_id' => $patient->patient_no,
                    'contact_number' => $patient->mobile_no,
                    'specialist_id' => $validated['specialist_id'],
                    'appointment_type' => $validated['appointment_type'],
                    'specialist_type' => $validated['specialist_type'],
                    'specialist_name' => $specialist->name,
                    'appointment_date' => $validated['appointment_date'],
                    'appointment_time' => $validated['appointment_time'],
                    'duration' => $validated['duration'] ?? '30 min',
                    'status' => 'pending',
                    'status_approval' => 'pending',
                    'appointment_source' => 'online',
                    'booking_method' => 'Online',
                    'notes' => $validated['notes'] ?? '',
                    'special_requirements' => $validated['special_requirements'] ?? '',
                    'price' => $validated['price'],
                ]);

                // Send notifications for pending appointment
                $notificationService->notifyNewPendingAppointment($pendingAppointment);

                DB::commit();

                Log::info('Unified patient registration and pending appointment created', [
                    'patient_id' => $patient->id,
                    'pending_appointment_id' => $pendingAppointment->id,
                    'user_id' => auth()->id(),
                ]);

                return redirect()->route('patient.dashboard')
                    ->with('success', 'Patient registration and appointment request submitted successfully! Your appointment is pending admin approval. You will receive notifications once approved.')
                    ->with('created_patient', [
                        'id' => $patient->id,
                        'last_name' => $patient->last_name,
                        'first_name' => $patient->first_name,
                        'age' => $patient->age,
                        'sex' => $patient->sex,
                    ])
                    ->with('created_pending_appointment', [
                        'id' => $pendingAppointment->id,
                        'appointment_type' => $pendingAppointment->appointment_type,
                        'appointment_date' => $pendingAppointment->appointment_date,
                        'appointment_time' => $pendingAppointment->appointment_time,
                        'specialist_name' => $specialist->name,
                        'status' => 'Pending Approval',
                    ]);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Throwable $e) {
            Log::error('Unified patient registration and appointment booking failed', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
                'request_data' => $request->all(),
            ]);

            return back()
                ->with('error', 'Failed to complete registration and booking: ' . $e->getMessage())
                ->withInput();
        }
    }
}


