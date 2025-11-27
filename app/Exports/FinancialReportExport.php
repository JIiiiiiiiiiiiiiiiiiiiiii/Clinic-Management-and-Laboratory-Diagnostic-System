<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use Illuminate\Support\Collection;

class FinancialReportExport implements WithMultipleSheets, WithEvents
{
    protected array $data;
    protected Collection $transactions;
    protected string $filter;
    protected string $date;
    protected string $reportType;

    public function __construct(array $data, Collection $transactions, string $filter, string $date, string $reportType)
    {
        $this->data = $data;
        $this->transactions = $transactions;
        $this->filter = $filter;
        $this->date = $date;
        $this->reportType = $reportType;
    }

    /**
     * @return array
     */
    public function sheets(): array
    {
        $sheets = [];

        // Summary Sheet
        $summaryRows = [
            ['Metric', 'Value'],
            ['Report Type', ucfirst($this->reportType)],
            ['Filter', ucfirst($this->filter)],
            ['Date', $this->date],
            ['Total Revenue', '₱' . number_format($this->data['summary']['total_revenue'] ?? 0, 2)],
            ['Total Transactions', $this->data['summary']['total_transactions'] ?? 0],
            ['Cash Total', '₱' . number_format($this->data['summary']['cash_total'] ?? 0, 2)],
            ['HMO Total', '₱' . number_format($this->data['summary']['hmo_total'] ?? 0, 2)],
            ['Pending Amount', '₱' . number_format($this->data['summary']['pending_amount'] ?? 0, 2)],
        ];
        $sheets[] = new ArrayExport($summaryRows, [], 'Financial Summary', true);

        // Financial Transactions Sheet
        $transactionRows = [
            ['Transaction ID', 'Patient Name', 'Specialist Name', 'Final Amount', 'Original Amount', 'Discount Amount', 'Senior Discount', 'Payment Method', 'Status', 'Date']
        ];
        foreach ($this->transactions as $transaction) {
            $transactionRows[] = [
                $transaction->transaction_id,
                $transaction->patient->name ?? 'N/A',
                $transaction->doctor->name ?? ($transaction->appointment->specialist->name ?? 'N/A'),
                '₱' . number_format($transaction->total_amount, 2),
                '₱' . number_format($transaction->original_amount ?? $transaction->total_amount, 2),
                '₱' . number_format($transaction->discount_amount ?? 0, 2),
                '₱' . number_format($transaction->senior_discount_amount ?? 0, 2),
                ucfirst($transaction->payment_method),
                ucfirst($transaction->status),
                \Carbon\Carbon::parse($transaction->transaction_date)->format('M d, Y'),
            ];
        }
        $sheets[] = new ArrayExport($transactionRows, [], 'Financial Transactions', true);

        return $sheets;
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
        $sheet->setCellValue('B2', 'San Isidro City of Cabuyao Laguna');
        $sheet->setCellValue('A3', 'Report Type:');
        $sheet->setCellValue('B3', 'Financial Report - ' . ucfirst($this->reportType));
        $sheet->setCellValue('A4', 'Filter:');
        $sheet->setCellValue('B4', ucfirst($this->filter));
        $sheet->setCellValue('A5', 'Date:');
        $sheet->setCellValue('B5', $this->date);
        $sheet->setCellValue('A6', 'Contact:');
        $sheet->setCellValue('B6', 'Tel. Nos. 02.85844533; 049.5341254; 049.5020058; Fax No.: local 307');

        // Style the header
        $sheet->getStyle('B1')->getFont()->setBold(true)->setSize(16);
        $sheet->getStyle('B1')->getFont()->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('2d5a27'));
        $sheet->setCellValue('C1', 'PASYENTE MUNA');
        $sheet->getStyle('C1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('C1')->getFont()->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('2d5a27'));
        $sheet->getStyle('B3')->getFont()->setItalic(true)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('1e40af'));
        $sheet->getStyle('B4')->getFont()->setBold(true)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('2d5a27'));
        
        // Style the labels in column A
        $sheet->getStyle('A2:A6')->getFont()->setBold(true);
        $sheet->getStyle('A2:A6')->getFont()->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('333333'));

        // Add border around the header area
        $sheet->getStyle('A1:C6')->getBorders()->getAllBorders()->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);
        $sheet->getStyle('A1:C6')->getBorders()->getBottom()->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM);
        
        // Add background color to header
        $sheet->getStyle('A1:C6')->getFill()
            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
            ->getStartColor()->setRGB('F8F9FA');
        
        // Set row height for header
        $sheet->getRowDimension(1)->setRowHeight(25);
        $sheet->getRowDimension(2)->setRowHeight(20);
        $sheet->getRowDimension(3)->setRowHeight(20);
        $sheet->getRowDimension(4)->setRowHeight(20);
        $sheet->getRowDimension(5)->setRowHeight(20);
        $sheet->getRowDimension(6)->setRowHeight(20);
        
        // Merge cells for better layout
        $sheet->mergeCells('B1:C1');
        $sheet->mergeCells('B2:C2');
        $sheet->mergeCells('B3:C3');
        $sheet->mergeCells('B4:C4');
        $sheet->mergeCells('B5:C5');
        $sheet->mergeCells('B6:C6');
    }
}
