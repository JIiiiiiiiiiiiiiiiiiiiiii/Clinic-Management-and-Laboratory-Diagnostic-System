<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $query = Patient::query();

        // Search functionality
        if ($request->has('search') && !empty($request->search)) {
            $query->search($request->search);
        }

        // Pagination
        $patients = $query->orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('admin/patient/index', [
            'patients' => $patients->items(),
            'pagination' => [
                'current_page' => $patients->currentPage(),
                'last_page' => $patients->lastPage(),
                'per_page' => $patients->perPage(),
                'total' => $patients->total(),
            ],
        ]);
    }

    public function create()
    {
        $doctors = \App\Models\User::query()
            ->where('role', 'doctor')
            ->where(function ($q) {
                // Some setups may not have is_active; guard with exists check
                try {
                    $q->where('is_active', true);
                } catch (\Throwable $e) {
                    // ignore
                }
            })
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/patient/create', [
            'doctors' => $doctors,
        ]);
    }

    public function store(Request $request)
    {
        try {
            // Validate the request data
            $validated = $request->validate([
            // Arrival Information
            'arrival_date' => 'required|date',
            'arrival_time' => 'required',

            // Patient Identification
            'last_name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'birthdate' => 'required|date',
            'age' => 'required|integer|min:0|max:150',
            'sex' => 'required|in:male,female',
            'patient_no' => 'nullable|string|unique:patients,patient_no',

            // Demographics
            'occupation' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'attending_physician' => 'required|string|max:255',
            'civil_status' => 'required|in:single,married,widowed,divorced,separated',
            'nationality' => 'nullable|string|max:255',

            // Contact Information
            'present_address' => 'required|string',
            'telephone_no' => 'nullable|string|max:255',
            'mobile_no' => 'required|string|max:255',

            // Emergency Contact
            'informant_name' => 'required|string|max:255',
            'relationship' => 'required|string|max:255',

            // Financial/Insurance
            'company_name' => 'nullable|string|max:255',
            'hmo_name' => 'nullable|string|max:255',
            'hmo_company_id_no' => 'nullable|string|max:255',
            'validation_approval_code' => 'nullable|string|max:255',
            'validity' => 'nullable|string|max:255',

            // Emergency Staff Nurse Section
            'mode_of_arrival' => 'nullable|string|max:255',
            'drug_allergies' => 'nullable|string|max:255',
            'food_allergies' => 'nullable|string|max:255',

            // Vital Signs
            'blood_pressure' => 'nullable|string|max:255',
            'heart_rate' => 'nullable|string|max:255',
            'respiratory_rate' => 'nullable|string|max:255',
            'temperature' => 'nullable|string|max:255',
            'weight_kg' => 'nullable|numeric|min:0|max:500',
            'height_cm' => 'nullable|numeric|min:0|max:300',
            'pain_assessment_scale' => 'nullable|string|max:255',
            'oxygen_saturation' => 'nullable|string|max:255',

            // Medical Assessment
            'reason_for_consult' => 'nullable|string',
            'time_seen' => 'required',
            'history_of_present_illness' => 'nullable|string',
            'pertinent_physical_findings' => 'nullable|string',
            'plan_management' => 'nullable|string',
            'past_medical_history' => 'nullable|string',
            'family_history' => 'nullable|string',
            'social_personal_history' => 'nullable|string',
            'obstetrics_gynecology_history' => 'nullable|string',
            'lmp' => 'nullable|string|max:255',
            'assessment_diagnosis' => 'nullable|string',
            ]);

            // Compute age from birthdate to ensure consistency
            if (isset($validated['birthdate'])) {
                $validated['age'] = now()->parse($validated['birthdate'])->age;
            }

            // Create the patient
            $patient = Patient::create($validated);

            return redirect()->route('patient.index')
                ->with('success', 'Patient created successfully!')
                ->with('created_patient', [
                    'id' => $patient->id,
                    'last_name' => $patient->last_name,
                    'first_name' => $patient->first_name,
                    'age' => $patient->age,
                    'sex' => $patient->sex,
                ]);
        } catch (\Throwable $e) {
            return back()
                ->with('error', 'Failed to create patient: '.($e->getMessage()))
                ->withInput();
        }
    }

    public function show(Patient $patient)
    {
        return Inertia::render('admin/patient/show', [
            'patient' => $patient
        ]);
    }

    public function edit(Patient $patient)
    {
        $doctors = \App\Models\User::query()
            ->where('role', 'doctor')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/patient/edit', [
            'patient' => $patient,
            'doctors' => $doctors,
        ]);
    }

    public function update(Request $request, Patient $patient)
    {
        try {
            // Validate the request data
            $validated = $request->validate([
            // Arrival Information
            'arrival_date' => 'required|date',
            'arrival_time' => 'required',

            // Patient Identification
            'last_name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'birthdate' => 'required|date',
            'age' => 'required|integer|min:0|max:150',
            'sex' => 'required|in:male,female',
            'patient_no' => ['nullable', 'string', Rule::unique('patients')->ignore($patient->id)],

            // Demographics
            'occupation' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'attending_physician' => 'required|string|max:255',
            'civil_status' => 'required|in:single,married,widowed,divorced,separated',
            'nationality' => 'nullable|string|max:255',

            // Contact Information
            'present_address' => 'required|string',
            'telephone_no' => 'nullable|string|max:255',
            'mobile_no' => 'required|string|max:255',

            // Emergency Contact
            'informant_name' => 'required|string|max:255',
            'relationship' => 'required|string|max:255',

            // Financial/Insurance
            'company_name' => 'nullable|string|max:255',
            'hmo_name' => 'nullable|string|max:255',
            'hmo_company_id_no' => 'nullable|string|max:255',
            'validation_approval_code' => 'nullable|string|max:255',
            'validity' => 'nullable|string|max:255',

            // Emergency Staff Nurse Section
            'mode_of_arrival' => 'nullable|string|max:255',
            'drug_allergies' => 'nullable|string|max:255',
            'food_allergies' => 'nullable|string|max:255',

            // Vital Signs
            'blood_pressure' => 'nullable|string|max:255',
            'heart_rate' => 'nullable|string|max:255',
            'respiratory_rate' => 'nullable|string|max:255',
            'temperature' => 'nullable|string|max:255',
            'weight_kg' => 'nullable|numeric|min:0|max:500',
            'height_cm' => 'nullable|numeric|min:0|max:300',
            'pain_assessment_scale' => 'nullable|string|max:255',
            'oxygen_saturation' => 'nullable|string|max:255',

            // Medical Assessment
            'reason_for_consult' => 'nullable|string',
            'time_seen' => 'required',
            'history_of_present_illness' => 'nullable|string',
            'pertinent_physical_findings' => 'nullable|string',
            'plan_management' => 'nullable|string',
            'past_medical_history' => 'nullable|string',
            'family_history' => 'nullable|string',
            'social_personal_history' => 'nullable|string',
            'obstetrics_gynecology_history' => 'nullable|string',
            'lmp' => 'nullable|string|max:255',
            'assessment_diagnosis' => 'nullable|string',
            ]);

            // Compute age from birthdate to ensure consistency
            if (isset($validated['birthdate'])) {
                $validated['age'] = now()->parse($validated['birthdate'])->age;
            }

            // Update the patient
            $patient->update($validated);

            return redirect()->route('patient.index')->with('success', 'Patient updated successfully!');
        } catch (\Throwable $e) {
            return back()
                ->with('error', 'Failed to update patient: '.($e->getMessage()))
                ->withInput();
        }
    }

    public function destroy(Patient $patient)
    {
        $patient->delete();

        return redirect()->route('patient.index')->with('success', 'Patient deleted successfully!');
    }
}
