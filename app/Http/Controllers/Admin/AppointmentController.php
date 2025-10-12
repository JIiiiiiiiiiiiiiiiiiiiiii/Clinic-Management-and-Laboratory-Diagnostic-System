<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\BillingTransaction;
use App\Models\AppointmentBillingLink;
use App\Models\Patient;
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

        // Order by patient_id first (ascending), then by appointment date and time
        $appointments = $query->orderBy('patient_id', 'asc')
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
    public function store(Request $request)
    {
        \Log::info('Admin\AppointmentController@store called', [
            'user_id' => auth()->id(),
            'user_role' => auth()->user()->role ?? 'unknown',
            'request_data' => $request->all()
        ]);
        
        $validator = Validator::make($request->all(), [
            'patient_name' => 'required|string|max:255',
            'patient_id' => 'nullable|string|max:50',
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

        // Note: Removed duplicate appointment validation to allow patients to have multiple appointments
        // This is normal in a clinic system where patients may need multiple consultations

        if ($validator->fails()) {
            \Log::error('Validation failed:', $validator->errors()->toArray());
            \Log::error('Request data:', $request->all());
            return back()->withErrors($validator)->withInput();
        }

        // Validate patient ID format (allow existing patients to book multiple appointments)
        if ($request->patient_id) {
            // Check if patient_id follows the correct format (P001, P002, etc.)
            if (!preg_match('/^P\d{3}$/', $request->patient_id)) {
                $validator->errors()->add('patient_id', 'Patient ID must be in format P001, P002, etc.');
            }
            // Note: Removed duplicate check to allow patients to have multiple appointments
        } else {
            // If no patient ID provided, generate one automatically
            $request->merge(['patient_id' => $this->getNextAvailablePatientId()]);
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

        $appointmentData = $request->all();
        $appointmentData['appointment_time'] = $time;
        $appointmentData['status'] = $request->status ?? 'Pending';
        $appointmentData['special_requirements'] = $request->special_requirements ?? null;
        $appointmentData['appointment_source'] = 'walk_in';
        
        // Calculate and set price based on appointment type
        $appointment = new Appointment($appointmentData);
        $appointmentData['price'] = $appointment->calculatePrice();
        $appointmentData['billing_status'] = 'pending';

        \Log::info('Creating appointment with data:', $appointmentData);

        try {
            $appointment = Appointment::create($appointmentData);

            \Log::info('Appointment created successfully with ID:', ['id' => $appointment->id]);

            return redirect()->route('admin.appointments.index')
                            ->with('success', 'Appointment created successfully! It will appear in Pending Appointments for billing.');
        } catch (\Exception $e) {
            \Log::error('Failed to create appointment:', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to create appointment. Please try again.']);
        }
    }


    /**
     * Delete appointments by patient_id and reindex remaining appointments
     */
    public function destroyByPatientId($patient_id)
    {
        try {
            // Delete appointments by patient_id
            $deletedCount = Appointment::where('patient_id', $patient_id)->delete();
            
            // Reindex remaining appointments to maintain sequential order
            $appointments = Appointment::orderBy('id')->get();
            $counter = 1;
            
            foreach ($appointments as $appointment) {
                $newPatientId = 'P' . str_pad($counter, 3, '0', STR_PAD_LEFT);
                $appointment->patient_id = $newPatientId;
                $appointment->save();
                $counter++;
            }
            
            return response()->json([
                'message' => 'Deleted and reindexed successfully',
                'deleted_count' => $deletedCount,
                'remaining_count' => $appointments->count()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete and reindex: ' . $e->getMessage()
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
     * Remove the specified resource from storage.
     */
    public function destroy(Appointment $appointment)
    {
        DB::beginTransaction();
        try {
            // Only allow deletion if billing is pending or cancelled
            if ($appointment->billing_status === 'paid') {
                return back()->withErrors(['error' => 'Cannot delete paid appointments. Please contact administrator.']);
            }

            // Delete related billing links and transactions if not paid
            $appointment->billingLinks()->delete();
            
            $appointment->delete();

            DB::commit();

            return redirect()->route('admin.appointments.index')
                            ->with('success', 'Appointment deleted successfully!');
        } catch (\Exception $e) {
            DB::rollback();
            \Log::error('Failed to delete appointment:', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to delete appointment. Please try again.']);
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

}