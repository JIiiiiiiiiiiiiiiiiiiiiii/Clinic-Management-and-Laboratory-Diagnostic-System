<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class AppointmentReportExport implements WithMultipleSheets
{
    protected $appointments;
    protected $summary;
    protected $reportType;

    public function __construct($appointments, $summary, $reportType)
    {
        $this->appointments = $appointments;
        $this->summary = $summary;
        $this->reportType = $reportType;
    }

    public function sheets(): array
    {
        return [
            'Summary' => new SummarySheet($this->summary, $this->reportType),
            'Appointments' => new AppointmentsSheet($this->appointments, $this->reportType),
        ];
    }
}

class SummarySheet implements FromCollection, WithHeadings, WithStyles, WithTitle
{
    protected $summary;
    protected $reportType;

    public function __construct($summary, $reportType)
    {
        $this->summary = $summary;
        $this->reportType = $reportType;
    }

    public function collection()
    {
        return collect([
            ['Metric', 'Value'],
            ['Total Appointments', $this->summary['total_appointments']],
            ['Completed Appointments', $this->summary['completed_appointments']],
            ['Pending Appointments', $this->summary['pending_appointments']],
            ['Confirmed Appointments', $this->summary['confirmed_appointments']],
            ['Cancelled Appointments', $this->summary['cancelled_appointments']],
            ['Total Revenue', '₱' . number_format($this->summary['total_revenue'], 2)],
            ['Online Appointments', $this->summary['online_appointments']],
            ['Walk-in Appointments', $this->summary['walk_in_appointments']],
        ]);
    }

    public function headings(): array
    {
        return [];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'size' => 14],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '366092']
                ],
                'font' => ['color' => ['rgb' => 'FFFFFF']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ],
            2 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E7E6E6']
                ],
            ],
        ];
    }

    public function title(): string
    {
        return 'Summary Statistics';
    }
}

class AppointmentsSheet implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected $appointments;
    protected $reportType;

    public function __construct($appointments, $reportType)
    {
        $this->appointments = $appointments;
        $this->reportType = $reportType;
    }

    public function collection()
    {
        return collect($this->appointments);
    }

    public function headings(): array
    {
        return [
            'Appointment Code',
            'Patient Name',
            'Contact Number',
            'Appointment Type',
            'Specialist Type',
            'Specialist Name',
            'Appointment Date',
            'Appointment Time',
            'Duration',
            'Status',
            'Source',
            'Price',
            'Notes',
            'Special Requirements',
            'Created At'
        ];
    }

    public function map($appointment): array
    {
        return [
            $appointment['appointment_code'] ?? 'A' . str_pad($appointment['id'], 4, '0', STR_PAD_LEFT),
            $appointment['patient_name'],
            $appointment['contact_number'],
            $appointment['appointment_type'],
            $appointment['specialist_type'],
            $appointment['specialist_name'],
            $appointment['appointment_date'],
            $appointment['appointment_time'],
            $appointment['duration'],
            $appointment['status'],
            $appointment['source'],
            $appointment['price'],
            $appointment['notes'] ?? '',
            $appointment['special_requirements'] ?? '',
            $appointment['created_at']
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '366092']
                ],
                'font' => ['color' => ['rgb' => 'FFFFFF']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ],
        ];
    }

    public function title(): string
    {
        return 'Appointments Details';
    }
}
