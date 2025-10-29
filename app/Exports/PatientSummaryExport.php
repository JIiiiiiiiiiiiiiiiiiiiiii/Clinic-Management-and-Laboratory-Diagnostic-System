<?php

namespace App\Exports;

use App\Models\Patient;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class PatientSummaryExport implements FromArray, WithHeadings, WithStyles, WithColumnWidths, WithEvents
{
    protected $patient;

    public function __construct(Patient $patient)
    {
        $this->patient = $patient;
    }

    public function array(): array
    {
        $data = [];

        try {
            // Patient Information Section
            $data[] = ['PATIENT INFORMATION'];
            $data[] = ['Patient No', $this->patient->patient_no ?? 'N/A'];
            $data[] = ['Full Name', $this->patient->full_name ?? 'N/A'];
            $data[] = ['Birthdate', $this->patient->birthdate ? $this->patient->birthdate->format('Y-m-d') : 'N/A'];
            $data[] = ['Age', $this->patient->age ?? 'N/A'];
            $data[] = ['Sex', ucfirst($this->patient->sex ?? 'N/A')];
            $data[] = ['Mobile No', $this->patient->mobile_no ?? 'N/A'];
            $data[] = ['Telephone No', $this->patient->telephone_no ?? 'N/A'];
            $data[] = ['Address', $this->patient->present_address ?? 'N/A'];
            $data[] = ['Occupation', $this->patient->occupation ?? 'N/A'];
            $data[] = ['Religion', $this->patient->religion ?? 'N/A'];
            $data[] = ['Civil Status', ucfirst($this->patient->civil_status ?? 'N/A')];
            $data[] = ['Nationality', $this->patient->nationality ?? 'N/A'];
            $data[] = ['Registration Date', $this->patient->created_at ? $this->patient->created_at->format('Y-m-d H:i:s') : 'N/A'];

            $data[] = []; // Empty row

            // Emergency Contact Section
            $data[] = ['EMERGENCY CONTACT'];
            $data[] = ['Contact Name', $this->patient->informant_name ?? 'N/A'];
            $data[] = ['Relationship', $this->patient->relationship ?? 'N/A'];

            $data[] = []; // Empty row

            // Insurance Information Section
            $data[] = ['INSURANCE INFORMATION'];
            $data[] = ['Company', $this->patient->insurance_company ?? 'N/A'];
            $data[] = ['HMO', $this->patient->hmo_name ?? 'N/A'];
            $data[] = ['HMO ID', $this->patient->hmo_id_no ?? 'N/A'];
            $data[] = ['Validation Code', $this->patient->approval_code ?? 'N/A'];
            $data[] = ['Validity', $this->patient->validity ?? 'N/A'];

            $data[] = []; // Empty row

            // Medical History Section
            $data[] = ['MEDICAL HISTORY'];
            $data[] = ['Drug Allergies', $this->patient->drug_allergies ?? 'N/A'];
            $data[] = ['Food Allergies', $this->patient->food_allergies ?? 'N/A'];
            $data[] = ['Past Medical History', $this->patient->past_medical_history ?? 'N/A'];
            $data[] = ['Family History', $this->patient->family_history ?? 'N/A'];
            $data[] = ['Social History', $this->patient->social_history ?? 'N/A'];
            $data[] = ['Obstetrics History', $this->patient->obgyn_history ?? 'N/A'];

            $data[] = []; // Empty row

            // Visit History Section
            $data[] = ['VISIT HISTORY'];
            $visits = $this->patient->visits ?? collect();
            $data[] = ['Total Visits', $visits->count()];

            if ($visits->count() > 0) {
                $data[] = []; // Empty row
                $data[] = ['Visit Date', 'Chief Complaint', 'Attending Physician', 'Status'];

                foreach ($visits as $visit) {
                    $data[] = [
                        $visit->visit_date_time_time ? $visit->visit_date_time_time->format('Y-m-d') : 'N/A',
                        $visit->purpose ?? 'N/A',
                        $visit->attending_staff_id ?? 'N/A',
                        $visit->status ?? 'N/A'
                    ];
                }
            }

            $data[] = []; // Empty row

            // Laboratory Orders Section
            $data[] = ['LABORATORY ORDERS'];
            $labOrders = $this->patient->labOrders ?? collect();
            $data[] = ['Total Lab Orders', $labOrders->count()];

            if ($labOrders->count() > 0) {
                $data[] = []; // Empty row
                $data[] = ['Order Date', 'Test Type', 'Status', 'Results Available'];

                foreach ($labOrders as $order) {
                    $results = $order->results ?? collect();
                    $data[] = [
                        $order->created_at ? $order->created_at->format('Y-m-d') : 'N/A',
                        $results->map(function ($result) {
                            return $result->test?->name ?? 'Unknown Test';
                        })->filter()->join(', ') ?: 'N/A',
                        $order->status ?? 'N/A',
                        $results->count() > 0 ? 'Yes' : 'No'
                    ];
                }
            }

        } catch (\Exception $e) {
            \Log::error('Error in PatientSummaryExport::array()', [
                'patient_id' => $this->patient->id ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Return basic patient info if there's an error
            $data = [
                ['PATIENT INFORMATION'],
                ['Patient No', $this->patient->patient_no ?? 'N/A'],
                ['Full Name', $this->patient->full_name ?? 'N/A'],
                ['Error', 'Unable to load complete patient data: ' . $e->getMessage()]
            ];
        }

        return $data;
    }

    public function headings(): array
    {
        return [
            'Field',
            'Value'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $styles = [];

        // Style section headers
        $sectionHeaders = ['PATIENT INFORMATION', 'EMERGENCY CONTACT', 'INSURANCE INFORMATION', 'MEDICAL HISTORY', 'VISIT HISTORY', 'LABORATORY ORDERS'];

        foreach ($sectionHeaders as $header) {
            $row = $this->findRowByValue($sheet, $header);
            if ($row) {
                $styles[$row] = [
                    'font' => [
                        'bold' => true,
                        'size' => 14,
                        'color' => ['rgb' => 'FFFFFF']
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => [
                            'rgb' => '1976D2'
                        ]
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER
                    ]
                ];
            }
        }

        return $styles;
    }

    public function columnWidths(): array
    {
        return [
            'A' => 40, // Field
            'B' => 60, // Value
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // Add borders to all cells with data
                $highestRow = $sheet->getHighestRow();
                $highestColumn = $sheet->getHighestColumn();

                $sheet->getStyle('A1:' . $highestColumn . $highestRow)->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => 'CCCCCC']
                        ]
                    ]
                ]);

                // Set row height for better readability
                for ($row = 1; $row <= $highestRow; $row++) {
                    $sheet->getRowDimension($row)->setRowHeight(20);
                }

                // Merge cells for section headers
                $this->mergeSectionHeaders($sheet);
            },
        ];
    }

    private function findRowByValue($sheet, $value)
    {
        $highestRow = $sheet->getHighestRow();

        for ($row = 1; $row <= $highestRow; $row++) {
            if ($sheet->getCell('A' . $row)->getValue() === $value) {
                return $row;
            }
        }

        return null;
    }

    private function mergeSectionHeaders($sheet)
    {
        $sectionHeaders = ['PATIENT INFORMATION', 'EMERGENCY CONTACT', 'INSURANCE INFORMATION', 'MEDICAL HISTORY', 'VISIT HISTORY', 'LABORATORY ORDERS'];

        foreach ($sectionHeaders as $header) {
            $row = $this->findRowByValue($sheet, $header);
            if ($row) {
                $sheet->mergeCells('A' . $row . ':B' . $row);
            }
        }
    }
}
