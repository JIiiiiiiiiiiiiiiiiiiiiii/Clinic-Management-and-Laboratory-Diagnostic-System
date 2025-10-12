<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;

class LaboratoryReportExport extends BaseExport implements FromArray, WithHeadings, WithEvents, WithTitle
{
    protected $data;
    protected $filter;
    protected $date;

    public function __construct($data, $filter, $date)
    {
        parent::__construct('Laboratory Report');
        $this->data = $data;
        $this->filter = $filter;
        $this->date = $date;
    }

    public function array(): array
    {
        $exportData = [];
        
        // Add summary statistics in table format
        $exportData[] = ['LABORATORY REPORT SUMMARY'];
        $exportData[] = ['Metric', 'Value', 'Percentage'];
        $exportData[] = ['Total Orders', $this->data['total_orders'], '100%'];
        $exportData[] = ['Pending Orders', $this->data['pending_orders'], 
            $this->data['total_orders'] > 0 ? round(($this->data['pending_orders'] / $this->data['total_orders']) * 100, 1) . '%' : '0%'];
        $exportData[] = ['Completed Orders', $this->data['completed_orders'], 
            $this->data['total_orders'] > 0 ? round(($this->data['completed_orders'] / $this->data['total_orders']) * 100, 1) . '%' : '0%'];
        $exportData[] = ['Completion Rate', $this->data['completion_rate'] . '%', '-'];
        $exportData[] = []; // Empty row
        
        // Add test summary in table format
        if (!empty($this->data['test_summary'])) {
            $exportData[] = ['TEST SUMMARY'];
            $exportData[] = ['Test Type', 'Count', 'Percentage'];
            foreach ($this->data['test_summary'] as $testType => $count) {
                $percentage = $this->data['total_orders'] > 0 ? round(($count / $this->data['total_orders']) * 100, 1) . '%' : '0%';
                $exportData[] = [$testType, $count, $percentage];
            }
            $exportData[] = []; // Empty row
        }
        
        // Add order details in table format
        if (!empty($this->data['order_details'])) {
            $exportData[] = ['ORDER DETAILS'];
            $exportData[] = ['Order #', 'Patient Name', 'Tests Ordered', 'Status', 'Ordered At', 'Ordered By'];
            
            foreach ($this->data['order_details'] as $order) {
                $exportData[] = [
                    '#' . $order['order_id'],
                    $order['patient_name'],
                    $order['tests_ordered'],
                    ucfirst($order['status']),
                    $order['ordered_at'],
                    $order['ordered_by']
                ];
            }
        }
        
        return $exportData;
    }

    public function headings(): array
    {
        return [
            'LABORATORY REPORT SUMMARY',
            'Period: ' . $this->data['period'],
            'Total Orders: ' . $this->data['total_orders'],
            'Pending Orders: ' . $this->data['pending_orders'],
            'Completed Orders: ' . $this->data['completed_orders'],
            'Completion Rate: ' . $this->data['completion_rate'] . '%'
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $this->addHospitalHeader($event);
                $this->styleReportData($event);
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
        $sheet->setCellValue('B2', 'San Isidro City of Cabuyao Laguna');
        $sheet->setCellValue('A3', 'Report Type:');
        $sheet->setCellValue('B3', 'Laboratory Report - ' . ucfirst($this->filter));
        $sheet->setCellValue('A4', 'Period:');
        $sheet->setCellValue('B4', $this->data['period']);
        $sheet->setCellValue('A5', 'Date Range:');
        $sheet->setCellValue('B5', $this->data['start_date'] . ' to ' . $this->data['end_date']);
        $sheet->setCellValue('A6', 'METRIC');
        $sheet->setCellValue('B6', 'email add: info@stjameshospital.com.ph');

        // Style the header
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
    }

    protected function styleReportData(AfterSheet $event)
    {
        $sheet = $event->sheet->getDelegate();
        $lastRow = $sheet->getHighestRow();
        
        // Style the data area (rows 8 onwards)
        if ($lastRow >= 8) {
            // Add borders to data rows
            $sheet->getStyle('A8:F' . $lastRow)->getBorders()->getAllBorders()
                ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);
            
            // Style headers
            $sheet->getStyle('A8:F8')->getFont()->setBold(true);
            $sheet->getStyle('A8:F8')->getFill()
                ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                ->getStartColor()->setRGB('E8F5E8');
        }
    }

    public function title(): string
    {
        return 'Laboratory Report - ' . ucfirst($this->filter);
    }
}
