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
        // Simple test with minimal data
        return Inertia::render('Hospital/Patients/IndexSimple', [
            'patients' => [
                'data' => [],
                'links' => [],
                'meta' => []
            ],
            'stats' => [
                'total_patients' => 0,
                'male_patients' => 0,
                'female_patients' => 0,
                'new_this_month' => 0,
            ],
            'filters' => [],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Hospital/Patients/CreateSimple');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'birthdate' => 'required|date',
            'sex' => 'required|in:male,female',
            'mobile_no' => 'nullable|string|max:20',
            'telephone_no' => 'nullable|string|max:20',
            'present_address' => 'nullable|string|max:500',
            'occupation' => 'nullable|string|max:255',
            'civil_status' => 'nullable|string|max:50',
            'nationality' => 'nullable|string|max:100',
            'religion' => 'nullable|string|max:100',
            'informant_name' => 'nullable|string|max:255',
            'relationship' => 'nullable|string|max:100',
            'drug_allergies' => 'nullable|string',
            'food_allergies' => 'nullable|string',
            'past_medical_history' => 'nullable|string',
            'family_history' => 'nullable|string',
            'social_personal_history' => 'nullable|string',
            'obstetrics_gynecology_history' => 'nullable|string',
        ]);

        // Calculate age from birthdate
        $age = \Carbon\Carbon::parse($validated['birthdate'])->age;

        // Generate patient number
        $maxPatientNo = Patient::max('patient_no');
        $nextPatientNo = $maxPatientNo ? $maxPatientNo + 1 : 1;

        $patient = Patient::create([
            ...$validated,
            'age' => $age,
            'patient_no' => $nextPatientNo,
            'user_id' => null, // Hospital patients don't have user accounts initially
        ]);

        return redirect()->route('hospital.patients.show', $patient)
            ->with('success', 'Patient created successfully and added to admin system.');
    }

    public function show(Patient $patient): Response
    {
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

    /**
     * Show refer patient form
     */
    public function refer(): Response
    {
        // Simple test data to match working structure
        $patients = [
            [
                'id' => 1,
                'patient_no' => 'P001',
                'full_name' => 'Test Patient 1'
            ],
            [
                'id' => 2,
                'patient_no' => 'P002', 
                'full_name' => 'Test Patient 2'
            ]
        ];

        return Inertia::render('Hospital/Patients/ReferSimple', [
            'patients' => $patients,
        ]);
    }

    /**
     * Process patient referral
     */
    public function processReferral(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'referral_reason' => 'required|string|max:500',
            'priority' => 'required|in:low,medium,high,urgent',
            'specialist_type' => 'required|string|max:100',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Create referral record
        $referral = \App\Models\PatientReferral::create([
            'patient_id' => $validated['patient_id'],
            'referral_reason' => $validated['referral_reason'],
            'priority' => $validated['priority'],
            'specialist_type' => $validated['specialist_type'],
            'notes' => $validated['notes'],
            'status' => 'pending',
            'referred_by' => auth()->id(),
        ]);

        return redirect()->route('hospital.patients.index')
            ->with('success', 'Patient referral created successfully.');
    }
}
