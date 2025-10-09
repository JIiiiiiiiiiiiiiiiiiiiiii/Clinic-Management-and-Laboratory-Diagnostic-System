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
        try {
            // Get patients with pagination and search
            $query = Patient::query();

            // Apply search filter
            if ($request->filled('p_search')) {
                $search = $request->p_search;
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('patient_no', 'like', "%{$search}%")
                      ->orWhere('mobile_no', 'like', "%{$search}%");
                });
            }

            // Apply additional filters
            if ($request->filled('sex')) {
                $query->where('sex', $request->sex);
            }

            if ($request->filled('age_from')) {
                $query->where('age', '>=', $request->age_from);
            }

            if ($request->filled('age_to')) {
                $query->where('age', '<=', $request->age_to);
            }

            if ($request->filled('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            if ($request->filled('has_visits')) {
                if ($request->has_visits === 'yes') {
                    $query->whereHas('visits');
                } elseif ($request->has_visits === 'no') {
                    $query->whereDoesntHave('visits');
                }
            }

            // Apply sorting
            $sortBy = $request->get('p_sort_by', 'created_at');
            $sortDir = $request->get('p_sort_dir', 'desc');
            $query->orderBy($sortBy, $sortDir);

            $patients = $query->paginate(15);

            // Get visits data
            $visitsQuery = \App\Models\PatientVisit::query();

            // Apply visit filters
            if ($request->filled('v_start')) {
                $visitsQuery->whereDate('arrival_date', '>=', $request->v_start);
            }
            if ($request->filled('v_end')) {
                $visitsQuery->whereDate('arrival_date', '<=', $request->v_end);
            }
            if ($request->filled('v_doctor')) {
                $visitsQuery->where('attending_physician', $request->v_doctor);
            }

            $visits = $visitsQuery->orderBy('arrival_date', 'desc')->paginate(15);

            // Get patient statistics
            $patientService = app(\App\Services\PatientService::class);
            $statistics = $patientService->getPatientStatistics();

            return Inertia::render('admin/patient/index', [
                'patients' => $patients->items(),
                'patients_pagination' => [
                    'current_page' => $patients->currentPage(),
                    'last_page' => $patients->lastPage(),
                    'per_page' => $patients->perPage(),
                    'total' => $patients->total()
                ],
                'patients_filters' => [
                    'p_search' => $request->get('p_search', ''),
                    'p_sort_by' => $request->get('p_sort_by', 'created_at'),
                    'p_sort_dir' => $request->get('p_sort_dir', 'desc'),
                    'sex' => $request->get('sex', ''),
                    'age_from' => $request->get('age_from', ''),
                    'age_to' => $request->get('age_to', ''),
                    'date_from' => $request->get('date_from', ''),
                    'date_to' => $request->get('date_to', ''),
                    'has_visits' => $request->get('has_visits', '')
                ],
                'visits' => $visits->items(),
                'visits_pagination' => [
                    'current_page' => $visits->currentPage(),
                    'last_page' => $visits->lastPage(),
                    'per_page' => $visits->perPage(),
                    'total' => $visits->total()
                ],
                'visits_filters' => [
                    'v_start' => $request->get('v_start'),
                    'v_end' => $request->get('v_end'),
                    'v_doctor' => $request->get('v_doctor'),
                    'v_sort_dir' => $request->get('v_sort_dir', 'desc')
                ],
                'statistics' => $statistics
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to load patient index', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return Inertia::render('admin/patient/index', [
                'patients' => [],
                'patients_pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 15,
                    'total' => 0
                ],
                'patients_filters' => [],
                'visits' => [],
                'visits_pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 15,
                    'total' => 0
                ],
                'visits_filters' => [],
                'statistics' => [],
                'error' => 'Failed to load patient data. Please try again.'
            ]);
        }
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
