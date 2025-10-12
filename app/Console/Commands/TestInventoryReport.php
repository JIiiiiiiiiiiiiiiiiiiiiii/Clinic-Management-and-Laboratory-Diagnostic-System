<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use Carbon\Carbon;

class TestInventoryReport extends Command
{
    protected $signature = 'inventory:test-report {--type=incoming-outgoing} {--range=monthly}';
    protected $description = 'Test inventory report logic';

    public function handle()
    {
        $reportType = $this->option('type');
        $dateRange = $this->option('range');
        
        $this->info("Testing {$reportType} report with {$dateRange} range...");

        // Calculate date range (same logic as controller)
        $dateFilter = $this->calculateDateRange($dateRange, null, null);
        
        $this->info("Date Filter: {$dateFilter['start']} to {$dateFilter['end']}");

        // Get movements
        $movementsQuery = InventoryMovement::with('inventoryItem');
        
        if ($dateFilter['start'] && $dateFilter['end']) {
            $movementsQuery->whereBetween('created_at', [$dateFilter['start'], $dateFilter['end']]);
        }

        $movements = $movementsQuery->orderBy('created_at', 'desc')->get();

        $this->info("Found {$movements->count()} movements in date range");

        // Calculate statistics
        $totalInMovements = $movements->where('movement_type', 'IN')->sum('quantity');
        $totalOutMovements = $movements->where('movement_type', 'OUT')->sum('quantity');
        $totalMovements = $movements->count();

        $this->info("IN Movements: {$totalInMovements} (quantity)");
        $this->info("OUT Movements: {$totalOutMovements} (quantity)");
        $this->info("Total Movement Records: {$totalMovements}");

        if ($reportType === 'incoming-outgoing') {
            $totalItems = $totalMovements;
            $totalConsumed = $totalInMovements; // Incoming movements
            $totalRejected = $totalOutMovements; // Outgoing movements
            $lowStockItems = $movements->where('movement_type', 'OUT')->count();

            $this->info("=== INCOMING & OUTGOING REPORT ===");
            $this->info("Total Items (Movements): {$totalItems}");
            $this->info("Incoming Movements: {$totalConsumed}");
            $this->info("Outgoing Movements: {$totalRejected}");
            $this->info("Outgoing Count: {$lowStockItems}");
        } else {
            // For consumed/rejected reports
            $itemsQuery = InventoryItem::query();
            if ($dateFilter['start'] && $dateFilter['end']) {
                $itemsQuery->whereBetween('created_at', [$dateFilter['start'], $dateFilter['end']]);
            }
            
            $totalItems = $itemsQuery->count();
            $totalConsumed = $itemsQuery->sum('consumed');
            $totalRejected = $itemsQuery->sum('rejected');
            $lowStockItems = $itemsQuery->clone()->lowStock()->count();

            $this->info("=== CONSUMED & REJECTED REPORT ===");
            $this->info("Total Items: {$totalItems}");
            $this->info("Items Consumed: {$totalConsumed}");
            $this->info("Items Rejected: {$totalRejected}");
            $this->info("Low Stock Items: {$lowStockItems}");
        }

        // Show sample movements
        $this->info("\n=== SAMPLE MOVEMENTS ===");
        $movements->take(5)->each(function($movement) {
            $this->line("ID: {$movement->id}, Type: {$movement->movement_type}, Qty: {$movement->quantity}, Date: {$movement->created_at->format('Y-m-d H:i:s')}");
        });
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
}
