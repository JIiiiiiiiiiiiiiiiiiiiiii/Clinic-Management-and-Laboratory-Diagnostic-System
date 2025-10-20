<?php

namespace App\Http\Controllers\Hospital;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\PatientTransfer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class HospitalPatientController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Patient::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%")
                  ->orWhere('mobile_no', 'like', "%{$search}%");
            });
        }

        // Filter by transfer status
        if ($request->has('transfer_status')) {
            $transferStatus = $request->transfer_status;
            if ($transferStatus === 'transferred') {
                $query->whereHas('transfers', function($q) {
                    $q->where('status', 'completed');
                });
            } elseif ($transferStatus === 'pending') {
                $query->whereHas('transfers', function($q) {
                    $q->where('status', 'pending');
                });
            } elseif ($transferStatus === 'not_transferred') {
                $query->whereDoesntHave('transfers');
            }
        }

        $patients = $query->with(['transfers' => function($q) {
            $q->latest();
        }])
        ->orderBy('created_at', 'desc')
        ->paginate(15)
        ->through(function($patient) {
            return [
                'id' => $patient->id,
                'patient_no' => $patient->patient_no,
                'full_name' => $patient->first_name . ' ' . $patient->last_name,
                'age' => $patient->age,
                'sex' => $patient->sex,
                'mobile_no' => $patient->mobile_no,
                'present_address' => $patient->present_address,
                'created_at' => $patient->created_at,
                'transfers' => $patient->transfers
            ];
        });

        // Get statistics
        $stats = [
            'total_patients' => Patient::count(),
            'male_patients' => Patient::where('sex', 'male')->count(),
            'female_patients' => Patient::where('sex', 'female')->count(),
            'transferred_patients' => Patient::whereHas('transfers', function($q) {
                $q->where('status', 'completed');
            })->count(),
            'new_this_month' => Patient::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];

        return Inertia::render('Hospital/Patients/Index', [
            'patients' => $patients,
            'stats' => $stats,
            'filters' => $request->only(['search', 'transfer_status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Hospital/Patients/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_number' => 'nullable|string|max:20',
            'medical_history' => 'nullable|string',
            'allergies' => 'nullable|string',
            'current_medications' => 'nullable|string',
        ]);

        // Generate patient ID
        $patientId = 'P' . str_pad(Patient::count() + 1, 6, '0', STR_PAD_LEFT);

        $patient = Patient::create([
            ...$validated,
            'patient_id' => $patientId,
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('hospital.patients.show', $patient)
            ->with('success', 'Patient created successfully.');
    }

    public function show(Patient $patient): Response
    {
        $patient->load(['transfers', 'visits', 'appointments']);

        return Inertia::render('Hospital/Patients/Show', [
            'patient' => $patient,
        ]);
    }

    public function edit(Patient $patient): Response
    {
        return Inertia::render('Hospital/Patients/Edit', [
            'patient' => $patient,
        ]);
    }

    public function update(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_number' => 'nullable|string|max:20',
            'medical_history' => 'nullable|string',
            'allergies' => 'nullable|string',
            'current_medications' => 'nullable|string',
        ]);

        $patient->update([
            ...$validated,
            'updated_by' => auth()->id(),
        ]);

        return redirect()->route('hospital.patients.show', $patient)
            ->with('success', 'Patient updated successfully.');
    }

    public function destroy(Patient $patient)
    {
        $patient->delete();

        return redirect()->route('hospital.patients.index')
            ->with('success', 'Patient deleted successfully.');
    }

    public function transferToClinic(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'transfer_reason' => 'required|string|max:500',
            'priority' => 'required|in:low,medium,high,urgent',
            'notes' => 'nullable|string|max:1000',
        ]);

        $transfer = PatientTransfer::create([
            'patient_id' => $patient->id,
            'from_hospital' => true,
            'transfer_reason' => $validated['transfer_reason'],
            'priority' => $validated['priority'],
            'notes' => $validated['notes'],
            'status' => 'pending',
            'transferred_by' => auth()->id(),
        ]);

        return redirect()->route('hospital.patients.show', $patient)
            ->with('success', 'Patient transfer request created successfully.');
    }

    public function transferHistory(Patient $patient): Response
    {
        $transfers = $patient->transfers()->with('transferredBy')->latest()->get();

        return Inertia::render('Hospital/Patients/TransferHistory', [
            'patient' => $patient,
            'transfers' => $transfers,
        ]);
    }

    public function refer(): Response
    {
        $patients = Patient::with(['transfers' => function($q) {
            $q->latest();
        }])
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function($patient) {
            return [
                'id' => $patient->id,
                'patient_no' => $patient->patient_no,
                'full_name' => $patient->first_name . ' ' . $patient->last_name,
                'age' => $patient->age,
                'sex' => $patient->sex,
                'mobile_no' => $patient->mobile_no,
                'created_at' => $patient->created_at,
                'transfers' => $patient->transfers
            ];
        });

        return Inertia::render('Hospital/Patients/Refer', [
            'patients' => $patients,
        ]);
    }

    public function processReferral(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'transfer_reason' => 'required|string|max:500',
            'priority' => 'required|in:low,medium,high,urgent',
            'notes' => 'nullable|string|max:1000',
        ]);

        $transfer = PatientTransfer::create([
            'patient_id' => $validated['patient_id'],
            'from_hospital' => true,
            'transfer_reason' => $validated['transfer_reason'],
            'priority' => $validated['priority'],
            'notes' => $validated['notes'],
            'status' => 'pending',
            'transferred_by' => auth()->id(),
        ]);

        return redirect()->route('hospital.patients.refer')
            ->with('success', 'Patient referral created successfully.');
    }
}
