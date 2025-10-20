<?php

namespace App\Exports\Hospital;

use App\Models\BillingTransaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TransactionsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths
{
    protected $dateRange;

    public function __construct($dateRange)
    {
        $this->dateRange = $dateRange;
    }

    public function collection()
    {
        return BillingTransaction::with(['patient', 'appointment'])
            ->whereBetween('created_at', [$this->dateRange['start'], $this->dateRange['end']])
            ->get();
    }

    public function headings(): array
    {
        return [
            'Transaction ID',
            'Patient Name',
            'Patient Code',
            'Appointment ID',
            'Amount',
            'Payment Type',
            'Status',
            'Transaction Date',
            'Notes',
            'Created At'
        ];
    }

    public function map($transaction): array
    {
        return [
            $transaction->id,
            $transaction->patient ? $transaction->patient->first_name . ' ' . $transaction->patient->last_name : 'N/A',
            $transaction->patient?->patient_code ?? 'N/A',
            $transaction->appointment_id,
            number_format($transaction->amount, 2),
            $transaction->payment_type,
            $transaction->status,
            $transaction->transaction_date?->format('Y-m-d H:i:s'),
            $transaction->notes,
            $transaction->created_at->format('Y-m-d H:i:s')
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
            'D' => 15,
            'E' => 15,
            'F' => 15,
            'G' => 15,
            'H' => 20,
            'I' => 30,
            'J' => 20,
        ];
    }
}
