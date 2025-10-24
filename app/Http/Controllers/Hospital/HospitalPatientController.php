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

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        
        // Validate sort column to prevent SQL injection
        $allowedSortColumns = ['id', 'first_name', 'last_name', 'created_at', 'updated_at'];
        if (!in_array($sortBy, $allowedSortColumns)) {
            $sortBy = 'created_at';
        }
        
        // Validate sort direction
        $sortDir = in_array(strtolower($sortDir), ['asc', 'desc']) ? strtolower($sortDir) : 'desc';

        $patients = $query->with(['transfers' => function($q) {
            $q->latest();
        }])
        ->orderBy($sortBy, $sortDir)
        ->paginate(15);

        return Inertia::render('admin/patient/index', [
            'patients' => $patients->items(),
            'patients_pagination' => [
                'current_page' => $patients->currentPage(),
                'last_page' => $patients->lastPage(),
                'per_page' => $patients->perPage(),
                'total' => $patients->total(),
            ],
            'patients_filters' => [
                'p_search' => $request->get('search', ''),
                'p_sort_by' => $request->get('sort_by', 'created_at'),
                'p_sort_dir' => $request->get('sort_dir', 'desc'),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/patient/create');
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
        
        return Inertia::render('admin/patient/show', [
            'patient' => $patient,
        ]);
    }

    public function edit(Patient $patient): Response
    {
        return Inertia::render('admin/patient/edit', [
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
        
        return Inertia::render('admin/patient/transfer-history', [
            'patient' => $patient,
            'transfers' => $transfers,
        ]);
    }
}
