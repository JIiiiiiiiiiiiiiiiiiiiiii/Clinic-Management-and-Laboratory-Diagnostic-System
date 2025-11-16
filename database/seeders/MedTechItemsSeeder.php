<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MedTechItemsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Collect all items, avoiding duplicates
        $allItems = [];
        $itemNames = []; // Track item names to avoid duplicates

        // URINALYSIS (Urinary Test) Items
        $urinalysisItems = [
            ['name' => 'Urine Collection Cups/Containers (Sterile)', 'code' => 'URINE-CUP-001', 'category' => 'URINALYSIS', 'unit' => 'box'],
            ['name' => 'Test Tubes', 'code' => 'TEST-TUBE-001', 'category' => 'URINALYSIS', 'unit' => 'box'],
            ['name' => 'Pipettes (Disposable)', 'code' => 'PIPETTE-001', 'category' => 'URINALYSIS', 'unit' => 'box'],
            ['name' => 'Glass Slides', 'code' => 'GLASS-SLIDE-001', 'category' => 'URINALYSIS', 'unit' => 'box'],
            ['name' => 'Cover Slips', 'code' => 'COVER-SLIP-001', 'category' => 'URINALYSIS', 'unit' => 'box'],
            ['name' => 'Urine Dipstick Strips', 'code' => 'DIPSTICK-001', 'category' => 'URINALYSIS', 'unit' => 'bottle'],
            ['name' => 'Reagents for Urinalysis (Protein, Glucose, Ketone, Bilirubin, etc.)', 'code' => 'URINE-REAGENT-001', 'category' => 'URINALYSIS', 'unit' => 'bottle'],
            ['name' => 'Gloves', 'code' => 'GLOVES-MT-001', 'category' => 'URINALYSIS', 'unit' => 'box'],
            ['name' => 'Biohazard Waste Bags', 'code' => 'BIOHAZARD-BAG-001', 'category' => 'URINALYSIS', 'unit' => 'pack'],
            ['name' => 'Labels/Stickers for Sample Identification', 'code' => 'LABEL-001', 'category' => 'URINALYSIS', 'unit' => 'pack'],
            ['name' => 'Tissue Wipes', 'code' => 'TISSUE-WIPE-001', 'category' => 'URINALYSIS', 'unit' => 'box'],
            ['name' => 'Disinfectant Solutions (Alcohol, Bleach)', 'code' => 'DISINFECTANT-001', 'category' => 'URINALYSIS', 'unit' => 'bottle'],
        ];

        // FECALYSIS (Stool Test) Items
        $fecalysisItems = [
            ['name' => 'Stool Collection Containers (with Spoon)', 'code' => 'STOOL-CONTAINER-001', 'category' => 'FECALYSIS', 'unit' => 'box'],
            ['name' => 'Glass Slides & Cover Slips', 'code' => 'SLIDE-COVER-001', 'category' => 'FECALYSIS', 'unit' => 'box'],
            ['name' => 'Applicator Sticks / Wooden Sticks', 'code' => 'APPLICATOR-001', 'category' => 'FECALYSIS', 'unit' => 'box'],
            ['name' => 'Saline Solution', 'code' => 'SALINE-001', 'category' => 'FECALYSIS', 'unit' => 'bottle'],
            ['name' => 'Lugol\'s Iodine', 'code' => 'LUGOL-001', 'category' => 'FECALYSIS', 'unit' => 'bottle'],
            ['name' => 'Specimen Transport Bags', 'code' => 'TRANSPORT-BAG-001', 'category' => 'FECALYSIS', 'unit' => 'pack'],
            // Note: Gloves, Disposable Pipettes, Biohazard Waste Bags, Tissue Wipes, Disinfectants 
            // are already included in URINALYSIS and will be skipped as duplicates
        ];

        // COMPLETE BLOOD COUNT (CBC) Items
        $cbcItems = [
            ['name' => 'EDTA Tubes (Lavender-top Tubes)', 'code' => 'EDTA-TUBE-001', 'category' => 'CBC', 'unit' => 'box'],
            ['name' => 'Lancets', 'code' => 'LANCET-001', 'category' => 'CBC', 'unit' => 'box'],
            ['name' => 'Alcohol Swabs', 'code' => 'ALCOHOL-SWAB-001', 'category' => 'CBC', 'unit' => 'box'],
            ['name' => 'Cotton Balls', 'code' => 'COTTON-MT-001', 'category' => 'CBC', 'unit' => 'pack'],
            ['name' => 'Microcapillary Tubes', 'code' => 'MICROCAP-001', 'category' => 'CBC', 'unit' => 'box'],
            ['name' => 'Hematocrit Clay/Sealant', 'code' => 'HEMATOCRIT-001', 'category' => 'CBC', 'unit' => 'bottle'],
            ['name' => 'Immersion Oil', 'code' => 'IMMERSION-OIL-001', 'category' => 'CBC', 'unit' => 'bottle'],
            ['name' => 'Blood Smear Slides', 'code' => 'BLOOD-SMEAR-001', 'category' => 'CBC', 'unit' => 'box'],
            ['name' => 'Quality Control Reagents', 'code' => 'QC-REAGENT-001', 'category' => 'CBC', 'unit' => 'bottle'],
            ['name' => 'CBC Machine Reagents - Diluent', 'code' => 'CBC-DILUENT-001', 'category' => 'CBC', 'unit' => 'bottle'],
            ['name' => 'CBC Machine Reagents - Lyse Reagent', 'code' => 'CBC-LYSE-001', 'category' => 'CBC', 'unit' => 'bottle'],
            ['name' => 'CBC Machine Reagents - Cleaner', 'code' => 'CBC-CLEANER-001', 'category' => 'CBC', 'unit' => 'bottle'],
            ['name' => 'Biohazard Containers (Sharps Container)', 'code' => 'SHARPS-CONTAINER-001', 'category' => 'CBC', 'unit' => 'piece'],
            // Note: Gloves, Bandages, Labels/Stickers, Disinfectants are already included 
            // in URINALYSIS and will be skipped as duplicates
        ];

        // GENERAL LAB SUPPLIES (Used Across All Tests)
        $generalLabItems = [
            ['name' => 'Lab Coats', 'code' => 'LAB-COAT-001', 'category' => 'General Lab Supplies', 'unit' => 'piece'],
            ['name' => 'Face Masks', 'code' => 'FACE-MASK-001', 'category' => 'General Lab Supplies', 'unit' => 'box'],
            ['name' => 'PPE Gowns', 'code' => 'PPE-GOWN-001', 'category' => 'General Lab Supplies', 'unit' => 'piece'],
            ['name' => 'Distilled Water', 'code' => 'DISTILLED-WATER-001', 'category' => 'General Lab Supplies', 'unit' => 'bottle'],
        ];

        // Combine all items
        $allCategoryItems = array_merge($urinalysisItems, $fecalysisItems, $cbcItems, $generalLabItems);

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

            // Check for partial matches in current batch (e.g., "Pipettes (Disposable)" vs "Disposable Pipettes")
            // Normalize by removing special characters and checking key words
            $normalizedNameWords = array_filter(explode(' ', preg_replace('/[^a-z0-9\s]/', ' ', $normalizedName)));
            $normalizedNameWords = array_map('trim', $normalizedNameWords);
            $normalizedNameWords = array_filter($normalizedNameWords);
            
            // Check against items already in the batch
            foreach ($itemNames as $existingNormalized) {
                $existingWords = array_filter(explode(' ', preg_replace('/[^a-z0-9\s]/', ' ', $existingNormalized)));
                $existingWords = array_map('trim', $existingWords);
                $existingWords = array_filter($existingWords);
                
                // Check if they share the same key words (indicating they're the same item)
                $keyWords = ['pipette', 'glove', 'disinfectant', 'biohazard', 'tissue', 'wipe', 'label', 'sticker', 'bandage'];
                $itemKeyWords = array_intersect($normalizedNameWords, $keyWords);
                $existingKeyWords = array_intersect($existingWords, $keyWords);
                
                // If both have the same key words, they're likely duplicates
                if (!empty($itemKeyWords) && !empty($existingKeyWords)) {
                    $sharedKeyWords = array_intersect($itemKeyWords, $existingKeyWords);
                    if (count($sharedKeyWords) == count($itemKeyWords) && count($itemKeyWords) > 0) {
                        // Check word overlap to confirm similarity
                        $wordOverlap = count(array_intersect($normalizedNameWords, $existingWords));
                        $totalUniqueWords = count(array_unique(array_merge($normalizedNameWords, $existingWords)));
                        if ($totalUniqueWords > 0 && ($wordOverlap / $totalUniqueWords) > 0.5) {
                            $this->command->info("Skipping duplicate in batch: {$item['name']} (similar to already added item)");
                            continue 2; // Continue outer loop
                        }
                    }
                }
            }
            
            // Check against existing items in database
            $similarItems = InventoryItem::where('assigned_to', 'Med Tech')->get();
            foreach ($similarItems as $existing) {
                $existingNormalized = strtolower(trim($existing->item_name));
                $existingWords = array_filter(explode(' ', preg_replace('/[^a-z0-9\s]/', ' ', $existingNormalized)));
                $existingWords = array_map('trim', $existingWords);
                $existingWords = array_filter($existingWords);
                
                // Check if key words match
                $keyWords = ['pipette', 'glove', 'disinfectant', 'biohazard', 'tissue', 'wipe', 'label', 'sticker', 'bandage'];
                $itemKeyWords = array_intersect($normalizedNameWords, $keyWords);
                $existingKeyWords = array_intersect($existingWords, $keyWords);
                
                if (!empty($itemKeyWords) && !empty($existingKeyWords)) {
                    $sharedKeyWords = array_intersect($itemKeyWords, $existingKeyWords);
                    if (count($sharedKeyWords) == count($itemKeyWords) && count($itemKeyWords) > 0) {
                        // Check word overlap
                        $wordOverlap = count(array_intersect($normalizedNameWords, $existingWords));
                        $totalUniqueWords = count(array_unique(array_merge($normalizedNameWords, $existingWords)));
                        if ($totalUniqueWords > 0 && ($wordOverlap / $totalUniqueWords) > 0.5) {
                            $this->command->info("Skipping {$item['name']} - similar to existing: {$existing->item_name}");
                            continue 2; // Continue outer loop
                        }
                    }
                }
            }

            // Set initial stock based on item type
            $initialStock = 50; // Default stock for most items
            $lowStockAlert = 10; // Default low stock alert
            
            // Adjust stock for specific item types
            if (strpos(strtolower($item['name']), 'reagent') !== false || 
                strpos(strtolower($item['name']), 'diluent') !== false ||
                strpos(strtolower($item['name']), 'lyse') !== false ||
                strpos(strtolower($item['name']), 'cleaner') !== false) {
                $initialStock = 20; // Reagents typically have lower stock
                $lowStockAlert = 5;
            } elseif (strpos(strtolower($item['name']), 'tube') !== false ||
                      strpos(strtolower($item['name']), 'slide') !== false ||
                      strpos(strtolower($item['name']), 'pipette') !== false ||
                      strpos(strtolower($item['name']), 'container') !== false) {
                $initialStock = 100; // Disposables typically have higher stock
                $lowStockAlert = 25;
            } elseif (strpos(strtolower($item['name']), 'coat') !== false ||
                      strpos(strtolower($item['name']), 'gown') !== false ||
                      strpos(strtolower($item['name']), 'mask') !== false) {
                $initialStock = 30; // PPE items
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
                'assigned_to' => 'Med Tech',
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
                $this->command->info("Created: {$itemData['item_name']} ({$itemData['item_code']}) - ID: {$itemId}");
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
                    
                    // Set expiry date for items that typically expire (reagents, medicines, solutions)
                    $expiryDate = null;
                    if (strpos($itemName, 'reagent') !== false ||
                        strpos($itemName, 'diluent') !== false ||
                        strpos($itemName, 'lyse') !== false ||
                        strpos($itemName, 'cleaner') !== false ||
                        strpos($itemName, 'solution') !== false ||
                        strpos($itemName, 'iodine') !== false ||
                        strpos($itemName, 'saline') !== false ||
                        strpos($itemName, 'disinfectant') !== false ||
                        strpos($itemName, 'water') !== false ||
                        strpos($itemName, 'oil') !== false) {
                        // Set expiry date to 1-2 years from now for reagents/solutions
                        $expiryDate = Carbon::now()->addYears(2)->format('Y-m-d');
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

