<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Supply\Supply;
use App\Models\Supply\SupplyStockLevel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class SupplyStockController extends Controller
{
    public function index()
    {
        $supplies = Supply::with(['stockLevels'])
            ->orderBy('name')
            ->get()
            ->map(function ($supply) {
                return [
                    'id' => $supply->id,
                    'name' => $supply->name,
                    'code' => $supply->code,
                    'category' => $supply->category,
                    'unit_of_measure' => $supply->unit_of_measure,
                    'current_stock' => $supply->current_stock,
                    'available_stock' => $supply->available_stock,
                    'minimum_stock_level' => $supply->minimum_stock_level,
                    'maximum_stock_level' => $supply->maximum_stock_level,
                    'is_low_stock' => $supply->is_low_stock,
                    'is_out_of_stock' => $supply->is_out_of_stock,
                    'total_value' => $supply->total_value,
                    'stock_levels' => $supply->stockLevels,
                ];
            });

        return Inertia::render('admin/inventory/supply-stock/index', [
            'supplies' => $supplies,
        ]);
    }

    public function getLowStock()
    {
        $lowStockSupplies = SupplyStockLevel::getLowStockProducts();
        
        return response()->json($lowStockSupplies);
    }

    public function getExpiringSoon(Request $request)
    {
        $days = $request->get('days', 30);
        $expiringSupplies = SupplyStockLevel::getExpiringSoon($days);
        
        return response()->json($expiringSupplies);
    }

    public function getExpiredStock()
    {
        $expiredSupplies = SupplyStockLevel::getExpiredStock();
        
        return response()->json($expiredSupplies);
    }

    public function getStockByLot(Request $request, $supplyId)
    {
        $supply = Supply::findOrFail($supplyId);
        $lotNumber = $request->get('lot_number');
        $expiryDate = $request->get('expiry_date');

        $stockLevel = $supply->getStockByLot($lotNumber, $expiryDate);
        
        return response()->json($stockLevel);
    }

    public function getStockHistory($supplyId)
    {
        $supply = Supply::with(['transactions' => function ($query) {
            $query->orderBy('transaction_date', 'desc');
        }])->findOrFail($supplyId);

        return response()->json($supply->transactions);
    }

    public function getStockReport(Request $request)
    {
        $startDate = $request->get('start_date', Carbon::now()->subMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', Carbon::now()->format('Y-m-d'));

        $supplies = Supply::with(['stockLevels', 'transactions' => function ($query) use ($startDate, $endDate) {
            $query->whereBetween('transaction_date', [$startDate, $endDate]);
        }])->get();

        $reportData = $supplies->map(function ($supply) {
            $transactions = $supply->transactions;
            $totalIn = $transactions->where('type', 'in')->sum('quantity');
            $totalOut = $transactions->where('type', 'out')->sum('quantity');
            
            return [
                'id' => $supply->id,
                'name' => $supply->name,
                'code' => $supply->code,
                'category' => $supply->category,
                'current_stock' => $supply->current_stock,
                'available_stock' => $supply->available_stock,
                'minimum_stock_level' => $supply->minimum_stock_level,
                'maximum_stock_level' => $supply->maximum_stock_level,
                'is_low_stock' => $supply->is_low_stock,
                'is_out_of_stock' => $supply->is_out_of_stock,
                'total_value' => $supply->total_value,
                'total_in' => $totalIn,
                'total_out' => $totalOut,
                'net_movement' => $totalIn - $totalOut,
                'stock_levels' => $supply->stockLevels,
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

    public function getStockAlerts()
    {
        $alerts = [
            'low_stock' => SupplyStockLevel::getLowStockProducts(),
            'expiring_soon' => SupplyStockLevel::getExpiringSoon(30),
            'expired' => SupplyStockLevel::getExpiredStock(),
        ];

        return response()->json($alerts);
    }

    public function updateStockLevel(Request $request, $stockLevelId)
    {
        $stockLevel = SupplyStockLevel::findOrFail($stockLevelId);

        $request->validate([
            'current_stock' => 'required|integer|min:0',
            'reserved_stock' => 'required|integer|min:0',
            'average_cost' => 'required|numeric|min:0',
        ]);

        $stockLevel->update([
            'current_stock' => $request->current_stock,
            'reserved_stock' => $request->reserved_stock,
            'available_stock' => $request->current_stock - $request->reserved_stock,
            'average_cost' => $request->average_cost,
            'total_value' => $request->current_stock * $request->average_cost,
            'last_updated' => now(),
        ]);

        return response()->json(['message' => 'Stock level updated successfully']);
    }

    public function reserveStock(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:supplies,id',
            'quantity' => 'required|integer|min:1',
            'lot_number' => 'nullable|string',
            'expiry_date' => 'nullable|date',
        ]);

        $supply = Supply::findOrFail($request->product_id);
        
        if ($supply->available_stock < $request->quantity) {
            return response()->json(['error' => 'Insufficient available stock'], 400);
        }

        // Find the appropriate stock level to reserve from
        $stockLevel = $supply->getStockByLot($request->lot_number, $request->expiry_date);
        
        if (!$stockLevel) {
            return response()->json(['error' => 'Stock level not found'], 404);
        }

        if ($stockLevel->available_stock < $request->quantity) {
            return response()->json(['error' => 'Insufficient stock in this lot'], 400);
        }

        $stockLevel->update([
            'reserved_stock' => $stockLevel->reserved_stock + $request->quantity,
            'available_stock' => $stockLevel->available_stock - $request->quantity,
        ]);

        return response()->json(['message' => 'Stock reserved successfully']);
    }

    public function releaseReservation(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:supplies,id',
            'quantity' => 'required|integer|min:1',
            'lot_number' => 'nullable|string',
            'expiry_date' => 'nullable|date',
        ]);

        $supply = Supply::findOrFail($request->product_id);
        $stockLevel = $supply->getStockByLot($request->lot_number, $request->expiry_date);
        
        if (!$stockLevel) {
            return response()->json(['error' => 'Stock level not found'], 404);
        }

        $releaseQuantity = min($request->quantity, $stockLevel->reserved_stock);
        
        $stockLevel->update([
            'reserved_stock' => $stockLevel->reserved_stock - $releaseQuantity,
            'available_stock' => $stockLevel->available_stock + $releaseQuantity,
        ]);

        return response()->json(['message' => 'Reservation released successfully']);
    }
}
