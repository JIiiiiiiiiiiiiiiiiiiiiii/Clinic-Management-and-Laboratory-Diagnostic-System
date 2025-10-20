<?php

namespace App\Exports\Hospital;

use App\Models\Patient;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PatientsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths
{
    protected $dateRange;

    public function __construct($dateRange)
    {
        $this->dateRange = $dateRange;
    }

    public function collection()
    {
        return Patient::with(['appointments', 'transfers'])
            ->whereBetween('created_at', [$this->dateRange['start'], $this->dateRange['end']])
            ->get();
    }

    public function headings(): array
    {
        return [
            'Patient ID',
            'First Name',
            'Last Name',
            'Date of Birth',
            'Age',
            'Sex',
            'Mobile Number',
            'Telephone Number',
            'Address',
            'Emergency Contact',
            'Emergency Phone',
            'Registration Date',
            'Total Appointments',
            'Total Transfers'
        ];
    }

    public function map($patient): array
    {
        return [
            $patient->patient_code,
            $patient->first_name,
            $patient->last_name,
            $patient->date_of_birth?->format('Y-m-d'),
            $patient->date_of_birth ? $patient->date_of_birth->age : 'N/A',
            $patient->sex,
            $patient->mobile_no,
            $patient->telephone_no,
            $patient->address,
            $patient->emergency_contact_name,
            $patient->emergency_contact_phone,
            $patient->created_at->format('Y-m-d H:i:s'),
            $patient->appointments->count(),
            $patient->transfers->count()
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 15,
            'B' => 20,
            'C' => 20,
            'D' => 15,
            'E' => 10,
            'F' => 10,
            'G' => 20,
            'H' => 20,
            'I' => 30,
            'J' => 25,
            'K' => 20,
            'L' => 20,
            'M' => 20,
            'N' => 20,
        ];
    }
}
