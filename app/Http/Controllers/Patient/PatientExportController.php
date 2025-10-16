<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\PatientDataExport;
use App\Exports\PatientSummaryExport;
use Carbon\Carbon;

class PatientExportController extends Controller
{
    /**
     * Export patient data in various formats
     */
    public function export(Request $request)
    {
        $format = $request->get('format', 'excel');
        $type = $request->get('type', 'summary');

        \Log::info('Export request received', [
            'format' => $format,
            'type' => $type,
            'request_data' => $request->all()
        ]);

        // Validate format
        if (!in_array($format, ['excel', 'csv', 'pdf'])) {
            \Log::error('Invalid export format: ' . $format);
            return response()->json(['error' => 'Invalid export format.'], 400);
        }

        // Validate type
        if (!in_array($type, ['summary', 'detailed', 'medical_history'])) {
            \Log::error('Invalid export type: ' . $type);
            return response()->json(['error' => 'Invalid export type.'], 400);
        }

        try {
            $patients = $this->getFilteredPatients($request);

            \Log::info('Patients found for export', [
                'count' => $patients->count(),
                'filters' => $request->all()
            ]);

            if ($patients->isEmpty()) {
                \Log::warning('No patients found for export', [
                    'filters' => $request->all(),
                    'total_patients_in_db' => \App\Models\Patient::count()
                ]);
                return response()->json(['error' => 'No patients found matching the criteria for export.'], 400);
            }

            $filename = 'patients_' . $type . '_' . now()->format('Ymd_His');

            \Log::info('Starting export', [
                'format' => $format,
                'type' => $type,
                'filename' => $filename,
                'patient_count' => $patients->count()
            ]);

            switch ($format) {
                case 'excel':
                    \Log::info('Starting Excel export', [
                        'patient_count' => $patients->count(),
                        'filename' => $filename . '.xlsx'
                    ]);
                    try {
                        return Excel::download(new PatientDataExport($patients, $type), $filename . '.xlsx');
                    } catch (\Exception $e) {
                        \Log::error('Excel export failed', [
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                        return response()->json(['error' => 'Excel export failed: ' . $e->getMessage()], 500);
                    }
                case 'csv':
                    \Log::info('Starting CSV export', [
                        'patient_count' => $patients->count(),
                        'filename' => $filename . '.csv'
                    ]);
                    try {
                        return Excel::download(new PatientDataExport($patients, $type), $filename . '.csv', \Maatwebsite\Excel\Excel::CSV);
                    } catch (\Exception $e) {
                        \Log::error('CSV export failed', [
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                        return response()->json(['error' => 'CSV export failed: ' . $e->getMessage()], 500);
                    }
                case 'pdf':
                    \Log::info('Starting PDF export', [
                        'patient_count' => $patients->count(),
                        'filename' => $filename . '.pdf'
                    ]);
                    try {
                        return $this->exportToPdf($patients, $type, $filename);
                    } catch (\Exception $e) {
                        \Log::error('PDF export failed', [
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                        return response()->json(['error' => 'PDF export failed: ' . $e->getMessage()], 500);
                    }
                default:
                    \Log::error('Invalid export format: ' . $format);
                    return response()->json(['error' => 'Invalid export format.'], 400);
            }
        } catch (\Exception $e) {
            \Log::error('Patient export failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Export individual patient summary
     */
    public function exportPatient(Patient $patient, Request $request)
    {
        $format = $request->get('format', 'pdf');

        \Log::info('Individual patient export request', [
            'patient_id' => $patient->id,
            'patient_no' => $patient->patient_no,
            'format' => $format,
            'request_data' => $request->all()
        ]);

        if (!in_array($format, ['excel', 'csv', 'pdf'])) {
            \Log::error('Invalid individual export format: ' . $format);
            return back()->with('error', 'Invalid export format.');
        }

        try {
            // Load patient with all related data
            $patient->load([
                'visits' => function ($query) {
                    $query->orderBy('visit_date_time', 'desc');
                },
                'labOrders.labTests',
                'labOrders.results'
            ]);

            $filename = "patient_{$patient->patient_no}_summary_" . now()->format('Y_m_d_H_i_s');

            \Log::info('Starting individual patient export', [
                'patient_id' => $patient->id,
                'format' => $format,
                'filename' => $filename,
                'visits_count' => $patient->visits->count(),
                'lab_orders_count' => $patient->labOrders->count()
            ]);

            switch ($format) {
                case 'excel':
                    return Excel::download(new PatientSummaryExport($patient), "{$filename}.xlsx");
                case 'csv':
                    return $this->exportPatientToCsv($patient, $filename);
                case 'pdf':
                    return $this->exportPatientToPdf($patient, $filename);
                default:
                    return back()->with('error', 'Invalid export format.');
            }
        } catch (\Exception $e) {
            \Log::error('Individual patient export failed', [
                'patient_id' => $patient->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            return back()->with('error', 'Export failed: ' . $e->getMessage());
        }
    }

    /**
     * Export patients to PDF
     */
    private function exportToPdf($patients, $type, $filename)
    {
        try {
            \Log::info('Starting bulk PDF export', [
                'patient_count' => $patients->count(),
                'type' => $type,
                'filename' => $filename
            ]);

            // For bulk PDF export, we'll create a simple HTML view
            $html = view('exports.patient-list', [
                'patients' => $patients,
                'type' => $type,
                'export_date' => now()->format('Y-m-d H:i:s')
            ])->render();

            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)
                ->setPaper('a4', 'portrait')
                ->setOptions([
                    'isHtml5ParserEnabled' => true,
                    'isRemoteEnabled' => false,
                    'defaultFont' => 'Arial'
                ]);

            \Log::info('Bulk PDF generated successfully', [
                'filename' => $filename . '.pdf',
                'patient_count' => $patients->count()
            ]);

            return $pdf->download($filename . '.pdf');
        } catch (\Exception $e) {
            \Log::error('Bulk PDF export failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'patient_count' => $patients->count()
            ]);
            return response()->json(['error' => 'PDF export failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Export individual patient to PDF
     */
    private function exportPatientToPdf(Patient $patient, $filename)
    {
        try {
            \Log::info('Starting individual PDF export', [
                'patient_id' => $patient->id,
                'filename' => $filename,
                'patient_data' => [
                    'patient_no' => $patient->patient_no,
                    'full_name' => $patient->full_name,
                    'visits_count' => $patient->visits ? $patient->visits->count() : 0
                ]
            ]);

            // Ensure patient data is properly loaded
            $patient->load([
                'visits' => function ($query) {
                    $query->orderBy('visit_date_time', 'desc');
                },
                'labOrders.labTests',
                'labOrders.results'
            ]);

            // Configure PDF options
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('exports.patient-summary', [
                'patient' => $patient
            ])->setPaper('a4', 'portrait')
              ->setOptions([
                  'isHtml5ParserEnabled' => true,
                  'isRemoteEnabled' => false,
                  'defaultFont' => 'Arial'
              ]);

            \Log::info('PDF generated successfully', [
                'filename' => $filename . '.pdf',
                'patient_visits' => $patient->visits->count()
            ]);

            return $pdf->download($filename . '.pdf');
        } catch (\Exception $e) {
            \Log::error('Individual PDF export failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'patient_id' => $patient->id,
                'patient_data' => $patient->toArray()
            ]);
            return response()->json(['error' => 'PDF export failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Export individual patient to CSV
     */
    private function exportPatientToCsv(Patient $patient, $filename)
    {
        try {
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $filename . '.csv"',
            ];

            $callback = function() use ($patient) {
                $file = fopen('php://output', 'w');

                // Patient Information
                fputcsv($file, ['PATIENT INFORMATION']);
                fputcsv($file, ['Patient No', $patient->patient_no]);
                fputcsv($file, ['Full Name', $patient->full_name]);
                fputcsv($file, ['Birthdate', $patient->birthdate ? $patient->birthdate->format('Y-m-d') : 'N/A']);
                fputcsv($file, ['Age', $patient->age]);
                fputcsv($file, ['Sex', ucfirst($patient->sex)]);
                fputcsv($file, ['Mobile No', $patient->mobile_no]);
                fputcsv($file, ['Address', $patient->present_address]);
                fputcsv($file, []); // Empty row

                // Visit History
                fputcsv($file, ['VISIT HISTORY']);
                fputcsv($file, ['Visit Date', 'Chief Complaint', 'Attending Physician', 'Status']);

                foreach ($patient->visits as $visit) {
                    fputcsv($file, [
                        $visit->visit_date_time ? $visit->visit_date_time->format('Y-m-d') : 'N/A',
                        $visit->reason_for_consult,
                        $visit->attending_physician,
                        $visit->status
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        } catch (\Exception $e) {
            \Log::error('Individual CSV export failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'patient_id' => $patient->id
            ]);
            return response()->json(['error' => 'CSV export failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get filtered patients based on request parameters
     */
    private function getFilteredPatients(Request $request)
    {
        $query = Patient::query();

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('patient_no', 'like', "%{$search}%")
                  ->orWhere('mobile_no', 'like', "%{$search}%");
            });
        }

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

        return $query->with(['visits', 'labOrders'])->get();
    }

    /**
     * Export patient summary data
     */
    private function exportPatientSummary($patients, $format)
    {
        $filename = 'patient_summary_' . now()->format('Y_m_d_H_i_s');

        if ($format === 'excel') {
            return Excel::download(new PatientDataExport($patients, 'summary'), "{$filename}.xlsx");
        }

        return $this->exportToCsv($patients, $filename, 'summary');
    }

    /**
     * Export detailed patient data
     */
    private function exportDetailedPatients($patients, $format)
    {
        $filename = 'patient_detailed_' . now()->format('Y_m_d_H_i_s');

        if ($format === 'excel') {
            return Excel::download(new PatientDataExport($patients, 'detailed'), "{$filename}.xlsx");
        }

        return $this->exportToCsv($patients, $filename, 'detailed');
    }

    /**
     * Export medical history data
     */
    private function exportMedicalHistory($patients, $format)
    {
        $filename = 'patient_medical_history_' . now()->format('Y_m_d_H_i_s');

        if ($format === 'excel') {
            return Excel::download(new PatientDataExport($patients, 'medical_history'), "{$filename}.xlsx");
        }

        return $this->exportToCsv($patients, $filename, 'medical_history');
    }

    /**
     * Export to CSV format
     */
    private function exportToCsv($patients, $filename, $type)
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}.csv\"",
        ];

        $callback = function() use ($patients, $type) {
            $file = fopen('php://output', 'w');

            // Add BOM for proper UTF-8 encoding in Excel
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            $this->writeCsvHeaders($file, $type);
            $this->writeCsvData($file, $patients, $type);

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Write CSV headers based on export type
     */
    private function writeCsvHeaders($file, $type)
    {
        switch ($type) {
            case 'summary':
                fputcsv($file, [
                    'Patient No', 'Full Name', 'Birthdate', 'Age', 'Sex',
                    'Mobile No', 'Address', 'Occupation', 'Civil Status',
                    'Registration Date', 'Total Visits', 'Last Visit'
                ]);
                break;
            case 'detailed':
                fputcsv($file, [
                    'Patient No', 'Full Name', 'Birthdate', 'Age', 'Sex',
                    'Mobile No', 'Telephone No', 'Address', 'Occupation',
                    'Religion', 'Civil Status', 'Nationality',
                    'Emergency Contact', 'Relationship',
                    'Company', 'HMO', 'HMO ID',
                    'Drug Allergies', 'Food Allergies',
                    'Past Medical History', 'Family History',
                    'Registration Date', 'Total Visits'
                ]);
                break;
            case 'medical_history':
                fputcsv($file, [
                    'Patient No', 'Full Name', 'Age', 'Sex',
                    'Drug Allergies', 'Food Allergies',
                    'Past Medical History', 'Family History',
                    'Social History', 'Obstetrics History',
                    'Total Visits', 'Last Visit Date'
                ]);
                break;
        }
    }

    /**
     * Write CSV data based on export type
     */
    private function writeCsvData($file, $patients, $type)
    {
        foreach ($patients as $patient) {
            switch ($type) {
                case 'summary':
                    fputcsv($file, [
                        $patient->patient_no,
                        $patient->full_name,
                        $patient->birthdate?->format('Y-m-d'),
                        $patient->age,
                        ucfirst($patient->sex),
                        $patient->mobile_no,
                        $patient->present_address,
                        $patient->occupation,
                        ucfirst($patient->civil_status),
                        $patient->created_at->format('Y-m-d H:i:s'),
                        $patient->visits->count(),
                        $patient->visits->first() && $patient->visits->first()->visit_date_time
                        ? $patient->visits->first()->visit_date_time->format('Y-m-d')
                        : 'N/A'
                    ]);
                    break;
                case 'detailed':
                    fputcsv($file, [
                        $patient->patient_no,
                        $patient->full_name,
                        $patient->birthdate?->format('Y-m-d'),
                        $patient->age,
                        ucfirst($patient->sex),
                        $patient->mobile_no,
                        $patient->telephone_no,
                        $patient->present_address,
                        $patient->occupation,
                        $patient->religion,
                        ucfirst($patient->civil_status),
                        $patient->nationality,
                        $patient->informant_name,
                        $patient->relationship,
                        $patient->company_name,
                        $patient->hmo_name,
                        $patient->hmo_company_id_no,
                        $patient->drug_allergies,
                        $patient->food_allergies,
                        $patient->past_medical_history,
                        $patient->family_history,
                        $patient->created_at->format('Y-m-d H:i:s'),
                        $patient->visits->count()
                    ]);
                    break;
                case 'medical_history':
                    fputcsv($file, [
                        $patient->patient_no,
                        $patient->full_name,
                        $patient->age,
                        ucfirst($patient->sex),
                        $patient->drug_allergies,
                        $patient->food_allergies,
                        $patient->past_medical_history,
                        $patient->family_history,
                        $patient->social_personal_history,
                        $patient->obstetrics_gynecology_history,
                        $patient->visits->count(),
                        $patient->visits->first() && $patient->visits->first()->visit_date_time
                        ? $patient->visits->first()->visit_date_time->format('Y-m-d')
                        : 'N/A'
                    ]);
                    break;
            }
        }
    }

}
