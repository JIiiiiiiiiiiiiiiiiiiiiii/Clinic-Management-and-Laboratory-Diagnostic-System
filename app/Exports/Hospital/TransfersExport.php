<?php

namespace App\Exports\Hospital;

use App\Models\PatientTransfer;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TransfersExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths
{
    protected $dateRange;

    public function __construct($dateRange)
    {
        $this->dateRange = $dateRange;
    }

    public function collection()
    {
        return PatientTransfer::with(['patient', 'fromClinic', 'toClinic'])
            ->whereBetween('transfer_date', [$this->dateRange['start'], $this->dateRange['end']])
            ->get();
    }

    public function headings(): array
    {
        return [
            'Transfer ID',
            'Patient Name',
            'Patient Code',
            'From Clinic',
            'To Clinic',
            'Transfer Date',
            'Status',
            'Reason',
            'Created At'
        ];
    }

    public function map($transfer): array
    {
        return [
            $transfer->id,
            $transfer->patient ? $transfer->patient->first_name . ' ' . $transfer->patient->last_name : 'N/A',
            $transfer->patient?->patient_code ?? 'N/A',
            $transfer->fromClinic?->name ?? 'Hospital',
            $transfer->toClinic?->name ?? 'Hospital',
            $transfer->transfer_date?->format('Y-m-d H:i:s'),
            $transfer->status,
            $transfer->reason,
            $transfer->created_at->format('Y-m-d H:i:s')
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
            'D' => 20,
            'E' => 20,
            'F' => 20,
            'G' => 15,
            'H' => 30,
            'I' => 20,
        ];
    }
}
