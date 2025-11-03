<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BillingTransaction;
use App\Models\BillingTransactionItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FixTransactionItemization extends Command
{
    protected $signature = 'fix:transaction-itemization {transaction_id?}';
    protected $description = 'Fix transaction itemization - breaks down single items into consultation + lab tests';

    public function handle()
    {
        $transactionId = $this->argument('transaction_id');
        
        if ($transactionId) {
            // Fix specific transaction
            $transactions = BillingTransaction::where('transaction_id', $transactionId)
                ->orWhere('id', $transactionId)
                ->get();
        } else {
            // Fix all transactions with appointments that have single items matching total
            $transactions = BillingTransaction::with(['appointmentLinks.appointment.labTests.labTest', 'items'])
                ->whereHas('appointmentLinks')
                ->get()
                ->filter(function($txn) {
                    // Filter to only transactions with 1 item matching total
                    $items = $txn->items;
                    if ($items->count() === 1) {
                        $item = $items->first();
                        if (abs($item->total_price - $txn->total_amount) < 0.01) {
                            // Check if appointment has lab tests
                            foreach ($txn->appointmentLinks as $link) {
                                $apt = $link->appointment;
                                if ($apt && ($apt->total_lab_amount > 0 || $apt->labTests->isNotEmpty())) {
                                    return true;
                                }
                            }
                        }
                    }
                    return false;
                });
        }

        $this->info("Found {$transactions->count()} transactions to fix");

        $fixed = 0;
        foreach ($transactions as $transaction) {
            $this->line("Processing transaction {$transaction->transaction_id}...");
            
            // Load appointment links and appointments
            $transaction->load(['appointmentLinks.appointment.labTests.labTest', 'items']);
            
            // Use appointmentLinks (not appointments) since that's the correct relationship
            $appointmentLinks = $transaction->appointmentLinks;
            if ($appointmentLinks->isEmpty()) {
                $this->warn("  - No appointment links found, skipping");
                continue;
            }
            
            $needsFix = false;
            $existingItems = $transaction->items;
            
            // Check if we need to fix
            if ($existingItems->count() === 1) {
                $singleItem = $existingItems->first();
                foreach ($appointmentLinks as $link) {
                    $appointment = $link->appointment;
                    if (!$appointment) {
                        continue;
                    }
                    
                    if (!$appointment->relationLoaded('labTests')) {
                        $appointment->load('labTests.labTest');
                    }
                    
                    $hasLabTests = $appointment->labTests->isNotEmpty() || ($appointment->total_lab_amount > 0);
                    $labTestItems = $transaction->items()->where('item_type', 'laboratory')->count();
                    
                    if ($hasLabTests && $labTestItems == 0) {
                        $needsFix = true;
                        $this->line("  → Found appointment with lab tests but no lab test items");
                        break;
                    }
                    
                    // Also check if single item price matches total but appointment has lab tests
                    if (abs($singleItem->total_price - $transaction->total_amount) < 0.01 && $hasLabTests && $labTestItems == 0) {
                        $needsFix = true;
                        $this->line("  → Single item matches total but appointment has lab tests");
                        break;
                    }
                }
            }
            
            if (!$needsFix) {
                $this->line("  - Transaction already properly itemized ({$existingItems->count()} items)");
                continue;
            }
            
            DB::transaction(function() use ($transaction, $appointmentLinks, &$fixed) {
                // Delete existing items
                $transaction->items()->delete();
                
                // Create items for each appointment
                foreach ($appointmentLinks as $link) {
                    $appointment = $link->appointment;
                    if (!$appointment) {
                        continue;
                    }
                    $appointmentTypeLabel = $appointment->appointment_type === 'general_consultation' ? 'Consultation' : ucfirst($appointment->appointment_type);
                    
                    // Create consultation item
                    BillingTransactionItem::create([
                        'billing_transaction_id' => $transaction->id,
                        'item_type' => 'consultation',
                        'item_name' => $appointmentTypeLabel . ' Appointment',
                        'item_description' => "Appointment for {$appointment->patient_name} on " . 
                            ($appointment->appointment_date ? \Carbon\Carbon::parse($appointment->appointment_date)->format('M d, Y') : 'N/A') . 
                            " at " . ($appointment->appointment_time ? \Carbon\Carbon::parse($appointment->appointment_time)->format('g:i A') : 'N/A'),
                        'quantity' => 1,
                        'unit_price' => $appointment->price,
                        'total_price' => $appointment->price
                    ]);
                    
                    // Load lab tests if not loaded
                    if (!$appointment->relationLoaded('labTests')) {
                        $appointment->load('labTests.labTest');
                    }
                    
                    // Create lab test items
                    foreach ($appointment->labTests as $appointmentLabTest) {
                        if (!$appointmentLabTest->relationLoaded('labTest')) {
                            $appointmentLabTest->load('labTest');
                        }
                        
                        if ($appointmentLabTest->labTest) {
                            BillingTransactionItem::create([
                                'billing_transaction_id' => $transaction->id,
                                'item_type' => 'laboratory',
                                'lab_test_id' => $appointmentLabTest->lab_test_id,
                                'item_name' => $appointmentLabTest->labTest->name,
                                'item_description' => "Lab test: {$appointmentLabTest->labTest->name}",
                                'quantity' => 1,
                                'unit_price' => $appointmentLabTest->unit_price ?? $appointmentLabTest->labTest->price,
                                'total_price' => $appointmentLabTest->total_price ?? $appointmentLabTest->labTest->price
                            ]);
                        }
                    }
                }
                
                // Update transaction
                $transaction->update(['is_itemized' => true]);
                
                $itemsCount = $transaction->items()->count();
                $fixed++;
                $this->info("  ✓ Fixed transaction {$transaction->transaction_id} - Created {$itemsCount} itemized items");
            });
        }

        $this->info("\nFixed {$fixed} transactions");
    }
}

