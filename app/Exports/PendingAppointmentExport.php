<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use Illuminate\Support\Collection;
use App\Models\Appointment;

class PendingAppointmentExport implements WithMultipleSheets, WithEvents
{
    protected Collection $appointments;
    protected array $filters;
    protected string $format;

    public function __construct(Collection $appointments, array $filters = [], string $format = 'excel')
    {
        $this->appointments = $appointments;
        $this->filters = $filters;
        $this->format = $format;
    }

    /**
     * @return array
     */
    public function sheets(): array
    {
        $sheets = [];

        // Summary Sheet
        $summaryData = $this->getSummaryData();
        $sheets[] = new ArrayExport($summaryData, 'Pending Appointments Summary', true);

        // Appointments Sheet
        $appointmentData = $this->getAppointmentData();
        $sheets[] = new ArrayExport($appointmentData, 'Pending Appointments', true);

        return $sheets;
    }

    protected function getSummaryData(): array
    {
        $totalAppointments = $this->appointments->count();
        $confirmedAppointments = $this->appointments->where('status', 'Confirmed')->count();
        $pendingAppointments = $this->appointments->where('status', 'Pending')->count();
        $cancelledAppointments = $this->appointments->where('status', 'Cancelled')->count();
        
        $onlineAppointments = $this->appointments->where('source', 'online')->count();
        $walkInAppointments = $this->appointments->where('source', 'walk_in')->count();
        $phoneAppointments = $this->appointments->where('source', 'phone')->count();
        
        $totalRevenue = $this->appointments->sum('price');
        $totalLabAmount = $this->appointments->sum('total_lab_amount');
        $totalFinalAmount = $this->appointments->sum('final_total_amount');

        return [
            ['Metric', 'Value'],
            ['Report Generated', now()->format('M d, Y H:i:s')],
            ['Date Range', $this->filters['date_from'] ?? 'All Time' . ' to ' . ($this->filters['date_to'] ?? 'Present')],
            ['Status Filter', $this->filters['status'] ?? 'All'],
            ['Specialist Filter', $this->filters['specialist_id'] ?? 'All'],
            ['Source Filter', $this->filters['source'] ?? 'All'],
            ['', ''],
            ['TOTAL APPOINTMENTS', $totalAppointments],
            ['CONFIRMED APPOINTMENTS', $confirmedAppointments],
            ['PENDING APPOINTMENTS', $pendingAppointments],
            ['CANCELLED APPOINTMENTS', $cancelledAppointments],
            ['', ''],
            ['ONLINE APPOINTMENTS', $onlineAppointments],
            ['WALK-IN APPOINTMENTS', $walkInAppointments],
            ['PHONE APPOINTMENTS', $phoneAppointments],
            ['', ''],
            ['TOTAL CONSULTATION REVENUE', 'PHP ' . number_format($totalRevenue, 2)],
            ['TOTAL LAB TEST AMOUNT', 'PHP ' . number_format($totalLabAmount, 2)],
            ['TOTAL FINAL AMOUNT', 'PHP ' . number_format($totalFinalAmount, 2)],
        ];
    }

    protected function getAppointmentData(): array
    {
        $data = [
            [
                'Appointment ID',
                'Patient Name',
                'Patient ID',
                'Contact Number',
                'Appointment Type',
                'Specialist Name',
                'Specialist Type',
                'Appointment Date',
                'Appointment Time',
                'Duration',
                'Status',
                'Source',
                'Consultation Price',
                'Lab Test Amount',
                'Final Total Amount',
                'Billing Status',
                'Notes',
                'Special Requirements',
                'Created At'
            ]
        ];

        foreach ($this->appointments as $appointment) {
            $data[] = [
                $appointment->id,
                $appointment->patient_name,
                $appointment->patient_id,
                $appointment->contact_number ?? 'N/A',
                ucfirst($appointment->appointment_type),
                $appointment->specialist_name,
                ucfirst($appointment->specialist_type ?? 'doctor'),
                $appointment->appointment_date ? $appointment->appointment_date->format('M d, Y') : 'N/A',
                $appointment->appointment_time ? $appointment->appointment_time->format('g:i A') : 'N/A',
                $appointment->duration ?? '30 min',
                ucfirst($appointment->status),
                ucfirst($appointment->source ?? 'online'),
                'PHP ' . number_format($appointment->price, 2),
                'PHP ' . number_format($appointment->total_lab_amount ?? 0, 2),
                'PHP ' . number_format($appointment->final_total_amount ?? $appointment->price, 2),
                ucfirst($appointment->billing_status ?? 'not_billed'),
                $appointment->notes ?? '',
                $appointment->special_requirements ?? '',
                $appointment->created_at ? $appointment->created_at->format('M d, Y H:i') : 'N/A'
            ];
        }

        return $data;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $this->addHospitalHeader($event);
            },
        ];
    }

    protected function addHospitalHeader(AfterSheet $event)
    {
        $sheet = $event->sheet->getDelegate();
        
        // Add hospital logo in A1
        $drawing = new Drawing();
        $drawing->setName('St. James Hospital Logo');
        $drawing->setDescription('St. James Hospital Logo');
        $drawing->setPath(public_path('st-james-logo.png'));
        $drawing->setHeight(60);
        $drawing->setWidth(60);
        $drawing->setCoordinates('A1');
        $drawing->setOffsetX(5);
        $drawing->setOffsetY(5);
        $drawing->setWorksheet($sheet);

        // Add hospital information
        $sheet->setCellValue('B1', 'St. James Hospital Clinic, Inc.');
        $sheet->setCellValue('A2', 'Generated on:');
        $sheet->setCellValue('B2', now()->format('M d, Y H:i:s'));
        $sheet->setCellValue('A3', 'Report Type:');
        $sheet->setCellValue('B3', 'Pending Appointments Report');
        $sheet->setCellValue('A4', 'Date Range:');
        $sheet->setCellValue('B4', ($this->filters['date_from'] ?? 'All Time') . ' to ' . ($this->filters['date_to'] ?? 'Present'));
        $sheet->setCellValue('A5', 'Contact:');
        $sheet->setCellValue('B5', 'Tel. Nos. 02.85844533; 049.5341254; 049.5020058; Fax No.: local 307');

        // Style the header
        $sheet->getStyle('B1')->getFont()->setBold(true)->setSize(16);
        $sheet->getStyle('B1')->getFont()->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('2d5a27'));
        $sheet->setCellValue('C1', 'PASYENTE MUNA');
        $sheet->getStyle('C1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('C1')->getFont()->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('2d5a27'));
        $sheet->getStyle('B3')->getFont()->setItalic(true)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('1e40af'));
        $sheet->getStyle('B4')->getFont()->setBold(true)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('2d5a27'));
        
        // Style the labels in column A
        $sheet->getStyle('A2:A5')->getFont()->setBold(true);
        $sheet->getStyle('A2:A5')->getFont()->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('333333'));

        // Add border around the header area
        $sheet->getStyle('A1:C5')->getBorders()->getAllBorders()->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);
        $sheet->getStyle('A1:C5')->getBorders()->getBottom()->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM);
        
        // Add background color to header
        $sheet->getStyle('A1:C5')->getFill()
            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setRGB('F8F9FA');
        
        // Set row height for header
        $sheet->getRowDimension(1)->setRowHeight(25);
        $sheet->getRowDimension(2)->setRowHeight(20);
        $sheet->getRowDimension(3)->setRowHeight(20);
        $sheet->getRowDimension(4)->setRowHeight(20);
        $sheet->getRowDimension(5)->setRowHeight(20);
        
        // Merge cells for better layout
        $sheet->mergeCells('B1:C1');
        $sheet->mergeCells('B2:C2');
        $sheet->mergeCells('B3:C3');
        $sheet->mergeCells('B4:C4');
        $sheet->mergeCells('B5:C5');
    }
}
