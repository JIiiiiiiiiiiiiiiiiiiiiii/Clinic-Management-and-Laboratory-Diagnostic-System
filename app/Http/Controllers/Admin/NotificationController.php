<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Appointment;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = auth()->user();
        
        // Get all notifications for the admin user
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        // Get unread count
        $unreadCount = Notification::where('user_id', $user->id)
            ->where('read', false)
            ->count();

        return Inertia::render('admin/notifications/index', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function show(Notification $notification): Response
    {
        // Mark notification as read
        $notification->markAsRead();

        // Get related appointment if it exists
        $appointment = null;
        if ($notification->related_type === 'Appointment' && $notification->related_id) {
            $appointment = Appointment::with(['patient'])->find($notification->related_id);
        }

        return Inertia::render('admin/notifications/show', [
            'notification' => $notification,
            'appointment' => $appointment,
        ]);
    }

    public function markAsRead(Notification $notification)
    {
        $notification->markAsRead();
        
        return response()->json(['success' => true]);
    }

    public function markAllAsRead()
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

    public function approveAppointment(Request $request, Appointment $appointment)
    {
        $request->validate([
            'appointment_date' => 'required|date',
            'appointment_time' => 'required|string',
            'notes' => 'nullable|string|max:500',
        ]);

        // Update appointment with admin approval
        $appointment->update([
            'appointment_date' => $request->appointment_date,
            'appointment_time' => $request->appointment_time,
            'status' => 'Confirmed',
            'notes' => $request->notes,
            'confirmation_sent' => true,
        ]);

        // Send notification to patient
        $notificationService = new NotificationService();
        $notificationService->notifyAppointmentStatusChange($appointment);

        return redirect()->route('admin.notifications.index')
            ->with('success', 'Appointment approved and patient notified.');
    }

    public function rejectAppointment(Request $request, Appointment $appointment)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        // Update appointment status
        $appointment->update([
            'status' => 'Cancelled',
            'notes' => $request->rejection_reason,
        ]);

        // Send notification to patient
        $notificationService = new NotificationService();
        $notificationService->notifyAppointmentStatusChange($appointment);

        return redirect()->route('admin.notifications.index')
            ->with('success', 'Appointment rejected and patient notified.');
    }

    public function getUnreadCount()
    {
        $user = auth()->user();
        $count = Notification::where('user_id', $user->id)
            ->where('read', false)
            ->count();

        return response()->json(['count' => $count]);
    }
}
