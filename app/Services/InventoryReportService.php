<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use App\Models\InventoryReport;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class InventoryReportService
{
    public function generateUsedRejectedReport($filters = [])
    {
        $dateRange = $this->getDateRange($filters);
        
        // Get all inventory items (not filtered by date range for this report)
        // This report shows current consumed/rejected totals, not movements within a date range
        $items = InventoryItem::with('movements')->get();

        // Calculate summary data
        $summary = [
            'total_items' => $items->count(),
            'total_consumed' => $items->sum('consumed'),
            'total_rejected' => $items->sum('rejected'),
            'low_stock_items' => $items->where('status', 'Low Stock')->count(),
            'out_of_stock_items' => $items->where('status', 'Out of Stock')->count(),
        ];

        // Department breakdown
        $departmentStats = [
            'doctor_nurse' => [
                'total_items' => $items->where('assigned_to', 'Doctor & Nurse')->count(),
                'total_consumed' => $items->where('assigned_to', 'Doctor & Nurse')->sum('consumed'),
                'total_rejected' => $items->where('assigned_to', 'Doctor & Nurse')->sum('rejected'),
                'low_stock' => $items->where('assigned_to', 'Doctor & Nurse')->where('status', 'Low Stock')->count(),
                'out_of_stock' => $items->where('assigned_to', 'Doctor & Nurse')->where('status', 'Out of Stock')->count(),
            ],
            'med_tech' => [
                'total_items' => $items->where('assigned_to', 'Med Tech')->count(),
                'total_consumed' => $items->where('assigned_to', 'Med Tech')->sum('consumed'),
                'total_rejected' => $items->where('assigned_to', 'Med Tech')->sum('rejected'),
                'low_stock' => $items->where('assigned_to', 'Med Tech')->where('status', 'Low Stock')->count(),
                'out_of_stock' => $items->where('assigned_to', 'Med Tech')->where('status', 'Out of Stock')->count(),
            ],
        ];

        // Top consumed items
        $topConsumed = $items->sortByDesc('consumed')->take(10)->values();

        // Top rejected items
        $topRejected = $items->sortByDesc('rejected')->take(10)->values();

        // Consumption trends by month
        $consumptionTrends = $this->getConsumptionTrends($dateRange);

        return [
            'summary' => $summary,
            'department_stats' => $departmentStats,
            'top_consumed_items' => $topConsumed,
            'top_rejected_items' => $topRejected,
            'consumption_trends' => $consumptionTrends,
            'date_range' => $dateRange,
        ];
    }

    public function generateInOutSuppliesReport($filters = [])
    {
        $dateRange = $this->getDateRange($filters);
        
        // Get movements within date range
        $movements = InventoryMovement::with('inventoryItem')
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate summary
        $summary = [
            'total_movements' => $movements->count(),
            'in_movements' => $movements->where('movement_type', 'IN')->count(),
            'out_movements' => $movements->where('movement_type', 'OUT')->count(),
            'total_in_quantity' => $movements->where('movement_type', 'IN')->sum('quantity'),
            'total_out_quantity' => $movements->where('movement_type', 'OUT')->sum('quantity'),
        ];

        // Department breakdown
        $departmentStats = [
            'doctor_nurse' => [
                'in_movements' => $movements->filter(function($m) {
                    return $m->movement_type === 'IN' && $m->inventoryItem && $m->inventoryItem->assigned_to === 'Doctor & Nurse';
                })->count(),
                'out_movements' => $movements->filter(function($m) {
                    return $m->movement_type === 'OUT' && $m->inventoryItem && $m->inventoryItem->assigned_to === 'Doctor & Nurse';
                })->count(),
            ],
            'med_tech' => [
                'in_movements' => $movements->filter(function($m) {
                    return $m->movement_type === 'IN' && $m->inventoryItem && $m->inventoryItem->assigned_to === 'Med Tech';
                })->count(),
                'out_movements' => $movements->filter(function($m) {
                    return $m->movement_type === 'OUT' && $m->inventoryItem && $m->inventoryItem->assigned_to === 'Med Tech';
                })->count(),
            ],
        ];

        // Movement trends
        $movementTrends = $this->getMovementTrends($dateRange);

        return [
            'summary' => $summary,
            'department_stats' => $departmentStats,
            'movements' => $movements,
            'movement_trends' => $movementTrends,
            'date_range' => $dateRange,
        ];
    }


    public function saveReport($reportType, $data, $filters, $userId)
    {
        $reportName = $this->generateReportName($reportType, $filters);
        
        return InventoryReport::create([
            'report_name' => $reportName,
            'report_type' => $reportType,
            'period' => $filters['period'] ?? 'custom',
            'start_date' => $filters['start_date'] ?? null,
            'end_date' => $filters['end_date'] ?? null,
            'filters' => $filters,
            'summary_data' => $data['summary'] ?? null,
            'detailed_data' => $data,
            'created_by' => $userId,
        ]);
    }

    private function getDateRange($filters)
    {
        $period = $filters['period'] ?? 'monthly';
        $now = Carbon::now();

        switch ($period) {
            case 'daily':
                return [
                    'start' => $now->copy()->startOfDay(),
                    'end' => $now->copy()->endOfDay(),
                    'label' => 'Today'
                ];
            case 'weekly':
                return [
                    'start' => $now->copy()->startOfWeek(),
                    'end' => $now->copy()->endOfWeek(),
                    'label' => 'This Week'
                ];
            case 'monthly':
                return [
                    'start' => $now->copy()->startOfMonth(),
                    'end' => $now->copy()->endOfMonth(),
                    'label' => 'This Month'
                ];
            case 'yearly':
                return [
                    'start' => $now->copy()->startOfYear(),
                    'end' => $now->copy()->endOfYear(),
                    'label' => 'This Year'
                ];
            case 'custom':
                return [
                    'start' => $filters['start_date'] ? Carbon::parse($filters['start_date'])->startOfDay() : null,
                    'end' => $filters['end_date'] ? Carbon::parse($filters['end_date'])->endOfDay() : null,
                    'label' => 'Custom Range'
                ];
            default:
                return [
                    'start' => $now->copy()->startOfMonth(),
                    'end' => $now->copy()->endOfMonth(),
                    'label' => 'This Month'
                ];
        }
    }

    private function getConsumptionTrends($dateRange)
    {
        return DB::table('inventory_movements')
            ->where('movement_type', 'OUT')
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(quantity) as total_consumed')
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    private function getMovementTrends($dateRange)
    {
        return DB::table('inventory_movements')
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m-%d") as date, movement_type, SUM(quantity) as total_quantity')
            ->groupBy('date', 'movement_type')
            ->orderBy('date')
            ->get()
            ->groupBy('date');
    }

    private function generateReportName($reportType, $filters)
    {
        $typeNames = [
            'used_rejected' => 'Used/Rejected Supplies',
            'in_out_supplies' => 'In/Out Supplies',
            'stock_levels' => 'Stock Levels',
            'daily_consumption' => 'Daily Consumption',
            'usage_by_location' => 'Usage by Location',
            'supply_items_by_department' => 'Supply Items by Department',
        ];

        $period = $filters['period'] ?? 'custom';
        $date = Carbon::now()->format('Y-m-d');

        return $typeNames[$reportType] . " - {$period} - {$date}";
    }

    public function generateSupplyItemsByDepartmentReport($filters = [])
    {
        $dateRange = $this->getDateRange($filters);
        
        // Get all inventory items
        $items = InventoryItem::with('movements')
            ->when(isset($filters['department']) && $filters['department'] !== 'all', function($query) use ($filters) {
                $query->where('assigned_to', $filters['department']);
            })
            ->get();

        // Calculate summary data
        $summary = [
            'total_items' => $items->count(),
            'total_departments' => 2,
            'low_stock_items' => $items->where('status', 'Low Stock')->count(),
            'out_of_stock_items' => $items->where('status', 'Out of Stock')->count(),
            'total_consumed' => $items->sum('consumed'),
            'total_rejected' => $items->sum('rejected'),
        ];

        // Department breakdown
        $departmentStats = [
            'doctor_nurse' => [
                'total_items' => $items->where('assigned_to', 'Doctor & Nurse')->count(),
                'total_consumed' => $items->where('assigned_to', 'Doctor & Nurse')->sum('consumed'),
                'total_rejected' => $items->where('assigned_to', 'Doctor & Nurse')->sum('rejected'),
                'low_stock' => $items->where('assigned_to', 'Doctor & Nurse')->where('status', 'Low Stock')->count(),
                'out_of_stock' => $items->where('assigned_to', 'Doctor & Nurse')->where('status', 'Out of Stock')->count(),
                'items' => $items->where('assigned_to', 'Doctor & Nurse')->map(function($item) {
                    return [
                        'item_name' => $item->item_name,
                        'category' => $item->category,
                        'assigned_to' => $item->assigned_to,
                        'stock' => $item->stock,
                        'consumed' => $item->consumed,
                        'rejected' => $item->rejected,
                        'status' => $item->status,
                    ];
                })->values()->toArray(),
            ],
            'med_tech' => [
                'total_items' => $items->where('assigned_to', 'Med Tech')->count(),
                'total_consumed' => $items->where('assigned_to', 'Med Tech')->sum('consumed'),
                'total_rejected' => $items->where('assigned_to', 'Med Tech')->sum('rejected'),
                'low_stock' => $items->where('assigned_to', 'Med Tech')->where('status', 'Low Stock')->count(),
                'out_of_stock' => $items->where('assigned_to', 'Med Tech')->where('status', 'Out of Stock')->count(),
                'items' => $items->where('assigned_to', 'Med Tech')->map(function($item) {
                    return [
                        'item_name' => $item->item_name,
                        'category' => $item->category,
                        'assigned_to' => $item->assigned_to,
                        'stock' => $item->stock,
                        'consumed' => $item->consumed,
                        'rejected' => $item->rejected,
                        'status' => $item->status,
                    ];
                })->values()->toArray(),
            ],
        ];

        // All items for the table
        $allItems = $items->map(function($item) {
            return [
                'item_name' => $item->item_name,
                'category' => $item->category,
                'assigned_to' => $item->assigned_to,
                'stock' => $item->stock,
                'consumed' => $item->consumed,
                'rejected' => $item->rejected,
                'status' => $item->status,
            ];
        })->values()->toArray();

        return [
            'summary' => $summary,
            'department_stats' => $departmentStats,
            'all_items' => $allItems,
            'date_range' => $dateRange,
        ];
    }
}
