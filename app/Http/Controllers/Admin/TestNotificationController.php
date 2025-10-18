<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\PendingAppointment;
use App\Models\User;
use Illuminate\Http\Request;

class TestNotificationController extends Controller
{
    /**
     * Create a test notification for admin
     */
    public function createTestNotification(Request $request)
    {
        try {
            // Get the current admin user
            $admin = auth()->user();
            
            if (!$admin || $admin->role !== 'admin') {
                return response()->json(['error' => 'Admin access required'], 403);
            }

            // Create a test pending appointment
            $pendingAppointment = PendingAppointment::create([
                'patient_name' => 'Test Patient',
                'patient_id' => 'TEST001',
                'contact_number' => '09123456789',
                'appointment_type' => 'consultation',
                'specialist_type' => 'General Medicine',
                'specialist_name' => 'Dr. Test Doctor',
                'specialist_id' => 1,
                'appointment_date' => now()->addDays(1),
                'appointment_time' => now()->setTime(9, 0),
                'duration' => 30,
                'status' => 'pending',
                'billing_status' => 'pending',
                'notes' => 'Test appointment for notification testing',
                'special_requirements' => null,
                'booking_method' => 'online',
                'price' => 500.00,
                'status_approval' => 'pending',
                'source' => 'Online',
            ]);

            // Create notification for the admin
            $notification = Notification::create([
                'type' => 'appointment_request',
                'title' => 'Test Appointment Request - Pending Approval',
                'message' => "Test Patient has requested a consultation appointment for tomorrow at 9:00 AM. Please review and approve.",
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
                'read' => false,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Test notification created successfully',
                'notification_id' => $notification->id,
                'pending_appointment_id' => $pendingAppointment->id,
                'data' => $notification->data
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get notification data for debugging
     */
    public function getNotificationData(Request $request, $notificationId)
    {
        try {
            $notification = Notification::findOrFail($notificationId);
            
            return response()->json([
                'success' => true,
                'notification' => [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'data' => $notification->data,
                    'read' => $notification->read,
                    'created_at' => $notification->created_at,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Debug notifications for current user
     */
    public function debugNotifications(Request $request)
    {
        try {
            $user = auth()->user();
            
            if (!$user) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }

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
                        'created_at' => $notification->created_at,
                        'raw_data' => $notification->getRawOriginal('data'),
                        'parsed_data' => $notification->data,
                        'data_type' => gettype($notification->data),
                        'data_keys' => is_array($notification->data) ? array_keys($notification->data) : 'not array'
                    ];
                });

            return response()->json([
                'success' => true,
                'user_id' => $user->id,
                'notifications' => $notifications,
                'total_count' => $notifications->count()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
