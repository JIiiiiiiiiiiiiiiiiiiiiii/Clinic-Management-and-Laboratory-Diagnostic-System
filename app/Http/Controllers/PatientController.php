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
        // Patients table: search and sorting
        $patientSearch = trim((string) $request->input('p_search', ''));
        $patientSortBy = in_array($request->input('p_sort_by'), ['last_name', 'first_name', 'patient_no']) ? $request->input('p_sort_by') : 'last_name';
        $patientSortDir = strtolower($request->input('p_sort_dir')) === 'desc' ? 'desc' : 'asc';

        $patientsQuery = Patient::query();
        if ($patientSearch !== '') {
            $patientsQuery->where(function ($q) use ($patientSearch) {
                $q->where('first_name', 'like', "%{$patientSearch}%")
                  ->orWhere('last_name', 'like', "%{$patientSearch}%");
            });
        }
        $patientsQuery->orderBy($patientSortBy, $patientSortDir);
        $patients = $patientsQuery->paginate(10, ['*'], 'p_page');

        // Visit records table: filters and sorting
        $vStart = $request->input('v_start');
        $vEnd = $request->input('v_end');
        $vDoctor = trim((string) $request->input('v_doctor', ''));
        $vSortDir = strtolower($request->input('v_sort_dir')) === 'asc' ? 'asc' : 'desc';

        $visitsQuery = \App\Models\PatientVisit::query()
            ->with(['patient:id,first_name,last_name,patient_no'])
            ->when($vStart && $vEnd, function ($q) use ($vStart, $vEnd) {
                $q->whereBetween('arrival_date', [$vStart, $vEnd]);
            })
            ->when($vStart && !$vEnd, function ($q) use ($vStart) {
                $q->whereDate('arrival_date', '>=', $vStart);
            })
            ->when(!$vStart && $vEnd, function ($q) use ($vEnd) {
                $q->whereDate('arrival_date', '<=', $vEnd);
            })
            ->when($vDoctor !== '', function ($q) use ($vDoctor) {
                $q->where('attending_physician', 'like', "%{$vDoctor}%");
            })
            ->orderBy('arrival_date', $vSortDir)
            ->orderBy('arrival_time', $vSortDir);

        $visits = $visitsQuery->paginate(10, ['*'], 'v_page');

        return Inertia::render('admin/patient/index', [
            'patients' => $patients->items(),
            'patients_pagination' => [
                'current_page' => $patients->currentPage(),
                'last_page' => $patients->lastPage(),
                'per_page' => $patients->perPage(),
                'total' => $patients->total(),
            ],
            'patients_filters' => [
                'p_search' => $patientSearch,
                'p_sort_by' => $patientSortBy,
                'p_sort_dir' => $patientSortDir,
            ],
            'visits' => $visits->items(),
            'visits_pagination' => [
                'current_page' => $visits->currentPage(),
                'last_page' => $visits->lastPage(),
                'per_page' => $visits->perPage(),
                'total' => $visits->total(),
            ],
            'visits_filters' => [
                'v_start' => $vStart,
                'v_end' => $vEnd,
                'v_doctor' => $vDoctor,
                'v_sort_dir' => $vSortDir,
            ],
        ]);
    }

    public function create()
    {
        // Get next patient number for display only (not used in form submission)
        $max = Patient::query()->max('patient_no');
        $numericMax = is_numeric($max) ? (int) $max : (int) ltrim((string) $max, '0');
        $nextPatientNo = (string) ($numericMax + 1);

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
            'next_patient_no' => $nextPatientNo,
        ]);
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
