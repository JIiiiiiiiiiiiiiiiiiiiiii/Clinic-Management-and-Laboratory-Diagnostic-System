<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BillingTransaction;
use App\Models\BillingTransactionItem;
use App\Models\Appointment;
use Illuminate\Support\Facades\DB;

class FixTransactionLabTests extends Command
{
    protected $signature = 'fix:transaction-lab-tests';
    protected $description = 'Fix transactions that are missing lab test items';

    public function handle()
    {
        $this->info('Starting to fix transactions with proper itemization...');

        // Find all transactions with appointment links
        $transactions = BillingTransaction::with(['appointmentLinks.appointment.labTests.labTest'])
            ->whereHas('appointmentLinks')
            ->get();

        $this->info("Found {$transactions->count()} transactions to check");

        $fixed = 0;
        foreach ($transactions as $transaction) {
            $this->line("Processing transaction {$transaction->transaction_id}...");
            
            $appointments = $transaction->appointments;
            if ($appointments->isEmpty()) {
                continue;
            }
            
            $needsFix = false;
            $existingItems = $transaction->items;
            $existingItemsCount = $existingItems->count();
            
            // Check if we have a single item that matches the total (indicates missing breakdown)
            if ($existingItemsCount === 1) {
                $singleItem = $existingItems->first();
                if ($singleItem && abs($singleItem->total_price - $transaction->total_amount) < 0.01) {
                    $needsFix = true;
                    $this->line("  → Found single item matching total amount, will replace with breakdown");
                }
            }
            
            // Check if any appointment has lab tests but items don't reflect it
            $hasLabTests = false;
            foreach ($appointments as $appointment) {
                if ($appointment->total_lab_amount > 0 || $appointment->labTests()->exists()) {
                    $hasLabTests = true;
                    // Check if lab test items exist
                    $labTestItems = $transaction->items()->where('item_type', 'laboratory')->count();
                    if ($labTestItems == 0) {
                        $needsFix = true;
                        $this->line("  → Appointment has lab tests but no lab test items found");
                        break;
                    }
                }
            }
            
            // Check if consultation items are missing
            $consultationItems = $transaction->items()->where('item_type', 'consultation')->count();
            if ($consultationItems == 0 && $appointments->isNotEmpty()) {
                $needsFix = true;
                $this->line("  → Missing consultation items");
            }
            
            // Check if consultation items have wrong price (₱300 instead of ₱350)
            $wrongPriceConsultations = $transaction->items()
                ->where('item_type', 'consultation')
                ->where('total_price', 300.00)
                ->get();
            
            if ($wrongPriceConsultations->isNotEmpty()) {
                foreach ($wrongPriceConsultations as $item) {
                    // Check if appointment suggests it should be ₱350
                    foreach ($appointments as $appointment) {
                        if ($appointment->price >= 350 || $appointment->total_lab_amount > 0) {
                            $needsFix = true;
                            $this->line("  → Found consultation item with wrong price (₱300, should be ₱350)");
                            break 2;
                        }
                    }
                }
            }
            
            // Check if "Additional Laboratory Tests" item exists (should be removed)
            $additionalItems = $transaction->items()
                ->where('item_name', 'Additional Laboratory Tests')
                ->get();
            
            if ($additionalItems->isNotEmpty()) {
                $needsFix = true;
                $this->line("  → Found 'Additional Laboratory Tests' item(s) that should be removed");
            }
            
            // Always check and fix senior discount if senior citizen
            if ($transaction->is_senior_citizen && $transaction->payment_method !== 'hmo') {
                $itemsTotal = $transaction->items()->sum('total_price');
                $correctDiscount = $itemsTotal * 0.20;
                $correctAmount = $itemsTotal - $correctDiscount;
                
                if (abs($transaction->senior_discount_amount - $correctDiscount) > 0.01 || abs($transaction->amount - $correctAmount) > 0.01) {
                    $needsFix = true;
                    $this->line("  → Senior discount needs recalculation (Current: ₱{$transaction->senior_discount_amount}, Should be: ₱{$correctDiscount})");
                }
            }
            
            if (!$needsFix && $existingItemsCount > 1) {
                $this->line("  ✓ Transaction already has proper breakdown ({$existingItemsCount} items)");
                continue;
            }
            
            if ($needsFix) {
                // CRITICAL: Save original transaction total BEFORE any processing
                $originalTransactionTotal = $transaction->total_amount;
                
                DB::transaction(function() use ($transaction, $appointments, &$fixed, $originalTransactionTotal) {
                    $this->line("  → Original transaction total: ₱{$originalTransactionTotal}");
                    
                    // Check if we need to fix consultation price only (not delete all items)
                    $wrongPriceItems = $transaction->items()
                        ->where('item_type', 'consultation')
                        ->where('total_price', 300.00)
                        ->get();
                    
                    $calculatedTotal = 0;
                    $shouldDeleteAll = true;
                    
                    // ALWAYS remove "Additional Laboratory Tests" item if it exists
                    // This item was likely created incorrectly during inference
                    $additionalItems = $transaction->items()
                        ->where('item_name', 'Additional Laboratory Tests')
                        ->get();
                    
                    if ($additionalItems->isNotEmpty()) {
                        foreach ($additionalItems as $additionalItem) {
                            $additionalItem->delete();
                            $this->line("    ✓ Removed 'Additional Laboratory Tests' item (₱{$additionalItem->total_price})");
                        }
                        $needsFix = true;
                    }
                    
                    if ($wrongPriceItems->isNotEmpty() && $transaction->items()->count() > 1) {
                        // Only fix consultation price, keep other items
                        $oldConsultationTotal = $wrongPriceItems->sum('total_price');
                        foreach ($wrongPriceItems as $item) {
                            $item->update([
                                'unit_price' => 350.00,
                                'total_price' => 350.00
                            ]);
                            $this->line("    ✓ Updated consultation item price from ₱300 to ₱350");
                        }
                        $shouldDeleteAll = false;
                        $calculatedTotal = $transaction->items()->sum('total_price');
                        // Items already fixed, skip to discount recalculation
                        goto recalculateDiscount;
                    }
                    
                    // If only removing Additional items (no price fix needed), skip to discount recalculation
                    if (!$shouldDeleteAll || ($additionalItems->isNotEmpty() && $wrongPriceItems->isEmpty())) {
                        $calculatedTotal = $transaction->items()->sum('total_price');
                        goto recalculateDiscount;
                    }
                    
                    if ($shouldDeleteAll) {
                        // Delete existing items if we're replacing them
                        if ($transaction->items()->count() > 0) {
                            $transaction->items()->delete();
                        }
                        $calculatedTotal = 0;
                    }
                    
                    // Create items for each appointment
                    foreach ($appointments as $appointment) {
                        $appointmentTypeLabel = $appointment->appointment_type === 'general_consultation' ? 'Consultation' : ucfirst($appointment->appointment_type);
                        
                        // CRITICAL: Use calculatePrice() to get base consultation price (₱350 for general_consultation, ₱300 default)
                        // BUT if appointment->price is higher than calculatePrice(), it means the price includes lab tests
                        $baseConsultationPrice = $appointment->calculatePrice();
                        $appointmentStoredPrice = $appointment->price;
                        
                        // SPECIAL HANDLING: For "manual_transaction" appointments, check if it's actually a consultation
                        // If stored price is ₱350 or higher, treat it as a consultation (₱350 base price)
                        if ($appointment->appointment_type === 'manual_transaction') {
                            // Check if appointment has lab tests or if price suggests it's a consultation with lab tests
                            if ($appointment->total_lab_amount > 0 || $appointmentStoredPrice >= 350) {
                                // This is likely a consultation, use ₱350 as base price
                                $baseConsultationPrice = 350.00;
                                $this->line("  → Detected manual_transaction as consultation, using ₱350 base price");
                            }
                        }
                        
                        // If appointment price is higher than base, it likely includes lab tests that aren't in total_lab_amount
                        // Use base price for consultation item, then infer lab tests from difference
                        $consultationPrice = $baseConsultationPrice;
                        
                        $this->line("  → Appointment {$appointment->id}: Type={$appointment->appointment_type}, Stored Price=₱{$appointmentStoredPrice}, Base Price=₱{$baseConsultationPrice}, Lab Amount=₱{$appointment->total_lab_amount}");
                        
                        // Create consultation item with base price
                        BillingTransactionItem::create([
                            'billing_transaction_id' => $transaction->id,
                            'item_type' => 'consultation',
                            'item_name' => $appointmentTypeLabel . ' Appointment',
                            'item_description' => "Appointment for {$appointment->patient_name} on " . 
                                ($appointment->appointment_date ? \Carbon\Carbon::parse($appointment->appointment_date)->format('M d, Y') : 'N/A') . 
                                " at " . ($appointment->appointment_time ? \Carbon\Carbon::parse($appointment->appointment_time)->format('g:i A') : 'N/A'),
                            'quantity' => 1,
                            'unit_price' => $consultationPrice,
                            'total_price' => $consultationPrice
                        ]);
                        $calculatedTotal += $consultationPrice;
                        
                        // Create lab test items from appointment_lab_tests table
                        $appointmentLabTests = \App\Models\AppointmentLabTest::where('appointment_id', $appointment->id)
                            ->with('labTest')
                            ->get();
                        
                        $this->line("  → Found {$appointmentLabTests->count()} lab tests in appointment_lab_tests table");
                        
                        if ($appointmentLabTests->isNotEmpty()) {
                            foreach ($appointmentLabTests as $appointmentLabTest) {
                                if ($appointmentLabTest->labTest) {
                                    $unitPrice = $appointmentLabTest->unit_price ?? $appointmentLabTest->labTest->price ?? 0;
                                    $totalPrice = $appointmentLabTest->total_price ?? $appointmentLabTest->labTest->price ?? 0;
                                    
                                    BillingTransactionItem::create([
                                        'billing_transaction_id' => $transaction->id,
                                        'item_type' => 'laboratory',
                                        'lab_test_id' => $appointmentLabTest->lab_test_id,
                                        'item_name' => $appointmentLabTest->labTest->name,
                                        'item_description' => "Lab test: {$appointmentLabTest->labTest->name}",
                                        'quantity' => 1,
                                        'unit_price' => $unitPrice,
                                        'total_price' => $totalPrice
                                    ]);
                                    $calculatedTotal += $totalPrice;
                                    $this->line("    ✓ Created lab test item: {$appointmentLabTest->labTest->name} (₱{$totalPrice})");
                                }
                            }
                        } else {
                            // No lab test records found, but appointment price might be higher than base
                            // Infer lab tests from the difference between stored price and base consultation
                            $priceDifference = $appointmentStoredPrice - $baseConsultationPrice;
                            
                            if ($priceDifference > 0.01) {
                                $this->line("  → No lab test records, but price difference detected: ₱{$priceDifference}");
                                $this->line("  → Inferring lab tests from price difference...");
                                
                                // Try to match known lab test prices
                                $knownLabTests = [
                                    ['name' => 'Complete Blood Count (CBC)', 'price' => 245.00],
                                    ['name' => 'Urinalysis', 'price' => 140.00],
                                    ['name' => 'Fecalysis', 'price' => 90.00],
                                ];
                                
                                $remaining = $priceDifference;
                                foreach ($knownLabTests as $test) {
                                    if ($remaining >= $test['price'] - 0.01) {
                                        BillingTransactionItem::create([
                                            'billing_transaction_id' => $transaction->id,
                                            'item_type' => 'laboratory',
                                            'item_name' => $test['name'],
                                            'item_description' => "Lab test: {$test['name']}",
                                            'quantity' => 1,
                                            'unit_price' => $test['price'],
                                            'total_price' => $test['price']
                                        ]);
                                        $calculatedTotal += $test['price'];
                                        $remaining -= $test['price'];
                                        $this->line("    ✓ Created inferred lab test: {$test['name']} (₱{$test['price']}), Remaining: ₱{$remaining}");
                                    }
                                }
                                
                                // If there's still remaining amount, create a generic item
                                if ($remaining > 0.01) {
                                    BillingTransactionItem::create([
                                        'billing_transaction_id' => $transaction->id,
                                        'item_type' => 'laboratory',
                                        'item_name' => 'Additional Laboratory Tests',
                                        'item_description' => "Additional laboratory tests",
                                        'quantity' => 1,
                                        'unit_price' => $remaining,
                                        'total_price' => $remaining
                                    ]);
                                    $calculatedTotal += $remaining;
                                    $this->line("    ✓ Created generic lab test item: ₱{$remaining}");
                                }
                            }
                        }
                    }
                    
                    recalculateDiscount:
                    // Recalculate senior citizen discount as 20% of TOTAL transaction amount
                    // Senior citizen discount applies to entire transaction (consultation + lab tests)
                    $itemsTotal = $transaction->items()->sum('total_price');
                    
                    if ($transaction->is_senior_citizen && $transaction->payment_method !== 'hmo') {
                        // Calculate discount as 20% of total amount
                        $correctSeniorDiscount = $itemsTotal * 0.20;
                        $finalAmount = $itemsTotal - $correctSeniorDiscount;
                        
                        $transaction->update([
                            'is_itemized' => true,
                            'total_amount' => $itemsTotal,
                            'amount' => $finalAmount,
                            'senior_discount_amount' => $correctSeniorDiscount,
                            'senior_discount_percentage' => 20.00
                        ]);
                        
                        $this->line("  → Recalculated senior discount: Total=₱{$itemsTotal}, Discount=₱{$correctSeniorDiscount} (20%), Final=₱{$finalAmount}");
                    } else {
                        // CRITICAL: Preserve original transaction total if calculated total doesn't match
                        // Use original total if calculated is significantly different (within ₱1 tolerance)
                        $finalTotal = abs($itemsTotal - $originalTransactionTotal) < 1.00 
                            ? $originalTransactionTotal 
                            : max($itemsTotal, $originalTransactionTotal);
                        
                        $transaction->update([
                            'is_itemized' => true,
                            'total_amount' => $finalTotal,
                            'amount' => $finalTotal
                        ]);
                    }
                    
                    $itemsCount = $transaction->items()->count();
                    $fixed++;
                    $this->info("  ✓ Fixed transaction {$transaction->transaction_id} - {$itemsCount} items, Total: ₱{$itemsTotal}, Amount: ₱{$transaction->amount}");
                });
            }
        }

        $this->info("\nFixed {$fixed} transactions");
        $this->info('Done!');
    }
}
