<?php

namespace Database\Seeders;

use App\Models\Inventory\Product;
use App\Models\Inventory\Transaction;
use App\Models\Inventory\StockLevel;
use App\Models\User;
use Illuminate\Database\Seeder;

class InventorySeeder extends Seeder
{
    public function run(): void
    {

        // Create products based on the inventory sheet
        $products = [
            [
                'name' => 'MICROPORE',
                'code' => 'MICROPORE-001',
                'description' => 'Micropore surgical tape for medical applications',
                'category' => 'Medical Supplies',
                'unit_of_measure' => 'rolls',
                'unit_cost' => 25.50,
                'minimum_stock_level' => 10,
                'maximum_stock_level' => 100,
                'requires_lot_tracking' => true,
                'requires_expiry_tracking' => true,
            ],
            [
                'name' => 'Surgical Gloves',
                'code' => 'GLOVES-001',
                'description' => 'Disposable surgical gloves, powder-free',
                'category' => 'Medical Supplies',
                'unit_of_measure' => 'boxes',
                'unit_cost' => 150.00,
                'minimum_stock_level' => 5,
                'maximum_stock_level' => 50,
                'requires_lot_tracking' => true,
                'requires_expiry_tracking' => true,
            ],
            [
                'name' => 'Alcohol 70%',
                'code' => 'ALCOHOL-001',
                'description' => 'Isopropyl alcohol 70% for disinfection',
                'category' => 'Medical Supplies',
                'unit_of_measure' => 'bottles',
                'unit_cost' => 45.00,
                'minimum_stock_level' => 20,
                'maximum_stock_level' => 200,
                'requires_lot_tracking' => true,
                'requires_expiry_tracking' => true,
            ],
            [
                'name' => 'Cotton Balls',
                'code' => 'COTTON-001',
                'description' => 'Sterile cotton balls for medical use',
                'category' => 'Medical Supplies',
                'unit_of_measure' => 'bags',
                'unit_cost' => 35.00,
                'minimum_stock_level' => 15,
                'maximum_stock_level' => 150,
                'requires_lot_tracking' => false,
                'requires_expiry_tracking' => false,
            ],
            [
                'name' => 'Syringe 5ml',
                'code' => 'SYRINGE-5ML',
                'description' => 'Disposable syringe 5ml with needle',
                'category' => 'Medical Supplies',
                'unit_of_measure' => 'pieces',
                'unit_cost' => 8.50,
                'minimum_stock_level' => 100,
                'maximum_stock_level' => 1000,
                'requires_lot_tracking' => true,
                'requires_expiry_tracking' => true,
            ],
        ];

        foreach ($products as $productData) {
            Product::updateOrCreate(['code' => $productData['code']], $productData);
        }

        // Get a user for transactions (assuming there's at least one user)
        $user = User::first();
        if (!$user) {
            $user = User::create([
                'name' => 'Inventory Manager',
                'email' => 'inventory@stjames.com',
                'password' => bcrypt('password'),
                'role' => 'admin',
            ]);
        }

        // Create sample transactions based on the inventory sheet pattern
        $micropore = Product::where('code', 'MICROPORE-001')->first();

        if ($micropore && $user) {
            // Sample incoming transactions (like the "DATE RECEIVED" section)
            $incomingTransactions = [
                [
                    'product_id' => $micropore->id,
                    'user_id' => $user->id,
                    'approved_by' => $user->id,
                    'type' => 'in',
                    'subtype' => 'received',
                    'quantity' => 50,
                    'unit_cost' => 25.50,
                    'total_cost' => 1275.00,
                    'lot_number' => 'LOT001',
                    'expiry_date' => now()->addMonths(24),
                    'notes' => 'Initial stock received from main hospital',
                    'reference_number' => 'PO-2024-001',
                    'transaction_date' => now()->subDays(30),
                    'transaction_time' => now()->subDays(30)->setTime(9, 0),
                    'is_verified' => true,
                    'approval_status' => 'approved',
                    'approved_at' => now()->subDays(30),
                ],
                [
                    'product_id' => $micropore->id,
                    'user_id' => $user->id,
                    'approved_by' => $user->id,
                    'type' => 'in',
                    'subtype' => 'received',
                    'quantity' => 30,
                    'unit_cost' => 25.50,
                    'total_cost' => 765.00,
                    'lot_number' => 'LOT002',
                    'expiry_date' => now()->addMonths(24),
                    'notes' => 'Additional stock received from main hospital',
                    'reference_number' => 'PO-2024-002',
                    'transaction_date' => now()->subDays(15),
                    'transaction_time' => now()->subDays(15)->setTime(10, 30),
                    'is_verified' => true,
                    'approval_status' => 'approved',
                    'approved_at' => now()->subDays(15),
                ],
            ];

            foreach ($incomingTransactions as $transactionData) {
                Transaction::create($transactionData);
            }

            // Create stock levels for the products
            $stockLevels = [
                [
                    'product_id' => $micropore->id,
                    'lot_number' => 'LOT001',
                    'expiry_date' => now()->addMonths(24),
                    'current_stock' => 35,
                    'reserved_stock' => 0,
                    'available_stock' => 35,
                    'average_cost' => 25.50,
                    'total_value' => 892.50,
                    'is_expired' => false,
                    'is_near_expiry' => false,
                    'last_updated' => now()->subDays(5),
                ],
                [
                    'product_id' => $micropore->id,
                    'lot_number' => 'LOT002',
                    'expiry_date' => now()->addMonths(24),
                    'current_stock' => 30,
                    'reserved_stock' => 0,
                    'available_stock' => 30,
                    'average_cost' => 25.50,
                    'total_value' => 765.00,
                    'is_expired' => false,
                    'is_near_expiry' => false,
                    'last_updated' => now()->subDays(2),
                ],
            ];

            foreach ($stockLevels as $stockData) {
                StockLevel::updateOrCreate([
                    'product_id' => $stockData['product_id'],
                    'lot_number' => $stockData['lot_number'],
                    'expiry_date' => $stockData['expiry_date'],
                ], $stockData);
            }

            // Create sample consumption transactions (like the "CONSUMED" section)
            $consumptionTransactions = [
                [
                    'product_id' => $micropore->id,
                    'user_id' => $user->id,
                    'approved_by' => $user->id,
                    'charged_to' => $user->id,
                    'type' => 'out',
                    'subtype' => 'consumed',
                    'quantity' => -5,
                    'unit_cost' => 25.50,
                    'total_cost' => -127.50,
                    'lot_number' => 'LOT001',
                    'expiry_date' => now()->addMonths(24),
                    'notes' => 'Daily consumption for patient care',
                    'usage_location' => 'Emergency Department',
                    'usage_purpose' => 'Patient wound dressing',
                    'transaction_date' => now()->subDays(5),
                    'transaction_time' => now()->subDays(5)->setTime(14, 0),
                    'is_verified' => true,
                    'approval_status' => 'approved',
                    'approved_at' => now()->subDays(5),
                ],
                [
                    'product_id' => $micropore->id,
                    'user_id' => $user->id,
                    'approved_by' => $user->id,
                    'charged_to' => $user->id,
                    'type' => 'out',
                    'subtype' => 'consumed',
                    'quantity' => -3,
                    'unit_cost' => 25.50,
                    'total_cost' => -76.50,
                    'lot_number' => 'LOT001',
                    'expiry_date' => now()->addMonths(24),
                    'notes' => 'Daily consumption for patient care',
                    'usage_location' => 'Outpatient Department',
                    'usage_purpose' => 'Minor procedure dressing',
                    'transaction_date' => now()->subDays(3),
                    'transaction_time' => now()->subDays(3)->setTime(16, 30),
                    'is_verified' => true,
                    'approval_status' => 'approved',
                    'approved_at' => now()->subDays(3),
                ],
                [
                    'product_id' => $micropore->id,
                    'user_id' => $user->id,
                    'approved_by' => $user->id,
                    'charged_to' => $user->id,
                    'type' => 'out',
                    'subtype' => 'consumed',
                    'quantity' => -7,
                    'unit_cost' => 25.50,
                    'total_cost' => -178.50,
                    'lot_number' => 'LOT001',
                    'expiry_date' => now()->addMonths(24),
                    'notes' => 'Daily consumption for patient care',
                    'usage_location' => 'Emergency Department',
                    'usage_purpose' => 'Multiple patient dressings',
                    'transaction_date' => now()->subDays(1),
                    'transaction_time' => now()->subDays(1)->setTime(11, 15),
                    'is_verified' => true,
                    'approval_status' => 'approved',
                    'approved_at' => now()->subDays(1),
                ],
            ];

            foreach ($consumptionTransactions as $transactionData) {
                Transaction::create($transactionData);
            }
        }
    }
}
