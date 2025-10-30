<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\InventoryMovement;
use App\Models\InventoryItem;
use App\Models\InventoryUsedRejectedItem;
use App\Models\User;
use Carbon\Carbon;

class BackfillUsedRejectedItems extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'inventory:backfill-used-rejected';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backfill consumed and rejected items from InventoryMovement records into inventory_used_rejected_items table';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting backfill of consumed and rejected items...');

        // Get all OUT movements that haven't been processed yet
        $outMovements = InventoryMovement::where('movement_type', 'OUT')
            ->orderBy('created_at', 'asc')
            ->get();

        $this->info("Found {$outMovements->count()} OUT movements to process");

        $bar = $this->output->createProgressBar($outMovements->count());
        $bar->start();

        $processed = 0;
        $skipped = 0;
        $errors = 0;

        foreach ($outMovements as $movement) {
            try {
                // Check if this movement has already been processed
                $existing = InventoryUsedRejectedItem::whereHas('inventoryItem', function($query) use ($movement) {
                    $query->where('id', $movement->inventory_id);
                })
                ->where('date_used_rejected', $movement->created_at->format('Y-m-d'))
                ->where('quantity', $movement->quantity)
                ->where('remarks', 'LIKE', '%' . substr($movement->remarks, 0, 50) . '%')
                ->first();

                if ($existing) {
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                $item = InventoryItem::find($movement->inventory_id);
                if (!$item) {
                    $errors++;
                    $bar->advance();
                    continue;
                }

                // Determine if it's rejected or consumed based on remarks
                $isRejected = false;
                $reason = null;
                
                if ($movement->remarks) {
                    $remarksLower = strtolower($movement->remarks);
                    $isRejected = str_contains($remarksLower, 'reject');
                    
                    // Extract reason
                    $reason = preg_replace('/^(Consumed|Rejected):\s*/i', '', $movement->remarks);
                    if (empty(trim($reason))) {
                        $reason = $movement->remarks;
                    }
                }

                // Parse created_by - can be name or ID
                $usedBy = 'System';
                $userId = 1;
                
                if ($movement->created_by) {
                    if (is_numeric($movement->created_by)) {
                        $user = User::find($movement->created_by);
                        $userId = $movement->created_by;
                        $usedBy = $user ? $user->name : 'System';
                    } else {
                        $usedBy = $movement->created_by;
                        $user = User::where('name', $movement->created_by)->first();
                        $userId = $user ? $user->id : 1;
                    }
                } elseif (auth()->check()) {
                    $usedBy = auth()->user()->name;
                    $userId = auth()->id();
                }

                // Create the used/rejected item record
                InventoryUsedRejectedItem::create([
                    'inventory_item_id' => $item->id,
                    'type' => $isRejected ? 'rejected' : 'used',
                    'quantity' => $movement->quantity,
                    'reason' => $reason,
                    'location' => $item->location ?? $item->assigned_to ?? null,
                    'used_by' => $usedBy,
                    'user_id' => $userId,
                    'date_used_rejected' => $movement->created_at->format('Y-m-d'),
                    'remarks' => $movement->remarks ?? ($isRejected ? 'Item Rejected' : 'Item Consumed'),
                    'reference_number' => null,
                ]);

                $processed++;
                $bar->advance();
            } catch (\Exception $e) {
                $errors++;
                $this->error("\nError processing movement ID {$movement->id}: " . $e->getMessage());
                $bar->advance();
            }
        }

        $bar->finish();
        $this->newLine();
        
        $this->info("Backfill completed!");
        $this->info("Processed: {$processed}");
        $this->info("Skipped (already exists): {$skipped}");
        $this->info("Errors: {$errors}");

        return 0;
    }
}

