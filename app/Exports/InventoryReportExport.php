<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class InventoryReportExport implements FromArray, WithHeadings, WithStyles, WithTitle, WithColumnWidths
{
    protected $report;

    public function __construct($report)
    {
        $this->report = $report;
    }

    public function array(): array
    {
        $data = $this->report->data;
        $summary = $data['summary'];
        $departmentStats = $data['departmentStats'];

        return [
            // Summary section
            ['INVENTORY SUMMARY REPORT'],
            ['Generated on:', now()->format('Y-m-d H:i:s')],
            ['Report Type:', $this->report->report_name],
            ['Period:', ucfirst($this->report->period)],
            ['Date Range:', $this->report->start_date . ' to ' . $this->report->end_date],
            [],
            
            // Summary data
            ['METRIC', 'COUNT'],
            ['Total Items', $summary['totalItems']],
            ['Items Consumed', $summary['totalConsumed']],
            ['Items Rejected', $summary['totalRejected']],
            ['Low Stock Items', $summary['lowStockItems']],
            [],
            
            // Department breakdown
            ['DEPARTMENT BREAKDOWN'],
            [],
            ['Doctor & Nurse Supplies'],
            ['Total Items', $departmentStats['doctorNurse']['totalItems']],
            ['Consumed', $departmentStats['doctorNurse']['totalConsumed']],
            ['Rejected', $departmentStats['doctorNurse']['totalRejected']],
            ['Low Stock', $departmentStats['doctorNurse']['lowStock']],
            [],
            
            ['Med Tech Supplies'],
            ['Total Items', $departmentStats['medTech']['totalItems']],
            ['Consumed', $departmentStats['medTech']['totalConsumed']],
            ['Rejected', $departmentStats['medTech']['totalRejected']],
            ['Low Stock', $departmentStats['medTech']['lowStock']],
        ];
    }

    public function headings(): array
    {
        return [];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Title row
            1 => [
                'font' => ['bold' => true, 'size' => 16],
                'alignment' => ['horizontal' => 'center'],
            ],
            // Headers
            7 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E3F2FD'],
                ],
            ],
            12 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E8F5E8'],
                ],
            ],
            18 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'FFF3E0'],
                ],
            ],
        ];
    }

    public function title(): string
    {
        return 'Inventory Report';
    }

    public function columnWidths(): array
    {
        return [
            'A' => 25,
            'B' => 15,
        ];
    }
}
