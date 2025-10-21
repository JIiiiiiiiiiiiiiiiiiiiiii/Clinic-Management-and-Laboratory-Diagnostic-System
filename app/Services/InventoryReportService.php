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
        
        // Get items with consumed/rejected data
        $items = InventoryItem::with('movements')
            ->where(function($query) use ($dateRange) {
                if ($dateRange['start'] && $dateRange['end']) {
                    $query->whereHas('movements', function($q) use ($dateRange) {
                        $q->whereBetween('created_at', [$dateRange['start'], $dateRange['end']]);
                    });
                }
            })
            ->get();

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
            ],
            'med_tech' => [
                'total_items' => $items->where('assigned_to', 'Med Tech')->count(),
                'total_consumed' => $items->where('assigned_to', 'Med Tech')->sum('consumed'),
                'total_rejected' => $items->where('assigned_to', 'Med Tech')->sum('rejected'),
                'low_stock' => $items->where('assigned_to', 'Med Tech')->where('status', 'Low Stock')->count(),
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

    public function generateStockLevelsReport($filters = [])
    {
        $items = InventoryItem::all();

        $summary = [
            'total_items' => $items->count(),
            'in_stock' => $items->where('status', 'In Stock')->count(),
            'low_stock' => $items->where('status', 'Low Stock')->count(),
            'out_of_stock' => $items->where('status', 'Out of Stock')->count(),
            'total_value' => $items->sum(function($item) {
                return $item->stock * ($item->unit_cost ?? 0);
            }),
        ];

        // Category breakdown
        $categoryStats = $items->groupBy('category')->map(function($categoryItems) {
            return [
                'total_items' => $categoryItems->count(),
                'in_stock' => $categoryItems->where('status', 'In Stock')->count(),
                'low_stock' => $categoryItems->where('status', 'Low Stock')->count(),
                'out_of_stock' => $categoryItems->where('status', 'Out of Stock')->count(),
                'total_value' => $categoryItems->sum(function($item) {
                    return $item->stock * ($item->unit_cost ?? 0);
                }),
            ];
        });

        // Items needing restock
        $needsRestock = $items->where('status', 'Low Stock')
            ->sortBy('stock')
            ->values();

        return [
            'summary' => $summary,
            'category_stats' => $categoryStats,
            'needs_restock' => $needsRestock,
            'all_items' => $items,
        ];
    }

    public function generateDailyConsumptionReport($filters = [])
    {
        $dateRange = $this->getDateRange($filters);
        
        // Get daily consumption data
        $dailyData = DB::table('inventory_movements')
            ->where('movement_type', 'OUT')
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->selectRaw('DATE(created_at) as date, SUM(quantity) as total_consumed')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Get consumption by item
        $itemConsumption = DB::table('inventory_movements')
            ->join('inventory_items', 'inventory_movements.inventory_id', '=', 'inventory_items.id')
            ->where('inventory_movements.movement_type', 'OUT')
            ->whereBetween('inventory_movements.created_at', [$dateRange['start'], $dateRange['end']])
            ->selectRaw('inventory_items.item_name, inventory_items.category, SUM(inventory_movements.quantity) as total_consumed')
            ->groupBy('inventory_items.id', 'inventory_items.item_name', 'inventory_items.category')
            ->orderByDesc('total_consumed')
            ->get();

        return [
            'daily_data' => $dailyData,
            'item_consumption' => $itemConsumption,
            'date_range' => $dateRange,
        ];
    }

    public function generateUsageByLocationReport($filters = [])
    {
        $dateRange = $this->getDateRange($filters);
        
        // Get usage by location (assigned_to)
        $locationUsage = DB::table('inventory_movements')
            ->join('inventory_items', 'inventory_movements.inventory_id', '=', 'inventory_items.id')
            ->where('inventory_movements.movement_type', 'OUT')
            ->whereBetween('inventory_movements.created_at', [$dateRange['start'], $dateRange['end']])
            ->selectRaw('inventory_items.assigned_to as location, SUM(inventory_movements.quantity) as total_used')
            ->groupBy('inventory_items.assigned_to')
            ->orderByDesc('total_used')
            ->get();

        return [
            'location_usage' => $locationUsage,
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
        ];

        $period = $filters['period'] ?? 'custom';
        $date = Carbon::now()->format('Y-m-d');

        return $typeNames[$reportType] . " - {$period} - {$date}";
    }
}
