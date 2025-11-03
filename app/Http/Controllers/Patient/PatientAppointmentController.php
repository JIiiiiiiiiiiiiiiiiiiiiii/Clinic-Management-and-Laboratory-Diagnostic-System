<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
// Removed PendingAppointment - using appointments table with status 'Pending'
use App\Models\User;
use App\Models\Patient;
use App\Models\Notification;
use App\Services\NotificationService;
use App\Services\AppointmentCreationService;
use App\Services\AppointmentAutomationService;
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
        $allAppointments = collect([]);

        // Load appointments if patient record exists, otherwise show empty state
        if ($patient) {
            // Get patient's appointments from BOTH tables:
            // 1. Pending appointments (waiting for admin approval)
            // 2. Confirmed appointments (approved by admin)
            
            $pendingAppointments = \App\Models\PendingAppointment::where('patient_id', (string)$patient->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'appointment_type' => $appointment->appointment_type,
                        'type' => $appointment->appointment_type,
                        'price' => $appointment->price ?? 0,
                        'patient_name' => $appointment->patient_name,
                        'specialist_name' => $appointment->specialist_name,
                        'specialist' => $appointment->specialist_name,
                        'appointment_date' => $appointment->appointment_date->format('Y-m-d'),
                        'date' => $appointment->appointment_date->format('M d, Y'),
                        'appointment_time' => $appointment->appointment_time->format('H:i:s'),
                        'time' => $appointment->appointment_time->format('g:i A'),
                        'status' => $appointment->status_approval,
                        'reason' => $appointment->appointment_type,
                        'notes' => $appointment->notes,
                        'created_at' => $appointment->created_at->format('Y-m-d H:i:s'),
                        'source' => 'pending'
                    ];
                });

            // Get confirmed appointments from appointments table
            $confirmedAppointments = Appointment::where('patient_id', $patient->id)
                ->with(['specialist', 'patient'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'appointment_type' => $appointment->appointment_type,
                        'type' => $appointment->appointment_type,
                        'price' => $appointment->price ?? 0,
                        'patient_name' => $appointment->patient ? trim($appointment->patient->first_name . ' ' . $appointment->patient->last_name) : 'Unknown Patient',
                        'specialist_name' => $appointment->specialist ? $appointment->specialist->name : 'Unknown Specialist',
                        'specialist' => $appointment->specialist ? $appointment->specialist->name : 'Unknown Specialist',
                        'appointment_date' => $appointment->appointment_date->format('Y-m-d'),
                        'date' => $appointment->appointment_date->format('M d, Y'),
                        'appointment_time' => $appointment->appointment_time->format('H:i:s'),
                        'time' => $appointment->appointment_time->format('g:i A'),
                        'status' => $appointment->status,
                        'reason' => $appointment->appointment_type,
                        'notes' => $appointment->additional_info,
                        'created_at' => $appointment->created_at->format('Y-m-d H:i:s'),
                        'source' => 'confirmed'
                    ];
                });

            // Combine both collections but filter out duplicates
            // A duplicate is when we have the same appointment in both pending and confirmed
            $allAppointments = $pendingAppointments->concat($confirmedAppointments);
            
            // Remove duplicates - prioritize confirmed appointments over pending ones
            // Group by appointment date, time, and type, then keep only the confirmed one if both exist
            $groupedAppointments = $allAppointments->groupBy(function ($appointment) {
                return $appointment['appointment_date'] . '|' . $appointment['appointment_time'] . '|' . $appointment['appointment_type'];
            });
            
            $uniqueAppointments = $groupedAppointments->map(function ($group) {
                // If there's a confirmed appointment in the group, prefer it over pending
                $confirmed = $group->where('source', 'confirmed')->first();
                if ($confirmed) {
                    return $confirmed;
                }
                // Otherwise, return the first pending one
                return $group->first();
            })->values();
            
            // Sort by creation date
            $allAppointments = $uniqueAppointments->sortByDesc('created_at');

            \Log::info('Appointments loaded', [
                'total_count' => $allAppointments->count(),
                'pending_count' => $pendingAppointments->count(),
                'confirmed_count' => $confirmedAppointments->count(),
                'unique_count' => $uniqueAppointments->count(),
                'patient_id' => $patient->patient_id,
                'appointments_data' => $allAppointments->map(function($apt) {
                    return [
                        'id' => $apt['id'],
                        'type' => $apt['appointment_type'],
                        'price' => $apt['price'],
                        'source' => $apt['source'],
                        'status' => $apt['status']
                    ];
                })->toArray()
            ]);
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

        \Log::info('Sending appointments to frontend', [
            'user_id' => $user->id,
            'patient_id' => $patient ? $patient->id : null,
            'patient_found' => $patient !== null,
            'noPatientRecord' => $patient === null,
            'total_appointments' => $allAppointments->count(),
            'appointments_data' => $allAppointments->toArray(),
            'sample_appointment' => $allAppointments->first()
        ]);

        return Inertia::render('patient/appointments', [
            'user' => $user,
            'patient' => $patient,
            'appointments' => $allAppointments->values(),
            'available_doctors' => $available_doctors,
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
            'noPatientRecord' => $patient === null, // Flag to show message in frontend
        ]);
    }

    public function create()
    {
        $user = auth()->user();
        $patient = Patient::where('user_id', $user->id)->first();

        // Get available doctors and medtechs
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
            'general_consultation' => 'General Consultation',
            'consultation' => 'Consultation',
            'checkup' => 'Checkup',
            'fecalysis' => 'Fecalysis',
            'fecalysis_test' => 'Fecalysis Test',
            'cbc' => 'Complete Blood Count (CBC)',
            'urinalysis' => 'Urinalysis',
            'urinarysis_test' => 'Urinalysis Test',
            'x-ray' => 'X-Ray',
            'ultrasound' => 'Ultrasound',
        ];

        return Inertia::render('patient/Appointments/Create', [
            'user' => $user,
            'patient' => $patient,
            'doctors' => $doctors,
            'medtechs' => $medtechs,
            'appointmentTypes' => $appointmentTypes,
        ]);
    }

    public function book()
    {
        // Always redirect to the unified registration and booking flow
        return redirect()->route('patient.register.and.book')
            ->with('info', 'Please complete your registration and book your appointment.');
    }

    public function store(Request $request, AppointmentAutomationService $automationService)
    {
        \Log::info('PatientAppointmentController@store called', [
            'user_id' => auth()->id(),
            'request_data' => $request->all()
        ]);

        $user = auth()->user();
        \Log::info('User authenticated', ['user_id' => $user->id]);
        
        $patient = Patient::where('user_id', $user->id)->first();
        \Log::info('Patient found', ['patient_id' => $patient ? $patient->patient_id : 'null']);

        // If no patient record, redirect to unified registration
        if (!$patient) {
            \Log::error('No patient record found', ['user_id' => $user->id]);
            return redirect()->route('patient.register.and.book')
                ->with('error', 'Please register as a patient first.');
        }

        \Log::info('Starting validation');
        $validator = Validator::make($request->all(), [
            'appointment_type' => 'required|string|in:consultation,general_consultation,checkup,fecalysis,fecalysis_test,cbc,urinalysis,urinarysis_test,x-ray,ultrasound',
            'specialist_type' => 'required|string|in:doctor,medtech',
            'specialist_id' => 'required|string',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'required|string',
            'notes' => 'nullable|string|max:500',
            'special_requirements' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            \Log::error('Validation failed', ['errors' => $validator->errors()]);
            return back()->withErrors($validator)->withInput();
        }
        \Log::info('Validation passed');

        // Validate appointment type logic
        if ($request->appointment_type === 'general_consultation' && $request->specialist_type !== 'doctor') {
            return back()->withErrors(['specialist_type' => 'General consultation requires a doctor.']);
        }
        
        // For non-general consultation appointments, require medtech
        $medtechAppointmentTypes = ['fecalysis', 'fecalysis_test', 'cbc', 'urinalysis', 'urinarysis_test', 'x-ray', 'ultrasound'];
        if (in_array($request->appointment_type, $medtechAppointmentTypes) && $request->specialist_type !== 'medtech') {
            return back()->withErrors(['specialist_type' => 'This appointment type requires a medical technologist.']);
        }

        // Get specialist information
        $specialist = User::find($request->specialist_id);
        if (!$specialist) {
            return back()->withErrors(['specialist_id' => 'Selected specialist not found.']);
        }

        // Check for time conflicts - more comprehensive check
        $formattedTime = $this->formatTimeForDatabase($request->appointment_time);
        $conflictCheck = Appointment::where('specialist_id', $request->specialist_id)
            ->where('appointment_date', $request->appointment_date)
            ->where('appointment_time', $formattedTime)
            ->whereIn('status', ['Pending', 'Confirmed', 'Completed'])
            ->exists();

        if ($conflictCheck) {
            \Log::info('Time conflict detected', [
                'specialist_id' => $request->specialist_id,
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $formattedTime,
                'original_time' => $request->appointment_time
            ]);
            return back()->withErrors(['appointment_time' => 'This time slot is already booked. Please choose another time.']);
        }

        try {
            // Create appointment data for online booking
            $appointmentData = [
                'patient_id' => $patient->patient_id,
                'specialist_id' => $request->specialist_id,
                'appointment_type' => $request->appointment_type,
                'specialist_type' => $request->specialist_type,
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $this->formatTimeForDatabase($request->appointment_time),
                'duration' => '30 min',
                'price' => $this->calculatePrice($request->appointment_type),
                'additional_info' => $request->notes,
            ];

            // Create appointment in PendingAppointment table (waiting for admin approval)
            $pendingAppointmentData = [
                'patient_id' => (string) $patient->id,
                'patient_name' => $patient->first_name . ' ' . $patient->last_name,
                'contact_number' => $patient->mobile_no ?? $patient->telephone_no ?? '',
                'specialist_id' => (string) $request->specialist_id,
                'specialist_name' => $this->getSpecialistName($request->specialist_id),
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

            \Log::info('Patient online appointment created successfully', [
                'appointment_id' => $appointment->id,
                'patient_id' => $patient->patient_id
            ]);

            // Send notification to admin for approval
            \Log::info('Starting notification process');
            try {
                // Send notification to admin using centralized service
                $notificationService = app(\App\Services\NotificationService::class);
                $notificationService->notifyNewAppointment($appointment);
                \Log::info('Notification process completed successfully');
            } catch (\Exception $e) {
                \Log::error('Notification process failed', [
                    'error' => $e->getMessage(),
                    'appointment_id' => $appointment->id
                ]);
                // Don't fail the appointment creation if notification fails
            }

            \Log::info('Notification process completed for online appointment', [
                'appointment_id' => $appointment->id,
                'admin_count' => User::where('role', 'admin')->count()
            ]);

            return redirect()->route('patient.appointments.index')
                ->with('success', 'Appointment request submitted successfully! You will be notified once it\'s approved by the admin.');
        } catch (\Exception $e) {
            \Log::error('Failed to create appointment', [
                'error' => $e->getMessage(),
                'patient_id' => $patient->patient_id,
                'request_data' => $request->all()
            ]);

            return back()->withErrors(['error' => 'Failed to submit appointment request. Please try again.']);
        }
    }

    public function show(Appointment $appointment): Response
    {
        $user = auth()->user();
        $patient = Patient::where('user_id', $user->id)->first();

        // Verify ownership - Appointment.patient_id relates to Patient.id (not patient_id or patient_no)
        if (!$patient || $appointment->patient_id !== $patient->id) {
            abort(403, 'Access denied.');
        }

        return Inertia::render('patient/Appointments/Show', [
            'appointment' => $appointment,
        ]);
    }

    public function edit(Appointment $appointment): Response
    {
        $user = auth()->user();
        $patient = Patient::where('user_id', $user->id)->first();

        // Verify ownership and allow editing only if pending
        if (!$patient || $appointment->patient_id !== $patient->patient_id) {
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

        return Inertia::render('patient/Appointments/Edit', [
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
        if (!$patient || $appointment->patient_id !== $patient->patient_id) {
            abort(403, 'Access denied.');
        }

        if ($appointment->status !== 'Pending') {
            return redirect()->route('patient.appointments.show', $appointment)
                ->with('error', 'Only pending appointments can be edited.');
        }

        $validator = Validator::make($request->all(), [
            'appointment_type' => 'required|string|in:consultation,general_consultation,checkup,fecalysis,fecalysis_test,cbc,urinalysis,urinarysis_test,x-ray,ultrasound',
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
        if (!$patient || $appointment->patient_id !== $patient->patient_id) {
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
     * Calculate price for appointment type
     */
    private function calculatePrice($appointmentType)
    {
        $prices = [
            'consultation' => 350,
            'general_consultation' => 350,
            'checkup' => 300,
            'fecalysis' => 90,
            'fecalysis_test' => 90,
            'cbc' => 245,
            'urinalysis' => 140,
            'urinarysis_test' => 140,
            'x-ray' => 700,
            'ultrasound' => 800,
        ];

        return $prices[$appointmentType] ?? 300;
    }

    private function getSpecialistName($specialistId)
    {
        $specialist = User::find($specialistId);
        return $specialist ? $specialist->name : 'Unknown';
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
