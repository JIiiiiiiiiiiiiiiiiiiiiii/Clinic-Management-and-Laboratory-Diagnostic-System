<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DoctorNurseItemsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Collect all items, avoiding duplicates
        $allItems = [];
        $itemNames = []; // Track item names to avoid duplicates

        // DOCTOR'S ITEMS FOR MINOR PROCEDURES
        $minorProcedureItems = [
            ['name' => 'Syringes 1ml', 'code' => 'SYRINGE-1ML-001', 'category' => 'Minor Procedures', 'unit' => 'box'],
            ['name' => 'Syringes 3ml', 'code' => 'SYRINGE-3ML-001', 'category' => 'Minor Procedures', 'unit' => 'box'],
            ['name' => 'Syringes 5ml', 'code' => 'SYRINGE-5ML-001', 'category' => 'Minor Procedures', 'unit' => 'box'],
            ['name' => 'Syringes 10ml', 'code' => 'SYRINGE-10ML-001', 'category' => 'Minor Procedures', 'unit' => 'box'],
            ['name' => 'Needles (Various Gauges)', 'code' => 'NEEDLE-VARIOUS-001', 'category' => 'Minor Procedures', 'unit' => 'box'],
            ['name' => 'Sterile Gauze Pads', 'code' => 'GAUZE-STERILE-001', 'category' => 'Minor Procedures', 'unit' => 'box'],
            ['name' => 'Adhesive Tapes', 'code' => 'TAPE-ADHESIVE-001', 'category' => 'Minor Procedures', 'unit' => 'roll'],
            ['name' => 'Betadine Solution', 'code' => 'BETADINE-001', 'category' => 'Minor Procedures', 'unit' => 'bottle'],
            ['name' => 'Alcohol Swabs', 'code' => 'ALCOHOL-SWAB-DN-001', 'category' => 'Minor Procedures', 'unit' => 'box'],
            ['name' => 'Sterile Gloves', 'code' => 'GLOVES-STERILE-001', 'category' => 'Minor Procedures', 'unit' => 'box'],
            ['name' => 'Dressing Set', 'code' => 'DRESSING-SET-001', 'category' => 'Minor Procedures', 'unit' => 'set'],
            ['name' => 'Tourniquet', 'code' => 'TOURNIQUET-001', 'category' => 'Minor Procedures', 'unit' => 'piece'],
        ];

        // BASIC MEDICINES - ANALGESICS / ANTIPYRETICS
        $analgesicsItems = [
            ['name' => 'Paracetamol Tablets', 'code' => 'PARACETAMOL-TAB-001', 'category' => 'Analgesics/Antipyretics', 'unit' => 'box'],
            ['name' => 'Paracetamol Syrup', 'code' => 'PARACETAMOL-SYRUP-001', 'category' => 'Analgesics/Antipyretics', 'unit' => 'bottle'],
            ['name' => 'Ibuprofen', 'code' => 'IBUPROFEN-001', 'category' => 'Analgesics/Antipyretics', 'unit' => 'box'],
            ['name' => 'Mefenamic Acid', 'code' => 'MEFENAMIC-001', 'category' => 'Analgesics/Antipyretics', 'unit' => 'box'],
        ];

        // BASIC MEDICINES - ANTIBIOTICS
        $antibioticsItems = [
            ['name' => 'Amoxicillin', 'code' => 'AMOXICILLIN-001', 'category' => 'Antibiotics', 'unit' => 'box'],
            ['name' => 'Cephalexin', 'code' => 'CEPHALEXIN-001', 'category' => 'Antibiotics', 'unit' => 'box'],
            ['name' => 'Azithromycin', 'code' => 'AZITHROMYCIN-001', 'category' => 'Antibiotics', 'unit' => 'box'],
            ['name' => 'Co-amoxiclav', 'code' => 'CO-AMOXICLAV-001', 'category' => 'Antibiotics', 'unit' => 'box'],
        ];

        // BASIC MEDICINES - ANTIHISTAMINES
        $antihistaminesItems = [
            ['name' => 'Cetirizine', 'code' => 'CETIRIZINE-001', 'category' => 'Antihistamines', 'unit' => 'box'],
            ['name' => 'Loratadine', 'code' => 'LORATADINE-001', 'category' => 'Antihistamines', 'unit' => 'box'],
            ['name' => 'Diphenhydramine', 'code' => 'DIPHENHYDRAMINE-001', 'category' => 'Antihistamines', 'unit' => 'box'],
        ];

        // BASIC MEDICINES - COUGH & COLD MEDICINES
        $coughColdItems = [
            ['name' => 'Carbocisteine', 'code' => 'CARBOCISTEINE-001', 'category' => 'Cough & Cold Medicines', 'unit' => 'bottle'],
            ['name' => 'Ambroxol', 'code' => 'AMBROXOL-001', 'category' => 'Cough & Cold Medicines', 'unit' => 'bottle'],
            ['name' => 'Phenylephrine/Chlorphenamine', 'code' => 'PHENYLEPHRINE-001', 'category' => 'Cough & Cold Medicines', 'unit' => 'bottle'],
        ];

        // BASIC MEDICINES - VITAMINS & SUPPLEMENTATION
        $vitaminsItems = [
            ['name' => 'Vitamin C', 'code' => 'VITAMIN-C-001', 'category' => 'Vitamins & Supplements', 'unit' => 'box'],
            ['name' => 'Multivitamins', 'code' => 'MULTIVITAMIN-001', 'category' => 'Vitamins & Supplements', 'unit' => 'box'],
            ['name' => 'Ferrous Sulfate', 'code' => 'FERROUS-SULFATE-001', 'category' => 'Vitamins & Supplements', 'unit' => 'box'],
            ['name' => 'Folic Acid', 'code' => 'FOLIC-ACID-001', 'category' => 'Vitamins & Supplements', 'unit' => 'box'],
        ];

        // Combine all items
        $allCategoryItems = array_merge(
            $minorProcedureItems,
            $analgesicsItems,
            $antibioticsItems,
            $antihistaminesItems,
            $coughColdItems,
            $vitaminsItems
        );

        // Process items and avoid duplicates
        foreach ($allCategoryItems as $item) {
            $normalizedName = strtolower(trim($item['name']));
            
            // Check for duplicates in current batch - skip if already added
            if (in_array($normalizedName, $itemNames)) {
                $this->command->info("Skipping duplicate in batch: {$item['name']}");
                continue;
            }

            // Check if item with same code already exists in database
            $existingItem = InventoryItem::where('item_code', $item['code'])->first();
            if ($existingItem) {
                $this->command->info("Skipping {$item['name']} - item code {$item['code']} already exists");
                continue;
            }

            // Check for similar item names (case-insensitive) in database
            $similarItem = InventoryItem::whereRaw('LOWER(item_name) = ?', [strtolower($item['name'])])->first();
            if ($similarItem) {
                $this->command->info("Skipping {$item['name']} - similar item already exists: {$similarItem->item_name}");
                continue;
            }

            // Check for partial matches in current batch
            $normalizedNameWords = array_filter(explode(' ', preg_replace('/[^a-z0-9\s]/', ' ', $normalizedName)));
            $normalizedNameWords = array_map('trim', $normalizedNameWords);
            $normalizedNameWords = array_filter($normalizedNameWords);
            
            // Check against items already in the batch
            foreach ($itemNames as $existingNormalized) {
                $existingWords = array_filter(explode(' ', preg_replace('/[^a-z0-9\s]/', ' ', $existingNormalized)));
                $existingWords = array_map('trim', $existingWords);
                $existingWords = array_filter($existingWords);
                
                $keyWords = ['syringe', 'needle', 'gauze', 'tape', 'glove', 'alcohol', 'swab'];
                $itemKeyWords = array_intersect($normalizedNameWords, $keyWords);
                $existingKeyWords = array_intersect($existingWords, $keyWords);
                
                if (!empty($itemKeyWords) && !empty($existingKeyWords)) {
                    $sharedKeyWords = array_intersect($itemKeyWords, $existingKeyWords);
                    if (count($sharedKeyWords) == count($itemKeyWords) && count($itemKeyWords) > 0) {
                        $wordOverlap = count(array_intersect($normalizedNameWords, $existingWords));
                        $totalUniqueWords = count(array_unique(array_merge($normalizedNameWords, $existingWords)));
                        if ($totalUniqueWords > 0 && ($wordOverlap / $totalUniqueWords) > 0.5) {
                            $this->command->info("Skipping duplicate in batch: {$item['name']} (similar to already added item)");
                            continue 2;
                        }
                    }
                }
            }
            
            // Check against existing items in database
            $similarItems = InventoryItem::where('assigned_to', 'Doctor & Nurse')->get();
            foreach ($similarItems as $existing) {
                $existingNormalized = strtolower(trim($existing->item_name));
                $existingWords = array_filter(explode(' ', preg_replace('/[^a-z0-9\s]/', ' ', $existingNormalized)));
                $existingWords = array_map('trim', $existingWords);
                $existingWords = array_filter($existingWords);
                
                $keyWords = ['syringe', 'needle', 'gauze', 'tape', 'glove', 'alcohol', 'swab'];
                $itemKeyWords = array_intersect($normalizedNameWords, $keyWords);
                $existingKeyWords = array_intersect($existingWords, $keyWords);
                
                if (!empty($itemKeyWords) && !empty($existingKeyWords)) {
                    $sharedKeyWords = array_intersect($itemKeyWords, $existingKeyWords);
                    if (count($sharedKeyWords) == count($itemKeyWords) && count($itemKeyWords) > 0) {
                        $wordOverlap = count(array_intersect($normalizedNameWords, $existingWords));
                        $totalUniqueWords = count(array_unique(array_merge($normalizedNameWords, $existingWords)));
                        if ($totalUniqueWords > 0 && ($wordOverlap / $totalUniqueWords) > 0.5) {
                            $this->command->info("Skipping {$item['name']} - similar to existing: {$existing->item_name}");
                            continue 2;
                        }
                    }
                }
            }

            // Set initial stock based on item type
            $initialStock = 50; // Default stock
            $lowStockAlert = 10; // Default low stock alert
            
            // Adjust stock for specific item types
            if (strpos(strtolower($item['name']), 'syringe') !== false ||
                strpos(strtolower($item['name']), 'needle') !== false ||
                strpos(strtolower($item['name']), 'gauze') !== false ||
                strpos(strtolower($item['name']), 'swab') !== false ||
                strpos(strtolower($item['name']), 'glove') !== false) {
                $initialStock = 100; // Medical supplies typically have higher stock
                $lowStockAlert = 25;
            } elseif (strpos(strtolower($item['name']), 'tablet') !== false ||
                      strpos(strtolower($item['name']), 'medicine') !== false ||
                      strpos(strtolower($item['name']), 'antibiotic') !== false ||
                      strpos(strtolower($item['name']), 'vitamin') !== false) {
                $initialStock = 30; // Medicines typically have moderate stock
                $lowStockAlert = 10;
            } elseif (strpos(strtolower($item['name']), 'syrup') !== false ||
                      strpos(strtolower($item['name']), 'bottle') !== false ||
                      strpos(strtolower($item['name']), 'solution') !== false) {
                $initialStock = 20; // Liquids typically have lower stock
                $lowStockAlert = 5;
            } elseif (strpos(strtolower($item['name']), 'tape') !== false ||
                      strpos(strtolower($item['name']), 'set') !== false) {
                $initialStock = 30;
                $lowStockAlert = 10;
            }
            
            // Calculate status based on stock
            $status = 'In Stock';
            if ($initialStock <= 0) {
                $status = 'Out of Stock';
            } elseif ($initialStock <= $lowStockAlert) {
                $status = 'Low Stock';
            }
            
            $allItems[] = [
                'item_name' => $item['name'],
                'item_code' => $item['code'],
                'category' => $item['category'],
                'unit' => $item['unit'],
                'assigned_to' => 'Doctor & Nurse',
                'stock' => $initialStock,
                'low_stock_alert' => $lowStockAlert,
                'consumed' => 0,
                'rejected' => 0,
                'status' => $status,
            ];

            $itemNames[] = $normalizedName;
        }

        // Get the next available ID since AUTO_INCREMENT is not working
        $maxId = DB::table('inventory_items')->max('id') ?? 0;
        $nextId = $maxId + 1;
        $createdItemIds = [];
        
        // Create all items using raw SQL with explicit IDs
        foreach ($allItems as $itemData) {
            try {
                $itemId = $nextId++;
                // Use raw SQL INSERT with explicit ID since AUTO_INCREMENT is not set
                $sql = "INSERT INTO `inventory_items` 
                        (`id`, `item_name`, `item_code`, `category`, `unit`, `assigned_to`, `stock`, `low_stock_alert`, `consumed`, `rejected`, `status`, `description`, `supplier`, `location`, `unit_cost`, `expiry_date`, `barcode`, `created_at`, `updated_at`) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                
                $now = now();
                DB::insert($sql, [
                    $itemId,
                    $itemData['item_name'],
                    $itemData['item_code'],
                    $itemData['category'],
                    $itemData['unit'],
                    $itemData['assigned_to'],
                    $itemData['stock'],
                    $itemData['low_stock_alert'],
                    $itemData['consumed'],
                    $itemData['rejected'],
                    $itemData['status'],
                    null, // description
                    null, // supplier
                    null, // location
                    null, // unit_cost
                    null, // expiry_date
                    null, // barcode
                    $now,
                    $now,
                ]);
                
                $createdItemIds[] = ['id' => $itemId, 'stock' => $itemData['stock']];
                $this->command->info("Created: {$itemData['item_name']} ({$itemData['item_code']}) - ID: {$itemId} - Stock: {$itemData['stock']}");
            } catch (\Exception $e) {
                $this->command->error("Failed to create {$itemData['item_name']}: " . $e->getMessage());
            }
        }

        // Create initial batch movements for items with stock > 0
        $maxMovementId = DB::table('inventory_movements')->max('id') ?? 0;
        $nextMovementId = $maxMovementId + 1;
        
        foreach ($createdItemIds as $itemInfo) {
            if ($itemInfo['stock'] > 0) {
                try {
                    // Get item name to determine if it needs an expiry date
                    $item = InventoryItem::find($itemInfo['id']);
                    $itemName = strtolower($item->item_name ?? '');
                    
                    // Set expiry date for items that typically expire (medicines, solutions, syrups)
                    $expiryDate = null;
                    if (strpos($itemName, 'tablet') !== false ||
                        strpos($itemName, 'syrup') !== false ||
                        strpos($itemName, 'solution') !== false ||
                        strpos($itemName, 'betadine') !== false ||
                        strpos($itemName, 'vitamin') !== false ||
                        strpos($itemName, 'antibiotic') !== false ||
                        strpos($itemName, 'antihistamine') !== false ||
                        strpos($itemName, 'paracetamol') !== false ||
                        strpos($itemName, 'ibuprofen') !== false ||
                        strpos($itemName, 'amoxicillin') !== false ||
                        strpos($itemName, 'cephalexin') !== false ||
                        strpos($itemName, 'azithromycin') !== false ||
                        strpos($itemName, 'cetirizine') !== false ||
                        strpos($itemName, 'loratadine') !== false ||
                        strpos($itemName, 'carbocisteine') !== false ||
                        strpos($itemName, 'ambroxol') !== false) {
                        // Set expiry date to 2-3 years from now for medicines
                        $expiryDate = Carbon::now()->addYears(2)->addMonths(6)->format('Y-m-d');
                    }
                    
                    $movementSql = "INSERT INTO `inventory_movements` 
                                    (`id`, `inventory_id`, `movement_type`, `quantity`, `expiry_date`, `remarks`, `created_by`, `created_at`, `updated_at`) 
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    
                    DB::insert($movementSql, [
                        $nextMovementId++,
                        $itemInfo['id'],
                        'IN',
                        $itemInfo['stock'],
                        $expiryDate,
                        'Initial stock',
                        'System',
                        Carbon::now()->subDays(7), // Set to 7 days ago for initial stock
                        Carbon::now()->subDays(7),
                    ]);
                } catch (\Exception $e) {
                    $this->command->warn("Failed to create movement for item ID {$itemInfo['id']}: " . $e->getMessage());
                }
            }
        }

        $this->command->info("Total items created: " . count($allItems));
        $this->command->info("Total batch movements created: " . count($createdItemIds));
    }
}

