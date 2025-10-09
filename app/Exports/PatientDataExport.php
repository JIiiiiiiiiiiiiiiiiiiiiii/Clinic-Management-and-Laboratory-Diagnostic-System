<?php

namespace App\Exports;

use App\Models\Patient;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class PatientDataExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithEvents
{
    protected $patients;
    protected $type;

    public function __construct($patients, $type = 'summary')
    {
        $this->patients = $patients;
        $this->type = $type;
    }

    public function collection()
    {
        return $this->patients;
    }

    public function headings(): array
    {
        switch ($this->type) {
            case 'summary':
                return [
                    'Patient No',
                    'Full Name',
                    'Birthdate',
                    'Age',
                    'Sex',
                    'Mobile No',
                    'Address',
                    'Occupation',
                    'Civil Status',
                    'Registration Date',
                    'Total Visits',
                    'Last Visit'
                ];
            case 'detailed':
                return [
                    'Patient No',
                    'Full Name',
                    'Birthdate',
                    'Age',
                    'Sex',
                    'Mobile No',
                    'Telephone No',
                    'Address',
                    'Occupation',
                    'Religion',
                    'Civil Status',
                    'Nationality',
                    'Emergency Contact',
                    'Relationship',
                    'Company',
                    'HMO',
                    'HMO ID',
                    'Drug Allergies',
                    'Food Allergies',
                    'Past Medical History',
                    'Family History',
                    'Registration Date',
                    'Total Visits'
                ];
            case 'medical_history':
                return [
                    'Patient No',
                    'Full Name',
                    'Age',
                    'Sex',
                    'Drug Allergies',
                    'Food Allergies',
                    'Past Medical History',
                    'Family History',
                    'Social History',
                    'Obstetrics History',
                    'Total Visits',
                    'Last Visit Date'
                ];
            default:
                return [];
        }
    }

    public function map($patient): array
    {
        try {
            switch ($this->type) {
                case 'summary':
                    return [
                        $patient->patient_no ?? 'N/A',
                        $patient->full_name ?? 'N/A',
                        $patient->birthdate ? $patient->birthdate->format('Y-m-d') : 'N/A',
                        $patient->age ?? 'N/A',
                        ucfirst($patient->sex ?? 'N/A'),
                        $patient->mobile_no ?? 'N/A',
                        $patient->present_address ?? 'N/A',
                        $patient->occupation ?? 'N/A',
                        ucfirst($patient->civil_status ?? 'N/A'),
                        $patient->created_at ? $patient->created_at->format('Y-m-d H:i:s') : 'N/A',
                        $patient->visits ? $patient->visits->count() : 0,
                        $patient->visits && $patient->visits->first() && $patient->visits->first()->arrival_date ? $patient->visits->first()->arrival_date->format('Y-m-d') : 'N/A'
                    ];
            case 'detailed':
                return [
                    $patient->patient_no ?? 'N/A',
                    $patient->full_name ?? 'N/A',
                    $patient->birthdate ? $patient->birthdate->format('Y-m-d') : 'N/A',
                    $patient->age ?? 'N/A',
                    ucfirst($patient->sex ?? 'N/A'),
                    $patient->mobile_no ?? 'N/A',
                    $patient->telephone_no ?? 'N/A',
                    $patient->present_address ?? 'N/A',
                    $patient->occupation ?? 'N/A',
                    $patient->religion ?? 'N/A',
                    ucfirst($patient->civil_status ?? 'N/A'),
                    $patient->nationality ?? 'N/A',
                    $patient->informant_name ?? 'N/A',
                    $patient->relationship ?? 'N/A',
                    $patient->company_name ?? 'N/A',
                    $patient->hmo_name ?? 'N/A',
                    $patient->hmo_company_id_no ?? 'N/A',
                    $patient->drug_allergies ?? 'N/A',
                    $patient->food_allergies ?? 'N/A',
                    $patient->past_medical_history ?? 'N/A',
                    $patient->family_history ?? 'N/A',
                    $patient->created_at ? $patient->created_at->format('Y-m-d H:i:s') : 'N/A',
                    $patient->visits ? $patient->visits->count() : 0
                ];
            case 'medical_history':
                return [
                    $patient->patient_no ?? 'N/A',
                    $patient->full_name ?? 'N/A',
                    $patient->age ?? 'N/A',
                    ucfirst($patient->sex ?? 'N/A'),
                    $patient->drug_allergies ?? 'N/A',
                    $patient->food_allergies ?? 'N/A',
                    $patient->past_medical_history ?? 'N/A',
                    $patient->family_history ?? 'N/A',
                    $patient->social_personal_history ?? 'N/A',
                    $patient->obstetrics_gynecology_history ?? 'N/A',
                    $patient->visits ? $patient->visits->count() : 0,
                    $patient->visits && $patient->visits->first() && $patient->visits->first()->arrival_date ? $patient->visits->first()->arrival_date->format('Y-m-d') : 'N/A'
                ];
            default:
                return [];
        }
        } catch (\Exception $e) {
            \Log::error('Error mapping patient data', [
                'patient_id' => $patient->id ?? 'unknown',
                'error' => $e->getMessage()
            ]);
            return array_fill(0, count($this->headings()), 'Error');
        }
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold text
            1 => [
                'font' => [
                    'bold' => true,
                    'size' => 12
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => [
                        'rgb' => 'E3F2FD'
                    ]
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ]
            ],
        ];
    }

    public function columnWidths(): array
    {
        switch ($this->type) {
            case 'summary':
                return [
                    'A' => 12, // Patient No
                    'B' => 25, // Full Name
                    'C' => 12, // Birthdate
                    'D' => 8,  // Age
                    'E' => 8,  // Sex
                    'F' => 15, // Mobile No
                    'G' => 30, // Address
                    'H' => 20, // Occupation
                    'I' => 15, // Civil Status
                    'J' => 18, // Registration Date
                    'K' => 12, // Total Visits
                    'L' => 12, // Last Visit
                ];
            case 'detailed':
                return [
                    'A' => 12, // Patient No
                    'B' => 25, // Full Name
                    'C' => 12, // Birthdate
                    'D' => 8,  // Age
                    'E' => 8,  // Sex
                    'F' => 15, // Mobile No
                    'G' => 15, // Telephone No
                    'H' => 30, // Address
                    'I' => 20, // Occupation
                    'J' => 15, // Religion
                    'K' => 15, // Civil Status
                    'L' => 15, // Nationality
                    'M' => 20, // Emergency Contact
                    'N' => 15, // Relationship
                    'O' => 20, // Company
                    'P' => 15, // HMO
                    'Q' => 15, // HMO ID
                    'R' => 20, // Drug Allergies
                    'S' => 20, // Food Allergies
                    'T' => 30, // Past Medical History
                    'U' => 30, // Family History
                    'V' => 18, // Registration Date
                    'W' => 12, // Total Visits
                ];
            case 'medical_history':
                return [
                    'A' => 12, // Patient No
                    'B' => 25, // Full Name
                    'C' => 8,  // Age
                    'D' => 8,  // Sex
                    'E' => 20, // Drug Allergies
                    'F' => 20, // Food Allergies
                    'G' => 30, // Past Medical History
                    'H' => 30, // Family History
                    'I' => 30, // Social History
                    'J' => 30, // Obstetrics History
                    'K' => 12, // Total Visits
                    'L' => 15, // Last Visit Date
                ];
            default:
                return [];
        }
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // Add borders to all cells
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

                // Auto-filter on the header row
                $sheet->setAutoFilter('A1:' . $highestColumn . '1');

                // Freeze the first row
                $sheet->freezePane('A2');
            },
        ];
    }
}
