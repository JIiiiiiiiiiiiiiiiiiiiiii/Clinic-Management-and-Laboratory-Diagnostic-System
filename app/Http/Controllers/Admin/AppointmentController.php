<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\BillingTransaction;
use App\Models\AppointmentBillingLink;
use App\Models\Patient;
use App\Models\Visit;
use App\Models\User;
use App\Services\AppointmentCreationService;
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
                $q->where('patient_name', 'like', "%{$search}%")
                  ->orWhere('patient_id', 'like', "%{$search}%")
                  ->orWhere('sequence_number', 'like', "%{$search}%")
                  ->orWhere('specialist_name', 'like', "%{$search}%");
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

        // Order by sequence_number first (ascending), then by appointment date and time
        $appointments = $query->with('patient')
                            ->orderBy('sequence_number', 'asc')
                            ->orderBy('appointment_date', 'asc')
                            ->orderBy('appointment_time', 'asc')
                            ->get();

        // Debug: Log appointments count and details
        \Log::info('Appointments found: ' . $appointments->count());
        \Log::info('Appointments data:', $appointments->map(function($apt) {
            return [
                'id' => $apt->id,
                'patient_id' => $apt->patient_id,
                'patient_name' => $apt->patient_name,
                'appointment_date' => $apt->appointment_date
            ];
        })->toArray());

        // Get next available patient ID with smart reset logic
        $nextPatientId = $this->getNextAvailablePatientId();

        // Get doctors and medtechs for the component
        $doctors = \App\Models\User::where('role', 'doctor')
            ->where(function($query) {
                $query->where('is_active', true)
                      ->orWhereNull('is_active');
            })
            ->select('id', 'name', 'specialization', 'employee_id')
            ->get();

        $medtechs = \App\Models\User::where('role', 'medtech')
            ->where(function($query) {
                $query->where('is_active', true)
                      ->orWhereNull('is_active');
            })
            ->select('id', 'name', 'specialization', 'employee_id')
            ->get();

        return Inertia::render('admin/appointments/index', [
            'appointments' => [
                'data' => $appointments,
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => $appointments->count(),
                'total' => $appointments->count()
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
    public function store(Request $request, AppointmentCreationService $appointmentService)
    {
        \Log::info('Admin\AppointmentController@store called', [
            'user_id' => auth()->id(),
            'user_role' => auth()->user()->role ?? 'unknown',
            'request_data' => $request->all()
        ]);
        
        $validator = Validator::make($request->all(), [
            'patient_name' => 'required|string|max:255',
            'patient_id' => 'nullable|integer|exists:patients,id',
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
            'price' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            \Log::error('Validation failed:', $validator->errors()->toArray());
            \Log::error('Request data:', $request->all());
            return back()->withErrors($validator)->withInput();
        }

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

        try {
            $appointmentData = [
                'patient_name' => $request->patient_name,
                'contact_number' => $request->contact_number,
                'appointment_type' => $request->appointment_type,
                'specialist_type' => $request->specialist_type,
                'specialist_name' => $request->specialist_name,
                'specialist_id' => $request->specialist_id,
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $time,
                'duration' => $request->duration ?? '30 min',
                'status' => $request->status ?? 'Pending',
                'notes' => $request->notes,
                'special_requirements' => $request->special_requirements,
                'appointment_source' => 'admin',
                'billing_status' => 'pending',
            ];

            // Calculate price
            $tempAppointment = new Appointment($appointmentData);
            $appointmentData['price'] = $tempAppointment->calculatePrice();

            // Create patient data if patient_id not provided
            $patientData = null;
            if (!$request->patient_id) {
                $nameParts = explode(' ', $request->patient_name, 2);
                $patientData = [
                    'first_name' => $nameParts[0] ?? 'Unknown',
                    'last_name' => $nameParts[1] ?? 'Unknown',
                    'birthdate' => '1990-01-01', // Default birthdate
                    'age' => 30, // Default age
                    'sex' => 'male', // Default sex
                    'civil_status' => 'single',
                    'nationality' => 'Filipino',
                    'present_address' => 'Not specified',
                    'mobile_no' => $request->contact_number ?? 'Not specified',
                    'informant_name' => 'Not specified',
                    'relationship' => 'Self',
                    'arrival_date' => now()->toDateString(),
                    'arrival_time' => now()->toTimeString(),
                    'attending_physician' => $request->specialist_name,
                    'time_seen' => now()->toTimeString(),
                ];
            }

            // Use the service to create appointment with proper relationships
            $result = $appointmentService->createAppointmentWithPatient($appointmentData, $patientData);

            \Log::info('Appointment created successfully', [
                'appointment_id' => $result['appointment']->id,
                'patient_id' => $result['patient']->id,
                'visit_id' => $result['visit']->id ?? 'not created'
            ]);

            return redirect()->route('admin.appointments.index')
                            ->with('success', 'Appointment created successfully! Patient, appointment, and visit records have been created.');
        } catch (\Exception $e) {
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
        // Get all existing patient IDs from appointments table only
        // We don't need to check patients table since appointments are independent
        $existingAppointmentIds = Appointment::where('patient_id', 'like', 'P%')
            ->pluck('patient_id')
            ->map(function($id) {
                return (int) substr($id, 1);
            })->toArray();
        
        // If no IDs exist, start with P001
        if (empty($existingAppointmentIds)) {
            return 'P001';
        }
        
        // Find the first missing ID starting from 1
        for ($i = 1; $i <= 999; $i++) {
            if (!in_array($i, $existingAppointmentIds)) {
                return 'P' . str_pad($i, 3, '0', STR_PAD_LEFT);
            }
        }
        
        // If all IDs 1-999 are taken, find the next available
        $maxId = max($existingAppointmentIds);
        return 'P' . str_pad($maxId + 1, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Display the specified resource.
     */
    public function show(Appointment $appointment)
    {
        return Inertia::render('admin/appointments/show', [
            'appointment' => $appointment
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
            'confirmation_sent' => $request->status === 'Confirmed'
        ]);

        return back()->with('success', 'Appointment status updated successfully!');
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
                'informant_name' => 'required|string|max:255',
                'relationship' => 'required|string|max:255',
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
            $specialist = User::findOrFail($request->specialist_id);
            
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

            // Prepare appointment data
            $appointmentData = [
                'patient_name' => $request->first_name . ' ' . $request->last_name,
                'appointment_type' => $request->appointment_type,
                'specialist_type' => $request->specialist_type,
                'specialist_id' => $request->specialist_id,
                'specialist_name' => $specialist->name,
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $timeFormatted,
                'status' => 'confirmed', // Walk-in appointments are immediately confirmed
                'notes' => $request->notes,
                'special_requirements' => $request->special_requirements,
                'created_by' => auth()->id(),
                'appointment_source' => 'walk_in',
            ];

            // Use AppointmentCreationService instead of SynchronizedIdService to avoid duplicate visits
            $appointmentService = app(\App\Services\AppointmentCreationService::class);
            $result = $appointmentService->createAppointmentWithPatient($appointmentData, $patientData);
            $patient = $result['patient'];
            $appointment = $result['appointment'];
            $visit = $result['visit'];

            DB::commit();

            return redirect()->route('admin.appointments.index')
                ->with('success', 'Walk-in appointment created successfully for ' . $patient->first_name . ' ' . $patient->last_name);

        } catch (\Exception $e) {
            DB::rollback();
            return back()->with('error', 'Failed to create walk-in appointment: ' . $e->getMessage())->withInput();
        }
    }

}