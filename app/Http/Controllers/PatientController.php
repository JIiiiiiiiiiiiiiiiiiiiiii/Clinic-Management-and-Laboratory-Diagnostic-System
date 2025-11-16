<?php

namespace App\Http\Controllers;

use App\Http\Requests\Patient\StorePatientRequest;
use App\Http\Requests\Patient\UpdatePatientRequest;
use App\Models\Patient;
use App\Services\PatientService;
use App\Services\AppointmentCreationService;
use App\Exports\PatientDataExport;
use App\Exports\PatientSummaryExport;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

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
                'birthdate',
                'mobile_no',
                'present_address',
                'address',
                'created_at',
                'updated_at'
            ])->paginate(15);

            // Transform the data to ensure address is properly displayed
            $patients->getCollection()->transform(function ($patient) {
                // Use present_address if available, otherwise fall back to address
                $patient->display_address = $patient->present_address ?: $patient->address ?: 'Not provided';
                return $patient;
            });


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

            // Create patient directly using PatientService
            $patient = $patientService->createPatient($validated);

            return redirect()->route('admin.patient.show', $patient)
                ->with('success', 'Patient created successfully.');
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
            // Prioritize emergency_name/emergency_relation, but fallback to informant_name/relationship
            if (empty($validated['emergency_name']) && !empty($validated['informant_name'])) {
                $validated['emergency_name'] = $validated['informant_name'];
            }
            if (empty($validated['emergency_relation']) && !empty($validated['relationship'])) {
                $validated['emergency_relation'] = $validated['relationship'];
            }
            
            // Remove the old field names to avoid confusion
            unset($validated['informant_name']);
            unset($validated['relationship']);

            \Log::info('Updating patient', [
                'patient_id' => $patient->id,
                'validated_fields' => array_keys($validated),
                'emergency_name' => $validated['emergency_name'] ?? 'NOT SET',
                'emergency_relation' => $validated['emergency_relation'] ?? 'NOT SET',
            ]);

            // Update the patient via service
            $patientService->updatePatient($patient, $validated);

            return redirect()->route('admin.patient.index')->with('success', 'Patient updated successfully!');
        } catch (\Throwable $e) {
            \Log::error('Failed to update patient', [
                'patient_id' => $patient->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return back()
                ->withErrors(['update_error' => 'Failed to update patient: '.($e->getMessage())])
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
                try {
                    $patient = Patient::findOrFail($patientId);
                    $patient->load(['visits', 'labOrders.labTests']);
                } catch (\Exception $e) {
                    return response()->json(['error' => 'Patient not found: ' . $e->getMessage()], 404);
                }
                
                $filename = "patient_{$patient->patient_no}_export_" . date('Y-m-d_H-i-s');
                $export = new PatientSummaryExport($patient);
            } else {
                $query = Patient::with(['visits', 'labOrders.labTests']);
                
                if ($dateFrom) {
                    $query->whereDate('created_at', '>=', $dateFrom);
                }
                if ($dateTo) {
                    $query->whereDate('created_at', '<=', $dateTo);
                }
                
                $patients = $query->get();
                $filename = "patients_export_" . date('Y-m-d_H-i-s');
                
                $exportType = 'summary';
                if ($includeMedicalHistory) {
                    $exportType = 'medical_history';
                } elseif ($includeVisits || $includeLabOrders) {
                    $exportType = 'detailed';
                }
                
                $export = new PatientDataExport($patients, $exportType);
            }

            // Export based on format
            if ($format === 'csv') {
                return Excel::download($export, $filename . '.csv', \Maatwebsite\Excel\Excel::CSV, [
                    'Content-Type' => 'text/csv',
                ]);
            } elseif ($format === 'pdf') {
                return $this->exportToPdf($export, $filename);
            } else {
                return Excel::download($export, $filename . '.xlsx', \Maatwebsite\Excel\Excel::XLSX, [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                ]);
            }

        } catch (\Exception $e) {
            \Log::error('Patient export failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'patient_id' => $patientId,
                'request' => $request->all()
            ]);
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }

    private function exportToPdf($export, $filename)
    {
        try {
            \Log::info('Starting PDF export', ['filename' => $filename]);
            
            // For PDF export, we'll create a simple HTML view and convert to PDF
            $data = [];
            
            if ($export instanceof PatientSummaryExport) {
                \Log::info('Using PatientSummaryExport');
                $data = $export->array();
            } elseif ($export instanceof PatientDataExport) {
                \Log::info('Using PatientDataExport');
                // Convert PatientDataExport to array format for PDF
                $patients = $export->collection();
                $headings = $export->headings();
                
                $data[] = $headings; // Add headers
                foreach ($patients as $patient) {
                    $data[] = $export->map($patient);
                }
            }
            
            \Log::info('PDF data prepared', ['data_count' => count($data)]);
            
            // Build HTML directly like lab order export
            $html = $this->buildPatientExportHtml($data, $filename);
            
            $pdf = Pdf::loadHTML($html)
                ->setPaper('a4', 'portrait')
                ->setOptions([
                    'isHtml5ParserEnabled' => true,
                    'isRemoteEnabled' => true,
                    'defaultFont' => 'Arial'
                ]);
            
            \Log::info('PDF generated successfully');
            $response = $pdf->download($filename . '.pdf');
            $response->headers->set('Content-Type', 'application/pdf');
            return $response;
        } catch (\Exception $e) {
            \Log::error('PDF export failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'PDF export failed: ' . $e->getMessage()], 500);
        }
    }

    private function buildPatientExportHtml($data, $filename)
    {
        // Convert logo to base64
        $logoPath = public_path('st-james-logo.png');
        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $logoData = file_get_contents($logoPath);
            $logoBase64 = 'data:image/png;base64,' . base64_encode($logoData);
        }

        $hospitalHeader = '
        <div style="text-align: center; margin-bottom: 10px; padding: 5px 0; position: relative;">
            <div style="position: absolute; left: 0; top: 0;">
                <img src="' . $logoBase64 . '" alt="St. James Hospital Logo" style="width: 80px; height: 80px;">
            </div>
            <div style="text-align: center; width: 100%;">
                <div style="font-size: 24px; font-weight: bold; color: #2d5a27; margin: 0 0 5px 0;">St. James Hospital Clinic, Inc.</div>
                <div style="font-size: 12px; color: #333; margin: 0 0 3px 0;">San Isidro City of Cabuyao Laguna</div>
                <div style="font-size: 14px; font-style: italic; color: #1e40af; margin: 0 0 5px 0;">Santa Rosa\'s First in Quality Healthcare Service</div>
                <div style="font-size: 16px; font-weight: bold; color: #2d5a27; margin: 0 0 5px 0;">PASYENTE MUNA</div>
                <div style="font-size: 10px; color: #666; margin: 0;">Tel. Nos. 02.85844533; 049.5341254; 049.5020058; Fax No.: local 307<br>email add: info@stjameshospital.com.ph</div>
            </div>
        </div>';

        $reportTitle = '<h2 style="font-family:\'Segoe UI\',Tahoma,Geneva,Verdana,sans-serif;margin:0 0 16px 0;color:#333;text-align:center">Patient Details Report</h2>';
        $reportMeta = '<p style="font-family:\'Segoe UI\',Tahoma,Geneva,Verdana,sans-serif;font-size:12px;color:#666;text-align:center;margin:0 0 20px 0">Generated on: ' . now()->format('Y-m-d H:i:s') . '</p>';

        $tableContent = '';
        if (!empty($data)) {
            // Card-based layout like the screenshot
            $tableContent .= '<div style="display:flex;flex-wrap:wrap;gap:20px;margin:20px 0;font-family:\'Segoe UI\',Tahoma,Geneva,Verdana,sans-serif;font-size:12px;line-height:1.6;background-color:#f5f5f5;padding:20px;border-radius:8px;">';
            
            // Organize data into sections
            $patientInfo = [];
            $contactInfo = [];
            $demographics = [];
            $emergencyContact = [];
            $medicalHistory = [];
            
            foreach ($data as $row) {
                if (isset($row[0]) && isset($row[1])) {
                    $field = $row[0];
                    $value = $row[1] ?: 'N/A';
                    
                    if(strpos($field, 'INFORMATION') !== false) {
                        // Skip section headers
                    } elseif(in_array($field, ['Patient No', 'Full Name', 'Birthdate', 'Age', 'Sex', 'Civil Status', 'Nationality', 'Registration Date'])) {
                        $patientInfo[] = ['label' => $field, 'value' => $value];
                    } elseif(in_array($field, ['Mobile No', 'Telephone No', 'Address'])) {
                        $contactInfo[] = ['label' => $field, 'value' => $value];
                    } elseif(in_array($field, ['Occupation', 'Religion'])) {
                        $demographics[] = ['label' => $field, 'value' => $value];
                    } elseif(in_array($field, ['Contact Name', 'Relationship'])) {
                        $emergencyContact[] = ['label' => $field, 'value' => $value];
                    } elseif(in_array($field, ['Drug Allergies', 'Food Allergies', 'Past Medical History', 'Family History', 'Social History', 'Obstetrics History'])) {
                        $medicalHistory[] = ['label' => $field, 'value' => $value];
                    }
                }
            }
            
            // Patient Identification Card
            $tableContent .= '<div style="background-color:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden;flex:1;min-width:300px;margin-bottom:20px;"><div style="background-color:#f8f9fa;padding:12px 16px;border-bottom:1px solid #e9ecef;"><h3 style="font-weight:bold;font-size:14px;color:#495057;margin:0;">Patient Identification</h3></div><div style="padding:16px;">';
            foreach($patientInfo as $field) {
                $tableContent .= '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #f1f3f4;"><span style="font-weight:600;color:#495057;flex:1;margin-right:16px;">' . e($field['label']) . '</span><span style="color:#212529;flex:1;text-align:right;word-break:break-word;">' . e($field['value']) . '</span></div>';
            }
            $tableContent .= '</div></div>';
            
            // Contact Information Card
            $tableContent .= '<div style="background-color:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden;flex:1;min-width:300px;margin-bottom:20px;"><div style="background-color:#f8f9fa;padding:12px 16px;border-bottom:1px solid #e9ecef;"><h3 style="font-weight:bold;font-size:14px;color:#495057;margin:0;">Contact Information</h3></div><div style="padding:16px;">';
            foreach($contactInfo as $field) {
                $tableContent .= '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #f1f3f4;"><span style="font-weight:600;color:#495057;flex:1;margin-right:16px;">' . e($field['label']) . '</span><span style="color:#212529;flex:1;text-align:right;word-break:break-word;">' . e($field['value']) . '</span></div>';
            }
            $tableContent .= '</div></div>';
            
            // Demographics Card
            $tableContent .= '<div style="background-color:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden;flex:1;min-width:300px;margin-bottom:20px;"><div style="background-color:#f8f9fa;padding:12px 16px;border-bottom:1px solid #e9ecef;"><h3 style="font-weight:bold;font-size:14px;color:#495057;margin:0;">Demographics</h3></div><div style="padding:16px;">';
            foreach($demographics as $field) {
                $tableContent .= '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #f1f3f4;"><span style="font-weight:600;color:#495057;flex:1;margin-right:16px;">' . e($field['label']) . '</span><span style="color:#212529;flex:1;text-align:right;word-break:break-word;">' . e($field['value']) . '</span></div>';
            }
            $tableContent .= '</div></div>';
            
            // Emergency Contact Card
            $tableContent .= '<div style="background-color:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden;flex:1;min-width:300px;margin-bottom:20px;"><div style="background-color:#f8f9fa;padding:12px 16px;border-bottom:1px solid #e9ecef;"><h3 style="font-weight:bold;font-size:14px;color:#495057;margin:0;">Emergency Contact</h3></div><div style="padding:16px;">';
            foreach($emergencyContact as $field) {
                $tableContent .= '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #f1f3f4;"><span style="font-weight:600;color:#495057;flex:1;margin-right:16px;">' . e($field['label']) . '</span><span style="color:#212529;flex:1;text-align:right;word-break:break-word;">' . e($field['value']) . '</span></div>';
            }
            $tableContent .= '</div></div>';
            
            // Medical History & Allergies Card (Full Width)
            $tableContent .= '<div style="background-color:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden;width:100%;margin-bottom:20px;"><div style="background-color:#f8f9fa;padding:12px 16px;border-bottom:1px solid #e9ecef;"><h3 style="font-weight:bold;font-size:14px;color:#495057;margin:0;">Medical History & Allergies</h3></div><div style="padding:16px;">';
            foreach($medicalHistory as $field) {
                $tableContent .= '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #f1f3f4;"><span style="font-weight:600;color:#495057;flex:1;margin-right:16px;">' . e($field['label']) . '</span><span style="color:#212529;flex:1;text-align:right;word-break:break-word;">' . e($field['value']) . '</span></div>';
            }
            $tableContent .= '</div></div>';
            
            $tableContent .= '</div>';
        } else {
            $tableContent = '<div style="display:flex;flex-wrap:wrap;gap:20px;margin:20px 0;font-family:\'Segoe UI\',Tahoma,Geneva,Verdana,sans-serif;font-size:12px;line-height:1.6;background-color:#f5f5f5;padding:20px;border-radius:8px;"><div style="background-color:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);overflow:hidden;flex:1;min-width:300px;"><div style="background-color:#f8f9fa;padding:12px 16px;border-bottom:1px solid #e9ecef;"><h3 style="font-weight:bold;font-size:14px;color:#495057;margin:0;">No Data Available</h3></div><div style="padding:16px;"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #f1f3f4;"><span style="font-weight:600;color:#495057;flex:1;margin-right:16px;">Status</span><span style="color:#212529;flex:1;text-align:right;word-break:break-word;">No data available for export</span></div></div></div></div>';
        }

        $footer = '<p style="font-family:\'Segoe UI\',Tahoma,Geneva,Verdana,sans-serif;font-size:10px;color:#666;margin-top:20px;text-align:center">This report was generated automatically by the Clinic Management System.</p>';

        return '<!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>Patient Details Report</title><meta name="ProgId" content="Word.Document"><meta name="Generator" content="Microsoft Word 15"><meta name="Originator" content="Microsoft Word 15"><style>body{font-family:\'Segoe UI\',Tahoma,Geneva,Verdana,sans-serif;}</style></head><body>' .
            $hospitalHeader .
            $reportTitle .
            $reportMeta .
            $tableContent .
            $footer .
            '</body></html>';
    }

    private function simpleCsvExport($patient, $filename)
    {
        try {
            \Log::info('Using simple CSV export fallback');
            
            $data = [
                ['Patient No', $patient->patient_no ?? 'N/A'],
                ['Full Name', $patient->full_name ?? 'N/A'],
                ['Birthdate', $patient->birthdate ? $patient->birthdate->format('Y-m-d') : 'N/A'],
                ['Age', $patient->age ?? 'N/A'],
                ['Sex', ucfirst($patient->sex ?? 'N/A')],
                ['Mobile No', $patient->mobile_no ?? 'N/A'],
                ['Address', $patient->present_address ?? 'N/A'],
                ['Created At', $patient->created_at ? $patient->created_at->format('Y-m-d H:i:s') : 'N/A'],
            ];

            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$filename}.csv\"",
            ];

            $callback = function() use ($data) {
                $file = fopen('php://output', 'w');
                foreach ($data as $row) {
                    fputcsv($file, $row);
                }
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        } catch (\Exception $e) {
            \Log::error('Simple CSV export failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
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
