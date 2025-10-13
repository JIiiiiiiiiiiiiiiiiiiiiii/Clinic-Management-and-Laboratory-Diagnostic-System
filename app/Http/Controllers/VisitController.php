<?php

namespace App\Http\Controllers;

use App\Models\Visit;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\User;
use App\Models\BillingTransaction;
use App\Models\LabOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VisitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Visit::with(['patient', 'doctor', 'appointment', 'billing'])
            ->orderBy('visit_date', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by doctor
        if ($request->has('doctor_id') && $request->doctor_id && $request->doctor_id !== 'all') {
            $query->where('doctor_id', $request->doctor_id);
        }

        // Filter by date range
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('visit_date', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('visit_date', '<=', $request->date_to);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('patient_no', 'like', "%{$search}%");
            });
        }

        $visits = $query->paginate(15);

        // Get doctors for filter
        $doctors = User::where('role', 'doctor')->get(['id', 'name']);

        return Inertia::render('admin/visits/index', [
            'visits' => $visits,
            'doctors' => $doctors,
            'filters' => $request->only(['status', 'doctor_id', 'date_from', 'date_to', 'search'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $appointmentId = $request->get('appointment_id');
        $appointment = null;
        $patient = null;

        if ($appointmentId) {
            $appointment = Appointment::with('patient')->find($appointmentId);
            $patient = $appointment->patient;
        }

        $doctors = User::where('role', 'doctor')->get(['id', 'name']);
        $patients = Patient::select('id', 'first_name', 'last_name', 'patient_no')->get();

        return Inertia::render('admin/visits/create', [
            'appointment' => $appointment,
            'patient' => $patient,
            'doctors' => $doctors,
            'patients' => $patients,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:users,id',
            'visit_date' => 'required|date',
            'reason' => 'nullable|string|max:1000',
            'vitals' => 'nullable|array',
            'appointment_id' => 'nullable|exists:appointments,id',
        ]);

        DB::beginTransaction();
        try {
            $visit = Visit::create([
                'patient_id' => $request->patient_id,
                'appointment_id' => $request->appointment_id,
                'doctor_id' => $request->doctor_id,
                'visit_date' => $request->visit_date,
                'reason' => $request->reason,
                'vitals' => $request->vitals,
                'status' => 'In Progress',
                'created_by' => auth()->id(),
            ]);

            // Update appointment status if linked
            if ($request->appointment_id) {
                $appointment = Appointment::find($request->appointment_id);
                $appointment->markAsCompleted();
            }

            DB::commit();

            return redirect()->route('admin.visits.show', $visit->id)
                ->with('success', 'Visit created successfully.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to create visit: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Visit $visit)
    {
        $visit->load(['patient', 'doctor', 'appointment', 'billing']);

        return Inertia::render('admin/visits/show', [
            'visit' => $visit,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Visit $visit)
    {
        $visit->load(['patient', 'doctor', 'appointment']);
        
        $doctors = User::where('role', 'doctor')->get(['id', 'name']);

        return Inertia::render('admin/visits/edit', [
            'visit' => $visit,
            'doctors' => $doctors,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Visit $visit)
    {
        $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'visit_date' => 'required|date',
            'reason' => 'nullable|string|max:1000',
            'diagnosis' => 'nullable|string|max:2000',
            'prescription' => 'nullable|string|max:2000',
            'vitals' => 'nullable|array',
            'notes' => 'nullable|string|max:1000',
            'lab_request' => 'boolean',
            'follow_up_required' => 'boolean',
            'follow_up_date' => 'nullable|date|after:today',
            'status' => 'required|in:Pending,In Progress,Completed,Cancelled',
        ]);

        $visit->update([
            'doctor_id' => $request->doctor_id,
            'visit_date' => $request->visit_date,
            'reason' => $request->reason,
            'diagnosis' => $request->diagnosis,
            'prescription' => $request->prescription,
            'vitals' => $request->vitals,
            'notes' => $request->notes,
            'lab_request' => $request->boolean('lab_request'),
            'follow_up_required' => $request->boolean('follow_up_required'),
            'follow_up_date' => $request->follow_up_date,
            'status' => $request->status,
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('admin.visits.show', $visit->id)
            ->with('success', 'Visit updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Visit $visit)
    {
        if ($visit->status === 'Completed') {
            return back()->withErrors(['error' => 'Cannot delete completed visits.']);
        }

        $visit->delete();

        return redirect()->route('admin.visits.index')
            ->with('success', 'Visit deleted successfully.');
    }

    /**
     * Create visit from appointment
     */
    public function createFromAppointment(Appointment $appointment)
    {
        $visit = Visit::createFromAppointment($appointment, auth()->id());
        
        return redirect()->route('admin.visits.show', $visit->id)
            ->with('success', 'Visit created from appointment.');
    }

    /**
     * Complete a visit
     */
    public function complete(Visit $visit)
    {
        $visit->markAsCompleted();

        return back()->with('success', 'Visit marked as completed.');
    }

    /**
     * Cancel a visit
     */
    public function cancel(Visit $visit)
    {
        $visit->markAsCancelled();

        return back()->with('success', 'Visit cancelled.');
    }

    /**
     * Generate visit summary/print
     */
    public function summary(Visit $visit)
    {
        $visit->load(['patient', 'doctor', 'billing']);
        
        return Inertia::render('admin/visits/summary', [
            'visit' => $visit,
            'summary' => $visit->generateSummary(),
        ]);
    }

    /**
     * Get visits for a specific patient
     */
    public function patientVisits(Patient $patient)
    {
        $visits = $patient->medicalVisits()
            ->with(['doctor', 'appointment', 'billing'])
            ->orderBy('visit_date', 'desc')
            ->paginate(10);

        return Inertia::render('admin/visits/patient-visits', [
            'patient' => $patient,
            'visits' => $visits,
        ]);
    }

    /**
     * Get today's visits
     */
    public function today()
    {
        $visits = Visit::with(['patient', 'doctor', 'appointment'])
            ->whereDate('visit_date', today())
            ->orderBy('visit_date')
            ->get();

        return Inertia::render('admin/visits/today', [
            'visits' => $visits,
        ]);
    }
}
