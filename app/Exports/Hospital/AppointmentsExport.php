<?php

namespace App\Exports\Hospital;

use App\Models\Appointment;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AppointmentsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths
{
    protected $dateRange;

    public function __construct($dateRange)
    {
        $this->dateRange = $dateRange;
    }

    public function collection()
    {
        return Appointment::with(['patient', 'doctor'])
            ->whereBetween('appointment_date', [$this->dateRange['start'], $this->dateRange['end']])
            ->get();
    }

    public function headings(): array
    {
        return [
            'Appointment ID',
            'Patient Name',
            'Patient Code',
            'Doctor Name',
            'Appointment Date',
            'Appointment Time',
            'Status',
            'Specialist Type',
            'Notes',
            'Created At'
        ];
    }

    public function map($appointment): array
    {
        return [
            $appointment->id,
            $appointment->patient ? $appointment->patient->first_name . ' ' . $appointment->patient->last_name : 'N/A',
            $appointment->patient?->patient_code ?? 'N/A',
            $appointment->doctor ? $appointment->doctor->first_name . ' ' . $appointment->doctor->last_name : 'N/A',
            $appointment->appointment_date?->format('Y-m-d'),
            $appointment->appointment_time,
            $appointment->status,
            $appointment->specialist_type,
            $appointment->notes,
            $appointment->created_at->format('Y-m-d H:i:s')
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
            'B' => 25,
            'C' => 15,
            'D' => 25,
            'E' => 15,
            'F' => 15,
            'G' => 15,
            'H' => 20,
            'I' => 30,
            'J' => 20,
        ];
    }
}
