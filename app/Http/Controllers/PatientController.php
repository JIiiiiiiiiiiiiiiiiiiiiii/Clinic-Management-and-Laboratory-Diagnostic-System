<?php

namespace App\Http\Controllers;

use App\Http\Requests\Patient\StorePatientRequest;
use App\Http\Requests\Patient\UpdatePatientRequest;
use App\Models\Patient;
use App\Services\PatientService;
use App\Services\AppointmentCreationService;
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


            // Apply sorting
            $sortBy = $request->get('p_sort_by', 'created_at');
            $sortDir = $request->get('p_sort_dir', 'desc');
            $query->orderBy($sortBy, $sortDir);

            $patients = $query->select([
                'id',
                'patient_no', 
                'first_name',
                'last_name',
                'middle_name',
                'sex',
                'age',
                'mobile_no',
                'address', // Fixed: was 'present_address'
                'created_at',
                'updated_at'
            ])->paginate(15);


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
                    'date_to' => $request->get('date_to', '')
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
                'statistics' => [],
                'error' => 'Failed to load patient data. Please try again.'
            ]);
        }
    }

    public function create()
    {
        // Get next patient number for display only (not used in form submission)
        $max = Patient::query()->max('patient_no');
        $numericMax = is_numeric($max) ? (int) $max : (int) ltrim((string) $max, 'P0');
        $candidate = $numericMax + 1;
        while (Patient::where('patient_no', 'P' . str_pad($candidate, 3, '0', STR_PAD_LEFT))->exists()) {
            $candidate++;
        }
        $nextPatientNo = 'P' . str_pad($candidate, 3, '0', STR_PAD_LEFT);

        $doctors = \App\Models\Staff::query()
            ->where('role', 'Doctor')
            ->orderBy('name')
            ->get(['staff_id as id', 'name']);

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
                    ->with(                    'duplicate_patient', [
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
        // Check if visits table exists
        if (!\Schema::hasTable('visits')) {
            // If visits table doesn't exist, load patient without visits
            $patient->load(['labOrders.labTests', 'labOrders.orderedBy']);

            return Inertia::render('admin/patient/show', [
                'patient' => $patient,
                'visits' => collect([]),
                'labOrders' => $patient->labOrders
            ]);
        }

        // Check if visit_date column exists in visits table
        if (!\Schema::hasColumn('visits', 'visit_date')) {
            // If visit_date column doesn't exist, order by created_at
            $patient->load(['visits' => function ($query) {
                $query->orderBy('created_at', 'desc');
            }, 'labOrders.labTests', 'labOrders.orderedBy']);
        } else {
            // If visit_date column exists, order by it
            $patient->load(['visits' => function ($query) {
                $query->orderBy('visit_date', 'desc');
            }, 'labOrders.labTests', 'labOrders.orderedBy']);
        }

        return Inertia::render('admin/patient/show', [
            'patient' => $patient,
            'visits' => $patient->visits,
            'labOrders' => $patient->labOrders
        ]);
    }

    public function edit(Patient $patient)
    {
        $doctors = \App\Models\Staff::query()
            ->where('role', 'Doctor')
            ->orderBy('name')
            ->get(['staff_id as id', 'name']);

        return Inertia::render('admin/patient/edit', [
            'patient' => $patient,
            'doctors' => $doctors,
        ]);
    }

    public function update(UpdatePatientRequest $request, Patient $patient, PatientService $patientService)
    {
        try {
            $validated = $request->validated();

            // Map old field names to new field names for backward compatibility
            if (isset($validated['informant_name']) && !isset($validated['emergency_name'])) {
                $validated['emergency_name'] = $validated['informant_name'];
                unset($validated['informant_name']);
            }
            if (isset($validated['relationship']) && !isset($validated['emergency_relation'])) {
                $validated['emergency_relation'] = $validated['relationship'];
                unset($validated['relationship']);
            }

            // Update the patient via service
            $patientService->updatePatient($patient, $validated);

            return redirect()->route('admin.patient.index')->with('success', 'Patient updated successfully!');
        } catch (\Throwable $e) {
            return back()
                ->with('error', 'Failed to update patient: '.($e->getMessage()))
                ->withInput();
        }
    }

    /**
     * Export patient data
     */
    public function export(Request $request, $patientId = null)
    {
        try {
            $format = $request->get('format', 'excel');
            $type = $request->get('type', 'summary');
            $dateFrom = $request->get('date_from');
            $dateTo = $request->get('date_to');
            $includeVisits = $request->boolean('include_visits', true);
            $includeLabOrders = $request->boolean('include_lab_orders', true);
            $includeMedicalHistory = $request->boolean('include_medical_history', true);

            // Get patient data
            if ($patientId) {
                $patient = Patient::findOrFail($patientId);
                $patients = collect([$patient]);
            } else {
                $query = Patient::query();
                
                if ($dateFrom) {
                    $query->whereDate('created_at', '>=', $dateFrom);
                }
                if ($dateTo) {
                    $query->whereDate('created_at', '<=', $dateTo);
                }
                
                $patients = $query->get();
            }

            // Prepare export data
            $exportData = [];
            foreach ($patients as $patient) {
                $data = [
                    'Patient No' => $patient->patient_no,
                    'First Name' => $patient->first_name,
                    'Last Name' => $patient->last_name,
                    'Middle Name' => $patient->middle_name,
                    'Sex' => $patient->sex,
                    'Age' => $patient->age,
                    'Birthdate' => $patient->birthdate,
                    'Mobile No' => $patient->mobile_no,
                    'Present Address' => $patient->address,
                    'Created At' => $patient->created_at->format('Y-m-d H:i:s'),
                ];

                if ($includeVisits && $patient->visits) {
                    $data['Total Visits'] = $patient->visits->count();
                }

                if ($includeLabOrders && $patient->labOrders) {
                    $data['Total Lab Orders'] = $patient->labOrders->count();
                }

                $exportData[] = $data;
            }

            // Generate filename
            $filename = $patientId 
                ? "patient_{$patient->patient_no}_export_" . date('Y-m-d_H-i-s')
                : "patients_export_" . date('Y-m-d_H-i-s');

            // Export based on format
            if ($format === 'csv') {
                return $this->exportToCsv($exportData, $filename);
            } elseif ($format === 'pdf') {
                return $this->exportToPdf($exportData, $filename);
            } else {
                return $this->exportToExcel($exportData, $filename);
            }

        } catch (\Exception $e) {
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }

    private function exportToCsv($data, $filename)
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}.csv\"",
        ];

        $callback = function() use ($data) {
            $file = fopen('php://output', 'w');
            
            if (!empty($data)) {
                fputcsv($file, array_keys($data[0]));
                foreach ($data as $row) {
                    fputcsv($file, $row);
                }
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportToExcel($data, $filename)
    {
        // For now, return CSV format with Excel extension
        // In a real implementation, you'd use Laravel Excel package
        $headers = [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}.xlsx\"",
        ];

        $callback = function() use ($data) {
            $file = fopen('php://output', 'w');
            
            if (!empty($data)) {
                fputcsv($file, array_keys($data[0]));
                foreach ($data as $row) {
                    fputcsv($file, $row);
                }
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function exportToPdf($data, $filename)
    {
        // For now, return a simple text response
        // In a real implementation, you'd use a PDF library like DomPDF
        $content = "Patient Export Report\n\n";
        foreach ($data as $patient) {
            $content .= "Patient: {$patient['First Name']} {$patient['Last Name']}\n";
            $content .= "Patient No: {$patient['Patient No']}\n";
            $content .= "Age: {$patient['Age']}\n";
            $content .= "Mobile: {$patient['Mobile No']}\n\n";
        }

        $headers = [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$filename}.pdf\"",
        ];

        return response($content, 200, $headers);
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

    /**
     * Delete patient and all related records (cascade delete)
     */
    public function destroy(Patient $patient, AppointmentCreationService $appointmentService)
    {
        try {
            $appointmentService->deletePatientWithCascade($patient->id);
            
            return redirect()->route('admin.patient.index')
                ->with('success', 'Patient and all related records deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete patient: ' . $e->getMessage()]);
        }
    }
}
