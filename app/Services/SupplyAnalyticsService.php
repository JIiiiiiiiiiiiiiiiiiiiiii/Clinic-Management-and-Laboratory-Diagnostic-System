<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\InventoryUsedRejectedItem;
use App\Models\Supply\Supply;
use App\Models\Supply\SupplyTransaction;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SupplyAnalyticsService
{
    /**
     * Get most frequently used supplies
     * Combines data from both inventory_used_rejected_items and supply_transactions
     *
     * @param int $limit Number of results to return
     * @param Carbon|null $startDate Start date for filtering
     * @param Carbon|null $endDate End date for filtering
     * @return Collection Collection of supply data with usage count
     */
    public function getMostUsedSupplies(int $limit = 10, ?Carbon $startDate = null, ?Carbon $endDate = null): Collection
    {
        $usageData = [];

        // Get usage from inventory_used_rejected_items (legacy inventory system)
        $inventoryQuery = InventoryUsedRejectedItem::query()
            ->select(
                'inventory_items.id',
                'inventory_items.item_name as name',
                'inventory_items.item_code as code',
                'inventory_items.category',
                DB::raw('SUM(inventory_used_rejected_items.quantity) as total_quantity'),
                DB::raw('COUNT(*) as usage_count')
            )
            ->join('inventory_items', 'inventory_used_rejected_items.inventory_item_id', '=', 'inventory_items.id')
            ->where('inventory_used_rejected_items.type', 'used');

        // Apply date filtering if provided
        if ($startDate && $endDate) {
            $inventoryQuery->whereBetween('inventory_used_rejected_items.date_used_rejected', [
                $startDate->format('Y-m-d'),
                $endDate->format('Y-m-d')
            ]);
        }

        $inventoryUsage = $inventoryQuery
            ->groupBy('inventory_items.id', 'inventory_items.item_name', 'inventory_items.item_code', 'inventory_items.category')
            ->get();

        // Aggregate inventory usage data
        foreach ($inventoryUsage as $item) {
            $key = $item->code;
            if (!isset($usageData[$key])) {
                $usageData[$key] = [
                    'id' => $item->id,
                    'name' => $item->name,
                    'code' => $item->code,
                    'category' => $item->category,
                    'quantity' => 0,
                    'count' => 0,
                ];
            }
            $usageData[$key]['quantity'] += (int) $item->total_quantity;
            $usageData[$key]['count'] += (int) $item->usage_count;
        }

        // Get usage from supply_transactions (new supply system)
        $supplyQuery = SupplyTransaction::query()
            ->select(
                'supplies.id',
                'supplies.name',
                'supplies.code',
                'supplies.category',
                DB::raw('SUM(supply_transactions.quantity) as total_quantity'),
                DB::raw('COUNT(*) as usage_count')
            )
            ->join('supplies', 'supply_transactions.product_id', '=', 'supplies.id')
            ->where('supply_transactions.type', 'out')
            ->whereIn('supply_transactions.subtype', ['consumed', 'used']);

        // Apply date filtering if provided
        if ($startDate && $endDate) {
            $supplyQuery->whereBetween('supply_transactions.transaction_date', [
                $startDate->format('Y-m-d'),
                $endDate->format('Y-m-d')
            ]);
        }

        $supplyUsage = $supplyQuery
            ->groupBy('supplies.id', 'supplies.name', 'supplies.code', 'supplies.category')
            ->get();

        // Aggregate supply usage data
        foreach ($supplyUsage as $item) {
            $key = $item->code;
            if (!isset($usageData[$key])) {
                $usageData[$key] = [
                    'id' => $item->id,
                    'name' => $item->name,
                    'code' => $item->code,
                    'category' => $item->category,
                    'quantity' => 0,
                    'count' => 0,
                ];
            }
            $usageData[$key]['quantity'] += (int) $item->total_quantity;
            $usageData[$key]['count'] += (int) $item->usage_count;
        }

        // Sort by quantity descending and return top items
        return collect($usageData)
            ->sortByDesc('quantity')
            ->take($limit)
            ->values();
    }

    /**
     * Get least frequently used supplies
     * Combines data from both inventory_items and supplies
     *
     * @param int $limit Number of results to return
     * @param Carbon|null $startDate Start date for filtering
     * @param Carbon|null $endDate End date for filtering
     * @return Collection Collection of supply data with usage count
     */
    public function getLeastUsedSupplies(int $limit = 10, ?Carbon $startDate = null, ?Carbon $endDate = null): Collection
    {
        // Get all inventory items (get all items, we'll filter by usage stats)
        // Try to get items with any status first, but exclude null/empty names
        $allInventoryItems = InventoryItem::whereNotNull('item_name')
            ->whereNotNull('item_code')
            ->where('item_name', '!=', '')
            ->where('item_code', '!=', '')
            ->get(['id', 'item_name as name', 'item_code as code', 'category']);

        // Get all active supplies
        $allSupplies = Supply::active()->get(['id', 'name', 'code', 'category']);

        // Get usage statistics for inventory items
        $inventoryUsageQuery = InventoryUsedRejectedItem::query()
            ->select(
                'inventory_item_id',
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('COUNT(*) as usage_count')
            )
            ->where('type', 'used');

        // Apply date filtering if provided
        if ($startDate && $endDate) {
            $inventoryUsageQuery->whereBetween('date_used_rejected', [
                $startDate->format('Y-m-d'),
                $endDate->format('Y-m-d')
            ]);
        }

        $inventoryUsageStats = $inventoryUsageQuery
            ->groupBy('inventory_item_id')
            ->get()
            ->keyBy('inventory_item_id');

        // Get usage statistics for supplies
        $supplyUsageQuery = SupplyTransaction::query()
            ->select(
                'product_id',
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('COUNT(*) as usage_count')
            )
            ->where('type', 'out')
            ->whereIn('subtype', ['consumed', 'used']);

        // Apply date filtering if provided
        if ($startDate && $endDate) {
            $supplyUsageQuery->whereBetween('transaction_date', [
                $startDate->format('Y-m-d'),
                $endDate->format('Y-m-d')
            ]);
        }

        $supplyUsageStats = $supplyUsageQuery
            ->groupBy('product_id')
            ->get()
            ->keyBy('product_id');

        // Map inventory items with their usage statistics
        $itemsWithUsage = $allInventoryItems->map(function ($item) use ($inventoryUsageStats) {
            $usage = $inventoryUsageStats->get($item->id);
            return [
                'id' => $item->id,
                'name' => $item->name ?? 'Unknown',
                'code' => $item->code ?? 'N/A',
                'category' => $item->category ?? 'Uncategorized',
                'quantity' => $usage ? (int) $usage->total_quantity : 0,
                'count' => $usage ? (int) $usage->usage_count : 0,
            ];
        })->filter(function ($item) {
            // Only include items with valid name and code
            return !empty($item['name']) && !empty($item['code']) && $item['name'] !== 'Unknown' && $item['code'] !== 'N/A';
        });

        // Map supplies with their usage statistics
        $suppliesWithUsage = $allSupplies->map(function ($supply) use ($supplyUsageStats) {
            $usage = $supplyUsageStats->get($supply->id);
            return [
                'id' => $supply->id,
                'name' => $supply->name ?? 'Unknown',
                'code' => $supply->code ?? 'N/A',
                'category' => $supply->category ?? 'Uncategorized',
                'quantity' => $usage ? (int) $usage->total_quantity : 0,
                'count' => $usage ? (int) $usage->usage_count : 0,
            ];
        })->filter(function ($item) {
            // Only include items with valid name and code
            return !empty($item['name']) && !empty($item['code']) && $item['name'] !== 'Unknown' && $item['code'] !== 'N/A';
        });

        // Combine both collections and remove duplicates by code
        $allItemsWithUsage = $itemsWithUsage->concat($suppliesWithUsage)
            ->unique('code')
            ->filter(function ($item) {
                // Ensure we have valid data
                return !empty($item['name']) && !empty($item['code']);
            })
            ->values();

        // If no items found, return empty collection
        if ($allItemsWithUsage->isEmpty()) {
            return collect();
        }

        // Sort by quantity (ascending) and count (ascending), then take the least used
        $sorted = $allItemsWithUsage->sortBy([
            ['quantity', 'asc'],
            ['count', 'asc'],
        ]);

        return $sorted->take($limit)->values();
    }

    /**
     * Get analytics summary for dashboard/reports
     *
     * @param int $topUsedLimit Number of top used supplies to return
     * @param int $topLeastUsedLimit Number of least used supplies to return
     * @param Carbon|null $startDate Start date for filtering
     * @param Carbon|null $endDate End date for filtering
     * @return array Analytics data
     */
    public function getAnalyticsSummary(int $topUsedLimit = 5, int $topLeastUsedLimit = 5, ?Carbon $startDate = null, ?Carbon $endDate = null): array
    {
        return [
            'most_used_supplies' => $this->getMostUsedSupplies($topUsedLimit, $startDate, $endDate),
            'least_used_supplies' => $this->getLeastUsedSupplies($topLeastUsedLimit, $startDate, $endDate),
        ];
    }
}

