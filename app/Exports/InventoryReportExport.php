<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;

class InventoryReportExport implements FromArray, WithHeadings, WithStyles, WithColumnWidths, WithEvents
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

        // Create empty rows for header (rows 1-7)
        $result = [
            [], // Row 1 - Logo and hospital name
            [], // Row 2 - Generated on and address
            [], // Row 3 - Report type and slogan
            [], // Row 4 - Period and motto
            [], // Row 5 - Date range and phone
            [], // Row 6 - METRIC and email
            [], // Row 7 - Empty spacing
        ];

        // Add data starting from row 8
        $result[] = ['Total Items', $summary['totalItems']];
        $result[] = ['Items Consumed', $summary['totalConsumed']];
        $result[] = ['Items Rejected', $summary['totalRejected']];
        $result[] = ['Low Stock Items', $summary['lowStockItems']];
        $result[] = []; // Empty row
        
        // Department breakdown
        $result[] = ['Doctor & Nurse Supplies', ''];
        $result[] = ['Total Items', $departmentStats['doctorNurse']['totalItems']];
        $result[] = ['Consumed', $departmentStats['doctorNurse']['totalConsumed']];
        $result[] = ['Rejected', $departmentStats['doctorNurse']['totalRejected']];
        $result[] = ['Low Stock', $departmentStats['doctorNurse']['lowStock']];
        $result[] = []; // Empty row
        
        $result[] = ['Med Tech Supplies', ''];
        $result[] = ['Total Items', $departmentStats['medTech']['totalItems']];
        $result[] = ['Consumed', $departmentStats['medTech']['totalConsumed']];
        $result[] = ['Rejected', $departmentStats['medTech']['totalRejected']];
        $result[] = ['Low Stock', $departmentStats['medTech']['lowStock']];

        return $result;
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


    public function columnWidths(): array
    {
        return [
            'A' => 25,
            'B' => 15,
        ];
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

        // Add hospital information in the exact format shown in the image
        $sheet->setCellValue('B1', 'St. James Hospital Clinic, Inc.');
        $sheet->setCellValue('A2', 'Generated on:');
        $sheet->setCellValue('B2', 'San Isidro City of Cabuyao Laguna');
        $sheet->setCellValue('A3', 'Report Type:');
        $sheet->setCellValue('B3', 'Santa Rosa\'s First in Quality Healthcare Service');
        $sheet->setCellValue('A4', 'Period:');
        $sheet->setCellValue('B4', 'PASYENTE MUNA');
        $sheet->setCellValue('A5', 'Date Range:');
        $sheet->setCellValue('B5', 'Tel. Nos. 02.85844533; 049.5341254; 049.5020058; Fax No.: local 307');
        $sheet->setCellValue('A6', 'METRIC');
        $sheet->setCellValue('B6', 'email add: info@stjameshospital.com.ph');

        // Style the header to match the image
        $sheet->getStyle('B1')->getFont()->setBold(true)->setSize(16);
        $sheet->getStyle('B1')->getFont()->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('2d5a27'));
        $sheet->getStyle('B3')->getFont()->setItalic(true)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('1e40af'));
        $sheet->getStyle('B4')->getFont()->setBold(true)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('2d5a27'));
        
        // Style the labels in column A
        $sheet->getStyle('A2:A6')->getFont()->setBold(true);
        $sheet->getStyle('A2:A6')->getFont()->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('333333'));

        // Add border around the header area
        $sheet->getStyle('A1:B6')->getBorders()->getAllBorders()->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);
        $sheet->getStyle('A1:B6')->getBorders()->getBottom()->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM);
        
        // Add background color to header
        $sheet->getStyle('A1:B6')->getFill()
            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setRGB('F8F9FA');
        
        // Set row height for header
        $sheet->getRowDimension(1)->setRowHeight(25);
        $sheet->getRowDimension(2)->setRowHeight(18);
        $sheet->getRowDimension(3)->setRowHeight(18);
        $sheet->getRowDimension(4)->setRowHeight(18);
        $sheet->getRowDimension(5)->setRowHeight(18);
        $sheet->getRowDimension(6)->setRowHeight(18);
        
        // Set column widths
        $sheet->getColumnDimension('A')->setWidth(15);
        $sheet->getColumnDimension('B')->setWidth(50);
        
        // Add some spacing after header
        $sheet->getRowDimension(7)->setRowHeight(10);
        
        // Style the data rows
        $this->styleDataRows($sheet);
    }
    
    protected function styleDataRows($sheet)
    {
        // Get the last row with data
        $lastRow = $sheet->getHighestRow();
        
        // Style the data area (rows 8 onwards)
        if ($lastRow >= 8) {
            // Add borders to data rows
            $sheet->getStyle('A8:B' . $lastRow)->getBorders()->getAllBorders()
                ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);
            
            // Style department headers (rows that contain department names)
            for ($row = 8; $row <= $lastRow; $row++) {
                $cellValue = $sheet->getCell('A' . $row)->getValue();
                if (is_string($cellValue) && (
                    strpos($cellValue, 'Doctor & Nurse Supplies') !== false ||
                    strpos($cellValue, 'Med Tech Supplies') !== false
                )) {
                    // Style department headers
                    $sheet->getStyle('A' . $row . ':B' . $row)->getFont()->setBold(true);
                    $sheet->getStyle('A' . $row . ':B' . $row)->getFill()
                        ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                        ->getStartColor()->setRGB('E8F5E8'); // Light green for Doctor & Nurse
                    
                    if (strpos($cellValue, 'Med Tech Supplies') !== false) {
                        $sheet->getStyle('A' . $row . ':B' . $row)->getFill()
                            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                            ->getStartColor()->setRGB('FFF3E0'); // Light orange for Med Tech
                    }
                }
            }
        }
    }
}
