<?php

namespace App\Http\Controllers;

use App\Http\Requests\Patient\StorePatientRequest;
use App\Http\Requests\Patient\UpdatePatientRequest;
use App\Models\Patient;
use App\Services\PatientService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        // Simple patients data to match working structure
        $patients = [
            'data' => [],
            'links' => [],
            'meta' => []
        ];

        $visits = [
            'data' => [],
            'links' => [],
            'meta' => []
        ];

        return Inertia::render('admin/patient/index', [
            'patients' => $patients,
            'visits' => $visits,
        ]);
    }

    public function create()
    {
        // Get next patient number for display only (not used in form submission)
        $max = Patient::query()->max('patient_no');
        $numericMax = is_numeric($max) ? (int) $max : (int) ltrim((string) $max, '0');
        $candidate = $numericMax + 1;
        while (Patient::where('patient_no', (string) $candidate)->exists()) {
            $candidate++;
        }
        $nextPatientNo = (string) $candidate;

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

        return Inertia::render('admin/patient/create');
    }


    public function store(StorePatientRequest $request, PatientService $patientService)
    {
        try {
            // Check for duplicate patient before validation
            $duplicatePatient = $patientService->findDuplicate($request->all());
            if ($duplicatePatient && !$request->boolean('force_create')) {
                return back()
                    ->with('error', 'A possible duplicate patient was found.')
                    ->with('duplicate_patient', [
                        'id' => $duplicatePatient->id,
                        'patient_no' => $duplicatePatient->patient_no,
                        'last_name' => $duplicatePatient->last_name,
                        'first_name' => $duplicatePatient->first_name,
                        'birthdate' => $duplicatePatient->birthdate ? (is_string($duplicatePatient->birthdate) ? $duplicatePatient->birthdate : \Carbon\Carbon::parse($duplicatePatient->birthdate)->format('Y-m-d')) : null,
                        'mobile_no' => $duplicatePatient->mobile_no,
                    ])
                    ->withInput();
            }

            // Validate the request data
            $validated = $request->validated();

            // Create the patient via service
            $patient = $patientService->createPatient($validated);

            return redirect()->route('admin.patient.show', $patient)
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
        $patient->load(['visits' => function ($query) {
            $query->orderBy('arrival_date', 'desc')->orderBy('arrival_time', 'desc');
        }, 'labOrders.labTests', 'labOrders.orderedBy']);

        return Inertia::render('admin/patient/show', [
            'patient' => $patient,
            'visits' => $patient->visits,
            'labOrders' => $patient->labOrders
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

    public function update(UpdatePatientRequest $request, Patient $patient, PatientService $patientService)
    {
        try {
            $validated = $request->validated();

            // Update the patient via service
            $patientService->updatePatient($patient, $validated);

            return redirect()->route('admin.patient.index')->with('success', 'Patient updated successfully!');
        } catch (\Throwable $e) {
            return back()
                ->with('error', 'Failed to update patient: '.($e->getMessage()))
                ->withInput();
        }
    }

    public function destroy(Patient $patient)
    {
        $patient->delete();

        return redirect()->route('admin.patient.index')->with('success', 'Patient deleted successfully!');
    }

    /**
     * Find potential duplicate patient based on core identifying information
     */
    private function findDuplicatePatient(Request $request)
    {
        $lastName = $request->input('last_name');
        $firstName = $request->input('first_name');
        $birthdate = $request->input('birthdate');
        $mobileNo = $request->input('mobile_no');

        // Check for exact matches on core identifying information
        $duplicate = Patient::where('last_name', $lastName)
            ->where('first_name', $firstName)
            ->where('birthdate', $birthdate)
            ->first();

        if ($duplicate) {
            return $duplicate;
        }

        // Check for mobile number match (alternative identifier)
        if ($mobileNo) {
            $duplicate = Patient::where('mobile_no', $mobileNo)
                ->where('last_name', $lastName)
                ->where('first_name', $firstName)
                ->first();

            if ($duplicate) {
                return $duplicate;
            }
        }

        return null;
    }
}
