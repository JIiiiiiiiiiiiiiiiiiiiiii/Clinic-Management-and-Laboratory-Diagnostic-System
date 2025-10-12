<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Worksheet\MemoryDrawing;

abstract class BaseExport implements WithEvents, WithTitle
{
    protected $title;

    public function __construct($title = 'Export')
    {
        $this->title = $title;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $this->addHospitalHeader($event);
                $this->adjustDataPosition($event);
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
        
        // Style the data rows (starting from row 8)
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
    
    protected function adjustDataPosition(AfterSheet $event)
    {
        $sheet = $event->sheet->getDelegate();
        
        // Move all data down by 7 rows to start from row 8
        $lastRow = $sheet->getHighestRow();
        $lastCol = $sheet->getHighestColumn();
        
        if ($lastRow > 0) {
            // Get all data from the sheet
            $data = [];
            for ($row = 1; $row <= $lastRow; $row++) {
                $rowData = [];
                for ($col = 'A'; $col <= $lastCol; $col++) {
                    $rowData[] = $sheet->getCell($col . $row)->getValue();
                }
                $data[] = $rowData;
            }
            
            // Clear the sheet
            $sheet->getStyle('A1:' . $lastCol . $lastRow)->getFill()
                ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_NONE);
            
            // Re-insert data starting from row 8
            $newRow = 8;
            foreach ($data as $rowData) {
                $col = 'A';
                foreach ($rowData as $cellValue) {
                    $sheet->setCellValue($col . $newRow, $cellValue);
                    $col++;
                }
                $newRow++;
            }
        }
    }

    public function title(): string
    {
        return $this->title;
    }
}
