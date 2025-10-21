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

        // Patient Information Section
        $data[] = ['PATIENT INFORMATION'];
        $data[] = ['Patient No', $this->patient->patient_no];
        $data[] = ['Full Name', $this->patient->full_name];
        $data[] = ['Birthdate', $this->patient->birthdate ? $this->patient->birthdate->format('Y-m-d') : 'N/A'];
        $data[] = ['Age', $this->patient->age];
        $data[] = ['Sex', ucfirst($this->patient->sex)];
        $data[] = ['Mobile No', $this->patient->mobile_no];
        $data[] = ['Telephone No', $this->patient->telephone_no];
        $data[] = ['Address', $this->patient->present_address];
        $data[] = ['Occupation', $this->patient->occupation];
        $data[] = ['Religion', $this->patient->religion];
        $data[] = ['Civil Status', ucfirst($this->patient->civil_status)];
        $data[] = ['Nationality', $this->patient->nationality];
        $data[] = ['Registration Date', $this->patient->created_at->format('Y-m-d H:i:s')];

        $data[] = []; // Empty row

        // Emergency Contact Section
        $data[] = ['EMERGENCY CONTACT'];
        $data[] = ['Contact Name', $this->patient->informant_name];
        $data[] = ['Relationship', $this->patient->relationship];

        $data[] = []; // Empty row

        // Insurance Information Section
        $data[] = ['INSURANCE INFORMATION'];
        $data[] = ['Company', $this->patient->company_name];
        $data[] = ['HMO', $this->patient->hmo_name];
        $data[] = ['HMO ID', $this->patient->hmo_company_id_no];
        $data[] = ['Validation Code', $this->patient->validation_approval_code];
        $data[] = ['Validity', $this->patient->validity];

        $data[] = []; // Empty row

        // Medical History Section
        $data[] = ['MEDICAL HISTORY'];
        $data[] = ['Drug Allergies', $this->patient->drug_allergies];
        $data[] = ['Food Allergies', $this->patient->food_allergies];
        $data[] = ['Past Medical History', $this->patient->past_medical_history];
        $data[] = ['Family History', $this->patient->family_history];
        $data[] = ['Social History', $this->patient->social_personal_history];
        $data[] = ['Obstetrics History', $this->patient->obstetrics_gynecology_history];

        $data[] = []; // Empty row

        // Visit History Section
        $data[] = ['VISIT HISTORY'];
        $data[] = ['Total Visits', $this->patient->visits->count()];

        if ($this->patient->visits->count() > 0) {
            $data[] = []; // Empty row
            $data[] = ['Visit Date', 'Chief Complaint', 'Attending Physician', 'Status'];

            foreach ($this->patient->visits as $visit) {
                $data[] = [
                    $visit->visit_date_time ? $visit->visit_date_time->format('Y-m-d') : 'N/A',
                    $visit->reason_for_consult,
                    $visit->attending_physician,
                    $visit->status
                ];
            }
        }

        $data[] = []; // Empty row

        // Laboratory Orders Section
        $data[] = ['LABORATORY ORDERS'];
        $data[] = ['Total Lab Orders', $this->patient->labOrders->count()];

        if ($this->patient->labOrders->count() > 0) {
            $data[] = []; // Empty row
            $data[] = ['Order Date', 'Test Type', 'Status', 'Results Available'];

            foreach ($this->patient->labOrders as $order) {
                $data[] = [
                    $order->created_at->format('Y-m-d'),
                    $order->results->map(function ($result) {
                        return $result->test?->name;
                    })->filter()->join(', '),
                    $order->status,
                    $order->results->count() > 0 ? 'Yes' : 'No'
                ];
            }
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
            'A' => 25, // Field
            'B' => 50, // Value
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
