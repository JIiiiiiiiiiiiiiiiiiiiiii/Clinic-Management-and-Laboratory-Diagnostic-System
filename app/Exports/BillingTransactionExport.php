<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use Illuminate\Support\Collection;
use App\Models\BillingTransaction;

class BillingTransactionExport implements WithMultipleSheets, WithEvents
{
    protected Collection $transactions;
    protected array $filters;
    protected string $format;

    public function __construct(Collection $transactions, array $filters = [], string $format = 'excel')
    {
        $this->transactions = $transactions;
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
        $sheets[] = new ArrayExport($summaryData, 'Billing Summary', true);

        // Transactions Sheet
        $transactionData = $this->getTransactionData();
        $sheets[] = new ArrayExport($transactionData, 'Billing Transactions', true);

        return $sheets;
    }

    protected function getSummaryData(): array
    {
        $totalTransactions = $this->transactions->count();
        $totalAmount = $this->transactions->sum('total_amount');
        $paidAmount = $this->transactions->where('status', 'paid')->sum('total_amount');
        $pendingAmount = $this->transactions->where('status', 'pending')->sum('total_amount');
        $cancelledAmount = $this->transactions->where('status', 'cancelled')->sum('total_amount');
        
        $cashAmount = $this->transactions->where('payment_method', 'cash')->sum('total_amount');
        $hmoAmount = $this->transactions->where('payment_method', 'hmo')->sum('total_amount');
        $cardAmount = $this->transactions->where('payment_method', 'card')->sum('total_amount');
        $bankTransferAmount = $this->transactions->where('payment_method', 'bank_transfer')->sum('total_amount');
        
        $seniorCitizenCount = $this->transactions->where('is_senior_citizen', true)->count();
        $seniorDiscountTotal = $this->transactions->sum('senior_discount_amount');

        return [
            ['Metric', 'Value'],
            ['Report Generated', now()->format('M d, Y H:i:s')],
            ['Date Range', $this->filters['date_from'] ?? 'All Time' . ' to ' . ($this->filters['date_to'] ?? 'Present')],
            ['Status Filter', $this->filters['status'] ?? 'All'],
            ['Payment Method Filter', $this->filters['payment_method'] ?? 'All'],
            ['Doctor Filter', $this->filters['doctor_id'] ?? 'All'],
            ['', ''],
            ['TOTAL TRANSACTIONS', $totalTransactions],
            ['TOTAL AMOUNT', 'PHP ' . number_format($totalAmount, 2)],
            ['PAID AMOUNT', 'PHP ' . number_format($paidAmount, 2)],
            ['PENDING AMOUNT', 'PHP ' . number_format($pendingAmount, 2)],
            ['CANCELLED AMOUNT', 'PHP ' . number_format($cancelledAmount, 2)],
            ['', ''],
            ['CASH PAYMENTS', 'PHP ' . number_format($cashAmount, 2)],
            ['HMO PAYMENTS', 'PHP ' . number_format($hmoAmount, 2)],
            ['CARD PAYMENTS', 'PHP ' . number_format($cardAmount, 2)],
            ['BANK TRANSFER', 'PHP ' . number_format($bankTransferAmount, 2)],
            ['', ''],
            ['SENIOR CITIZEN TRANSACTIONS', $seniorCitizenCount],
            ['TOTAL SENIOR DISCOUNT', 'PHP ' . number_format($seniorDiscountTotal, 2)],
        ];
    }

    protected function getTransactionData(): array
    {
        $data = [
            [
                'Transaction ID',
                'Patient Name',
                'Patient ID',
                'Doctor Name',
                'Appointment Type',
                'Total Amount',
                'Final Amount',
                'Discount Amount',
                'Senior Discount',
                'Payment Method',
                'HMO Provider',
                'HMO Reference',
                'Status',
                'Transaction Date',
                'Created At',
                'Notes'
            ]
        ];

        foreach ($this->transactions as $transaction) {
            $data[] = [
                $transaction->transaction_id,
                $transaction->patient ? $transaction->patient->first_name . ' ' . $transaction->patient->last_name : 'N/A',
                $transaction->patient_id,
                $transaction->doctor ? $transaction->doctor->name : 'N/A',
                $transaction->appointment ? ucfirst($transaction->appointment->appointment_type) : 'Manual Transaction',
                'PHP ' . number_format($transaction->total_amount, 2),
                'PHP ' . number_format($transaction->amount ?? $transaction->total_amount, 2),
                'PHP ' . number_format($transaction->discount_amount ?? 0, 2),
                'PHP ' . number_format($transaction->senior_discount_amount ?? 0, 2),
                ucfirst($transaction->payment_method ?? 'N/A'),
                $transaction->hmo_provider ?? 'N/A',
                $transaction->hmo_reference_number ?? 'N/A',
                ucfirst($transaction->status),
                $transaction->transaction_date ? $transaction->transaction_date->format('M d, Y H:i') : 'N/A',
                $transaction->created_at ? $transaction->created_at->format('M d, Y H:i') : 'N/A',
                $transaction->notes ?? ''
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
        $sheet->setCellValue('B3', 'Billing Transactions Report');
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
