<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AppointmentApprovalService;
use App\Models\Appointment;
use App\Models\Specialist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminAppointmentController extends Controller
{
    protected $appointmentApprovalService;

    public function __construct(AppointmentApprovalService $appointmentApprovalService)
    {
        $this->appointmentApprovalService = $appointmentApprovalService;
    }

    /**
     * Get pending appointments
     */
    public function pending()
    {
        try {
            $appointments = Appointment::where('status', 'Pending')
                ->with(['patient', 'specialist'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $appointments
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve pending appointments', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve pending appointments: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve an appointment
     */
    public function approve(Request $request, $appointmentId)
    {
        try {
            $request->validate([
                'assigned_specialist_id' => 'required|integer|exists:specialists,specialist_id',
                'assigned_nurse_id' => 'nullable|integer|exists:specialists,specialist_id',
                'admin_notes' => 'nullable|string|max:1000',
            ]);

            $result = $this->appointmentApprovalService->approveAppointment($appointmentId, [
                'assigned_specialist_id' => $request->input('assigned_specialist_id'),
                'assigned_nurse_id' => $request->input('assigned_nurse_id'),
                'admin_notes' => $request->input('admin_notes'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Appointment approved successfully',
                'data' => $result
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to approve appointment', [
                'appointment_id' => $appointmentId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to approve appointment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject an appointment
     */
    public function reject(Request $request, $appointmentId)
    {
        try {
            $request->validate([
                'reason' => 'required|string|max:1000',
            ]);

            $result = $this->appointmentApprovalService->rejectAppointment(
                $appointmentId,
                $request->input('reason')
            );

            return response()->json([
                'success' => true,
                'message' => 'Appointment rejected successfully',
                'data' => $result
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to reject appointment', [
                'appointment_id' => $appointmentId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to reject appointment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specialists for assignment
     */
    public function specialists()
    {
        try {
            $specialists = Specialist::where('status', 'Active')
                ->orderBy('role')
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $specialists
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve specialists: ' . $e->getMessage()
            ], 500);
        }
    }
}