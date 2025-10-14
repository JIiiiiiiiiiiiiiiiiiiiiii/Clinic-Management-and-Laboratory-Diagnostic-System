<?php

namespace App\Exports;

use App\Models\InventoryReport;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class InventoryReportExport implements FromArray, WithHeadings, WithTitle, WithStyles
{
    protected $report;
    protected $title;
    protected $data;

    public function __construct($reportOrTitle, $data = null)
    {
        if (is_string($reportOrTitle)) {
            // New format: title and data
            $this->title = $reportOrTitle;
            $this->data = $data;
        } else {
            // Old format: InventoryReport object
            $this->report = $reportOrTitle;
        }
    }

    public function array(): array
    {
        if ($this->report) {
            // Old format: using saved report
            $data = $this->report->detailed_data;
            
            switch ($this->report->report_type) {
                case 'used_rejected':
                    return $this->formatUsedRejectedData($data);
                case 'in_out_supplies':
                    return $this->formatInOutSuppliesData($data);
                case 'stock_levels':
                    return $this->formatStockLevelsData($data);
                case 'daily_consumption':
                    return $this->formatDailyConsumptionData($data);
                case 'usage_by_location':
                    return $this->formatUsageByLocationData($data);
                default:
                    return [];
            }
        } else {
            // New format: using direct data
            if (strpos($this->title, 'Used/Rejected') !== false) {
                return $this->formatUsedRejectedData($this->data);
            } elseif (strpos($this->title, 'In/Out') !== false) {
                return $this->formatInOutSuppliesData($this->data);
            } elseif (strpos($this->title, 'Stock Levels') !== false) {
                return $this->formatStockLevelsData($this->data);
            } elseif (strpos($this->title, 'Daily Consumption') !== false) {
                return $this->formatDailyConsumptionData($this->data);
            } elseif (strpos($this->title, 'Usage by Location') !== false) {
                return $this->formatUsageByLocationData($this->data);
            }
            return [];
        }
    }

    public function headings(): array
    {
        if ($this->report) {
            // Old format: using saved report
            switch ($this->report->report_type) {
                case 'used_rejected':
                    return ['Item Name', 'Category', 'Department', 'Current Stock', 'Consumed', 'Rejected', 'Status'];
                case 'in_out_supplies':
                    return ['Date', 'Item Name', 'Movement Type', 'Quantity', 'Handled By', 'Remarks'];
                case 'stock_levels':
                    return ['Item Name', 'Category', 'Department', 'Current Stock', 'Unit Cost', 'Total Value', 'Status'];
                case 'daily_consumption':
                    return ['Date', 'Total Consumed', 'Top Item', 'Top Category'];
                case 'usage_by_location':
                    return ['Location', 'Total Used', 'Percentage'];
                default:
                    return [];
            }
        } else {
            // New format: using direct data
            if (strpos($this->title, 'Used/Rejected') !== false) {
                return ['Item Name', 'Category', 'Department', 'Current Stock', 'Consumed', 'Rejected', 'Status'];
            } elseif (strpos($this->title, 'In/Out') !== false) {
                return ['Date', 'Item Name', 'Movement Type', 'Quantity', 'Handled By', 'Remarks'];
            } elseif (strpos($this->title, 'Stock Levels') !== false) {
                return ['Item Name', 'Category', 'Department', 'Current Stock', 'Unit Cost', 'Total Value', 'Status'];
            } elseif (strpos($this->title, 'Daily Consumption') !== false) {
                return ['Date', 'Total Consumed', 'Top Item', 'Top Category'];
            } elseif (strpos($this->title, 'Usage by Location') !== false) {
                return ['Location', 'Total Used', 'Percentage'];
            }
            return [];
        }
    }

    public function title(): string
    {
        if ($this->report) {
            return $this->report->report_name;
        } else {
            return $this->title;
        }
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    private function formatUsedRejectedData($data)
    {
        $formatted = [];
        
        if (isset($data['top_consumed_items'])) {
            foreach ($data['top_consumed_items'] as $item) {
                $formatted[] = [
                    $item['item_name'] ?? '',
                    $item['category'] ?? '',
                    $item['assigned_to'] ?? '',
                    $item['stock'] ?? 0,
                    $item['consumed'] ?? 0,
                    $item['rejected'] ?? 0,
                    $item['status'] ?? '',
                ];
            }
        }

        return $formatted;
    }

    private function formatInOutSuppliesData($data)
    {
        $formatted = [];
        
        if (isset($data['movements'])) {
            foreach ($data['movements'] as $movement) {
                $formatted[] = [
                    $movement['created_at'] ?? '',
                    $movement['inventory_item']['item_name'] ?? '',
                    $movement['movement_type'] ?? '',
                    $movement['quantity'] ?? 0,
                    $movement['created_by'] ?? '',
                    $movement['remarks'] ?? '',
                ];
            }
        }

        return $formatted;
    }

    private function formatStockLevelsData($data)
    {
        $formatted = [];
        
        if (isset($data['all_items'])) {
            foreach ($data['all_items'] as $item) {
                $formatted[] = [
                    $item['item_name'] ?? '',
                    $item['category'] ?? '',
                    $item['assigned_to'] ?? '',
                    $item['stock'] ?? 0,
                    $item['unit_cost'] ?? 0,
                    ($item['stock'] ?? 0) * ($item['unit_cost'] ?? 0),
                    $item['status'] ?? '',
                ];
            }
        }

        return $formatted;
    }

    private function formatDailyConsumptionData($data)
    {
        $formatted = [];
        
        if (isset($data['daily_data'])) {
            foreach ($data['daily_data'] as $daily) {
                $formatted[] = [
                    $daily['date'] ?? '',
                    $daily['total_consumed'] ?? 0,
                    'N/A', // Top item would need additional processing
                    'N/A', // Top category would need additional processing
                ];
            }
        }

        return $formatted;
    }

    private function formatUsageByLocationData($data)
    {
        $formatted = [];
        
        if (isset($data['location_usage'])) {
            $total = collect($data['location_usage'])->sum('total_used');
            
            foreach ($data['location_usage'] as $location) {
                $percentage = $total > 0 ? round(($location['total_used'] / $total) * 100, 2) : 0;
                $formatted[] = [
                    $location['location'] ?? '',
                    $location['total_used'] ?? 0,
                    $percentage . '%',
                ];
            }
        }

        return $formatted;
    }
}