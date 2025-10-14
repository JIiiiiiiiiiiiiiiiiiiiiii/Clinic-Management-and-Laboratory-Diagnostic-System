<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use Carbon\Carbon;

class InventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Doctor & Nurse Items
        $doctorNurseItems = [
            [
                'item_name' => 'Alcohol 70%',
                'item_code' => 'ALCOHOL-001',
                'category' => 'Medical Supplies',
                'unit' => 'bottle',
                'assigned_to' => 'Doctor & Nurse',
                'stock' => 25,
                'low_stock_alert' => 10,
                'consumed' => 5,
                'rejected' => 2,
                'status' => 'In Stock',
            ],
            [
                'item_name' => 'Cotton Balls',
                'item_code' => 'COTTON-001',
                'category' => 'Medical Supplies',
                'unit' => 'pack',
                'assigned_to' => 'Doctor & Nurse',
                'stock' => 8,
                'low_stock_alert' => 15,
                'consumed' => 12,
                'rejected' => 1,
                'status' => 'Low Stock',
            ],
            [
                'item_name' => 'Gauze Pads',
                'item_code' => 'GAUZE-001',
                'category' => 'Medical Supplies',
                'unit' => 'box',
                'assigned_to' => 'Doctor & Nurse',
                'stock' => 0,
                'low_stock_alert' => 5,
                'consumed' => 20,
                'rejected' => 3,
                'status' => 'Out of Stock',
            ],
            [
                'item_name' => 'Surgical Gloves',
                'item_code' => 'GLOVES-001',
                'category' => 'Protective Equipment',
                'unit' => 'box',
                'assigned_to' => 'Doctor & Nurse',
                'stock' => 15,
                'low_stock_alert' => 10,
                'consumed' => 8,
                'rejected' => 0,
                'status' => 'In Stock',
            ],
            [
                'item_name' => 'Bandages',
                'item_code' => 'BANDAGE-001',
                'category' => 'Medical Supplies',
                'unit' => 'box',
                'assigned_to' => 'Doctor & Nurse',
                'stock' => 30,
                'low_stock_alert' => 20,
                'consumed' => 10,
                'rejected' => 1,
                'status' => 'In Stock',
            ],
        ];

        // Med Tech Items
        $medTechItems = [
            [
                'item_name' => 'Test Tubes',
                'item_code' => 'TUBE-001',
                'category' => 'Laboratory Equipment',
                'unit' => 'box',
                'assigned_to' => 'Med Tech',
                'stock' => 50,
                'low_stock_alert' => 20,
                'consumed' => 15,
                'rejected' => 3,
                'status' => 'In Stock',
            ],
            [
                'item_name' => 'Blood Collection Needles',
                'item_code' => 'NEEDLE-001',
                'category' => 'Laboratory Equipment',
                'unit' => 'box',
                'assigned_to' => 'Med Tech',
                'stock' => 5,
                'low_stock_alert' => 15,
                'consumed' => 25,
                'rejected' => 2,
                'status' => 'Low Stock',
            ],
            [
                'item_name' => 'Microscope Slides',
                'item_code' => 'SLIDE-001',
                'category' => 'Laboratory Equipment',
                'unit' => 'box',
                'assigned_to' => 'Med Tech',
                'stock' => 100,
                'low_stock_alert' => 50,
                'consumed' => 30,
                'rejected' => 5,
                'status' => 'In Stock',
            ],
            [
                'item_name' => 'Reagent Strips',
                'item_code' => 'REAGENT-001',
                'category' => 'Laboratory Consumables',
                'unit' => 'bottle',
                'assigned_to' => 'Med Tech',
                'stock' => 12,
                'low_stock_alert' => 20,
                'consumed' => 8,
                'rejected' => 1,
                'status' => 'Low Stock',
            ],
            [
                'item_name' => 'Centrifuge Tubes',
                'item_code' => 'CENTRIFUGE-001',
                'category' => 'Laboratory Equipment',
                'unit' => 'box',
                'assigned_to' => 'Med Tech',
                'stock' => 40,
                'low_stock_alert' => 25,
                'consumed' => 20,
                'rejected' => 2,
                'status' => 'In Stock',
            ],
        ];

        // Create all items
        $allItems = array_merge($doctorNurseItems, $medTechItems);
        
        foreach ($allItems as $itemData) {
            $item = InventoryItem::create($itemData);
            
            // Create some sample movements for each item
            $this->createSampleMovements($item);
        }
    }

    private function createSampleMovements($item)
    {
        $movements = [
            [
                'movement_type' => 'IN',
                'quantity' => $item->stock + $item->consumed + $item->rejected,
                'remarks' => 'Initial stock',
                'created_by' => 'System',
                'created_at' => Carbon::now()->subDays(30),
            ],
        ];

        // Add some consumption movements
        if ($item->consumed > 0) {
            $movements[] = [
                'movement_type' => 'OUT',
                'quantity' => $item->consumed,
                'remarks' => 'Used during patient procedures',
                'created_by' => 'Nurse Johnson',
                'created_at' => Carbon::now()->subDays(15),
            ];
        }

        // Add rejection movements
        if ($item->rejected > 0) {
            $movements[] = [
                'movement_type' => 'OUT',
                'quantity' => $item->rejected,
                'remarks' => 'Rejected: Damaged during handling',
                'created_by' => 'Nurse Johnson',
                'created_at' => Carbon::now()->subDays(10),
            ];
        }

        foreach ($movements as $movementData) {
            InventoryMovement::create([
                'inventory_id' => $item->id,
                'movement_type' => $movementData['movement_type'],
                'quantity' => $movementData['quantity'],
                'remarks' => $movementData['remarks'],
                'created_by' => $movementData['created_by'],
                'created_at' => $movementData['created_at'],
            ]);
        }
    }
}