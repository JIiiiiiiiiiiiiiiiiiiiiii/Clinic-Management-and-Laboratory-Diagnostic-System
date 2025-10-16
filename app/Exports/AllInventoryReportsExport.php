<?php

namespace App\Exports;

use App\Models\InventoryReport;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AllInventoryReportsExport implements FromArray, WithHeadings, WithTitle, WithStyles
{
    protected $reports;

    public function __construct($reports)
    {
        $this->reports = $reports;
    }

    public function array(): array
    {
        $data = [];
        
        foreach ($this->reports as $report) {
            $data[] = [
                $report->report_name,
                $this->getReportTypeName($report->report_type),
                $report->period,
                $report->creator->name ?? 'Unknown',
                $report->created_at->format('Y-m-d H:i:s'),
                $report->status,
                $report->exported_at ? $report->exported_at->format('Y-m-d H:i:s') : 'Never',
                $report->export_format ?? 'N/A',
            ];
        }

        return $data;
    }

    public function headings(): array
    {
        return [
            'Report Name',
            'Report Type',
            'Period',
            'Created By',
            'Created At',
            'Status',
            'Exported At',
            'Export Format',
        ];
    }

    public function title(): string
    {
        return 'All Inventory Reports';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    private function getReportTypeName($type)
    {
        switch ($type) {
            case 'used_rejected':
                return 'Used/Rejected Supplies';
            case 'in_out_supplies':
                return 'In/Out Supplies';
            case 'stock_levels':
                return 'Stock Levels';
            case 'daily_consumption':
                return 'Daily Consumption';
            case 'usage_by_location':
                return 'Usage by Location';
            default:
                return 'Unknown Report';
        }
    }
}
