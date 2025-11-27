<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Notification;
use App\Models\LabOrder;
use App\Models\LabResult;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PatientDashboardController extends Controller
{
    /**
     * Display the patient dashboard - appointment focused only.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        
        // Debug: Log user information
        \Log::info('PatientDashboardController: User object', [
            'user' => $user ? [
                'id' => $user->id ?? 'null',
                'email' => $user->email ?? 'null',
                'role' => $user->role ?? 'null',
                'class' => get_class($user)
            ] : 'null'
        ]);

        // Find the patient record associated with this user
        // Try to find patient by user_id, or by email if user_id doesn't match
        $patient = Patient::where('user_id', $user->id)->first();
        
        // If patient not found by user_id, try to find by email
        if (!$patient && $user->email) {
            \Log::info('Patient not found by user_id, trying to find by email', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
            $patient = Patient::where('email', $user->email)->first();
        }

        \Log::info('Loading dashboard for patient', [
            'user_id' => $user->id,
            'patient_id' => $patient ? $patient->id : null,
            'patient_no' => $patient ? $patient->patient_no : null,
        ]);

        // Initialize dashboard data with appointment-focused content
        $dashboardData = [
            'user' => $user,
            'patient' => $patient,
        ];

        // Get patient's appointments (only confirmed, completed, or cancelled)
        $appointments = collect([]);
        if ($patient) {
            // Appointment.patient_id references Patient.id (integer)
            // Also check appointments linked via visits table
            // Exclude manual_transaction appointments from patient dashboard
            $appointments = Appointment::where(function($query) use ($patient) {
                    $query->where('patient_id', $patient->id)
                          ->orWhereHas('visit', function($q) use ($patient) {
                              $q->where('patient_id', $patient->id);
                          });
                })
                ->where('appointment_type', '!=', 'manual_transaction')
                ->whereIn('status', ['Confirmed', 'Completed', 'Cancelled'])
                ->with(['specialist', 'patient', 'visit']) // Eager load relationships
                ->orderBy('appointment_date', 'desc')
                ->orderBy('appointment_time', 'desc')
                ->get();
            
            \Log::info('Dashboard appointments loaded', [
                'patient_id' => $patient->id,
                'appointments_count' => $appointments->count(),
            ]);
            
            $appointments = $appointments->map(function ($appointment) {
                    // Get specialist name from relationship or fallback
                    $specialistName = 'Unknown Specialist';
                    if ($appointment->specialist) {
                        $specialistName = $appointment->specialist->name;
                    } elseif ($appointment->specialist_id) {
                        // Direct lookup by specialist_id
                        $specialist = \App\Models\Specialist::where('specialist_id', $appointment->specialist_id)->first();
                        if ($specialist) $specialistName = $specialist->name;
                    } elseif ($appointment->visit) {
                        // Try to get from visit relationships
                        $appointment->load('visit');
                        if ($appointment->visit) {
                            if ($appointment->visit->doctor_id) {
                                $doctor = \App\Models\Specialist::where('specialist_id', $appointment->visit->doctor_id)->first();
                                if ($doctor) $specialistName = $doctor->name;
                            } elseif ($appointment->visit->attending_staff_id) {
                                $staff = \App\Models\Specialist::where('specialist_id', $appointment->visit->attending_staff_id)->first();
                                if ($staff) $specialistName = $staff->name;
                            }
                        }
                    }
                    
                    // Format date for display and keep raw date for filtering
                    $appointmentDate = $appointment->appointment_date;
                    $dateRaw = $appointmentDate ? $appointmentDate->format('Y-m-d') : null; // Store as string for JSON serialization
                    
                    return [
                        'id' => $appointment->id,
                        'type' => $appointment->appointment_type,
                        'specialist' => $specialistName,
                        'date' => $appointmentDate ? $appointmentDate->format('M d, Y') : 'N/A',
                        'date_raw' => $dateRaw, // Store as Y-m-d string for filtering
                        'time' => $appointment->appointment_time ? $appointment->appointment_time->format('g:i A') : 'N/A',
                        'status' => $appointment->status,
                        'status_color' => $appointment->status_color,
                        'price' => $appointment->formatted_price,
                        'billing_status' => $appointment->billing_status,
                    ];
                });
        }

        // Get lab results count for stats
        $labResultsCount = 0;
        if ($patient) {
            $labResultsCount = LabResult::whereHas('order', function ($query) use ($patient) {
                $query->where('patient_id', $patient->id);
            })
            ->whereNotNull('verified_at')
            ->count();
        }

        // Helper function to check if appointment is upcoming (today or future)
        $isUpcoming = function($appointment) {
            if ($appointment['status'] !== 'Confirmed') {
                return false;
            }
            $dateRaw = $appointment['date_raw'];
            if (!$dateRaw) {
                return false;
            }
            $date = \Carbon\Carbon::parse($dateRaw);
            return $date->isToday() || $date->isFuture();
        };

        // Calculate stats
        $stats = [
            'total_appointments' => $appointments->count(),
            'upcoming_appointments' => $appointments->filter($isUpcoming)->count(),
            'completed_appointments' => $appointments->where('status', 'Completed')->count(),
            'total_visits' => 0, // Visits functionality removed
            'pending_lab_results' => $labResultsCount,
        ];

        // Get recent appointments (last 5)
        $recent_appointments = $appointments->take(5)->values();

        // Get upcoming appointments (confirmed, future dates or today)
        $upcoming_appointments = $appointments
            ->filter($isUpcoming)
            ->sortBy(function($appointment) {
                $dateRaw = $appointment['date_raw'];
                if (!$dateRaw) {
                    return 0;
                }
                $date = \Carbon\Carbon::parse($dateRaw);
                return $date->timestamp;
            })
            ->take(3)
            ->values();
            
        \Log::info('Upcoming appointments filter', [
            'total_appointments' => $appointments->count(),
            'confirmed_appointments' => $appointments->where('status', 'Confirmed')->count(),
            'upcoming_count' => $upcoming_appointments->count(),
            'upcoming_appointments' => $upcoming_appointments->map(function($apt) {
                return [
                    'id' => $apt['id'],
                    'status' => $apt['status'],
                    'date_raw' => $apt['date_raw'],
                    'date' => $apt['date'],
                ];
            })->toArray(),
        ]);

        // Get lab orders with results for the patient
        $recent_lab_orders = collect([]);
        if ($patient) {
            $recent_lab_orders = LabOrder::where('patient_id', $patient->id)
                ->with(['results.test', 'orderedBy'])
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'created_at' => $order->created_at ? $order->created_at->format('M d, Y') : 'N/A',
                        'tests' => $order->results->map(function ($result) {
                            return $result->test?->name ?? 'Unknown Test';
                        })->filter()->unique()->values()->all(),
                        'has_results' => $order->results->whereNotNull('verified_at')->count() > 0,
                        'status' => $order->status ?? 'pending',
                    ];
                });
        }

        $dashboardData['stats'] = $stats;
        $dashboardData['recent_appointments'] = $recent_appointments;
        $dashboardData['upcoming_appointments'] = $upcoming_appointments;
        $dashboardData['recent_lab_orders'] = $recent_lab_orders;
        $dashboardData['recent_visits'] = []; // Empty for now
        
        \Log::info('Dashboard data prepared', [
            'patient_id' => $patient ? $patient->id : null,
            'stats' => $stats,
            'recent_appointments_count' => $recent_appointments->count(),
            'upcoming_appointments_count' => $upcoming_appointments->count(),
            'recent_lab_orders_count' => $recent_lab_orders->count(),
            'sample_upcoming' => $upcoming_appointments->first(),
        ]);

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

        $dashboardData['notifications'] = $notifications;
        $dashboardData['unreadCount'] = $unreadCount;

        return Inertia::render('patient/dashboard', $dashboardData);
    }

    /**
     * Display the patient home page with modern design.
     */
    public function home(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        
        // Find the patient record associated with this user
        // Try to find patient by user_id, or by email if user_id doesn't match
        $patient = Patient::where('user_id', $user->id)->first();
        
        // If patient not found by user_id, try to find by email
        if (!$patient && $user->email) {
            \Log::info('Patient not found by user_id, trying to find by email', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
            $patient = Patient::where('email', $user->email)->first();
        }

        \Log::info('Loading home dashboard for patient', [
            'user_id' => $user->id,
            'patient_id' => $patient ? $patient->id : null,
            'patient_no' => $patient ? $patient->patient_no : null,
        ]);

        // Initialize dashboard data
        $dashboardData = [
            'user' => $user,
            'patient' => $patient,
        ];

        // Get patient's appointments
        $appointments = collect([]);
        if ($patient) {
            // Appointment.patient_id references Patient.id (integer)
            // Also check appointments linked via visits table
            // Exclude manual_transaction appointments from patient dashboard
            $appointments = Appointment::where(function($query) use ($patient) {
                    $query->where('patient_id', $patient->id)
                          ->orWhereHas('visit', function($q) use ($patient) {
                              $q->where('patient_id', $patient->id);
                          });
                })
                ->where('appointment_type', '!=', 'manual_transaction')
                ->whereIn('status', ['Confirmed', 'Completed', 'Cancelled'])
                ->with(['specialist', 'patient', 'visit']) // Eager load relationships
                ->orderBy('appointment_date', 'desc')
                ->orderBy('appointment_time', 'desc')
                ->get();
            
            \Log::info('Home dashboard appointments loaded', [
                'patient_id' => $patient->id,
                'appointments_count' => $appointments->count(),
            ]);
            
            $appointments = $appointments->map(function ($appointment) {
                    // Get specialist name from relationship or fallback
                    $specialistName = 'Unknown Specialist';
                    if ($appointment->specialist) {
                        $specialistName = $appointment->specialist->name;
                    } elseif ($appointment->visit) {
                        // Try to get from visit relationships
                        if ($appointment->visit->doctor_id) {
                            $doctor = \App\Models\Specialist::where('specialist_id', $appointment->visit->doctor_id)->first();
                            if ($doctor) $specialistName = $doctor->name;
                        }
                    }
                    
                    // Format date for display and keep raw date for filtering
                    $appointmentDate = $appointment->appointment_date;
                    $dateRaw = $appointmentDate ? $appointmentDate->format('Y-m-d') : null; // Store as string for JSON serialization
                    
                    return [
                        'id' => $appointment->id,
                        'type' => $appointment->appointment_type,
                        'specialist' => $specialistName,
                        'date' => $appointmentDate ? $appointmentDate->format('M d, Y') : 'N/A',
                        'date_raw' => $dateRaw, // Store as Y-m-d string for filtering
                        'time' => $appointment->appointment_time ? $appointment->appointment_time->format('g:i A') : 'N/A',
                        'status' => $appointment->status,
                        'status_color' => $appointment->status_color,
                        'price' => $appointment->formatted_price,
                        'billing_status' => $appointment->billing_status,
                    ];
                });
        }

        // Helper function to check if appointment is upcoming (today or future)
        $isUpcoming = function($appointment) {
            if ($appointment['status'] !== 'Confirmed') {
                return false;
            }
            $dateRaw = $appointment['date_raw'];
            if (!$dateRaw) {
                return false;
            }
            $date = \Carbon\Carbon::parse($dateRaw);
            return $date->isToday() || $date->isFuture();
        };

        // Calculate stats
        $stats = [
            'total_appointments' => $appointments->count(),
            'upcoming_appointments' => $appointments->filter($isUpcoming)->count(),
            'completed_appointments' => $appointments->where('status', 'Completed')->count(),
            'pending_lab_results' => 0, // This would come from LabResult model if needed
        ];

        // Get recent appointments (last 5)
        $recent_appointments = $appointments->take(5)->values();

        // Get upcoming appointments (confirmed, future dates or today)
        $upcoming_appointments = $appointments
            ->filter($isUpcoming)
            ->sortBy(function($appointment) {
                $dateRaw = $appointment['date_raw'];
                if (!$dateRaw) {
                    return 0;
                }
                $date = \Carbon\Carbon::parse($dateRaw);
                return $date->timestamp;
            })
            ->take(3)
            ->values();

        $dashboardData['stats'] = $stats;
        $dashboardData['recent_appointments'] = $recent_appointments;
        $dashboardData['upcoming_appointments'] = $upcoming_appointments;
        $dashboardData['recent_lab_orders'] = []; // Empty for now

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

        $dashboardData['notifications'] = $notifications;
        $dashboardData['unreadCount'] = $unreadCount;

        return Inertia::render('patient/home', $dashboardData);
    }
}
