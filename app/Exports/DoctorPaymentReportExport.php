<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class DoctorPaymentReportExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected $reportData;
    protected $summary;
    protected $filters;

    public function __construct($reportData, $summary, $filters)
    {
        $this->reportData = $reportData;
        $this->summary = $summary;
        $this->filters = $filters;
    }

    public function collection()
    {
        return collect($this->reportData);
    }

    public function headings(): array
    {
        $baseHeadings = [
            'Doctor Name',
            'Specialization',
            'Payment Count',
            'Basic Salary',
            'Deductions',
            'Holiday Pay',
            'Incentives',
            'Net Payment',
            'Average Payment',
        ];

        // Add date column based on report type
        if ($this->filters['report_type'] === 'daily') {
            array_unshift($baseHeadings, 'Date');
        } elseif ($this->filters['report_type'] === 'monthly') {
            array_unshift($baseHeadings, 'Month');
        } elseif ($this->filters['report_type'] === 'yearly') {
            array_unshift($baseHeadings, 'Year');
        }

        return $baseHeadings;
    }

    public function map($item): array
    {
        $baseData = [
            $item['doctor_name'],
            $item['doctor_specialization'],
            $item['payment_count'],
            number_format($item['incentives'], 2),
            number_format($item['net_payment'], 2),
            number_format($item['average_payment'], 2),
        ];

        // Add date column based on report type
        if ($this->filters['report_type'] === 'daily') {
            array_unshift($baseData, $item['date']);
        } elseif ($this->filters['report_type'] === 'monthly') {
            array_unshift($baseData, $item['month_name']);
        } elseif ($this->filters['report_type'] === 'yearly') {
            array_unshift($baseData, $item['year']);
        }

        return $baseData;
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold
            1 => ['font' => ['bold' => true]],
        ];
    }

    public function title(): string
    {
        return 'Doctor Payment Report - ' . ucfirst($this->filters['report_type']);
    }
}
