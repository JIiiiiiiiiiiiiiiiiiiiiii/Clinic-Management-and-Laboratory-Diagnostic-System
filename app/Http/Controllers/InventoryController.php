<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use App\Models\InventoryUsedRejectedItem;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index()
    {
        // Update all inventory item statuses to ensure they're in sync
        $this->updateAllInventoryStatuses();
        
        // Calculate consumed and rejected items for today
        // Get movements from today that represent consumption and rejection
        $consumedToday = InventoryMovement::whereDate('created_at', today())
            ->where('movement_type', 'OUT')
            ->where(function($query) {
                $query->where('remarks', 'like', '%Consumed%')
                      ->orWhere('remarks', 'like', '%Used%')
                      ->orWhere('remarks', 'like', '%Consume%');
            })
            ->sum('quantity');
            
        $rejectedToday = InventoryMovement::whereDate('created_at', today())
            ->where('movement_type', 'OUT')
            ->where(function($query) {
                $query->where('remarks', 'like', '%Rejected%')
                      ->orWhere('remarks', 'like', '%Reject%');
            })
            ->sum('quantity');

        // Enhanced inventory dashboard with clickable cards
        $stats = [
            'total_items' => InventoryItem::count(),
            'low_stock_items' => InventoryItem::lowStock()->count(),
            'out_of_stock_items' => InventoryItem::where('stock', 0)->count(),
            'total_suppliers' => 0, // Set to 0 if no suppliers table
            'total_movements_today' => InventoryMovement::whereDate('created_at', today())->count(),
            'consumed_today' => $consumedToday,
            'rejected_today' => $rejectedToday,
        ];
        
        // Additional debugging for low stock calculation
        $allItems = InventoryItem::all();
        $lowStockItemsDebug = $allItems->filter(function($item) {
            return $item->stock <= $item->low_stock_alert && $item->stock > 0;
        });
        
        \Log::info('Low Stock Debug Details:', [
            'low_stock_scope_count' => InventoryItem::lowStock()->count(),
            'manual_filter_count' => $lowStockItemsDebug->count(),
            'low_stock_items_manual' => $lowStockItemsDebug->map(function($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->item_name,
                    'code' => $item->item_code,
                    'stock' => $item->stock,
                    'low_stock_alert' => $item->low_stock_alert,
                    'assigned_to' => $item->assigned_to,
                ];
            })->toArray(),
            'all_items_with_alerts' => $allItems->map(function($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->item_name,
                    'code' => $item->item_code,
                    'stock' => $item->stock,
                    'low_stock_alert' => $item->low_stock_alert,
                    'is_low_stock' => $item->stock <= $item->low_stock_alert && $item->stock > 0,
                    'assigned_to' => $item->assigned_to,
                ];
            })->toArray()
        ]);

        $recentMovements = InventoryMovement::with(['inventoryItem'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $lowStockItems = InventoryItem::lowStock()
            ->orderBy('stock', 'asc')
            ->limit(10)
            ->get();

        // Debug logging for stats
        \Log::info('Enhanced Inventory Index Stats:', [
            'total_items' => $stats['total_items'],
            'low_stock_items' => $stats['low_stock_items'],
            'out_of_stock_items' => $stats['out_of_stock_items'],
            'consumed_today' => $stats['consumed_today'],
            'rejected_today' => $stats['rejected_today'],
            'lowStockItems_count' => $lowStockItems->count(),
        ]);
        
        // Debug logging for low stock items details
        if ($lowStockItems->count() > 0) {
            \Log::info('Low Stock Items Details:', $lowStockItems->map(function($item) {
                return [
                    'id' => $item->id,
                    'item_name' => $item->item_name,
                    'item_code' => $item->item_code,
                    'stock' => $item->stock,
                    'low_stock_alert' => $item->low_stock_alert,
                    'status' => $item->status,
                    'assigned_to' => $item->assigned_to,
                ];
            })->toArray());
        }

        // Get Doctor & Nurse Items
        $doctorNurseItems = InventoryItem::byAssignedTo('Doctor & Nurse')->get();
        $transformedDoctorNurseItems = $doctorNurseItems->map(function($item) {
            // Calculate status dynamically based on current stock and low stock alert
            $status = 'in_stock';
            if ($item->stock <= 0) {
                $status = 'out_of_stock';
            } elseif ($item->stock <= $item->low_stock_alert) {
                $status = 'low_stock';
            }
            
            return [
                'id' => $item->id,
                'item_name' => $item->item_name,
                'item_code' => $item->item_code,
                'category' => $item->category,
                'stock' => $item->stock,
                'low_stock_alert' => $item->low_stock_alert,
                'location' => $item->location ?? 'Main Storage',
                'assigned_to' => $item->assigned_to,
                'status' => $status,
                'last_updated' => $item->updated_at->toISOString(),
            ];
        });

        // Get Med Tech Items
        $medTechItems = InventoryItem::byAssignedTo('Med Tech')->get();
        $transformedMedTechItems = $medTechItems->map(function($item) {
            // Calculate status dynamically based on current stock and low stock alert
            $status = 'in_stock';
            if ($item->stock <= 0) {
                $status = 'out_of_stock';
            } elseif ($item->stock <= $item->low_stock_alert) {
                $status = 'low_stock';
            }
            
            return [
                'id' => $item->id,
                'item_name' => $item->item_name,
                'item_code' => $item->item_code,
                'category' => $item->category,
                'stock' => $item->stock,
                'low_stock_alert' => $item->low_stock_alert,
                'location' => $item->location ?? 'Main Storage',
                'assigned_to' => $item->assigned_to,
                'status' => $status,
                'last_updated' => $item->updated_at->toISOString(),
            ];
        });

        return Inertia::render('admin/inventory/index', [
            'stats' => $stats,
            'recentMovements' => $recentMovements,
            'lowStockItems' => $lowStockItems,
            'doctorNurseItems' => $transformedDoctorNurseItems,
            'medTechItems' => $transformedMedTechItems,
        ]);
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

        return redirect()->route('admin.inventory.supply-items')->with('success', 'Product deleted successfully!');
    }

    public function supplyItems()
    {
        // Get Doctor & Nurse Items with proper data transformation
        $doctorNurseItems = InventoryItem::byAssignedTo('Doctor & Nurse')->get()->map(function($item) {
            // Calculate status dynamically based on current stock and low stock alert
            $status = 'In Stock';
            if ($item->stock <= 0) {
                $status = 'Out of Stock';
            } elseif ($item->stock <= $item->low_stock_alert) {
                $status = 'Low Stock';
            }
            
            return [
                'id' => $item->id,
                'item_name' => $item->item_name,
                'item_code' => $item->item_code,
                'category' => $item->category,
                'unit' => $item->unit ?? 'pieces',
                'assigned_to' => $item->assigned_to,
                'stock' => $item->stock,
                'consumed' => $item->consumed ?? 0,
                'rejected' => $item->rejected ?? 0,
                'status' => $status,
                'low_stock_alert' => $item->low_stock_alert,
                'location' => $item->location ?? 'Main Storage',
                'last_updated' => $item->updated_at->toISOString(),
            ];
        });

        // Get Med Tech Items with proper data transformation
        $medTechItems = InventoryItem::byAssignedTo('Med Tech')->get()->map(function($item) {
            // Calculate status dynamically based on current stock and low stock alert
            $status = 'In Stock';
            if ($item->stock <= 0) {
                $status = 'Out of Stock';
            } elseif ($item->stock <= $item->low_stock_alert) {
                $status = 'Low Stock';
            }
            
            return [
                'id' => $item->id,
                'item_name' => $item->item_name,
                'item_code' => $item->item_code,
                'category' => $item->category,
                'unit' => $item->unit ?? 'pieces',
                'assigned_to' => $item->assigned_to,
                'stock' => $item->stock,
                'consumed' => $item->consumed ?? 0,
                'rejected' => $item->rejected ?? 0,
                'status' => $status,
                'low_stock_alert' => $item->low_stock_alert,
                'location' => $item->location ?? 'Main Storage',
                'last_updated' => $item->updated_at->toISOString(),
            ];
        });

        // Get Consumed/Rejected Items (items that have been consumed or rejected)
        $consumedRejectedItems = InventoryItem::where(function($query) {
            $query->where('consumed', '>', 0)
                  ->orWhere('rejected', '>', 0);
        })->get()->map(function($item) {
            return [
                'id' => $item->id,
                'item_name' => $item->item_name,
                'item_code' => $item->item_code,
                'category' => $item->category,
                'consumed' => $item->consumed ?? 0,
                'rejected' => $item->rejected ?? 0,
                'total_used' => ($item->consumed ?? 0) + ($item->rejected ?? 0),
                'last_updated' => $item->updated_at->toISOString(),
            ];
        });
        
        // Calculate combined stats
        $totalItems = InventoryItem::count();
        $lowStockItems = InventoryItem::lowStock()->count();
        $outOfStockItems = InventoryItem::where('stock', 0)->count();
        $totalConsumed = InventoryItem::sum('consumed');
        $totalRejected = InventoryItem::sum('rejected');

        $stats = [
            'totalItems' => $totalItems,
            'lowStock' => $lowStockItems,
            'outOfStock' => $outOfStockItems,
            'consumedItems' => $totalConsumed,
            'rejectedItems' => $totalRejected,
        ];

        // Get active staff members for dropdown
        $staffMembers = User::where('is_active', true)
            ->whereIn('role', ['doctor', 'nurse', 'medtech', 'admin', 'hospital_staff', 'hospital_admin'])
            ->select('id', 'name', 'role', 'employee_id')
            ->orderBy('name')
            ->get();

        // Get all IN movements for all items
        $batchMovements = InventoryMovement::where('movement_type', 'IN')
            ->with(['inventoryItem' => function($query) {
                $query->select('id', 'item_name', 'item_code', 'unit');
            }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->filter(function($movement) {
                // Filter out movements where inventory item doesn't exist
                return $movement->inventoryItem !== null;
            })
            ->map(function($movement) {
                return [
                    'id' => $movement->id,
                    'item_id' => $movement->inventory_id,
                    'item_name' => $movement->inventoryItem->item_name ?? 'N/A',
                    'item_code' => $movement->inventoryItem->item_code ?? 'N/A',
                    'unit' => $movement->inventoryItem->unit ?? 'pieces',
                    'quantity' => $movement->quantity,
                    'expiry_date' => $movement->expiry_date ? $movement->expiry_date->format('Y-m-d') : null,
                    'remarks' => $movement->remarks,
                    'created_at' => $movement->created_at->format('Y-m-d H:i:s'),
                    'created_by' => $movement->created_by,
                ];
            })
            ->values(); // Re-index array after filter

        return Inertia::render('Inventory/SupplyItems', [
            'doctorNurseItems' => $doctorNurseItems,
            'medTechItems' => $medTechItems,
            'consumedRejectedItems' => $consumedRejectedItems,
            'batchMovements' => $batchMovements,
            'stats' => $stats,
            'staffMembers' => $staffMembers,
        ]);
    }

    public function addMovement($id)
    {
        $item = InventoryItem::findOrFail($id);
        
        // Add department information based on assigned_to
        $item->department = $item->assigned_to;
        
        return Inertia::render('Inventory/AddMovement', [
            'item' => $item,
        ]);
    }

    public function storeMovement(Request $request, $id)
    {
        $request->validate([
            'movement_type' => 'required|in:IN,OUT',
            'quantity' => 'required|integer|min:1',
            'remarks' => 'nullable|string|max:500',
            'expiry_date' => 'nullable|date',
        ]);

        $item = InventoryItem::findOrFail($id);

        if ($request->movement_type === 'OUT' && $item->stock < $request->quantity) {
            return back()->withErrors(['quantity' => 'Insufficient stock available.']);
        }

        // Get the current user or default to system
        $createdBy = auth()->user() ? auth()->user()->name : 'System';

        // Update item stock using model methods (which create movement records)
        if ($request->movement_type === 'IN') {
            $item->addStock(
                $request->quantity, 
                $request->remarks ?? 'Stock Added', 
                $createdBy,
                $request->expiry_date
            );
        } else {
            $item->removeStock(
                $request->quantity, 
                false, 
                $request->remarks ?? 'Stock Removed', 
                $createdBy
            );
        }

        return redirect()->route('admin.inventory.supply-items')->with('success', 'Movement recorded successfully!');
    }

    public function consumeItem(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:500',
        ]);

        $item = InventoryItem::findOrFail($id);

        if ($item->stock < $request->quantity) {
            return back()->withErrors(['quantity' => 'Insufficient stock available.']);
        }

        // Update stock using model method (which creates movement record)
        $item->removeStock($request->quantity, false, 'Consumed: ' . ($request->reason ?? 'No reason provided'), auth()->user()->name ?? 'System');

        return redirect()->route('admin.inventory.supply-items')->with('success', 'Item consumed successfully!');
    }

    public function rejectItem(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|string|max:500',
        ]);

        $item = InventoryItem::findOrFail($id);

        if ($item->stock < $request->quantity) {
            return back()->withErrors(['quantity' => 'Insufficient stock available.']);
        }

        // Update stock using model method (which creates movement record)
        $item->removeStock($request->quantity, true, 'Rejected: ' . $request->reason, auth()->user()->name ?? 'System');

        return redirect()->route('admin.inventory.supply-items')->with('success', 'Item rejected successfully!');
    }

    public function getItemMovements($id)
    {
        $item = InventoryItem::findOrFail($id);
        
        // Get all IN movements (stock additions) with expiry dates
        $movements = InventoryMovement::where('inventory_id', $id)
            ->where('movement_type', 'IN')
            ->whereNotNull('expiry_date')
            ->orderBy('expiry_date', 'asc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($movement) {
                return [
                    'id' => $movement->id,
                    'quantity' => $movement->quantity,
                    'expiry_date' => $movement->expiry_date ? $movement->expiry_date->format('Y-m-d') : null,
                    'remarks' => $movement->remarks,
                    'created_at' => $movement->created_at->format('Y-m-d H:i:s'),
                    'created_by' => $movement->created_by,
                ];
            });

        return response()->json([
            'movements' => $movements,
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
            'expiry_date' => 'nullable|date',
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
                'expiry_date' => $request->expiry_date ?? null,
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
                
                // Create record in inventory_used_rejected_items table
                $usedBy = auth()->user()->name ?? 'System';
                $userId = auth()->id() ?? 1;
                $reason = null;
                
                // Extract reason from remarks
                if ($request->remarks) {
                    $reason = preg_replace('/^(Consumed|Rejected):\s*/i', '', $request->remarks);
                    if (empty(trim($reason))) {
                        $reason = $request->remarks;
                    }
                }
                
                // Get updated item for location
                $updatedItem = \App\Models\InventoryItem::find($item->id);
                
                \App\Models\InventoryUsedRejectedItem::create([
                    'inventory_item_id' => $item->id,
                    'type' => $isRejected ? 'rejected' : 'used',
                    'quantity' => $request->quantity,
                    'reason' => $reason,
                    'location' => $updatedItem->location ?? $updatedItem->assigned_to ?? null,
                    'used_by' => $usedBy,
                    'user_id' => $userId,
                    'date_used_rejected' => $request->date ?? now()->toDateString(),
                    'remarks' => $request->remarks ?? ($isRejected ? 'Item Rejected' : 'Item Consumed'),
                    'reference_number' => null,
                ]);
            }
            
            // Log immediately after update within transaction
            \Log::info('Within Transaction - After Update:', [
                'item_id' => $item->id,
                'movement_type' => $request->movement_type,
                'quantity' => $request->quantity,
                'was_rejected' => $isRejected,
                'used_rejected_record_created' => $request->movement_type === 'OUT'
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

    public function consume(Request $request, $id)
    {
        $item = InventoryItem::findOrFail($id);

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1|max:' . $item->stock,
            'notes' => 'nullable|string|max:255',
            'handled_by' => 'nullable|string|max:100',
        ]);

        // Update stock using model method (which creates movement record)
        $item->removeStock($validated['quantity'], false, 'Consumed: ' . ($validated['notes'] ?? 'No reason provided'), $validated['handled_by'] ?? auth()->user()->name ?? 'System');

        // Force refresh the item from database
        $item = InventoryItem::findOrFail($id);

        return back()->with('success', "Item consumed successfully! Stock: {$item->stock}, Consumed: {$item->consumed}");
    }

    public function reject(Request $request, $id)
    {
        $item = InventoryItem::findOrFail($id);

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1|max:' . $item->stock,
            // Accept either 'notes' or 'reason' from different UIs
            'notes' => 'nullable|string|max:255',
            'reason' => 'nullable|string|max:500',
            'handled_by' => 'nullable|string|max:100',
        ]);

        // Normalize reason field across UIs
        $reasonText = $validated['notes'] ?? $validated['reason'] ?? 'No reason provided';

        // Update stock using model method (which creates movement record)
        $item->removeStock($validated['quantity'], true, 'Rejected: ' . $reasonText, $validated['handled_by'] ?? auth()->user()->name ?? 'System');

        // Force refresh the item from database
        $item = InventoryItem::findOrFail($id);

        return back()->with('success', "Item rejected successfully! Stock: {$item->stock}, Rejected: {$item->rejected}");
    }

    /**
     * Debug endpoint to check low stock items
     */
    public function debugLowStock()
    {
        $lowStockItems = InventoryItem::lowStock()
            ->orderBy('stock', 'asc')
            ->get();
            
        $allItems = InventoryItem::all();
        
        $debugInfo = [
            'total_items' => $allItems->count(),
            'low_stock_count' => $lowStockItems->count(),
            'low_stock_items' => $lowStockItems->map(function($item) {
                return [
                    'id' => $item->id,
                    'item_name' => $item->item_name,
                    'item_code' => $item->item_code,
                    'category' => $item->category,
                    'stock' => $item->stock,
                    'low_stock_alert' => $item->low_stock_alert,
                    'status' => $item->status,
                    'assigned_to' => $item->assigned_to,
                    'location' => $item->location,
                    'difference' => $item->stock - $item->low_stock_alert,
                ];
            })->toArray(),
            'all_items_summary' => $allItems->map(function($item) {
                return [
                    'id' => $item->id,
                    'item_name' => $item->item_name,
                    'item_code' => $item->item_code,
                    'stock' => $item->stock,
                    'low_stock_alert' => $item->low_stock_alert,
                    'is_low_stock' => $item->stock <= $item->low_stock_alert,
                    'status' => $item->status,
                ];
            })->toArray()
        ];
        
        return response()->json($debugInfo, 200, [], JSON_PRETTY_PRINT);
    }

    /**
     * Debug endpoint to check inventory movements
     */
    public function debugMovements()
    {
        $movements = InventoryMovement::with('inventoryItem')->orderBy('created_at', 'desc')->get();
        $incoming = InventoryMovement::where('movement_type', 'IN')->sum('quantity');
        $outgoing = InventoryMovement::where('movement_type', 'OUT')->sum('quantity');
        
        $debugInfo = [
            'total_movements' => $movements->count(),
            'incoming_total' => $incoming,
            'outgoing_total' => $outgoing,
            'net_total' => $incoming - $outgoing,
            'movements' => $movements->map(function($movement) {
                return [
                    'id' => $movement->id,
                    'type' => $movement->movement_type,
                    'quantity' => $movement->quantity,
                    'remarks' => $movement->remarks,
                    'item_name' => $movement->inventoryItem ? $movement->inventoryItem->item_name : 'No Item',
                    'item_code' => $movement->inventoryItem ? $movement->inventoryItem->item_code : 'No Code',
                    'created_at' => $movement->created_at->format('Y-m-d H:i:s'),
                ];
            })->toArray()
        ];
        return response()->json($debugInfo, 200, [], JSON_PRETTY_PRINT);
    }

    /**
     * Test method to create a sample movement
     */
    public function testMovement()
    {
        $item = InventoryItem::first();
        if (!$item) {
            return response()->json(['error' => 'No inventory items found'], 404);
        }

        $beforeCount = InventoryMovement::count();
        
        // Test adding stock
        $item->addStock(5, 'Test movement - stock added', 'Test User');
        
        $afterCount = InventoryMovement::count();
        
        return response()->json([
            'item_name' => $item->item_name,
            'item_code' => $item->item_code,
            'before_movements' => $beforeCount,
            'after_movements' => $afterCount,
            'movement_created' => $afterCount > $beforeCount,
            'latest_movement' => InventoryMovement::latest()->first()
        ], 200, [], JSON_PRETTY_PRINT);
    }

    /**
     * Update all inventory item statuses to ensure they're in sync with current stock levels
     */
    private function updateAllInventoryStatuses()
    {
        try {
            $items = InventoryItem::all();
            $updatedCount = 0;
            
            foreach ($items as $item) {
                $oldStatus = $item->status;
                $newStatus = 'In Stock';
                
                if ($item->stock <= 0) {
                    $newStatus = 'Out of Stock';
                } elseif ($item->stock <= $item->low_stock_alert) {
                    $newStatus = 'Low Stock';
                }
                
                // Only update if status has changed
                if ($oldStatus !== $newStatus) {
                    $item->update(['status' => $newStatus]);
                    $updatedCount++;
                }
            }
            
            if ($updatedCount > 0) {
                \Log::info("Updated {$updatedCount} inventory item statuses to sync with stock levels");
            }
            
        } catch (\Exception $e) {
            \Log::error('Error updating inventory statuses: ' . $e->getMessage());
        }
    }
}