<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Supply\Supply;
use App\Models\Supply\SupplyTransaction;
use App\Models\User;
use Carbon\Carbon;

class SupplySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get a user for transactions (or create one if none exists)
        $user = User::first();
        if (!$user) {
            $user = User::create([
                'name' => 'System Admin',
                'email' => 'admin@clinic.com',
                'password' => bcrypt('password'),
            ]);
        }

        // Create sample supplies
        $supplies = [
            [
                'name' => 'Alcohol 70%',
                'code' => 'ALCOHOL-001',
                'description' => 'Medical grade alcohol for disinfection',
                'category' => 'Medical Supplies',
                'unit_of_measure' => 'bottle',
                'unit_cost' => 25.00,
                'minimum_stock_level' => 10,
                'maximum_stock_level' => 100,
                'is_active' => true,
                'requires_lot_tracking' => false,
                'requires_expiry_tracking' => true,
            ],
            [
                'name' => 'Cotton Balls',
                'code' => 'COTTON-001',
                'description' => 'Sterile cotton balls for medical use',
                'category' => 'Medical Supplies',
                'unit_of_measure' => 'pack',
                'unit_cost' => 15.00,
                'minimum_stock_level' => 15,
                'maximum_stock_level' => 200,
                'is_active' => true,
                'requires_lot_tracking' => false,
                'requires_expiry_tracking' => false,
            ],
            [
                'name' => 'Gauze Pads',
                'code' => 'GAUZE-001',
                'description' => 'Sterile gauze pads for wound care',
                'category' => 'Medical Supplies',
                'unit_of_measure' => 'box',
                'unit_cost' => 45.00,
                'minimum_stock_level' => 5,
                'maximum_stock_level' => 50,
                'is_active' => true,
                'requires_lot_tracking' => false,
                'requires_expiry_tracking' => true,
            ],
            [
                'name' => 'Surgical Gloves',
                'code' => 'GLOVES-001',
                'description' => 'Disposable surgical gloves',
                'category' => 'Protective Equipment',
                'unit_of_measure' => 'box',
                'unit_cost' => 80.00,
                'minimum_stock_level' => 10,
                'maximum_stock_level' => 100,
                'is_active' => true,
                'requires_lot_tracking' => false,
                'requires_expiry_tracking' => true,
            ],
            [
                'name' => 'Test Tubes',
                'code' => 'TUBE-001',
                'description' => 'Laboratory test tubes',
                'category' => 'Laboratory Equipment',
                'unit_of_measure' => 'box',
                'unit_cost' => 120.00,
                'minimum_stock_level' => 20,
                'maximum_stock_level' => 500,
                'is_active' => true,
                'requires_lot_tracking' => false,
                'requires_expiry_tracking' => false,
            ],
            [
                'name' => 'Blood Collection Needles',
                'code' => 'NEEDLE-001',
                'description' => 'Sterile blood collection needles',
                'category' => 'Laboratory Equipment',
                'unit_of_measure' => 'box',
                'unit_cost' => 200.00,
                'minimum_stock_level' => 15,
                'maximum_stock_level' => 200,
                'is_active' => true,
                'requires_lot_tracking' => true,
                'requires_expiry_tracking' => true,
            ],
            [
                'name' => 'Microscope Slides',
                'code' => 'SLIDE-001',
                'description' => 'Glass microscope slides',
                'category' => 'Laboratory Equipment',
                'unit_of_measure' => 'box',
                'unit_cost' => 60.00,
                'minimum_stock_level' => 50,
                'maximum_stock_level' => 1000,
                'is_active' => true,
                'requires_lot_tracking' => false,
                'requires_expiry_tracking' => false,
            ],
            [
                'name' => 'Reagent Strips',
                'code' => 'REAGENT-001',
                'description' => 'Diagnostic reagent strips',
                'category' => 'Laboratory Consumables',
                'unit_of_measure' => 'bottle',
                'unit_cost' => 150.00,
                'minimum_stock_level' => 20,
                'maximum_stock_level' => 100,
                'is_active' => true,
                'requires_lot_tracking' => true,
                'requires_expiry_tracking' => true,
            ],
        ];

        foreach ($supplies as $supplyData) {
            $supply = Supply::create($supplyData);
            
            // Create sample transactions for each supply
            $this->createSampleTransactions($supply, $user);
        }
    }

    private function createSampleTransactions($supply, $user)
    {
        $now = Carbon::now();
        
        // Initial stock (IN transaction)
        SupplyTransaction::create([
            'product_id' => $supply->id,
            'user_id' => $user->id,
            'approved_by' => $user->id,
            'type' => 'in',
            'subtype' => 'purchase',
            'quantity' => 50,
            'unit_cost' => $supply->unit_cost,
            'total_cost' => $supply->unit_cost * 50,
            'transaction_date' => $now->copy()->subDays(30),
            'transaction_time' => $now->copy()->subDays(30),
            'notes' => 'Initial stock received',
        ]);

        // Some consumption (OUT transactions)
        $consumptionTransactions = [
            ['quantity' => 5, 'subtype' => 'consumed', 'days_ago' => 25, 'notes' => 'Used for patient procedures'],
            ['quantity' => 3, 'subtype' => 'consumed', 'days_ago' => 20, 'notes' => 'Used for cleaning'],
            ['quantity' => 2, 'subtype' => 'consumed', 'days_ago' => 15, 'notes' => 'Used for laboratory tests'],
            ['quantity' => 1, 'subtype' => 'rejected', 'days_ago' => 10, 'notes' => 'Damaged during handling'],
            ['quantity' => 4, 'subtype' => 'consumed', 'days_ago' => 5, 'notes' => 'Used for patient care'],
        ];

        foreach ($consumptionTransactions as $transaction) {
            SupplyTransaction::create([
                'product_id' => $supply->id,
                'user_id' => $user->id,
                'approved_by' => $user->id,
                'type' => 'out',
                'subtype' => $transaction['subtype'],
                'quantity' => $transaction['quantity'],
                'unit_cost' => $supply->unit_cost,
                'total_cost' => $supply->unit_cost * $transaction['quantity'],
                'transaction_date' => $now->copy()->subDays($transaction['days_ago']),
                'transaction_time' => $now->copy()->subDays($transaction['days_ago']),
                'notes' => $transaction['notes'],
            ]);
        }

        // Some recent incoming stock
        SupplyTransaction::create([
            'product_id' => $supply->id,
            'user_id' => $user->id,
            'approved_by' => $user->id,
            'type' => 'in',
            'subtype' => 'purchase',
            'quantity' => 20,
            'unit_cost' => $supply->unit_cost,
            'total_cost' => $supply->unit_cost * 20,
            'transaction_date' => $now->copy()->subDays(3),
            'transaction_time' => $now->copy()->subDays(3),
            'notes' => 'Restock order received',
        ]);
    }
}
