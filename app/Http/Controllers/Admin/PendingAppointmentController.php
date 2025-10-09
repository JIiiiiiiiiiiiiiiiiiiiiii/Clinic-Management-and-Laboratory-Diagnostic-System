<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PendingAppointment;
use App\Models\Appointment;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PendingAppointmentController extends Controller
{
    /**
     * Display pending appointments for admin approval
     */
    public function index(): Response
    {
        // Get all pending appointments for debugging
        $allPendingAppointments = PendingAppointment::all();
        \Log::info('All pending appointments', [
            'count' => $allPendingAppointments->count(),
            'appointments' => $allPendingAppointments->map(function($apt) {
                return [
                    'id' => $apt->id,
                    'status_approval' => $apt->status_approval,
                    'patient_name' => $apt->patient_name
                ];
            })
        ]);

        $pendingAppointments = PendingAppointment::where('status_approval', 'pending')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'patient_name' => $appointment->patient_name,
                    'patient_id' => $appointment->patient_id,
                    'appointment_type' => $appointment->appointment_type,
                    'specialist_name' => $appointment->specialist_name,
                    'appointment_date' => $appointment->appointment_date->format('M d, Y'),
                    'appointment_time' => $appointment->appointment_time->format('g:i A'),
                    'price' => $appointment->formatted_price,
                    'notes' => $appointment->notes,
                    'special_requirements' => $appointment->special_requirements,
                    'created_at' => $appointment->created_at->format('M d, Y g:i A'),
                ];
            });

        \Log::info('Filtered pending appointments', [
            'count' => $pendingAppointments->count()
        ]);

        return Inertia::render('admin/pending-appointments/index', [
            'pendingAppointments' => $pendingAppointments,
        ]);
    }

    /**
     * Show pending appointment details
     */
    public function show(PendingAppointment $pendingAppointment): Response
    {
        return Inertia::render('admin/pending-appointments/show', [
            'pendingAppointment' => [
                'id' => $pendingAppointment->id,
                'patient_name' => $pendingAppointment->patient_name,
                'patient_id' => $pendingAppointment->patient_id,
                'contact_number' => $pendingAppointment->contact_number,
                'appointment_type' => $pendingAppointment->appointment_type,
                'specialist_type' => $pendingAppointment->specialist_type,
                'specialist_name' => $pendingAppointment->specialist_name,
                'specialist_id' => $pendingAppointment->specialist_id,
                'appointment_date' => $pendingAppointment->appointment_date->format('M d, Y'),
                'appointment_time' => $pendingAppointment->appointment_time->format('g:i A'),
                'duration' => $pendingAppointment->duration,
                'price' => $pendingAppointment->formatted_price,
                'notes' => $pendingAppointment->notes,
                'special_requirements' => $pendingAppointment->special_requirements,
                'booking_method' => $pendingAppointment->booking_method,
                'status_approval' => $pendingAppointment->status_approval,
                'created_at' => $pendingAppointment->created_at->format('M d, Y g:i A'),
            ],
        ]);
    }

    /**
     * Approve pending appointment
     */
    public function approve(Request $request, PendingAppointment $pendingAppointment): RedirectResponse
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:500',
        ]);

        try {
            // Check if appointment already exists to prevent duplicates
            $existingAppointment = Appointment::where('patient_id', $pendingAppointment->patient_id)
                ->where('appointment_date', $pendingAppointment->appointment_date)
                ->where('appointment_time', $pendingAppointment->appointment_time)
                ->where('appointment_type', $pendingAppointment->appointment_type)
                ->where('status', 'Confirmed')
                ->first();

            if ($existingAppointment) {
                return back()->withErrors(['error' => 'This appointment has already been approved. Please refresh the page.', 'code' => 'already_approved']);
            }

            // Create the actual appointment
            $appointmentData = [
                'patient_name' => $pendingAppointment->patient_name,
                'patient_id' => $pendingAppointment->patient_id,
                'contact_number' => $pendingAppointment->contact_number,
                'appointment_type' => $pendingAppointment->appointment_type,
                'specialist_type' => $pendingAppointment->specialist_type,
                'specialist_name' => $pendingAppointment->specialist_name,
                'specialist_id' => $pendingAppointment->specialist_id,
                'appointment_date' => $pendingAppointment->appointment_date,
                'appointment_time' => $pendingAppointment->appointment_time,
                'duration' => $pendingAppointment->duration,
                'status' => 'Confirmed',
                'billing_status' => $pendingAppointment->billing_status,
                'notes' => $pendingAppointment->notes,
                'special_requirements' => $pendingAppointment->special_requirements,
                'booking_method' => $pendingAppointment->booking_method,
                'price' => $pendingAppointment->price,
                'appointment_source' => $pendingAppointment->appointment_source,
            ];

            $appointment = Appointment::create($appointmentData);

            // Update pending appointment status
            $pendingAppointment->update([
                'status_approval' => 'approved',
                'admin_notes' => $request->admin_notes,
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);

            // Log the pending appointment update
            \Log::info('Pending appointment updated', [
                'pending_appointment_id' => $pendingAppointment->id,
                'status_approval' => 'approved',
                'patient_id' => $pendingAppointment->patient_id
            ]);

            // Notify patient about approval with admin notes
            $this->notifyPatientAppointmentApproved($appointment, $request->admin_notes);

            // Log the approval for debugging
            \Log::info('Appointment approved successfully', [
                'appointment_id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'admin_notes' => $request->admin_notes
            ]);

            return redirect()->route('admin.pending-appointments.index')
                ->with('success', 'Appointment approved successfully! Patient has been notified.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to approve appointment. Please try again.']);
        }
    }

    /**
     * Reject pending appointment
     */
    public function reject(Request $request, PendingAppointment $pendingAppointment): RedirectResponse
    {
        $request->validate([
            'admin_notes' => 'required|string|max:500',
        ]);

        try {
            // Update pending appointment status
            $pendingAppointment->update([
                'status_approval' => 'rejected',
                'admin_notes' => $request->admin_notes,
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);

            // Notify patient about rejection
            $this->notifyPatientAppointmentRejected($pendingAppointment);

            return redirect()->route('admin.pending-appointments.index')
                ->with('success', 'Appointment rejected. Patient has been notified with the reason.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to reject appointment. Please try again.']);
        }
    }

    /**
     * Notify patient about appointment approval
     */
    private function notifyPatientAppointmentApproved(Appointment $appointment, $adminNotes = null)
    {
        \Log::info('Starting notification process', [
            'appointment_id' => $appointment->id,
            'patient_id' => $appointment->patient_id,
            'appointment_type' => $appointment->appointment_type
        ]);

        // Find patient user
        $patient = \App\Models\Patient::where('patient_no', $appointment->patient_id)->first();
        if (!$patient || !$patient->user_id) {
            \Log::error('Patient not found for notification', [
                'appointment_id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'all_patients' => \App\Models\Patient::select('patient_no', 'user_id')->get()
            ]);
            return;
        }

        \Log::info('Patient found for notification', [
            'patient_id' => $patient->id,
            'patient_no' => $patient->patient_no,
            'user_id' => $patient->user_id
        ]);

        $user = User::find($patient->user_id);
        if (!$user) {
            \Log::error('User not found for notification', [
                'patient_id' => $patient->id,
                'user_id' => $patient->user_id
            ]);
            return;
        }

        // Build notification message with admin notes if provided
        $message = "Your appointment for {$appointment->appointment_type} on {$appointment->appointment_date} at {$appointment->appointment_time} has been approved and confirmed.";
        if ($adminNotes) {
            $message .= " Admin notes: {$adminNotes}";
        }

        try {
            $notification = Notification::create([
                'type' => 'appointment',
                'title' => 'Appointment Approved',
                'message' => $message,
                'data' => [
                    'appointment_id' => $appointment->id,
                    'status' => 'Confirmed',
                    'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time,
                    'specialist_name' => $appointment->specialist_name,
                    'admin_notes' => $adminNotes,
                ],
                'user_id' => $user->id,
                'related_id' => $appointment->id,
                'related_type' => 'Appointment',
            ]);

            \Log::info('Notification created successfully', [
                'notification_id' => $notification->id,
                'user_id' => $user->id,
                'appointment_id' => $appointment->id
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to create notification', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'appointment_id' => $appointment->id
            ]);
            return;
        }

        // Broadcast to patient
        broadcast(new \App\Events\AppointmentStatusUpdate($notification, $user->id));

        // Log the notification for debugging
        \Log::info('Patient notification sent', [
            'notification_id' => $notification->id,
            'user_id' => $user->id,
            'appointment_id' => $appointment->id,
            'message' => $message
        ]);
    }

    /**
     * Remove pending appointment
     */
    public function destroy(PendingAppointment $pendingAppointment): RedirectResponse
    {
        try {
            $appointmentId = $pendingAppointment->id;
            $patientName = $pendingAppointment->patient_name;
            
            // Delete the pending appointment
            $pendingAppointment->delete();
            
            \Log::info('Pending appointment removed', [
                'appointment_id' => $appointmentId,
                'patient_name' => $patientName
            ]);
            
            return redirect()->route('admin.pending-appointments.index')
                ->with('success', 'Pending appointment removed successfully.');
                
        } catch (\Exception $e) {
            \Log::error('Failed to remove pending appointment', [
                'error' => $e->getMessage(),
                'appointment_id' => $pendingAppointment->id
            ]);
            
            return back()->withErrors(['error' => 'Failed to remove pending appointment. Please try again.']);
        }
    }

    /**
     * Notify patient about appointment rejection
     */
    private function notifyPatientAppointmentRejected(PendingAppointment $pendingAppointment)
    {
        // Find patient user
        $patient = \App\Models\Patient::where('patient_id', $pendingAppointment->patient_id)->first();
        if (!$patient || !$patient->user_id) {
            return;
        }

        $user = User::find($patient->user_id);
        if (!$user) {
            return;
        }

        Notification::create([
            'type' => 'appointment',
            'title' => 'Appointment Request Rejected',
            'message' => "Your appointment request for {$pendingAppointment->appointment_type} on {$pendingAppointment->appointment_date} at {$pendingAppointment->appointment_time} has been rejected. Reason: {$pendingAppointment->admin_notes}",
            'data' => [
                'pending_appointment_id' => $pendingAppointment->id,
                'status' => 'Rejected',
                'appointment_date' => $pendingAppointment->appointment_date,
                'appointment_time' => $pendingAppointment->appointment_time,
                'specialist_name' => $pendingAppointment->specialist_name,
                'admin_notes' => $pendingAppointment->admin_notes,
            ],
            'user_id' => $user->id,
            'related_id' => $pendingAppointment->id,
            'related_type' => 'PendingAppointment',
        ]);

        // Broadcast to patient
        broadcast(new \App\Events\AppointmentStatusUpdate($notification, $user->id));
    }
}
