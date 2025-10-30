<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryUsedRejectedItem;
use App\Models\InventoryItem;
use App\Models\User;
use Carbon\Carbon;

class InventoryUsedRejectedSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some inventory items to work with
        $inventoryItems = InventoryItem::take(5)->get();
        
        if ($inventoryItems->isEmpty()) {
            $this->command->info('No inventory items found. Please run the inventory seeder first.');
            return;
        }

        // Get a user to assign as the user who performed the actions
        $user = User::first();
        if (!$user) {
            $this->command->info('No users found. Please create a user first.');
            return;
        }

        $usedBy = $user->name;
        $userId = $user->id;

        // Create sample used items
        $usedItems = [
            [
                'inventory_item_id' => $inventoryItems[0]->id,
                'quantity' => 5,
                'reason' => 'Patient treatment',
                'location' => 'Emergency Room',
                'remarks' => 'Used for emergency patient care',
                'reference_number' => 'USED-001',
            ],
            [
                'inventory_item_id' => $inventoryItems[1]->id,
                'quantity' => 3,
                'reason' => 'Routine procedure',
                'location' => 'Operating Room',
                'remarks' => 'Used during surgery',
                'reference_number' => 'USED-002',
            ],
            [
                'inventory_item_id' => $inventoryItems[2]->id,
                'quantity' => 2,
                'reason' => 'Laboratory testing',
                'location' => 'Lab',
                'remarks' => 'Used for blood sample collection',
                'reference_number' => 'USED-003',
            ],
        ];

        // Create sample rejected items
        $rejectedItems = [
            [
                'inventory_item_id' => $inventoryItems[0]->id,
                'quantity' => 1,
                'reason' => 'Expired',
                'location' => 'Storage Room',
                'remarks' => 'Item past expiration date',
                'reference_number' => 'REJ-001',
            ],
            [
                'inventory_item_id' => $inventoryItems[1]->id,
                'quantity' => 2,
                'reason' => 'Damaged packaging',
                'location' => 'Storage Room',
                'remarks' => 'Package was torn during delivery',
                'reference_number' => 'REJ-002',
            ],
        ];

        // Add more rejected items if we have enough inventory items
        if ($inventoryItems->count() > 2) {
            $rejectedItems[] = [
                'inventory_item_id' => $inventoryItems[2]->id,
                'quantity' => 1,
                'reason' => 'Quality issue',
                'location' => 'Quality Control',
                'remarks' => 'Failed quality inspection',
                'reference_number' => 'REJ-003',
            ];
        }

        // Create used items for different dates
        foreach ($usedItems as $index => $item) {
            InventoryUsedRejectedItem::createUsedItem(
                $item['inventory_item_id'],
                $item['quantity'],
                $usedBy,
                $userId,
                Carbon::now()->subDays($index + 1)->format('Y-m-d'),
                $item['reason'],
                $item['location'],
                $item['remarks'],
                $item['reference_number']
            );
        }

        // Create rejected items for different dates
        foreach ($rejectedItems as $index => $item) {
            InventoryUsedRejectedItem::createRejectedItem(
                $item['inventory_item_id'],
                $item['quantity'],
                $usedBy,
                $userId,
                Carbon::now()->subDays($index + 2)->format('Y-m-d'),
                $item['reason'],
                $item['location'],
                $item['remarks'],
                $item['reference_number']
            );
        }

        $this->command->info('Created ' . count($usedItems) . ' used items and ' . count($rejectedItems) . ' rejected items.');
    }
}