<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\BillingTransaction;
use App\Models\AppointmentBillingLink;
use App\Models\Patient;
use App\Models\PendingAppointment;
use App\Models\Visit;
use App\Models\User;
use App\Models\Staff;
use App\Services\AppointmentCreationService;
use App\Services\PatientService;
use App\Services\AppointmentAutomationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Appointment::query();

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhereHas('patient', function($patientQuery) use ($search) {
                      $patientQuery->where('first_name', 'like', "%{$search}%")
                                   ->orWhere('last_name', 'like', "%{$search}%")
                                   ->orWhere('patient_no', 'like', "%{$search}%");
                  })
                  ->orWhereHas('specialist', function($specialistQuery) use ($search) {
                      $specialistQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('date') && $request->date !== 'all') {
            if ($request->date === 'today') {
                $query->whereDate('appointment_date', Carbon::today());
            } elseif ($request->date === 'tomorrow') {
                $query->whereDate('appointment_date', Carbon::tomorrow());
            } elseif ($request->date === 'this_week') {
                $query->whereBetween('appointment_date', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ]);
            }
        }

        if ($request->filled('specialist') && $request->specialist !== 'all') {
            $query->where('specialist_id', $request->specialist);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'appointment_date');
        $sortDir = $request->get('sort_dir', 'asc');
        
        // Validate sort column to prevent SQL injection
        $allowedSortColumns = ['id', 'appointment_date', 'appointment_time', 'status', 'price', 'final_total_amount', 'total_lab_amount', 'created_at', 'patient_name', 'specialist_name', 'patient_id'];
        if (!in_array($sortBy, $allowedSortColumns)) {
            $sortBy = 'appointment_date';
        }
        
        // Validate sort direction
        $sortDir = in_array(strtolower($sortDir), ['asc', 'desc']) ? strtolower($sortDir) : 'asc';

        // Get all appointments from single source (appointments table only)
        if ($sortBy === 'patient_id') {
            // For patient_id sorting, we need to join with patients table to sort by sequence_number
            $appointments = $query->with(['patient', 'specialist', 'billingTransactions'])
                                ->leftJoin('patients', 'appointments.patient_id', '=', 'patients.id')
                                ->orderBy('patients.sequence_number', $sortDir)
                                ->select('appointments.*')
                                ->get();
        } else {
            $appointments = $query->with(['patient', 'specialist', 'billingTransactions'])
                                ->orderBy($sortBy, $sortDir)
                                ->get();
        }
        
        // Transform appointments to include proper field names for frontend
        $transformedAppointments = $appointments->map(function($appointment) {
            return [
                'id' => $appointment->id,
                'appointment_code' => 'A' . str_pad($appointment->id, 4, '0', STR_PAD_LEFT),
                'patient_id' => $appointment->patient_id,
                'patient_name' => $appointment->patient ? trim($appointment->patient->first_name . ' ' . $appointment->patient->last_name) : 'Unknown Patient',
                'patient_id_display' => $appointment->patient ? $appointment->patient->patient_no : 'N/A',
                'contact_number' => $appointment->patient ? $appointment->patient->mobile_no : 'N/A',
                'specialist_id' => $appointment->specialist_id,
                'specialist_name' => $appointment->specialist ? $appointment->specialist->name : 'Unknown Specialist',
                'doctor' => $appointment->specialist ? $appointment->specialist->name : 'Unknown Specialist',
                'appointment_type' => $appointment->appointment_type,
                'specialist_type' => $appointment->specialist_type,
                'appointment_date' => $appointment->appointment_date,
                'appointment_time' => $appointment->appointment_time,
                'duration' => $appointment->duration,
                'price' => $appointment->price,
                'total_lab_amount' => $appointment->total_lab_amount ?? 0,
                'final_total_amount' => $appointment->final_total_amount ?? $appointment->price,
                'additional_info' => $appointment->additional_info,
                'source' => $appointment->source,
                'status' => $appointment->status,
                'admin_notes' => $appointment->admin_notes,
                'billing_transactions' => $appointment->billingTransactions ? $appointment->billingTransactions->map(function($transaction) {
                    return [
                        'id' => $transaction->id,
                        'transaction_id' => $transaction->transaction_id,
                        'total_amount' => $transaction->total_amount,
                        'status' => $transaction->status,
                        'created_at' => $transaction->created_at,
                    ];
                }) : [],
                'created_at' => $appointment->created_at,
                'updated_at' => $appointment->updated_at,
            ];
        });

        // Use single source - no duplication
        $allAppointments = $transformedAppointments;

        // Debug: Log appointments count and details
        \Log::info('Appointments found: ' . $appointments->count());
        \Log::info('Transformed appointments data:', $transformedAppointments->toArray());

        // Get next available patient ID with smart reset logic
        $nextPatientId = $this->getNextAvailablePatientId();

        // Get doctors and medtechs for the component
        $doctors = \App\Models\Staff::where('role', 'Doctor')
            ->select('staff_id as id', 'name', 'specialization', 'staff_code as employee_id')
            ->get();

        $medtechs = \App\Models\Staff::where('role', 'MedTech')
            ->select('staff_id as id', 'name', 'specialization', 'staff_code as employee_id')
            ->get();

        return Inertia::render('admin/appointments/index', [
            'appointments' => [
                'data' => $allAppointments,
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => $allAppointments->count(),
                'total' => $allAppointments->count()
            ],
            'filters' => $request->only(['search', 'status', 'date', 'specialist']),
            'nextPatientId' => $nextPatientId,
            'doctors' => $doctors,
            'medtechs' => $medtechs
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/appointments/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, AppointmentAutomationService $automationService)
    {
        \Log::info('Admin\AppointmentController@store called', [
            'user_id' => auth()->id(),
            'user_role' => auth()->user()->role ?? 'unknown',
            'request_data' => $request->all()
        ]);
        
        $validator = Validator::make($request->all(), [
            // Patient fields
            'patient_id' => 'nullable|integer|exists:patients,id',
            'last_name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'birthdate' => 'required|date',
            'age' => 'required|integer|min:0',
            'sex' => 'required|in:Male,Female',
            'nationality' => 'nullable|string|max:50',
            'civil_status' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'telephone_no' => 'nullable|string|max:20',
            'mobile_no' => 'required|string|max:20',
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
            
            // Appointment fields
            'appointment_type' => 'required|string',
            'specialist_type' => 'required|in:Doctor,MedTech',
            'specialist_id' => 'required|integer|exists:users,id',
            'appointment_date' => 'required|date',
            'appointment_time' => 'required|string',
            'duration' => 'nullable|string|max:50',
            'price' => 'nullable|numeric|min:0',
            'additional_info' => 'nullable|string',
            'admin_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            \Log::error('Validation failed:', $validator->errors()->toArray());
            \Log::error('Request data:', $request->all());
            return back()->withErrors($validator)->withInput();
        }

        try {
            DB::beginTransaction();

            // Create or find patient
            $patientData = [
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
            ];

            $patient = $automationService->createOrFindPatient($patientData);

            // Create appointment data
            $appointmentData = [
                'patient_id' => $patient->patient_id,
                'specialist_id' => $request->specialist_id,
                'appointment_type' => $request->appointment_type,
                'specialist_type' => $request->specialist_type,
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $request->appointment_time,
                'duration' => $request->duration ?? '30 min',
                'price' => $request->price,
                'additional_info' => $request->additional_info,
                'admin_notes' => $request->admin_notes,
                'source' => 'Walk-in',
                'status' => 'Confirmed',
            ];

            // Create appointment directly
            $appointment = Appointment::create($appointmentData);

            DB::commit();

            \Log::info('Appointment created successfully', [
                'appointment_id' => $appointment->id,
                'patient_id' => $patient->patient_id,
                'visit_created' => $appointment->visit ? 'yes' : 'no',
                'billing_created' => $appointment->billingTransactions()->exists() ? 'yes' : 'no'
            ]);

            return redirect()->route('admin.appointments.index')
                            ->with('success', 'Walk-in appointment created successfully! Patient, appointment, visit, and billing records have been created.');
        } catch (\Exception $e) {
            DB::rollback();
            \Log::error('Failed to create appointment:', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to create appointment: ' . $e->getMessage()]);
        }
    }


    /**
     * Delete patient and all related records (cascade delete)
     */
    public function destroyPatient($patient_id, AppointmentCreationService $appointmentService)
    {
        try {
            $appointmentService->deletePatientWithCascade($patient_id);
            
            return response()->json([
                'message' => 'Patient and all related records deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete patient: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete appointment only (patient remains)
     */
    public function destroy($id, AppointmentCreationService $appointmentService)
    {
        try {
            $appointmentService->deleteAppointmentOnly($id);
            
            return response()->json([
                'message' => 'Appointment deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete appointment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the next available patient ID with smart reset logic
     * If P001 is deleted, start from P001 again instead of continuing from highest number
     */
    private function getNextAvailablePatientId()
    {
        // Get all existing patient IDs from patients table
        $existingPatientIds = \App\Models\Patient::where('patient_no', 'like', 'P%')
            ->get()
            ->pluck('patient_no')
            ->map(function($code) {
                return (int) substr($code, 1);
            })->toArray();
        
        // If no IDs exist, start with P001
        if (empty($existingPatientIds)) {
            return 'P001';
        }
        
        // Find the first missing ID starting from 1
        for ($i = 1; $i <= 999; $i++) {
            if (!in_array($i, $existingPatientIds)) {
                return 'P' . str_pad($i, 3, '0', STR_PAD_LEFT);
            }
        }
        
        // If all IDs 1-999 are taken, find the next available
        $maxId = max($existingPatientIds);
        return 'P' . str_pad($maxId + 1, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Display the specified resource.
     */
    public function show(Appointment $appointment)
    {
        // Format the appointment data for frontend display
        $formattedAppointment = [
            'id' => $appointment->id,
            'patient_name' => $appointment->patient_name,
            'patient_id' => $appointment->patient_id,
            'contact_number' => $appointment->contact_number,
            'appointment_type' => $appointment->appointment_type,
            'price' => $appointment->price,
            'specialist_type' => $appointment->specialist_type,
            'specialist_name' => $appointment->specialist_name,
            'specialist_id' => $appointment->specialist_id,
            'appointment_date' => $appointment->appointment_date ? $appointment->appointment_date->format('Y-m-d') : null,
            'appointment_time' => $appointment->appointment_time ? $appointment->appointment_time->format('H:i:s') : null,
            'duration' => $appointment->duration,
            'status' => $appointment->status,
            'billing_status' => $appointment->billing_status,
            'notes' => $appointment->notes,
            'special_requirements' => $appointment->special_requirements,
            'created_at' => $appointment->created_at,
            'updated_at' => $appointment->updated_at,
            'patient' => $appointment->patient,
            'specialist' => $appointment->specialist,
            'visits' => $appointment->visits,
            'billingTransactions' => $appointment->billingTransactions
        ];

        return Inertia::render('admin/appointments/show', [
            'appointment' => $formattedAppointment
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Appointment $appointment)
    {
        return Inertia::render('admin/appointments/edit', [
            'appointment' => $appointment
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Appointment $appointment)
    {
        // Debug: Log the incoming request data
        \Log::info('Appointment update request data:', $request->all());
        \Log::info('Current appointment data:', $appointment->toArray());
        
        $validator = Validator::make($request->all(), [
            'patient_name' => 'required|string|max:255',
            'patient_id' => 'required|string|max:50',
            'contact_number' => 'nullable|string|max:20',
            'appointment_type' => 'required|string|in:consultation,checkup,fecalysis,cbc,urinalysis,Follow-up',
            'specialist_type' => 'required|string|in:doctor,medtech',
            'specialist_name' => 'required|string|max:255',
            'specialist_id' => 'required|string|max:50',
            'appointment_date' => 'required|date',
            'appointment_time' => 'required|string',
            'duration' => 'nullable|string|max:20',
            'status' => 'nullable|string|in:Pending,Confirmed,Completed,Cancelled',
            'notes' => 'nullable|string',
            'special_requirements' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            \Log::error('Appointment update validation failed:', $validator->errors()->toArray());
            \Log::error('Request data:', $request->all());
            return back()->withErrors($validator)->withInput();
        }

        try {
            // Prepare update data
            $updateData = $request->all();
            
            // Format the time properly for time field
            $time = $request->appointment_time;
            if (strpos($time, ':') === false) {
                // If time doesn't have colon, assume it's in HHMM format
                $time = substr($time, 0, 2) . ':' . substr($time, 2, 2);
            }
            
            // Ensure time is in HH:MM:SS format for database storage
            if (strlen($time) === 5) {
                $time .= ':00'; // Add seconds if not present
            }
            $updateData['appointment_time'] = $time;
            
            // Recalculate price if appointment type changed
            if ($request->appointment_type !== $appointment->appointment_type) {
                $tempAppointment = new Appointment($updateData);
                $updateData['price'] = $tempAppointment->calculatePrice();
            }
            
            // Store old status for comparison
            $oldStatus = $appointment->status;
            
            // Update the appointment
            $appointment->update($updateData);
            
            // If status changed, broadcast to patient
            if ($oldStatus !== $appointment->status) {
                $notificationService = new \App\Services\NotificationService();
                $notificationService->notifyAppointmentStatusChange($appointment);
                
                // Broadcast real-time notification to patient
                $realtimeController = new \App\Http\Controllers\Admin\RealtimeAppointmentController($notificationService);
                $realtimeController->broadcastAppointmentStatusChange($appointment);
            }
            
            \Log::info('Appointment updated successfully:', ['id' => $appointment->id]);

            return redirect()->route('admin.appointments.index')
                            ->with('success', 'Appointment updated successfully!');
        } catch (\Exception $e) {
            \Log::error('Failed to update appointment:', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to update appointment. Please try again.']);
        }
    }


    /**
     * Update appointment status
     */
    public function updateStatus(Request $request, Appointment $appointment)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:Pending,Confirmed,Completed,Cancelled'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $appointment->update([
            'status' => $request->status,
        ]);

        return back()->with('success', 'Appointment status updated successfully!');
    }

    /**
     * Approve online appointment
     */
    public function approveAppointment(Request $request, Appointment $appointment, AppointmentAutomationService $automationService)
    {
        try {
            DB::beginTransaction();

            $appointment = $automationService->approveAppointment($appointment);

            DB::commit();

            return back()->with('success', 'Online appointment approved successfully! Visit and billing records have been created.');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to approve appointment: ' . $e->getMessage()]);
        }
    }

    /**
     * Get appointments for a specific date
     */
    public function getByDate(Request $request)
    {
        $date = $request->date ?? Carbon::today()->format('Y-m-d');
        
        $appointments = Appointment::whereDate('appointment_date', $date)
                                 ->orderBy('appointment_time', 'asc')
                                 ->get();

        return response()->json($appointments);
    }

    /**
     * Get appointment statistics
     */
    public function getStats()
    {
        $stats = [
            'total' => Appointment::count(),
            'pending' => Appointment::pending()->count(),
            'confirmed' => Appointment::confirmed()->count(),
            'completed' => Appointment::completed()->count(),
            'cancelled' => Appointment::cancelled()->count(),
            'today' => Appointment::byDate(Carbon::today())->count(),
            'this_week' => Appointment::whereBetween('appointment_date', [
                Carbon::now()->startOfWeek(),
                Carbon::now()->endOfWeek()
            ])->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Store a walk-in appointment (admin creates appointment for walk-in patient)
     */
    public function storeWalkIn(Request $request)
    {
        try {
            DB::beginTransaction();

            // Validate the request
            $validator = Validator::make($request->all(), [
                // Patient fields
                'last_name' => 'required|string|max:255',
                'first_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'birthdate' => 'required|date',
                'age' => 'required|integer|min:0',
                'sex' => 'required|in:male,female',
                'civil_status' => 'required|string',
                'nationality' => 'nullable|string|max:255',
                'present_address' => 'required|string',
                'telephone_no' => 'nullable|string|max:20',
                'mobile_no' => 'required|string|max:20',
                'emergency_name' => 'nullable|string|max:255',
                'emergency_relation' => 'nullable|string|max:255',
                'informant_name' => 'nullable|string|max:255',
                'relationship' => 'nullable|string|max:255',
                'company_name' => 'nullable|string|max:255',
                'hmo_name' => 'nullable|string|max:255',
                'hmo_company_id_no' => 'nullable|string|max:255',
                'validation_approval_code' => 'nullable|string|max:255',
                'validity' => 'nullable|string|max:255',
                'drug_allergies' => 'nullable|string',
                'food_allergies' => 'nullable|string',
                'past_medical_history' => 'nullable|string',
                'family_history' => 'nullable|string',
                'social_personal_history' => 'nullable|string',
                'obstetrics_gynecology_history' => 'nullable|string',
                
                // Appointment fields
                'appointment_type' => 'required|string',
                'specialist_type' => 'required|in:doctor,medtech',
                'specialist_id' => 'required|integer',
                'appointment_date' => 'required|date',
                'appointment_time' => 'required|string',
                'notes' => 'nullable|string',
                'special_requirements' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return back()->withErrors($validator)->withInput();
            }

            // Get specialist info
            $specialist = \App\Models\Staff::findOrFail($request->specialist_id);
            
            // Convert time format from "3:30 PM" to "15:30:00"
            $timeFormatted = Carbon::createFromFormat('g:i A', $request->appointment_time)->format('H:i:s');
            
            // Prepare patient data
            $patientData = [
                'last_name' => $request->last_name,
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'birthdate' => $request->birthdate,
                'age' => $request->age,
                'sex' => $request->sex,
                'civil_status' => $request->civil_status,
                'nationality' => $request->nationality,
                'present_address' => $request->present_address,
                'telephone_no' => $request->telephone_no,
                'mobile_no' => $request->mobile_no,
                'emergency_name' => $request->emergency_name ?? $request->informant_name,
                'emergency_relation' => $request->emergency_relation ?? $request->relationship,
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

            // Create patient directly
            $patient = \App\Models\Patient::create($patientData);

            // Create appointment data
            $appointmentData = [
                'patient_id' => $patient->patient_id,
                'specialist_id' => $request->specialist_id,
                'appointment_type' => $request->appointment_type,
                'specialist_type' => $request->specialist_type,
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $timeFormatted,
                'duration' => '30 min',
                'price' => null, // Will be calculated using Appointment model's calculatePrice method
                'additional_info' => $request->notes,
                'admin_notes' => $request->special_requirements,
                'source' => 'Walk-in',
                'status' => 'Confirmed',
            ];

            // Create appointment
            $appointment = \App\Models\Appointment::create($appointmentData);

            // Calculate and set price using the model's calculatePrice method
            $calculatedPrice = $appointment->calculatePrice();
            $appointment->update(['price' => $calculatedPrice]);

            // Generate visit code before creation
            $nextId = \App\Models\Visit::max('id') + 1;
            $visitCode = 'V' . str_pad($nextId, 4, '0', STR_PAD_LEFT);

            // Create visit automatically for walk-in appointments
            // Format the visit date properly - combine appointment date and time
            $appointmentDate = $appointment->appointment_date;
            $appointmentTime = $appointment->appointment_time;
            
            // Handle different date/time formats
            if (is_string($appointmentDate)) {
                $appointmentDate = date('Y-m-d', strtotime($appointmentDate));
            } else {
                $appointmentDate = $appointmentDate->format('Y-m-d');
            }
            
            if (is_string($appointmentTime)) {
                $appointmentTime = date('H:i:s', strtotime($appointmentTime));
            } else {
                $appointmentTime = $appointmentTime->format('H:i:s');
            }
            
            $visitDateTime = $appointmentDate . ' ' . $appointmentTime;
            
            $visit = \App\Models\Visit::create([
                'appointment_id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'visit_date_time_time' => $visitDateTime,
                'visit_date_time' => $visitDateTime,
                'purpose' => $appointment->appointment_type,
                'attending_staff_id' => $appointment->specialist_id,
                'status' => 'Ongoing',
                'visit_code' => $visitCode,
            ]);

            // Create billing transaction for walk-in appointments
            $billingTransaction = \App\Models\BillingTransaction::create([
                'appointment_id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'doctor_id' => $appointment->specialist_type === 'doctor' ? $appointment->specialist_id : null,
                'medtech_id' => $appointment->specialist_type === 'medtech' ? $appointment->specialist_id : null,
                'amount' => $appointment->price,
                'status' => 'Pending',
            ]);

            DB::commit();

            \Log::info('Walk-in appointment created successfully', [
                'appointment_id' => $appointment->id,
                'patient_id' => $patient->patient_id,
                'visit_id' => $visit->visit_id,
                'transaction_id' => $billingTransaction->transaction_id
            ]);

            return redirect()->route('admin.appointments.index')
                ->with('success', 'Walk-in appointment created successfully for ' . $patient->first_name . ' ' . $patient->last_name . '. Visit and billing transaction have been created.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->with('error', 'Failed to create walk-in appointment: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Calculate price based on appointment type
     */
    private function calculatePrice($appointmentType)
    {
        $prices = [
            'consultation' => 500.00,
            'checkup' => 300.00,
            'fecalysis' => 150.00,
            'cbc' => 200.00,
            'urinalysis' => 100.00,
            'Follow-up' => 400.00,
        ];

        return $prices[$appointmentType] ?? 300.00;
    }

}