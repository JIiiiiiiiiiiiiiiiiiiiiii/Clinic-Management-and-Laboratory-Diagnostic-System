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

        // Calculate summary from transactions collection to ensure accuracy
        $totalRevenue = $this->transactions->sum('amount') ?? 0; // Final amount after discounts
        $totalTransactions = $this->transactions->count();
        $cashTotal = $this->transactions->where('payment_method', 'cash')->sum('amount') ?? 0;
        $hmoTotal = $this->transactions->where('payment_method', 'hmo')->sum('amount') ?? 0;
        $pendingAmount = $this->transactions->where('status', 'pending')->sum('amount') ?? 0;
        
        // Summary Sheet
        $summaryRows = [
            ['Metric', 'Value'],
            ['Report Type', ucfirst($this->reportType)],
            ['Filter', ucfirst($this->filter)],
            ['Date', $this->date],
            ['Total Revenue', 'PHP ' . number_format($totalRevenue, 2)],
            ['Total Transactions', $totalTransactions],
            ['Cash Total', 'PHP ' . number_format($cashTotal, 2)],
            ['HMO Total', 'PHP ' . number_format($hmoTotal, 2)],
            ['Pending Amount', 'PHP ' . number_format($pendingAmount, 2)],
        ];
        $sheets[] = new ArrayExport($summaryRows, [], 'Financial Summary', true);

        // Financial Transactions Sheet
        $transactionRows = [
            ['Transaction ID', 'Patient Name', 'Specialist Name', 'Final Amount', 'Original Amount', 'Discount Amount', 'Senior Discount', 'Payment Method', 'Status', 'Date']
        ];
        foreach ($this->transactions as $transaction) {
            // Calculate original amount: final amount + all discounts
            $finalAmount = $transaction->amount ?? 0; // Final amount after discounts
            $discountAmount = $transaction->discount_amount ?? 0;
            $seniorDiscountAmount = $transaction->senior_discount_amount ?? 0;
            $originalAmount = $finalAmount + $discountAmount + $seniorDiscountAmount; // Original amount before discounts
            
            // Get patient name
            $patientName = 'N/A';
            if ($transaction->patient) {
                $firstName = $transaction->patient->first_name ?? '';
                $middleName = $transaction->patient->middle_name ?? '';
                $lastName = $transaction->patient->last_name ?? '';
                $patientName = trim(implode(' ', array_filter([$firstName, $middleName, $lastName]))) ?: 'N/A';
            }
            
            // Get specialist name - use same logic as billing transactions
            // Default to 'Paul Henry N. Parrotina, MD.' to match billing transactions behavior
            $specialistName = 'Paul Henry N. Parrotina, MD.';
            
            // Try from transaction's doctor relationship
            if ($transaction->doctor) {
                $specialistName = $transaction->doctor->name ?? 'Paul Henry N. Parrotina, MD.';
            }
            
            // Try from appointment relationship
            if (($specialistName === 'Paul Henry N. Parrotina, MD.' || empty($specialistName)) && $transaction->appointment && $transaction->appointment->specialist) {
                $specialistName = $transaction->appointment->specialist->name ?? 'Paul Henry N. Parrotina, MD.';
            }
            
            // Try from appointment links if still not found
            // Always query appointment links directly to ensure we check even if relationship is empty
            if (($specialistName === 'Paul Henry N. Parrotina, MD.' || empty($specialistName))) {
                $appointmentLinks = \App\Models\AppointmentBillingLink::where('billing_transaction_id', $transaction->id)->get();
                if ($appointmentLinks->isNotEmpty()) {
                    foreach ($appointmentLinks as $link) {
                        if ($link->appointment_id) {
                            $appointment = \App\Models\Appointment::find($link->appointment_id);
                            if ($appointment && $appointment->specialist_id) {
                                $appointmentSpecialist = \App\Models\Specialist::where('specialist_id', $appointment->specialist_id)->first();
                                if ($appointmentSpecialist && $appointmentSpecialist->name) {
                                    $specialistName = $appointmentSpecialist->name;
                                    break;
                                }
                            }
                            
                            // Try visit relationships
                            if (($specialistName === 'Paul Henry N. Parrotina, MD.' || empty($specialistName))) {
                                $visit = \App\Models\Visit::where('appointment_id', $link->appointment_id)->first();
                                if ($visit) {
                                    // Try doctor_id, then attending_staff_id, then nurse_id, then medtech_id
                                    $visitSpecialistId = $visit->doctor_id ?? $visit->attending_staff_id ?? $visit->nurse_id ?? $visit->medtech_id ?? null;
                                    if ($visitSpecialistId) {
                                        $visitSpecialist = \App\Models\Specialist::where('specialist_id', $visitSpecialistId)->first();
                                        if ($visitSpecialist && $visitSpecialist->name) {
                                            $specialistName = $visitSpecialist->name;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // Try from specialist_id if still not found
            if (($specialistName === 'Paul Henry N. Parrotina, MD.' || empty($specialistName)) && $transaction->specialist_id) {
                $specialist = \App\Models\Specialist::where('specialist_id', $transaction->specialist_id)->first();
                if ($specialist && $specialist->name) {
                    $specialistName = $specialist->name;
                }
            }
            
            // Ensure we have a default value
            if (empty($specialistName)) {
                $specialistName = 'Paul Henry N. Parrotina, MD.';
            }
            
            $transactionRows[] = [
                $transaction->transaction_id,
                $patientName,
                $specialistName,
                'PHP ' . number_format($finalAmount, 2),
                'PHP ' . number_format($originalAmount, 2),
                'PHP ' . number_format($discountAmount, 2),
                'PHP ' . number_format($seniorDiscountAmount, 2),
                ucfirst($transaction->payment_method ?? 'cash'),
                ucfirst($transaction->status ?? 'pending'),
                $transaction->transaction_date ? \Carbon\Carbon::parse($transaction->transaction_date)->format('M d, Y') : 'N/A',
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
