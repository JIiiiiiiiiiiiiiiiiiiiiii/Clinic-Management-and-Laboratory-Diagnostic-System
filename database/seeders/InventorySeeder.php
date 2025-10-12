<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;

class InventorySeeder extends Seeder
{
    public function run()
    {
        // Create sample inventory items
        $items = [
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
                'status' => 'In Stock'
            ],
            [
                'item_name' => 'Surgical Gloves',
                'item_code' => 'GLOVES-002',
                'category' => 'Personal Protective Equipment',
                'unit' => 'box',
                'assigned_to' => 'Doctor & Nurse',
                'stock' => 8,
                'low_stock_alert' => 15,
                'consumed' => 12,
                'rejected' => 1,
                'status' => 'Low Stock'
            ],
            [
                'item_name' => 'Blood Collection Tubes',
                'item_code' => 'TUBES-003',
                'category' => 'Laboratory Supplies',
                'unit' => 'pack',
                'assigned_to' => 'Med Tech',
                'stock' => 50,
                'low_stock_alert' => 20,
                'consumed' => 30,
                'rejected' => 3,
                'status' => 'In Stock'
            ],
            [
                'item_name' => 'Syringes 5ml',
                'item_code' => 'SYRINGE-004',
                'category' => 'Medical Supplies',
                'unit' => 'piece',
                'assigned_to' => 'Doctor & Nurse',
                'stock' => 0,
                'low_stock_alert' => 20,
                'consumed' => 45,
                'rejected' => 5,
                'status' => 'Out of Stock'
            ],
            [
                'item_name' => 'Lab Reagent Kit',
                'item_code' => 'REAGENT-005',
                'category' => 'Laboratory Supplies',
                'unit' => 'set',
                'assigned_to' => 'Med Tech',
                'stock' => 3,
                'low_stock_alert' => 10,
                'consumed' => 7,
                'rejected' => 1,
                'status' => 'Low Stock'
            ],
            [
                'item_name' => 'Bandages',
                'item_code' => 'BANDAGE-006',
                'category' => 'Medical Supplies',
                'unit' => 'roll',
                'assigned_to' => 'Doctor & Nurse',
                'stock' => 15,
                'low_stock_alert' => 5,
                'consumed' => 8,
                'rejected' => 0,
                'status' => 'In Stock'
            ]
        ];

        foreach ($items as $itemData) {
            $item = InventoryItem::create($itemData);
            
            // Create initial movement record
            if ($item->stock > 0) {
                InventoryMovement::create([
                    'inventory_id' => $item->id,
                    'movement_type' => 'IN',
                    'quantity' => $item->stock,
                    'remarks' => 'Initial stock',
                    'created_by' => 'System'
                ]);
            }
            
            // Create some consumption movements
            if ($item->consumed > 0) {
                InventoryMovement::create([
                    'inventory_id' => $item->id,
                    'movement_type' => 'OUT',
                    'quantity' => $item->consumed,
                    'remarks' => 'Consumed: Used for patient treatment',
                    'created_by' => 'Dr. Smith'
                ]);
            }
            
            // Create some rejection movements
            if ($item->rejected > 0) {
                InventoryMovement::create([
                    'inventory_id' => $item->id,
                    'movement_type' => 'OUT',
                    'quantity' => $item->rejected,
                    'remarks' => 'Rejected: Damaged packaging',
                    'created_by' => 'Nurse Johnson'
                ]);
            }
        }
    }
}