<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Visit;
use App\Models\BillingTransaction;
use App\Models\Notification;
use App\Models\Specialist;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AppointmentApprovalService
{
    /**
     * Approve an appointment (admin function)
     * 
     * @param int $appointmentId
     * @param array $data
     * @return array
     */
    public function approveAppointment(int $appointmentId, array $data): array
    {
        return DB::transaction(function () use ($appointmentId, $data) {
            try {
                // Get appointment with lock
                $appointment = Appointment::where('id', $appointmentId)
                    ->where('status', 'Pending')
                    ->lockForUpdate()
                    ->first();

                if (!$appointment) {
                    throw new \Exception('Appointment not found or already processed');
                }

                $assignedSpecialistId = $data['assigned_specialist_id'];
                $assignedNurseId = $data['assigned_nurse_id'] ?? null;
                $adminNotes = $data['admin_notes'] ?? null;

                // Get specialist role to determine doctor/medtech assignment
                $specialist = Specialist::find($assignedSpecialistId);
                if (!$specialist) {
                    throw new \Exception('Assigned specialist not found');
                }

                // Update appointment
                $appointment->update([
                    'status' => 'Confirmed',
                    'notes' => $adminNotes,
                    'specialist_id' => $assignedSpecialistId,
                ]);

                // Generate visit code before creation
                $nextId = Visit::max('id') + 1;
                $visitCode = 'V' . str_pad($nextId, 4, '0', STR_PAD_LEFT);

                // Create visit with correct field names
                // Properly format the visit date/time
                $appointmentDate = $appointment->appointment_date;
                $appointmentTime = $appointment->appointment_time;
                
                // Handle different date/time formats
                if (is_string($appointmentDate)) {
                    $appointmentDate = date('Y-m-d', strtotime($appointmentDate));
                } else {
                    $appointmentDate = $appointmentDate->format('Y-m-d');
                }
                
                if (is_string($appointmentTime)) {
                    $appointmentTime = date('H:i:s', strtotime($appointmentTime));
                } else {
                    $appointmentTime = $appointmentTime->format('H:i:s');
                }
                
                $visitDateTime = $appointmentDate . ' ' . $appointmentTime;
                
                $visit = Visit::create([
                    'appointment_id' => $appointment->id,
                    'patient_id' => $appointment->patient_id,
                    'attending_staff_id' => $assignedSpecialistId,
                    'purpose' => $appointment->appointment_type,
                    'visit_date_time_time' => $visitDateTime,
                    'visit_date_time' => $visitDateTime,
                    'status' => 'scheduled',
                    'visit_code' => $visitCode,
                ]);

                $visitId = $visit->id;

                // Set billing status to pending for manual processing
                $appointment->update(['billing_status' => 'pending']);

                // Skip auto-generating billing transaction - admin will handle this manually
                // $billingTransaction = BillingTransaction::create([...]);
                // $billingLink = AppointmentBillingLink::create([...]);

                $transactionId = null;
                $transactionCode = null;

                // Create notification for patient
                Notification::create([
                    'type' => 'appointment_approved',
                    'title' => 'Appointment Approved',
                    'message' => "Your appointment for {$appointment->appointment_type} has been approved and scheduled.",
                    'data' => [
                        'appointment_id' => $appointment->id,
                        'visit_id' => $visitId,
                        'transaction_id' => $transactionId,
                    ],
                    'user_id' => 1, // Default admin user
                    'related_id' => $appointment->id,
                    'related_type' => 'Appointment',
                ]);

                Log::info('Appointment approved successfully', [
                    'appointment_id' => $appointment->id,
                    'visit_id' => $visitId,
                    'note' => 'Billing transaction will be created manually by admin',
                    'specialist_id' => $assignedSpecialistId,
                ]);

                return [
                    'success' => true,
                    'appointment_id' => $appointment->id,
                    'appointment_code' => $appointment->appointment_code ?? 'A' . str_pad($appointment->id, 4, '0', STR_PAD_LEFT),
                    'visit_id' => $visitId,
                    'visit_code' => $visitCode,
                    'note' => 'Billing transaction will be created manually by admin',
                    'status' => 'Confirmed'
                ];

            } catch (\Exception $e) {
                Log::error('Appointment approval failed', [
                    'appointment_id' => $appointmentId,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }
        });
    }

    /**
     * Reject an appointment
     * 
     * @param int $appointmentId
     * @param string $reason
     * @return array
     */
    public function rejectAppointment(int $appointmentId, string $reason): array
    {
        return DB::transaction(function () use ($appointmentId, $reason) {
            try {
                $appointment = Appointment::where('id', $appointmentId)
                    ->where('status', 'Pending')
                    ->lockForUpdate()
                    ->first();

                if (!$appointment) {
                    throw new \Exception('Appointment not found or already processed');
                }

                // Update appointment status
                $appointment->update([
                    'status' => 'Cancelled',
                    'notes' => $reason,
                ]);

                // Create notification for patient
                Notification::create([
                    'type' => 'appointment_rejected',
                    'title' => 'Appointment Rejected',
                    'message' => "Your appointment has been rejected. Reason: {$reason}",
                    'data' => [
                        'appointment_id' => $appointment->id,
                        'reason' => $reason,
                    ],
                    'user_id' => 1, // Default admin user
                    'related_id' => $appointment->id,
                    'related_type' => 'Appointment',
                ]);

                Log::info('Appointment rejected', [
                    'appointment_id' => $appointment->id,
                    'reason' => $reason
                ]);

                return [
                    'success' => true,
                    'appointment_id' => $appointment->id,
                    'status' => 'Cancelled'
                ];

            } catch (\Exception $e) {
                Log::error('Appointment rejection failed', [
                    'appointment_id' => $appointmentId,
                    'error' => $e->getMessage()
                ]);
                throw $e;
            }
        });
    }
}