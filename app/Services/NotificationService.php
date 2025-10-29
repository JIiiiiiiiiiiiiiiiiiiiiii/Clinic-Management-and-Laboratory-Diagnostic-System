<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\Appointment;
use App\Models\PatientTransfer;

class NotificationService
{
    /**
     * Create a new notification
     */
    public function createNotification(array $data): Notification
    {
        return Notification::create($data);
    }

    /**
     * Notify admin about new appointment request
     */
    public function notifyNewAppointment(Appointment $appointment): void
    {
        // Get all admin users
        $adminUsers = User::where('role', 'admin')->get();

        foreach ($adminUsers as $admin) {
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
                ],
                'user_id' => $admin->id,
                'related_id' => $appointment->id,
                'related_type' => 'Appointment',
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
    }

    /**
     * Notify admin about new pending appointment request
     */
    public function notifyNewPendingAppointment(\App\Models\PendingAppointment $pendingAppointment): void
    {
        // Get all admin users
        $adminUsers = User::where('role', 'admin')->get();

        foreach ($adminUsers as $admin) {
            $notification = Notification::create([
                'type' => 'appointment_request',
                'title' => 'New Pending Appointment Request',
                'message' => "New appointment request from {$pendingAppointment->patient_name} for {$pendingAppointment->appointment_type} on {$pendingAppointment->appointment_date} at {$pendingAppointment->appointment_time} - Requires approval",
                'data' => [
                    'pending_appointment_id' => $pendingAppointment->id,
                    'patient_name' => $pendingAppointment->patient_name,
                    'appointment_type' => $pendingAppointment->appointment_type,
                    'appointment_date' => $pendingAppointment->appointment_date,
                    'appointment_time' => $pendingAppointment->appointment_time,
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
    }

    /**
     * Notify patient about appointment status change
     */
    public function notifyAppointmentStatusChange(Appointment $appointment): void
    {
        // Find patient user
        $patient = \App\Models\Patient::where('patient_id', $appointment->patient_id)->first();
        if (!$patient || !$patient->user_id) {
            return;
        }

        $user = User::find($patient->user_id);
        if (!$user) {
            return;
        }

        $statusMessages = [
            'Confirmed' => 'Your appointment has been confirmed',
            'Completed' => 'Your appointment has been completed',
            'Cancelled' => 'Your appointment has been cancelled',
        ];

        $message = $statusMessages[$appointment->status] ?? "Your appointment status has been updated to {$appointment->status}";

        Notification::create([
            'type' => 'appointment',
            'title' => 'Appointment Status Update',
            'message' => $message,
            'data' => [
                'appointment_id' => $appointment->id,
                'status' => $appointment->status,
                'appointment_date' => $appointment->appointment_date,
                'appointment_time' => $appointment->appointment_time,
            ],
            'user_id' => $user->id,
            'related_id' => $appointment->id,
            'related_type' => 'Appointment',
        ]);
    }

    /**
     * Notify clinic about new patient transfer
     */
    public function notifyNewPatientTransfer(PatientTransfer $transfer): void
    {
        // Get all admin users
        $adminUsers = User::where('role', 'admin')->get();

        foreach ($adminUsers as $admin) {
            Notification::create([
                'type' => 'transfer',
                'title' => 'New Patient Transfer Request',
                'message' => "New patient transfer request from St. James Hospital for {$transfer->patient->first_name} {$transfer->patient->last_name}",
                'data' => [
                    'transfer_id' => $transfer->id,
                    'patient_name' => $transfer->patient->first_name . ' ' . $transfer->patient->last_name,
                    'priority' => $transfer->priority,
                    'reason' => $transfer->transfer_reason,
                ],
                'user_id' => $admin->id,
                'related_id' => $transfer->id,
                'related_type' => 'PatientTransfer',
            ]);
        }
    }

    /**
     * Notify hospital about transfer status change
     */
    public function notifyTransferStatusChange(PatientTransfer $transfer): void
    {
        $user = User::find($transfer->transferred_by);
        if (!$user) {
            return;
        }

        $statusMessages = [
            'completed' => 'Patient transfer has been completed',
            'cancelled' => 'Patient transfer has been cancelled',
        ];

        $message = $statusMessages[$transfer->status] ?? "Patient transfer status has been updated to {$transfer->status}";

        Notification::create([
            'type' => 'transfer',
            'title' => 'Transfer Status Update',
            'message' => $message,
            'data' => [
                'transfer_id' => $transfer->id,
                'patient_name' => $transfer->patient->first_name . ' ' . $transfer->patient->last_name,
                'status' => $transfer->status,
            ],
            'user_id' => $user->id,
            'related_id' => $transfer->id,
            'related_type' => 'PatientTransfer',
        ]);
    }

    /**
     * Get unread notifications for a user
     */
    public function getUnreadNotifications(User $user): \Illuminate\Database\Eloquent\Collection
    {
        return Notification::where('user_id', $user->id)
            ->where('read', false)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get all notifications for a user
     */
    public function getUserNotifications(User $user, int $limit = 20): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($limit);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Notification $notification): void
    {
        $notification->markAsRead();
    }

    /**
     * Mark all notifications as read for a user
     */
    public function markAllAsRead(User $user): void
    {
        Notification::where('user_id', $user->id)
            ->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);
    }

    /**
     * Get notification count for a user
     */
    public function getUnreadCount(User $user): int
    {
        return Notification::where('user_id', $user->id)
            ->where('read', false)
            ->count();
    }
}
