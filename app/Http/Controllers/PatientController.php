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
            // Log the request for debugging
            \Log::info('PatientController@index called', [
                'user' => auth()->user() ? auth()->user()->name : 'Not authenticated',
                'request_data' => $request->all()
            ]);

            // For testing, return simple HTML first
            if ($request->has('test')) {
                return '<html><body><h1>Patient Controller Test</h1><p>This route is working!</p><p>User: ' . (auth()->user() ? auth()->user()->name : 'Not authenticated') . '</p></body></html>';
            }

            // Get basic patient data - order by patient number for sequential display
            $patients = Patient::orderByRaw('CAST(patient_no AS UNSIGNED)')->paginate(15);
            $visits = \App\Models\PatientVisit::with(['patient'])->orderBy('arrival_date', 'desc')->paginate(15);

            \Log::info('PatientController@index data prepared', [
                'patients_count' => $patients->count(),
                'visits_count' => $visits->count()
            ]);

            // Return data structure that matches the frontend expectations
            return Inertia::render('admin/patient/index', [
                'patients' => $patients->items(), // Get the actual items from pagination
                'patients_pagination' => [
                    'current_page' => $patients->currentPage(),
                    'last_page' => $patients->lastPage(),
                    'per_page' => $patients->perPage(),
                    'total' => $patients->total(),
                ],
                'visits' => $visits->items(), // Get the actual items from pagination
                'visits_pagination' => [
                    'current_page' => $visits->currentPage(),
                    'last_page' => $visits->lastPage(),
                    'per_page' => $visits->perPage(),
                    'total' => $visits->total(),
                ],
                'patients_filters' => [
                    'p_search' => $request->get('p_search', ''),
                    'p_sort_by' => $request->get('p_sort_by', 'patient_no'),
                    'p_sort_dir' => $request->get('p_sort_dir', 'asc'),
                ],
                'visits_filters' => [
                    'v_start' => $request->get('v_start', ''),
                    'v_end' => $request->get('v_end', ''),
                    'v_doctor' => $request->get('v_doctor', ''),
                    'v_sort_dir' => $request->get('v_sort_dir', 'desc'),
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('PatientController@index error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return a simple error page for debugging
            return response()->json([
                'error' => 'PatientController error: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    public function create()
    {
        // Get next patient number for display only (not used in form submission)
        // Use the same logic as PatientService for consistency
        $existingNumbers = Patient::withTrashed()
            ->pluck('patient_no')
            ->map(function ($no) {
                return (int) $no;
            })
            ->sort()
            ->values()
            ->toArray();
        
        if (empty($existingNumbers)) {
            $nextPatientNo = '1';
        } else {
            $expectedNumber = 1;
            foreach ($existingNumbers as $existingNumber) {
                if ($existingNumber === $expectedNumber) {
                    $expectedNumber++;
                } else {
                    break;
                }
            }
            $nextPatientNo = (string) $expectedNumber;
        }

        $doctors = \App\Models\User::query()
            ->where('role', 'doctor')
            ->where(function ($q) {
                $q->where('is_active', true)
                  ->orWhereNull('is_active');
            })
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/patient/register', [
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
