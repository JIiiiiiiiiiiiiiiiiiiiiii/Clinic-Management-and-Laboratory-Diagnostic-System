<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryUsedRejectedItem;
use App\Models\InventoryItem;
use App\Models\User;
use Carbon\Carbon;

class AddSpecificUsedRejectedItems extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Adding specific consumed and rejected items...');

        // Get a user to assign as the user who performed the actions
        $user = User::first();
        if (!$user) {
            $this->command->error('No users found. Please create a user first.');
            return;
        }

        $usedBy = $user->name;
        $userId = $user->id;

        // Define the specific items to add
        $items = [
            [
                'item_code' => 'ALCOHOL-001',
                'item_name' => 'Alcohol 70%',
                'category' => 'Medical Supplies',
                'consumed' => 21,
                'rejected' => 3,
                'last_updated' => '2025-10-29',
            ],
            [
                'item_code' => 'GLOVES-001',
                'item_name' => 'Surgical Gloves',
                'category' => 'Laboratory Equipment',
                'consumed' => 10,
                'rejected' => 0,
                'last_updated' => '2025-10-29',
            ],
            [
                'item_code' => 'Cotton - 001',
                'item_name' => 'Cotton',
                'category' => 'Medical Supplies',
                'consumed' => 3,
                'rejected' => 2,
                'last_updated' => '2025-10-29',
            ],
        ];

        $totalCreated = 0;

        foreach ($items as $itemData) {
            // Find or create the inventory item
            $inventoryItem = InventoryItem::where('item_code', $itemData['item_code'])->first();
            
            if (!$inventoryItem) {
                // Create the inventory item if it doesn't exist
                $inventoryItem = InventoryItem::create([
                    'item_name' => $itemData['item_name'],
                    'item_code' => $itemData['item_code'],
                    'category' => $itemData['category'],
                    'description' => $itemData['item_name'],
                    'unit' => 'pieces',
                    'assigned_to' => 'Doctor & Nurse',
                    'stock' => 100, // Default stock
                    'low_stock_alert' => 10,
                    'consumed' => 0,
                    'rejected' => 0,
                    'status' => 'In Stock',
                    'unit_cost' => 0.00,
                ]);
                $this->command->info("Created inventory item: {$itemData['item_name']}");
            }

            // Add consumed items
            if ($itemData['consumed'] > 0) {
                InventoryUsedRejectedItem::create([
                    'inventory_item_id' => $inventoryItem->id,
                    'type' => 'used',
                    'quantity' => $itemData['consumed'],
                    'reason' => 'Medical procedure usage',
                    'location' => $inventoryItem->assigned_to ?? 'Doctor & Nurse',
                    'used_by' => $usedBy,
                    'user_id' => $userId,
                    'date_used_rejected' => $itemData['last_updated'],
                    'remarks' => 'Item consumed during medical procedures',
                    'reference_number' => 'CONSUMED-' . $itemData['item_code'] . '-' . date('Ymd'),
                ]);
                $totalCreated++;
            }

            // Add rejected items
            if ($itemData['rejected'] > 0) {
                InventoryUsedRejectedItem::create([
                    'inventory_item_id' => $inventoryItem->id,
                    'type' => 'rejected',
                    'quantity' => $itemData['rejected'],
                    'reason' => 'Quality control rejection',
                    'location' => $inventoryItem->assigned_to ?? 'Doctor & Nurse',
                    'used_by' => $usedBy,
                    'user_id' => $userId,
                    'date_used_rejected' => $itemData['last_updated'],
                    'remarks' => 'Item rejected due to quality issues',
                    'reference_number' => 'REJECTED-' . $itemData['item_code'] . '-' . date('Ymd'),
                ]);
                $totalCreated++;
            }

            // Update the inventory item's consumed and rejected totals
            $inventoryItem->update([
                'consumed' => $inventoryItem->consumed + $itemData['consumed'],
                'rejected' => $inventoryItem->rejected + $itemData['rejected'],
            ]);
        }

        $this->command->info("Successfully added {$totalCreated} consumed/rejected item records to the database.");
        $this->command->info('Items added:');
        foreach ($items as $item) {
            $this->command->info("- {$item['item_name']}: {$item['consumed']} consumed, {$item['rejected']} rejected");
        }
    }
}
