<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use Carbon\Carbon;

class CreateSampleMovements extends Command
{
    protected $signature = 'inventory:create-sample-movements';
    protected $description = 'Create sample inventory movements for testing reports';

    public function handle()
    {
        $this->info('Creating sample inventory movements...');

        // Get some inventory items
        $items = InventoryItem::take(3)->get();
        
        if ($items->isEmpty()) {
            $this->error('No inventory items found. Please create some items first.');
            return;
        }

        $movementTypes = ['IN', 'OUT'];
        $remarks = [
            'IN' => ['Stock received', 'New shipment arrived', 'Restocked from supplier'],
            'OUT' => ['Used in procedure', 'Consumed during treatment', 'Removed from inventory']
        ];

        // Create movements for the last 30 days
        for ($i = 0; $i < 20; $i++) {
            $item = $items->random();
            $movementType = $movementTypes[array_rand($movementTypes)];
            $quantity = rand(1, 10);
            $date = Carbon::now()->subDays(rand(0, 30));
            
            $movement = InventoryMovement::create([
                'inventory_id' => $item->id,
                'movement_type' => $movementType,
                'quantity' => $quantity,
                'remarks' => $remarks[$movementType][array_rand($remarks[$movementType])],
                'created_by' => 'Sample Data Generator',
                'created_at' => $date,
                'updated_at' => $date,
            ]);

            $this->line("Created {$movementType} movement for {$item->item_name}: {$quantity} units on {$date->format('Y-m-d')}");
        }

        $this->info('Sample movements created successfully!');
        $this->info('You can now test the "Incoming & Outgoing" report.');
    }
}
