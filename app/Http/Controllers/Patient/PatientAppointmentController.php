<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\PendingAppointment;
use App\Models\User;
use App\Models\Patient;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class PatientAppointmentController extends Controller
{
    public function index(Request $request): Response
    {
        $user = auth()->user();
        $patient = Patient::where('user_id', $user->id)->first();
        
        $appointments = collect([]);
        $available_doctors = collect([]);
        
        // Load appointments if patient record exists, otherwise show empty state
        if ($patient) {
            // Get patient's appointments using patient_no as the identifier
            // Only show confirmed, completed, or cancelled appointments (no pending ones)
            $appointments = Appointment::where('patient_id', $patient->patient_no)
                ->whereIn('status', ['Confirmed', 'Completed', 'Cancelled'])
                ->orderBy('appointment_date', 'desc')
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'type' => $appointment->appointment_type,
                        'specialist' => $appointment->specialist_name,
                        'date' => $appointment->appointment_date->format('M d, Y'),
                        'time' => $appointment->appointment_time->format('g:i A'),
                        'status' => $appointment->status,
                        'status_color' => $this->getStatusColor($appointment->status),
                        'price' => $this->formatPrice($appointment->price),
                        'billing_status' => $appointment->billing_status,
                    ];
                });
            
        }
        
        // Always get available doctors for booking (even without patient record)
        $available_doctors = User::where('role', 'doctor')
            ->where(function($query) {
                $query->where('is_active', true)
                      ->orWhereNull('is_active');
            })
            ->get()
            ->map(function ($doctor) {
                return [
                    'id' => $doctor->id,
                    'name' => $doctor->name,
                    'specialization' => $doctor->specialization ?? 'General Medicine',
                    'availability' => 'Mon-Fri 9AM-5PM',
                    'nextAvailable' => now()->addDays(1)->format('M d, Y g:i A'),
                    'rating' => 4.8,
                    'experience' => '10+ years',
                ];
            });

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
                    'created_at' => $notification->created_at->toISOString(),
                    'data' => $notification->data,
                ];
            });
        
        $unreadCount = Notification::where('user_id', $user->id)
            ->where('read', false)
            ->count();

        return Inertia::render('patient/appointments-simple', [
            'user' => $user,
            'patient' => $patient,
            'appointments' => $appointments,
        ]);
    }

    public function create(): Response
    {
        $user = auth()->user();
        
        // Get available doctors and specialists
        $doctors = User::where('role', 'doctor')
            ->where(function($query) {
                $query->where('is_active', true)
                      ->orWhereNull('is_active');
            })
            ->select('id', 'name', 'specialization', 'employee_id')
            ->get();

        $medtechs = User::where('role', 'medtech')
            ->where(function($query) {
                $query->where('is_active', true)
                      ->orWhereNull('is_active');
            })
            ->select('id', 'name', 'specialization', 'employee_id')
            ->get();

        $appointmentTypes = [
            'consultation' => 'Consultation',
            'checkup' => 'Checkup',
            'fecalysis' => 'Fecalysis',
            'cbc' => 'Complete Blood Count (CBC)',
            'urinalysis' => 'Urinalysis',
            'x-ray' => 'X-Ray',
            'ultrasound' => 'Ultrasound',
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
                    'created_at' => $notification->created_at->toISOString(),
                    'data' => $notification->data,
                ];
            });
        
        $unreadCount = Notification::where('user_id', $user->id)
            ->where('read', false)
            ->count();

        return Inertia::render('patient/appointment-create', [
            'user' => $user,
            'patient' => Patient::where('user_id', $user->id)->first(),
            'doctors' => $doctors,
            'medtechs' => $medtechs,
            'appointmentTypes' => $appointmentTypes,
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function book(): Response
    {
        $user = auth()->user();
        
        // Get available doctors and specialists with enhanced info
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
                    'availability' => 'Mon-Fri 8AM-4PM',
                    'rating' => 4.7,
                    'experience' => '8+ years',
                    'nextAvailable' => now()->addDays(1)->format('M d, Y g:i A'),
                ];
            });

        $appointmentTypes = [
            'consultation' => 'Consultation',
            'checkup' => 'Checkup',
            'fecalysis' => 'Fecalysis',
            'cbc' => 'Complete Blood Count (CBC)',
            'urinalysis' => 'Urinalysis',
            'x-ray' => 'X-Ray',
            'ultrasound' => 'Ultrasound',
        ];

        return Inertia::render('patient/DebugAppointmentBooking', [
            'user' => $user,
            'patient' => Patient::where('user_id', $user->id)->first(),
        ]);
    }

    public function store(Request $request)
    {
        \Log::info('PatientAppointmentController@store called', [
            'user_id' => auth()->id(),
            'request_data' => $request->all()
        ]);
        
        $user = auth()->user();
        $patient = Patient::where('user_id', $user->id)->first();
        
        // If no patient record, redirect to unified registration
        if (!$patient) {
            return redirect()->route('patient.register.and.book')
                ->with('error', 'Please register as a patient first.');
        }

        $validator = Validator::make($request->all(), [
            'appointment_type' => 'required|string|in:consultation,checkup,fecalysis,cbc,urinalysis,x-ray,ultrasound',
            'specialist_type' => 'required|string|in:doctor,medtech',
            'specialist_id' => 'required|string',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|string',
            'notes' => 'nullable|string|max:500',
            'special_requirements' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Get specialist information
        $specialist = User::find($request->specialist_id);
        if (!$specialist) {
            return back()->withErrors(['specialist_id' => 'Selected specialist not found.']);
        }

        // Check for time conflicts
        $conflictCheck = Appointment::where('specialist_id', $request->specialist_id)
            ->where('appointment_date', $request->appointment_date)
            ->where('appointment_time', $request->appointment_time)
            ->where('status', '!=', 'Cancelled')
            ->exists();

        if ($conflictCheck) {
            return back()->withErrors(['appointment_time' => 'This time slot is already booked. Please choose another time.']);
        }

        // Convert time format from "10:00 AM" to "10:00:00"
        $timeFormatted = $this->formatTimeForDatabase($request->appointment_time);

        // Create pending appointment (requires admin approval)
        $pendingAppointmentData = [
            'patient_name' => $patient->first_name . ' ' . $patient->last_name,
            'patient_id' => $patient->patient_no,
            'contact_number' => $patient->mobile_no,
            'appointment_type' => $request->appointment_type,
            'specialist_type' => $request->specialist_type,
            'specialist_name' => $specialist->name,
            'specialist_id' => $specialist->employee_id ?? $specialist->id,
            'appointment_date' => $request->appointment_date,
            'appointment_time' => $timeFormatted,
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

        try {
            $pendingAppointment = PendingAppointment::create($pendingAppointmentData);

            \Log::info('Pending appointment created successfully', [
                'pending_appointment_id' => $pendingAppointment->id,
                'patient_name' => $pendingAppointment->patient_name,
                'appointment_type' => $pendingAppointment->appointment_type,
                'appointment_date' => $pendingAppointment->appointment_date,
                'appointment_time' => $pendingAppointment->appointment_time,
            ]);

            // Send notification to admin for approval
            $this->notifyAdminPendingAppointment($pendingAppointment);

            \Log::info('Notification process completed for pending appointment', [
                'pending_appointment_id' => $pendingAppointment->id,
                'admin_count' => User::where('role', 'admin')->count()
            ]);

            return redirect()->route('patient.appointments.index')
                ->with('success', 'Appointment request submitted successfully! You will be notified once it\'s approved by the admin.');
        } catch (\Exception $e) {
            \Log::error('Failed to create pending appointment', [
                'error' => $e->getMessage(),
                'patient_id' => $patient->id,
                'appointment_data' => $pendingAppointmentData
            ]);
            
            return back()->withErrors(['error' => 'Failed to submit appointment request. Please try again.']);
        }
    }

    public function show(Appointment $appointment): Response
    {
        $user = auth()->user();
        $patient = Patient::where('user_id', $user->id)->first();
        
        // Verify ownership
        if (!$patient || $appointment->patient_id !== $patient->patient_no) {
            abort(403, 'Access denied.');
        }

        return Inertia::render('Patient/Appointments/Show', [
            'appointment' => $appointment,
        ]);
    }

    public function edit(Appointment $appointment): Response
    {
        $user = auth()->user();
        $patient = Patient::where('user_id', $user->id)->first();
        
        // Verify ownership and allow editing only if pending
        if (!$patient || $appointment->patient_id !== $patient->patient_no) {
            abort(403, 'Access denied.');
        }

        if ($appointment->status !== 'Pending') {
            return redirect()->route('patient.appointments.show', $appointment)
                ->with('error', 'Only pending appointments can be edited.');
        }

        // Get available doctors and specialists
        $doctors = User::where('role', 'doctor')
            ->where(function($query) {
                $query->where('is_active', true)
                      ->orWhereNull('is_active');
            })
            ->select('id', 'name', 'specialization', 'employee_id')
            ->get();

        $medtechs = User::where('role', 'medtech')
            ->where(function($query) {
                $query->where('is_active', true)
                      ->orWhereNull('is_active');
            })
            ->select('id', 'name', 'specialization', 'employee_id')
            ->get();

        $appointmentTypes = [
            'consultation' => 'Consultation',
            'checkup' => 'Checkup',
            'fecalysis' => 'Fecalysis',
            'cbc' => 'Complete Blood Count (CBC)',
            'urinalysis' => 'Urinalysis',
            'x-ray' => 'X-Ray',
            'ultrasound' => 'Ultrasound',
        ];

        return Inertia::render('Patient/Appointments/Edit', [
            'appointment' => $appointment,
            'patient' => $patient,
            'doctors' => $doctors,
            'medtechs' => $medtechs,
            'appointmentTypes' => $appointmentTypes,
        ]);
    }

    public function update(Request $request, Appointment $appointment)
    {
        $user = auth()->user();
        $patient = Patient::where('user_id', $user->id)->first();
        
        // Verify ownership and allow editing only if pending
        if (!$patient || $appointment->patient_id !== $patient->patient_no) {
            abort(403, 'Access denied.');
        }

        if ($appointment->status !== 'Pending') {
            return redirect()->route('patient.appointments.show', $appointment)
                ->with('error', 'Only pending appointments can be edited.');
        }

        $validator = Validator::make($request->all(), [
            'appointment_type' => 'required|string|in:consultation,checkup,fecalysis,cbc,urinalysis,x-ray,ultrasound',
            'specialist_type' => 'required|string|in:doctor,medtech',
            'specialist_id' => 'required|string',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|string',
            'notes' => 'nullable|string|max:500',
            'special_requirements' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Get specialist information
        $specialist = User::find($request->specialist_id);
        if (!$specialist) {
            return back()->withErrors(['specialist_id' => 'Selected specialist not found.']);
        }

        // Check for time conflicts (excluding current appointment)
        $conflictCheck = Appointment::where('specialist_id', $request->specialist_id)
            ->where('appointment_date', $request->appointment_date)
            ->where('appointment_time', $request->appointment_time)
            ->where('id', '!=', $appointment->id)
            ->where('status', '!=', 'Cancelled')
            ->exists();

        if ($conflictCheck) {
            return back()->withErrors(['appointment_time' => 'This time slot is already booked. Please choose another time.']);
        }

        // Update appointment
        $appointment->update([
            'appointment_type' => $request->appointment_type,
            'specialist_type' => $request->specialist_type,
            'specialist_name' => $specialist->name,
            'specialist_id' => $specialist->employee_id,
            'appointment_date' => $request->appointment_date,
            'appointment_time' => $request->appointment_time,
            'notes' => $request->notes,
            'special_requirements' => $request->special_requirements,
        ]);

        // Recalculate price
        $appointment->update(['price' => $appointment->calculatePrice()]);

        // Send notification to admin about appointment update
        $this->notifyAdminAppointmentUpdate($appointment);

        return redirect()->route('patient.appointments.index')
            ->with('success', 'Appointment updated successfully! Admin has been notified of the changes.');
    }

    public function destroy(Appointment $appointment)
    {
        $user = auth()->user();
        $patient = Patient::where('user_id', $user->id)->first();
        
        // Verify ownership and allow cancellation only if pending
        if (!$patient || $appointment->patient_id !== $patient->patient_no) {
            abort(403, 'Access denied.');
        }

        if ($appointment->status !== 'Pending') {
            return redirect()->route('patient.appointments.show', $appointment)
                ->with('error', 'Only pending appointments can be cancelled.');
        }

        $appointment->update(['status' => 'Cancelled']);

        return redirect()->route('patient.appointments.index')
            ->with('success', 'Appointment cancelled successfully.');
    }

    public function getAvailableDoctors(Request $request)
    {
        $specialistType = $request->get('specialist_type', 'doctor');
        
        $specialists = User::where('role', $specialistType)
            ->where('is_active', true)
            ->select('id', 'name', 'specialization', 'employee_id')
            ->get();

        return response()->json($specialists);
    }

    public function getAvailableTimes(Request $request)
    {
        $specialistId = $request->get('specialist_id');
        $date = $request->get('date');
        
        if (!$specialistId || !$date) {
            return response()->json([]);
        }

        // Get existing appointments for the date
        $existingAppointments = Appointment::where('specialist_id', $specialistId)
            ->where('appointment_date', $date)
            ->where('status', '!=', 'Cancelled')
            ->pluck('appointment_time')
            ->toArray();

        // Generate available time slots (9 AM to 5 PM, 30-minute intervals)
        $availableTimes = [];
        $startTime = Carbon::createFromTime(9, 0);
        $endTime = Carbon::createFromTime(17, 0);

        while ($startTime->lte($endTime)) {
            $timeString = $startTime->format('H:i:s');
            if (!in_array($timeString, $existingAppointments)) {
                $availableTimes[] = [
                    'value' => $timeString,
                    'label' => $startTime->format('g:i A'),
                ];
            }
            $startTime->addMinutes(30);
        }

        return response()->json($availableTimes);
    }

    /**
     * Format time from "10:00 AM" to "10:00:00" for database storage
     */
    private function formatTimeForDatabase($timeString)
    {
        try {
            // Parse time string like "10:00 AM" or "2:30 PM"
            $time = \Carbon\Carbon::createFromFormat('g:i A', $timeString);
            return $time->format('H:i:s');
        } catch (\Exception $e) {
            // If parsing fails, try to extract just the time part
            if (preg_match('/(\d{1,2}):(\d{2})\s*(AM|PM)/i', $timeString, $matches)) {
                $hour = (int)$matches[1];
                $minute = $matches[2];
                $ampm = strtoupper($matches[3]);
                
                if ($ampm === 'PM' && $hour !== 12) {
                    $hour += 12;
                } elseif ($ampm === 'AM' && $hour === 12) {
                    $hour = 0;
                }
                
                return sprintf('%02d:%s:00', $hour, $minute);
            }
            
            // Default fallback
            return '09:00:00';
        }
    }

    /**
     * Notify admin about pending appointment request
     */
    private function notifyAdminPendingAppointment(PendingAppointment $pendingAppointment)
    {
        // Get all admin users
        $adminUsers = User::where('role', 'admin')->get();

        foreach ($adminUsers as $admin) {
            // Create notification
            $notification = Notification::create([
                'type' => 'appointment_request',
                'title' => 'New Appointment Request - Pending Approval',
                'message' => "Patient {$pendingAppointment->patient_name} has requested an appointment for {$pendingAppointment->appointment_type} on {$pendingAppointment->appointment_date} at {$pendingAppointment->appointment_time}. Please review and approve.",
                'data' => [
                    'pending_appointment_id' => $pendingAppointment->id,
                    'patient_name' => $pendingAppointment->patient_name,
                    'appointment_type' => $pendingAppointment->appointment_type,
                    'appointment_date' => $pendingAppointment->appointment_date,
                    'appointment_time' => $pendingAppointment->appointment_time,
                    'specialist_name' => $pendingAppointment->specialist_name,
                    'status' => $pendingAppointment->status_approval,
                    'price' => $pendingAppointment->price,
                ],
                'user_id' => $admin->id,
                'related_id' => $pendingAppointment->id,
                'related_type' => 'PendingAppointment',
            ]);

            // Broadcast real-time notification to admin
            try {
                broadcast(new \App\Events\NewAppointmentNotification($notification, $admin->id));
            } catch (\Exception $e) {
                \Log::error('Failed to broadcast notification to admin', [
                    'admin_id' => $admin->id,
                    'notification_id' => $notification->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        \Log::info('Pending appointment notification sent to admin users', [
            'pending_appointment_id' => $pendingAppointment->id,
            'patient_name' => $pendingAppointment->patient_name
        ]);
    }

    /**
     * Notify admin about appointment update
     */
    private function notifyAdminAppointmentUpdate(Appointment $appointment)
    {
        // Get all admin users
        $adminUsers = User::where('role', 'admin')->get();

        foreach ($adminUsers as $admin) {
            // Create notification
            Notification::create([
                'type' => 'appointment_update',
                'title' => 'Appointment Updated by Patient',
                'message' => "Patient {$appointment->patient_name} has updated their appointment for {$appointment->appointment_type} on {$appointment->appointment_date} at {$appointment->appointment_time}",
                'data' => [
                    'appointment_id' => $appointment->id,
                    'patient_name' => $appointment->patient_name,
                    'appointment_type' => $appointment->appointment_type,
                    'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time,
                    'specialist_name' => $appointment->specialist_name,
                    'status' => $appointment->status,
                    'updated_by' => 'patient',
                ],
                'user_id' => $admin->id,
                'related_id' => $appointment->id,
                'related_type' => 'Appointment',
            ]);

            // Broadcast real-time notification to admin
            broadcast(new \App\Events\AppointmentUpdateNotification([
                'id' => $appointment->id,
                'patient_name' => $appointment->patient_name,
                'appointment_type' => $appointment->appointment_type,
                'appointment_date' => $appointment->appointment_date,
                'appointment_time' => $appointment->appointment_time,
                'specialist_name' => $appointment->specialist_name,
                'status' => $appointment->status,
                'updated_by' => 'patient',
                'message' => "Patient {$appointment->patient_name} has updated their appointment",
                'timestamp' => now()->toISOString(),
            ], $admin->id));
        }

        \Log::info('Appointment update notification sent to admin users', [
            'appointment_id' => $appointment->id,
            'patient_name' => $appointment->patient_name
        ]);
    }

    /**
     * Get status color for appointment status
     */
    private function getStatusColor($status)
    {
        return match($status) {
            'Confirmed' => 'bg-green-100 text-green-800',
            'Completed' => 'bg-blue-100 text-blue-800',
            'Cancelled' => 'bg-red-100 text-red-800',
            'Pending' => 'bg-yellow-100 text-yellow-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    /**
     * Format price for display
     */
    private function formatPrice($price)
    {
        return '₱' . number_format($price, 2);
    }
}
