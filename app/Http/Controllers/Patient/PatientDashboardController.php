<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Notification;
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
        $patient = Patient::where('user_id', $user->id)->first();

        // Initialize dashboard data with appointment-focused content
        $dashboardData = [
            'user' => $user,
            'patient' => $patient,
        ];

        // Get patient's appointments (only confirmed, completed, or cancelled)
        $appointments = collect([]);
        if ($patient) {
            $appointments = Appointment::where('patient_id', $patient->id)
                ->whereIn('status', ['Confirmed', 'Completed', 'Cancelled'])
                ->orderBy('appointment_date', 'desc')
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'type' => $appointment->appointment_type,
                        'specialist' => $appointment->specialist_name,
                        'date' => $appointment->appointment_date->format('M d, Y'),
                        'date_raw' => $appointment->appointment_date, // Keep original date for filtering
                        'time' => $appointment->appointment_time->format('g:i A'),
                        'status' => $appointment->status,
                        'status_color' => $appointment->status_color,
                        'price' => $appointment->formatted_price,
                        'billing_status' => $appointment->billing_status,
                    ];
                });
        }

        // Calculate stats
        $stats = [
            'total_appointments' => $appointments->count(),
            'upcoming_appointments' => $appointments->where('status', 'Confirmed')->count(),
            'completed_appointments' => $appointments->where('status', 'Completed')->count(),
            'total_visits' => 0, // Visits functionality removed
            'pending_lab_results' => 0, // This would come from LabResult model if needed
        ];

        // Get recent appointments (last 5)
        $recent_appointments = $appointments->take(5)->values();

        // Get upcoming appointments (confirmed, future dates)
        $upcoming_appointments = $appointments->where('status', 'Confirmed')
            ->filter(function($appointment) {
                // Use the raw date for accurate comparison
                return $appointment['date_raw']->isFuture();
            })
            ->take(3)
            ->values();

        $dashboardData['stats'] = $stats;
        $dashboardData['recent_appointments'] = $recent_appointments;
        $dashboardData['upcoming_appointments'] = $upcoming_appointments;
        $dashboardData['recent_lab_orders'] = []; // Empty for now
        $dashboardData['recent_visits'] = []; // Empty for now

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

        return Inertia::render('patient/dashboard-simple', $dashboardData);
    }

    /**
     * Display the patient home page with modern design.
     */
    public function home(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        
        // Find the patient record associated with this user
        $patient = Patient::where('user_id', $user->id)->first();

        // Initialize dashboard data
        $dashboardData = [
            'user' => $user,
            'patient' => $patient,
        ];

        // Get patient's appointments
        $appointments = collect([]);
        if ($patient) {
            $appointments = Appointment::where('patient_id', $patient->id)
                ->whereIn('status', ['Confirmed', 'Completed', 'Cancelled'])
                ->orderBy('appointment_date', 'desc')
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'type' => $appointment->appointment_type,
                        'specialist' => $appointment->specialist_name,
                        'date' => $appointment->appointment_date->format('M d, Y'),
                        'date_raw' => $appointment->appointment_date, // Keep original date for filtering
                        'time' => $appointment->appointment_time->format('g:i A'),
                        'status' => $appointment->status,
                        'status_color' => $appointment->status_color,
                        'price' => $appointment->formatted_price,
                        'billing_status' => $appointment->billing_status,
                    ];
                });
        }

        // Calculate stats
        $stats = [
            'total_appointments' => $appointments->count(),
            'upcoming_appointments' => $appointments->where('status', 'Confirmed')->count(),
            'completed_appointments' => $appointments->where('status', 'Completed')->count(),
            'pending_lab_results' => 0, // This would come from LabResult model if needed
        ];

        // Get recent appointments (last 5)
        $recent_appointments = $appointments->take(5)->values();

        // Get upcoming appointments (confirmed, future dates)
        $upcoming_appointments = $appointments->where('status', 'Confirmed')
            ->filter(function($appointment) {
                // Use the raw date for accurate comparison
                return $appointment['date_raw']->isFuture();
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
