<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index()
    {
        // Use fresh database queries to ensure latest values
        $totalSupplies = InventoryItem::count();
        $lowStockItems = InventoryItem::lowStock()->count();
        $totalConsumed = InventoryItem::sum('consumed');
        $totalRejected = InventoryItem::sum('rejected');

        $doctorNurseItems = InventoryItem::byAssignedTo('Doctor & Nurse')->get();
        $medTechItems = InventoryItem::byAssignedTo('Med Tech')->get();

        // Debug logging for stats
        \Log::info('Inventory Index Stats:', [
            'totalSupplies' => $totalSupplies,
            'lowStockItems' => $lowStockItems,
            'totalConsumed' => $totalConsumed,
            'totalRejected' => $totalRejected,
        ]);

        return Inertia::render('Inventory/Index', [
            'stats' => [
                'totalSupplies' => $totalSupplies,
                'lowStockItems' => $lowStockItems,
                'totalConsumed' => $totalConsumed,
                'totalRejected' => $totalRejected,
            ],
            'doctorNurseItems' => $doctorNurseItems,
            'medTechItems' => $medTechItems,
        ]);
    }

    public function create()
    {
        return Inertia::render('Inventory/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'item_name' => 'required|string|max:100',
            'item_code' => 'required|string|max:50|unique:inventory_items,item_code',
            'category' => 'required|string|max:50',
            'unit' => 'required|string|max:20',
            'assigned_to' => 'required|in:Doctor & Nurse,Med Tech',
            'stock' => 'required|integer|min:0',
            'low_stock_alert' => 'integer|min:0',
        ]);

        $item = InventoryItem::create([
            'item_name' => $request->item_name,
            'item_code' => $request->item_code,
            'category' => $request->category,
            'unit' => $request->unit,
            'assigned_to' => $request->assigned_to,
            'stock' => $request->stock,
            'low_stock_alert' => $request->low_stock_alert ?? 10,
        ]);

        $item->updateStatus();

        // Create initial movement record if stock > 0
        if ($item->stock > 0) {
            InventoryMovement::create([
                'inventory_id' => $item->id,
                'movement_type' => 'IN',
                'quantity' => $item->stock,
                'remarks' => 'Initial stock',
                'created_by' => auth()->user()->name ?? 'System',
            ]);
        }

        return redirect()->route('admin.inventory.index')->with('success', 'Product created successfully!');
    }

    public function show($id)
    {
        $item = InventoryItem::with('movements')->findOrFail($id);
        return Inertia::render('Inventory/Show', [
            'item' => $item,
        ]);
    }

    public function edit($id)
    {
        $item = InventoryItem::findOrFail($id);
        return Inertia::render('Inventory/Edit', [
            'item' => $item,
        ]);
    }

    public function update(Request $request, $id)
    {
        $item = InventoryItem::findOrFail($id);

        $request->validate([
            'item_name' => 'required|string|max:100',
            'item_code' => 'required|string|max:50|unique:inventory_items,item_code,' . $id,
            'category' => 'required|string|max:50',
            'unit' => 'required|string|max:20',
            'assigned_to' => 'required|in:Doctor & Nurse,Med Tech',
            'low_stock_alert' => 'integer|min:0',
        ]);

        $item->update([
            'item_name' => $request->item_name,
            'item_code' => $request->item_code,
            'category' => $request->category,
            'unit' => $request->unit,
            'assigned_to' => $request->assigned_to,
            'low_stock_alert' => $request->low_stock_alert ?? 10,
        ]);

        $item->updateStatus();

        return redirect()->route('admin.inventory.index')->with('success', 'Product updated successfully!');
    }

    public function destroy($id)
    {
        $item = InventoryItem::findOrFail($id);
        $item->delete();

        return redirect()->route('admin.inventory.index')->with('success', 'Product deleted successfully!');
    }

    public function doctorNurse()
    {
        $items = InventoryItem::byAssignedTo('Doctor & Nurse')->get();
        
        // Calculate stats from fresh database queries to ensure latest values
        $consumedTotal = InventoryItem::byAssignedTo('Doctor & Nurse')->sum('consumed');
        $rejectedTotal = InventoryItem::byAssignedTo('Doctor & Nurse')->sum('rejected');
        $lowStockCount = InventoryItem::byAssignedTo('Doctor & Nurse')->where('status', 'Low Stock')->count();
        
        $stats = [
            'totalItems' => $items->count(),
            'lowStock' => $lowStockCount,
            'consumedItems' => $consumedTotal,
            'rejectedItems' => $rejectedTotal,
        ];

        // Debug logging
        \Log::info('DoctorNurse Stats:', [
            'totalItems' => $stats['totalItems'],
            'consumedItems' => $stats['consumedItems'],
            'rejectedItems' => $stats['rejectedItems'],
            'items_data' => $items->map(function($item) {
                return [
                    'name' => $item->item_name,
                    'consumed' => $item->consumed,
                    'rejected' => $item->rejected
                ];
            })
        ]);

        return Inertia::render('Inventory/DoctorNurse', [
            'items' => $items,
            'stats' => $stats,
        ]);
    }

    public function medTech()
    {
        $items = InventoryItem::byAssignedTo('Med Tech')->get();
        
        // Calculate stats from fresh database queries to ensure latest values
        $consumedTotal = InventoryItem::byAssignedTo('Med Tech')->sum('consumed');
        $rejectedTotal = InventoryItem::byAssignedTo('Med Tech')->sum('rejected');
        $lowStockCount = InventoryItem::byAssignedTo('Med Tech')->where('status', 'Low Stock')->count();
        
        $stats = [
            'totalItems' => $items->count(),
            'lowStock' => $lowStockCount,
            'consumedItems' => $consumedTotal,
            'rejectedItems' => $rejectedTotal,
        ];

        // Debug logging
        \Log::info('MedTech Stats:', [
            'totalItems' => $stats['totalItems'],
            'consumedItems' => $stats['consumedItems'],
            'rejectedItems' => $stats['rejectedItems'],
            'items_data' => $items->map(function($item) {
                return [
                    'name' => $item->item_name,
                    'consumed' => $item->consumed,
                    'rejected' => $item->rejected
                ];
            })
        ]);

        return Inertia::render('Inventory/MedTech', [
            'items' => $items,
            'stats' => $stats,
        ]);
    }

    public function reports(Request $request)
    {
        // Get filter parameters
        $dateRange = $request->get('dateRange', $request->get('date_range', 'monthly'));
        $reportType = $request->get('reportType', $request->get('report_type', 'consumed-rejected'));
        $startDate = $request->get('startDate', $request->get('start_date'));
        $endDate = $request->get('endDate', $request->get('end_date'));

        // Debug logging for reports method
        \Log::info('Reports Method Debug:', [
            'dateRange' => $dateRange,
            'reportType' => $reportType,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'all_params' => $request->all()
        ]);

        // Calculate date range
        $dateFilter = $this->calculateDateRange($dateRange, $startDate, $endDate);

        // Debug logging for date filter
        \Log::info('Date Filter Debug:', [
            'dateRange' => $dateRange,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'calculated_filter' => $dateFilter
        ]);

        // Get comprehensive inventory data based on date filter
        $itemsQuery = InventoryItem::query();
        
        // For inventory reports, we should get all items but filter movements by date
        // The items themselves don't need date filtering - we want to see all items
        // but only show movements/activities within the selected date range

        // Get movement data for the selected period
        $movementsQuery = InventoryMovement::with('inventoryItem');
        
        if ($dateFilter['start'] && $dateFilter['end']) {
            $movementsQuery->whereBetween('created_at', [$dateFilter['start'], $dateFilter['end']]);
        }

        $movements = $movementsQuery->orderBy('created_at', 'desc')->get();

        // Debug logging for movements
        \Log::info('Movements Query Debug:', [
            'total_movements_found' => $movements->count(),
            'date_filter_start' => $dateFilter['start'] ? $dateFilter['start']->format('Y-m-d H:i:s') : 'null',
            'date_filter_end' => $dateFilter['end'] ? $dateFilter['end']->format('Y-m-d H:i:s') : 'null',
            'movement_dates' => $movements->pluck('created_at')->map(function($date) { return $date->format('Y-m-d H:i:s'); })->toArray()
        ]);

        // Calculate movement statistics
        $totalInMovements = $movements->where('movement_type', 'IN')->sum('quantity');
        $totalOutMovements = $movements->where('movement_type', 'OUT')->sum('quantity');
        $totalMovements = $movements->count();

        // Calculate summary based on report type
        if ($reportType === 'incoming-outgoing') {
            // For movement reports, show movement data
            $totalItems = $totalMovements;
            $totalConsumed = $totalInMovements; // Incoming movements
            $totalRejected = $totalOutMovements; // Outgoing movements
            $lowStockItems = $movements->where('movement_type', 'OUT')->count(); // Outgoing movements count
            
            \Log::info('Movement Report Data:', [
                'totalMovements' => $totalMovements,
                'totalInMovements' => $totalInMovements,
                'totalOutMovements' => $totalOutMovements,
                'calculated_totalItems' => $totalItems,
                'calculated_totalConsumed' => $totalConsumed,
                'calculated_totalRejected' => $totalRejected,
                'calculated_lowStockItems' => $lowStockItems
            ]);
        } else {
            // For consumed/rejected reports, show movement data within the date range
            $totalItems = $itemsQuery->count(); // Total items in inventory
            $totalConsumed = $movements->where('movement_type', 'OUT')->sum('quantity'); // Items consumed in date range
            $totalRejected = $movements->where('movement_type', 'OUT')->sum('quantity'); // Items rejected in date range
            $lowStockItems = $itemsQuery->clone()->lowStock()->count(); // Current low stock items
            
            \Log::info('Consumed/Rejected Report Data:', [
                'calculated_totalItems' => $totalItems,
                'calculated_totalConsumed' => $totalConsumed,
                'calculated_totalRejected' => $totalRejected,
                'calculated_lowStockItems' => $lowStockItems
            ]);
        }

        // Get department-wise statistics
        $doctorNurseQuery = InventoryItem::byAssignedTo('Doctor & Nurse');
        $medTechQuery = InventoryItem::byAssignedTo('Med Tech');

        // Calculate department statistics based on report type
        if ($reportType === 'incoming-outgoing') {
            // For movement reports, show movement data by department
            $doctorNurseMovements = $movements->filter(function($movement) {
                return $movement->inventoryItem && $movement->inventoryItem->assigned_to === 'Doctor & Nurse';
            });
            $medTechMovements = $movements->filter(function($movement) {
                return $movement->inventoryItem && $movement->inventoryItem->assigned_to === 'Med Tech';
            });

            $doctorNurseStats = [
                'totalItems' => $doctorNurseMovements->count(),
                'totalConsumed' => $doctorNurseMovements->where('movement_type', 'IN')->sum('quantity'),
                'totalRejected' => $doctorNurseMovements->where('movement_type', 'OUT')->sum('quantity'),
                'lowStock' => $doctorNurseMovements->where('movement_type', 'OUT')->count(),
            ];

            $medTechStats = [
                'totalItems' => $medTechMovements->count(),
                'totalConsumed' => $medTechMovements->where('movement_type', 'IN')->sum('quantity'),
                'totalRejected' => $medTechMovements->where('movement_type', 'OUT')->sum('quantity'),
                'lowStock' => $medTechMovements->where('movement_type', 'OUT')->count(),
            ];
        } else {
            // For consumed/rejected reports, show movement data by department for the date range
            $doctorNurseMovements = $movements->filter(function($movement) {
                return $movement->inventoryItem && $movement->inventoryItem->assigned_to === 'Doctor & Nurse';
            });
            
            $medTechMovements = $movements->filter(function($movement) {
                return $movement->inventoryItem && $movement->inventoryItem->assigned_to === 'Med Tech';
            });

            $doctorNurseStats = [
                'totalItems' => $doctorNurseQuery->count(),
                'totalConsumed' => $doctorNurseMovements->where('movement_type', 'OUT')->sum('quantity'),
                'totalRejected' => $doctorNurseMovements->where('movement_type', 'OUT')->sum('quantity'),
                'lowStock' => $doctorNurseQuery->clone()->lowStock()->count(),
            ];

            $medTechStats = [
                'totalItems' => $medTechQuery->count(),
                'totalConsumed' => $medTechMovements->where('movement_type', 'OUT')->sum('quantity'),
                'totalRejected' => $medTechMovements->where('movement_type', 'OUT')->sum('quantity'),
                'lowStock' => $medTechQuery->clone()->lowStock()->count(),
            ];
        }

        // Get activity tracking data
        $reportsGenerated = \App\Models\Report::where('report_type', 'inventory')->count();
        $filesExported = \App\Models\Report::where('report_type', 'inventory')
            ->whereNotNull('exported_at')
            ->count();
        $lastReport = \App\Models\Report::where('report_type', 'inventory')
            ->orderBy('created_at', 'desc')
            ->first();

        // Get report data based on type
        $reportData = [];
        if ($reportType === 'consumed-rejected') {
            $reportData = [
                'consumedItems' => $movements->where('movement_type', 'OUT'),
                'rejectedItems' => $movements->where('movement_type', 'OUT'),
            ];
        } else {
            $reportData = [
                'incomingMovements' => $movements->where('movement_type', 'IN'),
                'outgoingMovements' => $movements->where('movement_type', 'OUT'),
            ];
        }

        // Debug logging for frontend data
        \Log::info('Frontend Data Debug:', [
            'reportType' => $reportType,
            'summary_data' => [
                'totalItems' => $totalItems,
                'totalConsumed' => $totalConsumed,
                'totalRejected' => $totalRejected,
                'lowStockItems' => $lowStockItems,
            ]
        ]);

        // Create a report record to track this generation
        $report = \App\Models\Report::create([
            'report_type' => 'inventory',
            'report_name' => 'Inventory Report - ' . ($reportType === 'incoming-outgoing' ? 'Movement Report' : 'Consumed & Rejected Report'),
            'description' => 'Inventory report for ' . $dateFilter['label'],
            'filters' => [
                'date_range' => $dateRange,
                'report_type' => $reportType,
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'data' => [
                'summary' => [
                    'totalItems' => $totalItems,
                    'totalConsumed' => $totalConsumed,
                    'totalRejected' => $totalRejected,
                    'lowStockItems' => $lowStockItems,
                ],
                'departmentStats' => [
                    'doctorNurse' => $doctorNurseStats,
                    'medTech' => $medTechStats,
                ],
                'reportData' => $reportData,
            ],
            'period' => $dateRange,
            'start_date' => $dateFilter['start'] ? $dateFilter['start']->toDateString() : null,
            'end_date' => $dateFilter['end'] ? $dateFilter['end']->toDateString() : null,
            'status' => 'active',
            'created_by' => auth()->id(),
        ]);

        return Inertia::render('Inventory/Reports', [
            'filters' => [
                'dateRange' => $dateRange,
                'reportType' => $reportType,
                'startDate' => $startDate,
                'endDate' => $endDate,
            ],
            'summary' => [
                'totalItems' => $totalItems,
                'totalConsumed' => $totalConsumed,
                'totalRejected' => $totalRejected,
                'lowStockItems' => $lowStockItems,
                'totalInMovements' => $totalInMovements,
                'totalOutMovements' => $totalOutMovements,
                'totalMovements' => $totalMovements,
            ],
            'departmentStats' => [
                'doctorNurse' => $doctorNurseStats,
                'medTech' => $medTechStats,
            ],
            'activityTracking' => [
                'reportsGenerated' => $reportsGenerated,
                'filesExported' => $filesExported,
                'lastReportTimestamp' => $lastReport ? $lastReport->created_at->format('m/d/Y h:i A') : null,
            ],
            'reportData' => $reportData,
            'dateFilter' => $dateFilter,
            'reportId' => $report->id, // Add report ID for export
            'generatedAt' => $report->created_at->format('m/d/Y h:i A'),
        ]);
    }

    public function exportReport(Request $request)
    {
        $format = $request->get('format', 'pdf');
        $reportId = $request->get('reportId', $request->get('report_id'));

        // Debug logging
        \Log::info('Export Report Debug:', [
            'format' => $format,
            'reportId' => $reportId,
            'all_params' => $request->all()
        ]);

        // If no report_id provided, return error
        if (!$reportId) {
            return response()->json([
                'error' => 'Report ID is required. Please generate a report first.'
            ], 400);
        }

        // Find the report by ID
        $report = \App\Models\Report::find($reportId);
        
        if (!$report) {
            return response()->json([
                'error' => 'Report not found. Please generate a new report.'
            ], 404);
        }

        // Verify the report belongs to the current user (security check)
        if ($report->created_by !== auth()->id()) {
            return response()->json([
                'error' => 'Unauthorized access to report.'
            ], 403);
        }

        // Log the report being exported for debugging
        \Log::info('Exporting Report:', [
            'report_id' => $report->id,
            'report_name' => $report->report_name,
            'report_type' => $report->filters['report_type'] ?? 'unknown',
            'format' => $format,
            'user_id' => auth()->id()
        ]);

        // Use the stored report data directly - no need to regenerate
        if ($format === 'pdf') {
            return $this->exportToPdf($report);
        } else {
            return $this->exportToExcel($report);
        }
    }

    private function exportToPdf($report)
    {
        // Update report with export timestamp
        $report->update(['exported_at' => now()]);

        // Generate PDF using a simple HTML template
        $html = view('lab.inventory-report-pdf', [
            'report' => $report,
            'data' => $report->data,
        ])->render();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'portrait');

        return $pdf->download('inventory-report-' . now()->format('Y-m-d-H-i-s') . '.pdf');
    }

    private function exportToExcel($report)
    {
        // Update report with export timestamp
        $report->update(['exported_at' => now()]);

        // Create Excel export
        $export = new \App\Exports\InventoryReportExport($report);
        
        return \Maatwebsite\Excel\Facades\Excel::download(
            $export,
            'inventory-report-' . now()->format('Y-m-d-H-i-s') . '.xlsx'
        );
    }

    private function calculateDateRange($dateRange, $startDate, $endDate)
    {
        $now = now();
        
        switch ($dateRange) {
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
                    'start' => $startDate ? \Carbon\Carbon::parse($startDate)->startOfDay() : null,
                    'end' => $endDate ? \Carbon\Carbon::parse($endDate)->endOfDay() : null,
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

    public function rejectedSupplies(Request $request)
    {
        \Log::info('RejectedSupplies method called', [
            'request_data' => $request->all(),
            'url' => $request->url(),
            'method' => $request->method()
        ]);

        // Get filter parameters
        $assignedTo = $request->get('assigned_to', 'all');
        $category = $request->get('category', 'all');
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');

        // Build query for items with rejections
        $itemsQuery = InventoryItem::where('rejected', '>', 0);
        
        if ($assignedTo !== 'all') {
            $itemsQuery->where('assigned_to', $assignedTo);
        }
        
        if ($category !== 'all') {
            $itemsQuery->where('category', $category);
        }
        
        $itemsWithRejections = $itemsQuery->orderBy('rejected', 'desc')->get();

        // Build query for rejected movements with date filtering
        $movementsQuery = InventoryMovement::with(['inventoryItem'])
            ->where('movement_type', 'OUT')
            ->where(function($query) {
                $query->where('remarks', 'like', '%rejected%')
                      ->orWhere('remarks', 'like', '%Rejected:%')
                      ->orWhere('remarks', 'like', '%damaged%')
                      ->orWhere('remarks', 'like', '%expired%')
                      ->orWhere('remarks', 'like', '%defective%');
            });
            
        if ($assignedTo !== 'all') {
            $movementsQuery->whereHas('inventoryItem', function($q) use ($assignedTo) {
                $q->where('assigned_to', $assignedTo);
            });
        }
        
        if ($category !== 'all') {
            $movementsQuery->whereHas('inventoryItem', function($q) use ($category) {
                $q->where('category', $category);
            });
        }
        
        if ($dateFrom) {
            $movementsQuery->whereDate('created_at', '>=', $dateFrom);
        }
        
        if ($dateTo) {
            $movementsQuery->whereDate('created_at', '<=', $dateTo);
        }
        
        $rejectedMovements = $movementsQuery->orderBy('created_at', 'desc')->get();

        // Calculate comprehensive summary data
        $totalRejectedItems = $itemsWithRejections->sum('rejected');
        $totalRejectedProducts = $itemsWithRejections->count();
        $totalRejectedMovements = $rejectedMovements->count();
        
        // Calculate rejection rate
        $totalItems = InventoryItem::count();
        $rejectionRate = $totalItems > 0 ? round(($totalRejectedProducts / $totalItems) * 100, 2) : 0;
        
        // Get top rejected categories
        $topRejectedCategories = $itemsWithRejections->groupBy('category')
            ->map(function($items) {
                return [
                    'category' => $items->first()->category,
                    'total_rejected' => $items->sum('rejected'),
                    'product_count' => $items->count()
                ];
            })
            ->sortByDesc('total_rejected')
            ->take(5)
            ->values();

        // Get rejection trends by month (last 6 months)
        $rejectionTrends = InventoryMovement::where('movement_type', 'OUT')
            ->where(function($query) {
                $query->where('remarks', 'like', '%rejected%')
                      ->orWhere('remarks', 'like', '%Rejected:%')
                      ->orWhere('remarks', 'like', '%damaged%')
                      ->orWhere('remarks', 'like', '%expired%')
                      ->orWhere('remarks', 'like', '%defective%');
            })
            ->where('created_at', '>=', now()->subMonths(6))
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(quantity) as total_rejected')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Get available filters
        $availableCategories = InventoryItem::distinct()->pluck('category')->sort()->values();
        $availableAssignedTo = InventoryItem::distinct()->pluck('assigned_to')->sort()->values();

        \Log::info('About to render Inertia view', [
            'view_path' => 'admin/inventory/reports/rejected-supplies',
            'data_keys' => array_keys([
                'itemsWithRejections' => $itemsWithRejections,
                'rejectedMovements' => $rejectedMovements,
                'summary' => [
                    'totalRejectedItems' => $totalRejectedItems,
                    'totalRejectedProducts' => $totalRejectedProducts,
                    'totalRejectedMovements' => $totalRejectedMovements,
                    'rejectionRate' => $rejectionRate,
                    'topRejectedCategories' => $topRejectedCategories,
                    'rejectionTrends' => $rejectionTrends,
                ],
                'filters' => [
                    'assignedTo' => $assignedTo,
                    'category' => $category,
                    'dateFrom' => $dateFrom,
                    'dateTo' => $dateTo,
                    'availableCategories' => $availableCategories,
                    'availableAssignedTo' => $availableAssignedTo,
                ],
            ])
        ]);


        return Inertia::render('admin/inventory/reports/rejected-supplies', [
            'itemsWithRejections' => $itemsWithRejections,
            'rejectedMovements' => $rejectedMovements,
            'summary' => [
                'totalRejectedItems' => $totalRejectedItems,
                'totalRejectedProducts' => $totalRejectedProducts,
                'totalRejectedMovements' => $totalRejectedMovements,
                'rejectionRate' => $rejectionRate,
                'topRejectedCategories' => $topRejectedCategories,
                'rejectionTrends' => $rejectionTrends,
            ],
            'filters' => [
                'assignedTo' => $assignedTo,
                'category' => $category,
                'dateFrom' => $dateFrom,
                'dateTo' => $dateTo,
                'availableCategories' => $availableCategories,
                'availableAssignedTo' => $availableAssignedTo,
            ],
        ]);
    }

    public function exportRejectedSupplies(Request $request)
    {
        $format = $request->get('format', 'pdf');
        $assignedTo = $request->get('assigned_to', 'all');
        $category = $request->get('category', 'all');
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');

        // Build query for items with rejections
        $itemsQuery = InventoryItem::where('rejected', '>', 0);
        
        if ($assignedTo !== 'all') {
            $itemsQuery->where('assigned_to', $assignedTo);
        }
        
        if ($category !== 'all') {
            $itemsQuery->where('category', $category);
        }
        
        $itemsWithRejections = $itemsQuery->orderBy('rejected', 'desc')->get();

        if ($format === 'pdf') {
            $html = view('lab.inventory-report-pdf', [
                'report' => (object)[
                    'report_name' => 'Rejected Supplies Report',
                    'created_at' => now(),
                    'data' => [
                        'itemsWithRejections' => $itemsWithRejections,
                        'summary' => [
                            'totalRejectedItems' => $itemsWithRejections->sum('rejected'),
                            'totalRejectedProducts' => $itemsWithRejections->count(),
                        ]
                    ]
                ],
                'data' => [
                    'itemsWithRejections' => $itemsWithRejections,
                    'summary' => [
                        'totalRejectedItems' => $itemsWithRejections->sum('rejected'),
                        'totalRejectedProducts' => $itemsWithRejections->count(),
                    ]
                ],
            ])->render();

            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
            $pdf->setPaper('A4', 'portrait');

            return $pdf->download('rejected-supplies-report-' . now()->format('Y-m-d-H-i-s') . '.pdf');
        } else {
            // Excel export
            $export = new \App\Exports\InventoryReportExport((object)[
                'data' => [
                    'itemsWithRejections' => $itemsWithRejections,
                    'summary' => [
                        'totalRejectedItems' => $itemsWithRejections->sum('rejected'),
                        'totalRejectedProducts' => $itemsWithRejections->count(),
                    ]
                ]
            ]);
            
            return \Maatwebsite\Excel\Facades\Excel::download(
                $export,
                'rejected-supplies-report-' . now()->format('Y-m-d-H-i-s') . '.xlsx'
            );
        }
    }

    public function movement(Request $request, $id)
    {
        $request->validate([
            'movement_type' => 'required|in:IN,OUT',
            'quantity' => 'required|integer|min:1',
            'remarks' => 'nullable|string',
        ]);

        $item = InventoryItem::findOrFail($id);

        if ($request->movement_type === 'OUT' && $item->stock < $request->quantity) {
            return back()->withErrors(['quantity' => 'Insufficient stock available.']);
        }

        // Determine if this is a rejection based on multiple criteria
        $isRejected = false;
        
        // 1. Check if the frontend explicitly indicates this is a rejection
        if ($request->movement_type === 'OUT' && $request->has('is_rejection')) {
            $isRejected = $request->is_rejection;
        }
        
        // 2. If not explicitly set, check remarks for rejection indicators
        if ($request->movement_type === 'OUT' && !$isRejected && $request->remarks) {
            $remarks = strtolower($request->remarks);
            $isRejected = str_contains($remarks, 'rejected') || 
                         str_contains($remarks, 'damaged') || 
                         str_contains($remarks, 'expired') ||
                         str_contains($remarks, 'defective') ||
                         str_starts_with($remarks, 'rejected:');
        }

        // Debug logging
        \Log::info('Movement Request:', [
            'item_id' => $item->id,
            'item_name' => $item->item_name,
            'movement_type' => $request->movement_type,
            'quantity' => $request->quantity,
            'remarks' => $request->remarks,
            'isRejected' => $isRejected,
            'is_rejection_flag' => $request->is_rejection,
            'before_stock' => $item->stock,
            'before_rejected' => $item->rejected,
            'before_consumed' => $item->consumed,
            'all_request_data' => $request->all(),
        ]);

        // Use database transaction to ensure atomicity
        $result = \DB::transaction(function () use ($item, $request, $isRejected) {
            // Create movement record first
            $movement = InventoryMovement::create([
                'inventory_id' => $item->id,
                'movement_type' => $request->movement_type,
                'quantity' => $request->quantity,
                'remarks' => $request->remarks,
                'created_by' => auth()->user()->name ?? 'System',
            ]);

            // Update item stock and rejected/consumed simultaneously using direct database update
            if ($request->movement_type === 'IN') {
                // For incoming stock
                \DB::table('inventory_items')
                    ->where('id', $item->id)
                    ->update([
                        'stock' => \DB::raw('stock + ' . $request->quantity),
                        'status' => \DB::raw("CASE 
                            WHEN stock + " . $request->quantity . " <= 0 THEN 'Out of Stock'
                            WHEN stock + " . $request->quantity . " <= low_stock_alert THEN 'Low Stock'
                            ELSE 'In Stock'
                        END")
                    ]);
            } else {
                // For outgoing stock (reject or consume)
                if ($isRejected) {
                    \DB::table('inventory_items')
                        ->where('id', $item->id)
                        ->update([
                            'stock' => \DB::raw('stock - ' . $request->quantity),
                            'rejected' => \DB::raw('rejected + ' . $request->quantity),
                            'status' => \DB::raw("CASE 
                                WHEN stock - " . $request->quantity . " <= 0 THEN 'Out of Stock'
                                WHEN stock - " . $request->quantity . " <= low_stock_alert THEN 'Low Stock'
                                ELSE 'In Stock'
                            END")
                        ]);
                } else {
                    \DB::table('inventory_items')
                        ->where('id', $item->id)
                        ->update([
                            'stock' => \DB::raw('stock - ' . $request->quantity),
                            'consumed' => \DB::raw('consumed + ' . $request->quantity),
                            'status' => \DB::raw("CASE 
                                WHEN stock - " . $request->quantity . " <= 0 THEN 'Out of Stock'
                                WHEN stock - " . $request->quantity . " <= low_stock_alert THEN 'Low Stock'
                                ELSE 'In Stock'
                            END")
                        ]);
                }
            }
            
            // Log immediately after update within transaction
            \Log::info('Within Transaction - After Update:', [
                'item_id' => $item->id,
                'movement_type' => $request->movement_type,
                'quantity' => $request->quantity,
                'was_rejected' => $isRejected
            ]);
            
            return $movement;
        });

        // Force refresh the item from database to get latest values
        $item = InventoryItem::findOrFail($id);
        
        // Clear any potential caching
        \Cache::forget('inventory_stats');
        \Cache::forget('inventory_items');
        
        // Verify the update was successful
        \Log::info('After Movement Update - Final Values:', [
            'item_id' => $item->id,
            'item_name' => $item->item_name,
            'after_stock' => $item->stock,
            'after_rejected' => $item->rejected,
            'after_consumed' => $item->consumed,
            'after_status' => $item->status,
            'was_rejected' => $isRejected,
            'quantity_moved' => $request->quantity
        ]);

        // Calculate updated stats for the specific assigned_to group
        $assignedTo = $item->assigned_to;
        $updatedStats = [
            'totalItems' => InventoryItem::byAssignedTo($assignedTo)->count(),
            'lowStock' => InventoryItem::byAssignedTo($assignedTo)->where('status', 'Low Stock')->count(),
            'consumedItems' => InventoryItem::byAssignedTo($assignedTo)->sum('consumed'),
            'rejectedItems' => InventoryItem::byAssignedTo($assignedTo)->sum('rejected'),
        ];
        
        // Ensure the response includes the updated values
        $action = $isRejected ? 'rejected' : 'consumed';
        $message = "Item {$action} successfully! Stock: {$item->stock}, Rejected: {$item->rejected}, Consumed: {$item->consumed}";
        
        // Return back with updated stats for Inertia
        return back()->with([
            'success' => $message,
            'updatedStats' => $updatedStats,
            'updated_item' => [
                'id' => $item->id,
                'stock' => $item->stock,
                'rejected' => $item->rejected,
                'consumed' => $item->consumed,
                'status' => $item->status
            ]
        ]);
    }
}
