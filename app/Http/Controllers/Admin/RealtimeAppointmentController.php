<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Notification;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

class RealtimeAppointmentController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Get real-time appointment updates
     */
    public function getAppointmentUpdates(Request $request)
    {
        $user = auth()->user();
        
        // Get recent appointments (last 24 hours)
        $recentAppointments = Appointment::where('created_at', '>=', now()->subDay())
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Get unread notifications
        $unreadNotifications = Notification::where('user_id', $user->id)
            ->where('read', false)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'appointments' => $recentAppointments,
            'notifications' => $unreadNotifications,
            'unread_count' => $unreadNotifications->count(),
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Broadcast new appointment to admin users
     */
    public function broadcastNewAppointment(Appointment $appointment)
    {
        try {
            // Get all admin users
            $adminUsers = User::where('role', 'admin')->get();

            foreach ($adminUsers as $admin) {
                // Create notification
                $notification = Notification::create([
                    'type' => 'appointment',
                    'title' => 'New Appointment Request',
                    'message' => "New appointment request from {$appointment->patient_name} for {$appointment->appointment_type} on {$appointment->appointment_date} at {$appointment->appointment_time}",
                    'data' => [
                        'appointment_id' => $appointment->id,
                        'patient_name' => $appointment->patient_name,
                        'appointment_type' => $appointment->appointment_type,
                        'appointment_date' => $appointment->appointment_date,
                        'appointment_time' => $appointment->appointment_time,
                        'specialist_name' => $appointment->specialist_name,
                        'status' => $appointment->status,
                    ],
                    'user_id' => $admin->id,
                    'related_id' => $appointment->id,
                    'related_type' => 'Appointment',
                ]);

                // Broadcast to specific user
                broadcast(new \App\Events\NewAppointmentNotification($notification, $admin->id));
            }

            Log::info('New appointment broadcasted to admin users', [
                'appointment_id' => $appointment->id,
                'patient_name' => $appointment->patient_name
            ]);

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            Log::error('Failed to broadcast new appointment', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage()
            ]);

            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Broadcast appointment status change to patient
     */
    public function broadcastAppointmentStatusChange(Appointment $appointment)
    {
        try {
            // Find patient user
            $patient = \App\Models\Patient::where('patient_id', $appointment->patient_id)->first();
            if (!$patient || !$patient->user_id) {
                return response()->json(['success' => false, 'error' => 'Patient user not found']);
            }

            $user = User::find($patient->user_id);
            if (!$user) {
                return response()->json(['success' => false, 'error' => 'User not found']);
            }

            $statusMessages = [
                'Confirmed' => 'Your appointment has been confirmed',
                'Completed' => 'Your appointment has been completed',
                'Cancelled' => 'Your appointment has been cancelled',
            ];

            $message = $statusMessages[$appointment->status] ?? "Your appointment status has been updated to {$appointment->status}";

            $notification = Notification::create([
                'type' => 'appointment',
                'title' => 'Appointment Status Update',
                'message' => $message,
                'data' => [
                    'appointment_id' => $appointment->id,
                    'status' => $appointment->status,
                    'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time,
                    'specialist_name' => $appointment->specialist_name,
                ],
                'user_id' => $user->id,
                'related_id' => $appointment->id,
                'related_type' => 'Appointment',
            ]);

            // Broadcast to patient
            broadcast(new \App\Events\AppointmentStatusUpdate($notification, $user->id));

            Log::info('Appointment status change broadcasted to patient', [
                'appointment_id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'status' => $appointment->status
            ]);

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            Log::error('Failed to broadcast appointment status change', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage()
            ]);

            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get real-time notification updates
     */
    public function getNotificationUpdates(Request $request)
    {
        $user = auth()->user();
        
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        $unreadCount = Notification::where('user_id', $user->id)
            ->where('read', false)
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markNotificationAsRead(Request $request, $notificationId)
    {
        $user = auth()->user();
        
        $notification = Notification::where('id', $notificationId)
            ->where('user_id', $user->id)
            ->first();

        if (!$notification) {
            return response()->json(['success' => false, 'error' => 'Notification not found'], 404);
        }

        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllNotificationsAsRead(Request $request)
    {
        $user = auth()->user();
        
        Notification::where('user_id', $user->id)
            ->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);

        return response()->json(['success' => true]);
    }
}
