<?php

namespace App\Http\Controllers;

use App\Services\InventoryReportService;
use App\Services\SupplyAnalyticsService;
use App\Models\InventoryReport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class InventoryReportController extends Controller
{
    protected $reportService;

    public function __construct()
    {
        $this->reportService = new InventoryReportService();
    }

    public function index(Request $request)
    {
        try {
            $filter = $request->get('filter', 'daily');
            $date = $request->get('date', now()->format('Y-m-d'));
            $reportType = $request->get('report_type', 'all');

            \Log::info('InventoryReportController - Index Request', [
                'filter' => $filter,
                'date' => $date,
                'report_type' => $reportType
            ]);

            // Get paginated inventory items for the table
            $startDate = $this->getStartDate($filter, $date);
            $endDate = $this->getEndDate($filter, $date);

            $data = $this->getInventoryReportData($filter, $date, $reportType);

            \Log::info('InventoryReportController - Data Retrieved', [
                'total_products' => $data['total_products'] ?? 0,
                'supply_details_count' => count($data['supply_details'] ?? []),
                'period' => $data['period'] ?? 'Unknown'
            ]);

            // Get paginated inventory items
            $query = \App\Models\InventoryItem::query();

            // Apply date range filter based on report type
            if ($reportType === 'used_rejected' || $reportType === 'in_out') {
                // For transaction-based reports, we need to get items that have movements in the date range
                $query->whereHas('movements', function($q) use ($startDate, $endDate) {
                    $q->whereBetween('created_at', [$startDate, $endDate]);
                });
            } else {
                // For all items report, filter by created_at
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }

            if ($request->filled('category')) {
                $query->where('category', $request->category);
            }

            if ($request->filled('low_stock')) {
                $query->where('low_stock_alert', '>', 0);
            }

            $supplies = $query->orderBy('item_name')
                ->paginate(20);

            // Transform data to match frontend expectations
            $transformedData = $supplies->getCollection()->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->item_name,
                    'code' => $item->item_code,
                    'category' => $item->category,
                    'unit_of_measure' => $item->unit,
                    'current_stock' => $item->stock,
                    'minimum_stock_level' => $item->low_stock_alert,
                    'maximum_stock_level' => $item->max_stock ?? 0,
                    'is_low_stock' => $item->stock <= $item->low_stock_alert,
                    'is_out_of_stock' => $item->stock <= 0,
                    'is_active' => $item->status === 'Active',
                    'created_at' => $item->created_at,
                ];
            });

            // Create a new paginated result with transformed data
            $supplies = new \Illuminate\Pagination\LengthAwarePaginator(
                $transformedData,
                $supplies->total(),
                $supplies->perPage(),
                $supplies->currentPage(),
                [
                    'path' => $supplies->url($supplies->currentPage()),
                    'pageName' => 'page',
                ]
            );

            $summary = [
                'total_products' => $supplies->count(),
                'low_stock_items' => $supplies->filter(function($item) {
                    return $item['current_stock'] <= $item['minimum_stock_level'];
                })->count(),
                'out_of_stock' => $supplies->filter(function($item) {
                    return $item['current_stock'] <= 0;
                })->count(),
            ];

            // Get analytics data for the selected period
            $analyticsService = new SupplyAnalyticsService();
            $analytics = $analyticsService->getAnalyticsSummary(5, 5, $startDate, $endDate);

            return Inertia::render('admin/reports/inventory', [
                'filter' => $filter,
                'date' => $date,
                'reportType' => $reportType,
                'data' => $data,
                'supplies' => $supplies,
                'summary' => $summary,
                'analytics' => $analytics,
                'filterOptions' => $this->getFilterOptions(),
                'metadata' => $this->getReportMetadata(),
            ]);
        } catch (\Exception $e) {
            \Log::error('InventoryReportController error: ' . $e->getMessage());
            return Inertia::render('admin/reports/inventory', [
                'filter' => 'daily',
                'date' => now()->format('Y-m-d'),
                'reportType' => 'all',
                'data' => [
                    'total_products' => 0,
                    'low_stock_items' => 0,
                    'out_of_stock' => 0,
                    'category_summary' => [],
                    'supply_details' => [],
                    'period' => 'No data available',
                    'start_date' => now()->format('Y-m-d'),
                    'end_date' => now()->format('Y-m-d')
                ],
                'supplies' => collect(),
                'summary' => [
                    'total_products' => 0,
                    'low_stock_items' => 0,
                    'out_of_stock' => 0,
                ],
                'analytics' => [
                    'most_used_supplies' => [],
                    'least_used_supplies' => [],
                ],
                'filterOptions' => [],
                'metadata' => [
                    'generated_at' => now()->format('Y-m-d H:i:s'),
                    'generated_by' => 'System',
                    'generated_by_role' => 'Admin',
                    'system_version' => '1.0.0',
                ],
                'error' => 'Unable to load inventory report data.'
            ]);
        }
    }

    // Helper methods from ReportsController
    private function getStartDate($filter, $date)
    {
        $dateObj = Carbon::parse($date);
        switch ($filter) {
            case 'monthly':
                return $dateObj->copy()->startOfMonth();
            case 'yearly':
                return $dateObj->copy()->startOfYear();
            default: // daily
                return $dateObj->copy()->startOfDay();
        }
    }

    private function getEndDate($filter, $date)
    {
        $dateObj = Carbon::parse($date);
        switch ($filter) {
            case 'monthly':
                return $dateObj->copy()->endOfMonth();
            case 'yearly':
                return $dateObj->copy()->endOfYear();
            default: // daily
                return $dateObj->copy()->endOfDay();
        }
    }

    private function getInventoryReportData($filter, $date, $reportType)
    {
        $startDate = $this->getStartDate($filter, $date);
        $endDate = $this->getEndDate($filter, $date);

        // Handle different report types
        if ($reportType === 'in_out') {
            return $this->getInOutReportData($startDate, $endDate, $filter, $date);
        }

        if ($reportType === 'used_rejected') {
            return $this->getUsedRejectedReportData($startDate, $endDate, $filter, $date);
        }

        // Get inventory items for the period
        $items = \App\Models\InventoryItem::whereBetween('created_at', [$startDate, $endDate])->get();

        // If no items found in the date range, get all items
        if ($items->isEmpty()) {
            $items = \App\Models\InventoryItem::all();
        }

        // Calculate statistics
        $totalProducts = $items->count();
        $lowStockItems = $items->filter(function($item) {
            return $item->stock <= $item->low_stock_alert;
        })->count();
        $outOfStock = $items->filter(function($item) {
            return $item->stock <= 0;
        })->count();

        // Calculate category summary
        $categorySummary = $items->groupBy('category')
            ->map(function ($categoryItems) {
                return [
                    'count' => $categoryItems->count(),
                    'low_stock' => $categoryItems->filter(function($item) {
                        return $item->stock <= $item->low_stock_alert;
                    })->count(),
                    'out_of_stock' => $categoryItems->filter(function($item) {
                        return $item->stock <= 0;
                    })->count(),
                ];
            })->toArray();

        // Get item details - transform to match frontend expectations
        $itemDetails = $items->map(function ($item) {
            return [
                'id' => $item->id,
                'name' => $item->item_name,
                'code' => $item->item_code,
                'category' => $item->category,
                'unit_of_measure' => $item->unit,
                'current_stock' => $item->stock,
                'minimum_stock_level' => $item->low_stock_alert,
                'maximum_stock_level' => $item->max_stock ?? 0,
                'is_low_stock' => $item->stock <= $item->low_stock_alert,
                'is_out_of_stock' => $item->stock <= 0,
                'is_active' => $item->status === 'Active',
                'created_at' => $item->created_at,
            ];
        });

        return [
            'total_products' => $totalProducts,
            'low_stock_items' => $lowStockItems,
            'out_of_stock' => $outOfStock,
            'category_summary' => $categorySummary,
            'supply_details' => $itemDetails,
            'period' => $this->getPeriodLabel($filter, $date),
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d')
        ];
    }

    private function getInOutReportData($startDate, $endDate, $filter, $date)
    {
        try {
            \Log::info('InventoryReportController - getInOutReportData Debug', [
                'start_date' => $startDate->format('Y-m-d H:i:s'),
                'end_date' => $endDate->format('Y-m-d H:i:s'),
                'filter' => $filter,
                'date' => $date,
                'start_date_timestamp' => $startDate->timestamp,
                'end_date_timestamp' => $endDate->timestamp,
                'timezone' => $startDate->timezone->getName(),
                'current_time' => now()->format('Y-m-d H:i:s')
            ]);

            // Get incoming and outgoing movements from InventoryMovement model with date filtering
            $incomingMovements = \App\Models\InventoryMovement::where('movement_type', 'IN')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->with('inventoryItem')
                ->orderBy('created_at', 'desc')
                ->get();

            $outgoingMovements = \App\Models\InventoryMovement::where('movement_type', 'OUT')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->with('inventoryItem')
                ->orderBy('created_at', 'desc')
                ->get();

            // Get all movements for debugging (with date filtering)
            $allMovements = \App\Models\InventoryMovement::whereBetween('created_at', [$startDate, $endDate])
                ->with('inventoryItem')
                ->orderBy('created_at', 'desc')
                ->get();

            // Get all movements for comparison (without date filter)
            $allMovementsAllTime = \App\Models\InventoryMovement::with('inventoryItem')->orderBy('created_at', 'desc')->get();

            \Log::info('InventoryReportController - In/Out Movement Query Results', [
                'incoming_movements_count' => $incomingMovements->count(),
                'outgoing_movements_count' => $outgoingMovements->count(),
                'date_range' => $startDate->format('Y-m-d') . ' to ' . $endDate->format('Y-m-d'),
                'total_movements_in_date_range' => $allMovements->count(),
                'total_movements_all_time' => $allMovementsAllTime->count(),
                'sample_movement_data' => $allMovements->take(3)->map(function($m) {
                    return [
                        'id' => $m->id,
                        'movement_type' => $m->movement_type,
                        'quantity' => $m->quantity,
                        'created_by' => $m->created_by,
                        'remarks' => $m->remarks,
                        'item_name' => $m->inventoryItem ? $m->inventoryItem->item_name : 'No Item',
                        'created_at' => $m->created_at->format('Y-m-d H:i:s'),
                    ];
                })->toArray(),
                'all_time_sample' => $allMovementsAllTime->take(3)->map(function($m) {
                    return [
                        'id' => $m->id,
                        'movement_type' => $m->movement_type,
                        'created_at' => $m->created_at->format('Y-m-d H:i:s'),
                    ];
                })->toArray()
            ]);

            // Calculate statistics from the already filtered movements
            $totalMovements = $allMovements->count();
            $incomingCount = $incomingMovements->count();
            $outgoingCount = $outgoingMovements->count();

            // Return individual movements instead of grouped data
            $movementDetails = $allMovements->map(function ($movement) {
                $item = $movement->inventoryItem;

                $mappedData = [
                    'id' => $movement->id,
                    'name' => $item ? $item->item_name : 'Unknown Item',
                    'code' => $item ? $item->item_code : 'N/A',
                    'category' => $item ? $item->category : 'Unknown',
                    'movement_type' => $movement->movement_type,
                    'quantity' => $movement->quantity,
                    'created_by' => $movement->created_by,
                    'remarks' => $movement->remarks,
                    'created_at' => $movement->created_at->format('Y-m-d H:i:s'),
                    'item_id' => $movement->inventory_id,
                ];

                // Debug log for first few items
                if ($movement->id <= 3) {
                    \Log::info('InventoryReportController - Movement mapping debug', [
                        'original_movement' => [
                            'id' => $movement->id,
                            'movement_type' => $movement->movement_type,
                            'created_by' => $movement->created_by,
                            'remarks' => $movement->remarks,
                        ],
                        'mapped_data' => $mappedData
                    ]);
                }

                return $mappedData;
            })->values();

            // Also create grouped summary for category summary
            $productSummary = $allMovements->groupBy('inventory_id')
                ->map(function ($movements) {
                    $item = $movements->first()->inventoryItem;
                    $incoming = $movements->where('movement_type', 'IN');
                    $outgoing = $movements->where('movement_type', 'OUT');

                    return [
                        'id' => $item->id,
                        'name' => $item->item_name,
                        'code' => $item->item_code,
                        'category' => $item->category,
                        'unit_of_measure' => $item->unit,
                        'incoming_quantity' => $incoming->sum('quantity'),
                        'outgoing_quantity' => $outgoing->sum('quantity'),
                        'net_quantity' => $incoming->sum('quantity') - $outgoing->sum('quantity'),
                        'movement_count' => $movements->count(),
                        'last_movement_date' => $movements->max('created_at'),
                    ];
                })->values();

            // Category summary
            $categorySummary = $productSummary->groupBy('category')
                ->map(function ($products) {
                    return [
                        'count' => $products->count(),
                        'incoming_quantity' => $products->sum('incoming_quantity'),
                        'outgoing_quantity' => $products->sum('outgoing_quantity'),
                        'net_quantity' => $products->sum('incoming_quantity') - $products->sum('outgoing_quantity'),
                    ];
                })->toArray();

            // Debug: Log the final data being returned
            \Log::info('InventoryReportController - getInOutReportData Final Data', [
                'total_movements' => $totalMovements,
                'movement_details_count' => $movementDetails->count(),
                'sample_movement_details' => $movementDetails->take(3)->toArray(),
                'incoming_count' => $incomingCount,
                'outgoing_count' => $outgoingCount,
            ]);

            return [
                'total_products' => $productSummary->count(),
                'low_stock_items' => 0, // Not applicable for in/out
                'out_of_stock' => 0, // Not applicable for in/out
                'incoming_count' => $incomingCount,
                'outgoing_count' => $outgoingCount,
                'total_transactions' => $totalMovements,
                'incoming_quantity' => $incomingMovements->sum('quantity'),
                'outgoing_quantity' => $outgoingMovements->sum('quantity'),
                'net_quantity' => $incomingMovements->sum('quantity') - $outgoingMovements->sum('quantity'),
                'category_summary' => $categorySummary,
                'supply_details' => $movementDetails->toArray(), // Use movement details instead of product summary
                'period' => $this->getPeriodLabel($filter, $date),
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d')
            ];
        } catch (\Exception $e) {
            \Log::error('InventoryReportController - In/Out report data error: ' . $e->getMessage());
            return [
                'total_products' => 0,
                'low_stock_items' => 0,
                'out_of_stock' => 0,
                'incoming_count' => 0,
                'outgoing_count' => 0,
                'total_transactions' => 0,
                'category_summary' => [],
                'supply_details' => [],
                'period' => 'No data available',
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d')
            ];
        }
    }

    private function getUsedRejectedReportData($startDate, $endDate, $filter, $date)
    {
        try {
            \Log::info('InventoryReportController - getUsedRejectedReportData Debug', [
                'start_date' => $startDate->format('Y-m-d H:i:s'),
                'end_date' => $endDate->format('Y-m-d H:i:s'),
                'filter' => $filter,
                'date' => $date
            ]);

            // Get used and rejected items from the new dedicated table
            $usedMovements = \App\Models\InventoryUsedRejectedItem::getUsedItems($startDate->format('Y-m-d'), $endDate->format('Y-m-d'));
            $rejectedMovements = \App\Models\InventoryUsedRejectedItem::getRejectedItems($startDate->format('Y-m-d'), $endDate->format('Y-m-d'));
            $allMovements = \App\Models\InventoryUsedRejectedItem::getAllUsedRejectedItems($startDate->format('Y-m-d'), $endDate->format('Y-m-d'));

            \Log::info('InventoryReportController - Used/Rejected Movement Query Results', [
                'used_movements_count' => $usedMovements->count(),
                'rejected_movements_count' => $rejectedMovements->count(),
                'date_range' => $startDate->format('Y-m-d') . ' to ' . $endDate->format('Y-m-d'),
                'total_movements_in_date_range' => $allMovements->count(),
                'sample_movement_data' => $allMovements->take(3)->map(function($m) {
                    return [
                        'id' => $m->id,
                        'movement_type' => $m->movement_type,
                        'quantity' => $m->quantity,
                        'created_by' => $m->created_by,
                        'remarks' => $m->remarks,
                        'item_name' => $m->inventoryItem ? $m->inventoryItem->item_name : 'No Item',
                        'created_at' => $m->created_at->format('Y-m-d H:i:s'),
                    ];
                })->toArray()
            ]);

            // Calculate statistics from the already filtered movements
            $totalMovements = $allMovements->count();
            $usedCount = $usedMovements->count();
            $rejectedCount = $rejectedMovements->count();

            // Return individual movements instead of grouped data
            $movementDetails = $allMovements->map(function ($item) {
                $inventoryItem = $item->inventoryItem;

                $mappedData = [
                    'id' => $item->id,
                    'name' => $inventoryItem ? $inventoryItem->item_name : 'Unknown Item',
                    'code' => $inventoryItem ? $inventoryItem->item_code : 'N/A',
                    'category' => $inventoryItem ? $inventoryItem->category : 'Unknown',
                    'movement_type' => $item->type,
                    'quantity' => $item->quantity,
                    'created_by' => $item->used_by,
                    'remarks' => $item->remarks,
                    'created_at' => $item->date_used_rejected . ' ' . $item->created_at->format('H:i:s'),
                    'item_id' => $item->inventory_item_id,
                    // Add used/rejected specific fields
                    'used_quantity' => $item->type === 'used' ? $item->quantity : 0,
                    'rejected_quantity' => $item->type === 'rejected' ? $item->quantity : 0,
                    'reason' => $item->reason,
                    'location' => $item->location,
                ];

                return $mappedData;
            })->values();

            // Create category summary for used/rejected
            $categorySummary = $allMovements->groupBy('inventoryItem.category')
                ->map(function ($items) {
                    $used = $items->where('type', 'used');
                    $rejected = $items->where('type', 'rejected');

                    return [
                        'count' => $items->count(),
                        'used_quantity' => $used->sum('quantity'),
                        'rejected_quantity' => $rejected->sum('quantity'),
                    ];
                })->toArray();

            return [
                'total_products' => $allMovements->groupBy('inventory_item_id')->count(),
                'low_stock_items' => 0, // Not applicable for used/rejected
                'out_of_stock' => 0, // Not applicable for used/rejected
                'used_count' => $usedCount,
                'rejected_count' => $rejectedCount,
                'total_transactions' => $totalMovements,
                'used_quantity' => $usedMovements->sum('quantity'),
                'rejected_quantity' => $rejectedMovements->sum('quantity'),
                'category_summary' => $categorySummary,
                'supply_details' => $movementDetails->toArray(),
                'period' => $this->getPeriodLabel($filter, $date),
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d')
            ];
        } catch (\Exception $e) {
            \Log::error('InventoryReportController - Used/Rejected report data error: ' . $e->getMessage());
            return [
                'total_products' => 0,
                'low_stock_items' => 0,
                'out_of_stock' => 0,
                'used_count' => 0,
                'rejected_count' => 0,
                'total_transactions' => 0,
                'category_summary' => [],
                'supply_details' => [],
                'period' => 'No data available',
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d')
            ];
        }
    }

    private function getPeriodLabel($filter, $date)
    {
        $dateObj = Carbon::parse($date);
        switch ($filter) {
            case 'monthly':
                return 'Monthly Report - ' . $dateObj->format('F Y');
            case 'yearly':
                return 'Yearly Report - ' . $dateObj->format('Y');
            default:
                return 'Daily Report - ' . $dateObj->format('M d, Y');
        }
    }

    private function getFilterOptions()
    {
        return [];
    }

    private function getReportMetadata()
    {
        $user = auth()->user();
        return [
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'generated_by' => $user ? $user->name : 'System',
            'generated_by_role' => $user ? ($user->role ?? 'User') : 'System',
            'system_version' => '1.0.0',
        ];
    }

    public function usedRejectedReport(Request $request)
    {
        $filters = $request->only(['period', 'start_date', 'end_date', 'department']);
        $data = $this->reportService->generateUsedRejectedReport($filters);

        // Save report if requested
        if ($request->has('save_report')) {
            $report = $this->reportService->saveReport('used_rejected', $data, $filters, auth()->id());
            $data['report_id'] = $report->id;
        }

        return Inertia::render('Inventory/Reports/UsedRejected', [
            'data' => $data,
            'filters' => $filters,
        ]);
    }

    public function inOutSuppliesReport(Request $request)
    {
        try {
            $filters = $request->only(['period', 'start_date', 'end_date', 'department']);
            $data = $this->reportService->generateInOutSuppliesReport($filters);

            // Save report if requested
            if ($request->has('save_report')) {
                $report = $this->reportService->saveReport('in_out_supplies', $data, $filters, auth()->id());
                $data['report_id'] = $report->id;
            }

            return Inertia::render('Inventory/Reports/InOutSupplies', [
                'data' => $data,
                'filters' => $filters,
            ]);
        } catch (\Exception $e) {
            // Fallback with empty data
            return Inertia::render('Inventory/Reports/InOutSupplies', [
                'data' => [
                    'summary' => [
                        'total_movements' => 0,
                        'in_movements' => 0,
                        'out_movements' => 0,
                        'total_in_quantity' => 0,
                        'total_out_quantity' => 0,
                    ],
                    'department_stats' => [
                        'doctor_nurse' => ['in_movements' => 0, 'out_movements' => 0],
                        'med_tech' => ['in_movements' => 0, 'out_movements' => 0],
                    ],
                    'movements' => [],
                    'movement_trends' => [],
                    'date_range' => ['start' => null, 'end' => null, 'label' => 'No data'],
                ],
                'filters' => $filters,
            ]);
        }
    }

    public function stockLevelsReport(Request $request)
    {
        try {
            $filters = $request->only(['category', 'status']);
            $data = $this->reportService->generateStockLevelsReport($filters);

            // Save report if requested
            if ($request->has('save_report')) {
                $report = $this->reportService->saveReport('stock_levels', $data, $filters, auth()->id());
                $data['report_id'] = $report->id;
            }

            return Inertia::render('Inventory/Reports/StockLevels', [
                'data' => $data,
                'filters' => $filters,
            ]);
        } catch (\Exception $e) {
            // Fallback with empty data
            return Inertia::render('Inventory/Reports/StockLevels', [
                'data' => [
                    'summary' => [
                        'total_items' => 0,
                        'in_stock' => 0,
                        'low_stock' => 0,
                        'out_of_stock' => 0,
                        'total_value' => 0,
                    ],
                    'category_stats' => [],
                    'needs_restock' => [],
                    'all_items' => [],
                ],
                'filters' => $filters,
            ]);
        }
    }

    public function dailyConsumptionReport(Request $request)
    {
        try {
            $filters = $request->only(['period', 'start_date', 'end_date', 'item_id']);
            $data = $this->reportService->generateDailyConsumptionReport($filters);

            // Save report if requested
            if ($request->has('save_report')) {
                $report = $this->reportService->saveReport('daily_consumption', $data, $filters, auth()->id());
                $data['report_id'] = $report->id;
            }

            return Inertia::render('Inventory/Reports/DailyConsumption', [
                'data' => $data,
                'filters' => $filters,
            ]);
        } catch (\Exception $e) {
            // Fallback with empty data
            return Inertia::render('Inventory/Reports/DailyConsumption', [
                'data' => [
                    'daily_data' => [],
                    'item_consumption' => [],
                    'date_range' => ['start' => null, 'end' => null, 'label' => 'No data'],
                ],
                'filters' => $filters,
            ]);
        }
    }

    public function usageByLocationReport(Request $request)
    {
        try {
            $filters = $request->only(['period', 'start_date', 'end_date', 'location']);
            $data = $this->reportService->generateUsageByLocationReport($filters);

            // Save report if requested
            if ($request->has('save_report')) {
                $report = $this->reportService->saveReport('usage_by_location', $data, $filters, auth()->id());
                $data['report_id'] = $report->id;
            }

            return Inertia::render('Inventory/Reports/UsageByLocation', [
                'data' => $data,
                'filters' => $filters,
            ]);
        } catch (\Exception $e) {
            // Fallback with empty data
            return Inertia::render('Inventory/Reports/UsageByLocation', [
                'data' => [
                    'location_usage' => [],
                    'date_range' => ['start' => null, 'end' => null, 'label' => 'No data'],
                ],
                'filters' => $filters,
            ]);
        }
    }

    public function exportReport(Request $request, $reportId)
    {
        $report = InventoryReport::findOrFail($reportId);
        $format = $request->get('format', 'pdf');

        // Update export timestamp
        $report->update([
            'exported_at' => now(),
            'export_format' => $format,
        ]);

        if ($format === 'pdf') {
            return $this->exportReportToPdf($report);
        } else {
            return $this->exportReportToExcel($report);
        }
    }

    private function exportReportToPdf($report)
    {
        $html = view('reports.inventory-pdf', [
            'report' => $report,
            'data' => $report->detailed_data,
        ])->render();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'portrait');

        $filename = 'inventory-report-' . $report->id . '.pdf';
        return $pdf->download($filename);
    }

    private function exportReportToExcel($report)
    {
        $export = new \App\Exports\InventoryReportExport($report);

        $filename = 'inventory-report-' . $report->id . '.xlsx';
        return \Maatwebsite\Excel\Facades\Excel::download($export, $filename);
    }

    public function exportAllReports(Request $request)
    {
        $format = $request->get('format', 'pdf');

        // Get all reports
        $reports = InventoryReport::with('creator')->get();

        if ($format === 'pdf') {
            return $this->exportAllToPdf($reports);
        } else {
            return $this->exportAllToExcel($reports);
        }
    }

    private function exportAllToPdf($reports)
    {
        $html = view('reports.inventory-all-pdf', [
            'reports' => $reports,
        ])->render();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'portrait');

        $filename = 'all-inventory-reports.pdf';
        return $pdf->download($filename);
    }

    private function exportAllToExcel($reports)
    {
        $export = new \App\Exports\AllInventoryReportsExport($reports);

        $filename = 'all-inventory-reports.xlsx';
        return \Maatwebsite\Excel\Facades\Excel::download($export, $filename);
    }

    public function exportUsedRejected(Request $request)
    {
        $filters = $request->only(['period', 'start_date', 'end_date', 'department']);
        $filters['report_type'] = 'used_rejected'; // Set report type for PDF template

        $data = $this->reportService->generateUsedRejectedReport($filters);

        $format = $request->get('format', 'pdf');

        if ($format === 'pdf') {
            return $this->exportToPdf('Used/Rejected Supplies Report', $data, $filters);
        } else {
            return $this->exportToExcel('Used/Rejected Supplies Report', $data);
        }
    }

    public function exportInOutSupplies(Request $request)
    {
        $filters = $request->only(['period', 'start_date', 'end_date', 'department', 'date']);
        // Ensure default period is daily if not provided
        if (empty($filters['period'])) {
            $filters['period'] = 'daily';
        }
        // If a single date is provided, map it to start/end for daily export
        if (!empty($filters['date']) && empty($filters['start_date']) && empty($filters['end_date'])) {
            $filters['start_date'] = $filters['date'];
            $filters['end_date'] = $filters['date'];
        }
        // Normalize when period is daily but no dates are provided – use requested date or today
        if ($filters['period'] === 'daily' && empty($filters['start_date']) && empty($filters['end_date'])) {
            $filters['start_date'] = $request->get('date', now()->format('Y-m-d'));
            $filters['end_date'] = $filters['start_date'];
        }
        $data = $this->reportService->generateInOutSuppliesReport($filters);
        $format = $request->get('format', 'pdf');

        if ($format === 'pdf') {
            return $this->exportToPdf('In/Out Supplies Report', $data, $filters);
        } else {
            return $this->exportToExcel('In/Out Supplies Report', $data);
        }
    }

    public function exportStockLevels(Request $request)
    {
        $filters = $request->only(['category', 'status']);
        $data = $this->reportService->generateStockLevelsReport($filters);
        $format = $request->get('format', 'pdf');

        if ($format === 'pdf') {
            return $this->exportToPdf('Stock Levels Report', $data);
        } else {
            return $this->exportToExcel('Stock Levels Report', $data);
        }
    }

    public function exportDailyConsumption(Request $request)
    {
        $filters = $request->only(['period', 'start_date', 'end_date', 'item_id']);
        $data = $this->reportService->generateDailyConsumptionReport($filters);
        $format = $request->get('format', 'pdf');

        if ($format === 'pdf') {
            return $this->exportToPdf('Daily Consumption Report', $data);
        } else {
            return $this->exportToExcel('Daily Consumption Report', $data);
        }
    }

    public function exportUsageByLocation(Request $request)
    {
        $filters = $request->only(['period', 'start_date', 'end_date', 'location']);
        $data = $this->reportService->generateUsageByLocationReport($filters);
        $format = $request->get('format', 'pdf');

        if ($format === 'pdf') {
            return $this->exportToPdf('Usage by Location Report', $data);
        } else {
            return $this->exportToExcel('Usage by Location Report', $data);
        }
    }

    private function exportToPdf($title, $data, $filters = [])
    {
        $html = view('reports.inventory-pdf', [
            'title' => $title,
            'data' => $data,
            'filters' => $filters,
        ])->render();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'portrait');

        $filename = strtolower(str_replace([' ', '/', '\\'], ['-', '-', '-'], $title)) . '.pdf';
        return $pdf->download($filename);
    }

    private function exportToExcel($title, $data)
    {
        $export = new \App\Exports\InventoryReportExport($title, $data);

        $filename = strtolower(str_replace([' ', '/', '\\'], ['-', '-', '-'], $title)) . '.xlsx';
        return \Maatwebsite\Excel\Facades\Excel::download($export, $filename);
    }

    public function destroy($id)
    {
        $report = InventoryReport::findOrFail($id);
        $report->delete();

        return back()->with('success', 'Report deleted successfully.');
    }
}
