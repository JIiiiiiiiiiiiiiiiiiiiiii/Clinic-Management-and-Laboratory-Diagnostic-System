<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use App\Models\Supply\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class EnhancedInventoryController extends Controller
{
    public function index()
    {
        $stats = [
            'total_items' => InventoryItem::count(),
            'low_stock_items' => InventoryItem::lowStock()->count(),
            'out_of_stock_items' => InventoryItem::where('stock', 0)->count(),
            'total_suppliers' => Supplier::count(),
            'total_movements_today' => InventoryMovement::whereDate('created_at', today())->count(),
        ];

        $recentMovements = InventoryMovement::with(['inventoryItem'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $lowStockItems = InventoryItem::lowStock()
            ->orderBy('stock', 'asc')
            ->limit(10)
            ->get();

        return Inertia::render('admin/inventory/enhanced/index', [
            'stats' => $stats,
            'recentMovements' => $recentMovements,
            'lowStockItems' => $lowStockItems,
        ]);
    }

    public function getDetailedReport(Request $request)
    {
        $startDate = $request->get('start_date', Carbon::now()->subMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->format('Y-m-d'));

        $items = InventoryItem::with(['movements' => function ($query) use ($startDate, $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }])
        ->orderBy('item_name')
        ->get();

        $reportData = $items->map(function ($item) {
            $movements = $item->movements;
            $totalIn = $movements->where('movement_type', 'IN')->sum('quantity');
            $totalOut = $movements->where('movement_type', 'OUT')->sum('quantity');
            
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
                'current_stock' => $item->stock,
                'total_in' => $totalIn,
                'total_out' => $totalOut,
                'net_movement' => $totalIn - $totalOut,
                'status' => $status,
            ];
        });

        return response()->json([
            'data' => $reportData,
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function getUsageReport(Request $request)
    {
        $startDate = $request->get('start_date', Carbon::now()->subMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->format('Y-m-d'));

        $usageData = InventoryMovement::with('inventoryItem')
            ->where('movement_type', 'OUT')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('inventory_id, SUM(quantity) as total_usage')
            ->groupBy('inventory_id')
            ->orderBy('total_usage', 'desc')
            ->get()
            ->map(function ($movement) {
                return [
                    'item_name' => $movement->inventoryItem->item_name,
                    'item_code' => $movement->inventoryItem->item_code,
                    'category' => $movement->inventoryItem->category,
                    'total_usage' => $movement->total_usage,
                ];
            });

        return response()->json([
            'data' => $usageData,
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function getSupplierReport()
    {
        $suppliers = Supplier::withCount(['inventoryItems' => function ($query) {
            $query->whereHas('movements');
        }])
        ->orderBy('name')
        ->get();

        $supplierData = $suppliers->map(function ($supplier) {
            return [
                'id' => $supplier->id,
                'name' => $supplier->name,
                'contact_person' => $supplier->contact_person,
                'email' => $supplier->email,
                'phone' => $supplier->phone,
                'items_count' => $supplier->inventory_items_count,
                'is_active' => $supplier->is_active,
            ];
        });

        return response()->json([
            'data' => $supplierData,
        ]);
    }

    public function getInOutFlowReport(Request $request)
    {
        $startDate = $request->get('start_date', Carbon::now()->subMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->format('Y-m-d'));

        $flowData = InventoryMovement::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, movement_type, SUM(quantity) as total_quantity')
            ->groupBy('date', 'movement_type')
            ->orderBy('date')
            ->get()
            ->groupBy('date')
            ->map(function ($dayMovements) {
                $inFlow = $dayMovements->where('movement_type', 'IN')->sum('total_quantity');
                $outFlow = $dayMovements->where('movement_type', 'OUT')->sum('total_quantity');
                
                return [
                    'date' => $dayMovements->first()->date,
                    'in_flow' => $inFlow,
                    'out_flow' => $outFlow,
                    'net_flow' => $inFlow - $outFlow,
                ];
            });

        return response()->json([
            'data' => $flowData->values(),
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function exportReport(Request $request, $type)
    {
        switch ($type) {
            case 'detailed':
                return $this->exportDetailedReport($request);
            case 'usage':
                return $this->exportUsageReport($request);
            case 'supplier':
                return $this->exportSupplierReport();
            case 'flow':
                return $this->exportFlowReport($request);
            default:
                return response()->json(['error' => 'Invalid report type'], 400);
        }
    }

    private function exportDetailedReport(Request $request)
    {
        // Implementation for detailed report export
        // This would typically generate an Excel or PDF file
        return response()->json(['message' => 'Detailed report export not implemented yet']);
    }

    private function exportUsageReport(Request $request)
    {
        // Implementation for usage report export
        return response()->json(['message' => 'Usage report export not implemented yet']);
    }

    private function exportSupplierReport()
    {
        // Implementation for supplier report export
        return response()->json(['message' => 'Supplier report export not implemented yet']);
    }

    private function exportFlowReport(Request $request)
    {
        // Implementation for flow report export
        return response()->json(['message' => 'Flow report export not implemented yet']);
    }
}
