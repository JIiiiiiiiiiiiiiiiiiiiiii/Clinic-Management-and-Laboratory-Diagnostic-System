<?php

namespace App\Exports\Hospital;

use App\Models\LabOrder;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LaboratoryExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths
{
    protected $dateRange;

    public function __construct($dateRange)
    {
        $this->dateRange = $dateRange;
    }

    public function collection()
    {
        return LabOrder::with(['patient', 'labResults'])
            ->whereBetween('created_at', [$this->dateRange['start'], $this->dateRange['end']])
            ->get();
    }

    public function headings(): array
    {
        return [
            'Lab Order ID',
            'Patient Name',
            'Patient Code',
            'Test Type',
            'Status',
            'Order Date',
            'Results Count',
            'Notes',
            'Created At'
        ];
    }

    public function map($labOrder): array
    {
        return [
            $labOrder->id,
            $labOrder->patient ? $labOrder->patient->first_name . ' ' . $labOrder->patient->last_name : 'N/A',
            $labOrder->patient?->patient_code ?? 'N/A',
            $labOrder->test_type,
            $labOrder->status,
            $labOrder->order_date?->format('Y-m-d H:i:s'),
            $labOrder->labResults->count(),
            $labOrder->notes,
            $labOrder->created_at->format('Y-m-d H:i:s')
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
            'E' => 15,
            'F' => 20,
            'G' => 15,
            'H' => 30,
            'I' => 20,
        ];
    }
}
