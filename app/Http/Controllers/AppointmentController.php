<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\AppointmentSlot;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
{
    /**
     * Display a listing of appointments.
     */
    public function index(Request $request): View
    {
        $query = Appointment::with(['patient', 'scheduledBy', 'slot']);

        // Filter by status
        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        // Filter by date range
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->byDateRange($request->start_date, $request->end_date);
        }

        // Filter by patient
        if ($request->filled('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        $appointments = $query->latest('appointment_date_time')->paginate(15);
        $patients = Patient::all();
        $users = User::whereIn('role', ['Staff', 'Doctor'])->get();

        return view('appointments.index', compact('appointments', 'patients', 'users'));
    }

    /**
     * Show the form for creating a new appointment.
     */
    public function create(): View
    {
        $patients = Patient::all();
        $users = User::whereIn('role', ['Staff', 'Doctor'])->get();
        $availableSlots = AppointmentSlot::available()->get();

        return view('appointments.create', compact('patients', 'users', 'availableSlots'));
    }

    /**
     * Store a newly created appointment.
     */
    public function store(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:patients,patient_id',
            'scheduled_by_user_id' => 'required|exists:users,user_id',
            'scheduled_by_role' => 'required|in:Patient,Staff,Doctor,System',
            'appointment_date_time' => 'required|date|after:now',
            'reason' => 'nullable|string|max:1000',
            'slot_id' => 'nullable|exists:appointment_slots,slot_id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            DB::beginTransaction();

            $appointment = Appointment::create($request->all());

            // If a slot is selected, mark it as unavailable
            if ($request->filled('slot_id')) {
                AppointmentSlot::where('slot_id', $request->slot_id)
                    ->update(['is_available' => false]);
            }

            DB::commit();

            return redirect()->route('appointments.index')
                ->with('success', 'Appointment created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to create appointment. Please try again.');
        }
    }

    /**
     * Display the specified appointment.
     */
    public function show(Appointment $appointment): View
    {
        $appointment->load(['patient', 'scheduledBy', 'slot', 'consultation.doctor']);

        return view('appointments.show', compact('appointment'));
    }

    /**
     * Show the form for editing the specified appointment.
     */
    public function edit(Appointment $appointment): View
    {
        $patients = Patient::all();
        $users = User::whereIn('role', ['Staff', 'Doctor'])->get();
        $availableSlots = AppointmentSlot::available()->get();

        return view('appointments.edit', compact('appointment', 'patients', 'users', 'availableSlots'));
    }

    /**
     * Update the specified appointment.
     */
    public function update(Request $request, Appointment $appointment): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:patients,patient_id',
            'scheduled_by_user_id' => 'required|exists:users,user_id',
            'scheduled_by_role' => 'required|in:Patient,Staff,Doctor,System',
            'appointment_date_time' => 'required|date',
            'status' => 'required|in:Requested,Scheduled,Confirmed,Completed,Cancelled',
            'reason' => 'nullable|string|max:1000',
            'slot_id' => 'nullable|exists:appointment_slots,slot_id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            DB::beginTransaction();

            // If slot is changing, update availability
            if ($appointment->slot_id !== $request->slot_id) {
                // Mark old slot as available
                if ($appointment->slot_id) {
                    AppointmentSlot::where('slot_id', $appointment->slot_id)
                        ->update(['is_available' => true]);
                }

                // Mark new slot as unavailable
                if ($request->filled('slot_id')) {
                    AppointmentSlot::where('slot_id', $request->slot_id)
                        ->update(['is_available' => false]);
                }
            }

            $appointment->update($request->all());

            DB::commit();

            return redirect()->route('appointments.index')
                ->with('success', 'Appointment updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to update appointment. Please try again.');
        }
    }

    /**
     * Remove the specified appointment.
     */
    public function destroy(Appointment $appointment): RedirectResponse
    {
        try {
            DB::beginTransaction();

            // Mark slot as available if it exists
            if ($appointment->slot_id) {
                AppointmentSlot::where('slot_id', $appointment->slot_id)
                    ->update(['is_available' => true]);
            }

            $appointment->delete();

            DB::commit();

            return redirect()->route('appointments.index')
                ->with('success', 'Appointment deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to delete appointment. Please try again.');
        }
    }

    /**
     * Update appointment status.
     */
    public function updateStatus(Request $request, Appointment $appointment): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:Requested,Scheduled,Confirmed,Completed,Cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $appointment->update([
            'status' => $request->status,
            'checked_in_at' => $request->status === 'Confirmed' ? now() : null,
            'completed_at' => $request->status === 'Completed' ? now() : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Appointment status updated successfully.',
            'appointment' => $appointment->fresh()
        ]);
    }

    /**
     * Get available appointment slots for a specific date.
     */
    public function getAvailableSlots(Request $request): JsonResponse
    {
        $date = $request->get('date');

        if (!$date) {
            return response()->json(['success' => false, 'message' => 'Date is required.'], 400);
        }

        $slots = AppointmentSlot::available()
            ->byDate($date)
            ->get();

        return response()->json([
            'success' => true,
            'slots' => $slots
        ]);
    }
}
