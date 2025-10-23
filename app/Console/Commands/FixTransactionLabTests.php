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
        $this->info('Starting to fix transactions with lab tests...');

        $transactions = BillingTransaction::whereHas('appointmentLinks.appointment', function($query) {
            $query->where('total_lab_amount', '>', 0);
        })->get();

        $this->info("Found {$transactions->count()} transactions to check");

        $fixed = 0;
        foreach ($transactions as $transaction) {
            $this->line("Processing transaction {$transaction->transaction_id}...");
            
            // Check if lab test items exist
            $labTestItems = $transaction->items()->where('item_type', 'laboratory')->count();
            
            if ($labTestItems == 0) {
                // Add missing lab test items
                $appointments = $transaction->appointments;
                $totalLabAmount = 0;
                
                foreach ($appointments as $appointment) {
                    if ($appointment->total_lab_amount > 0) {
                        $labTests = $appointment->labTests()->with('labTest')->get();
                        foreach ($labTests as $appointmentLabTest) {
                            BillingTransactionItem::create([
                                'billing_transaction_id' => $transaction->id,
                                'item_type' => 'laboratory',
                                'lab_test_id' => $appointmentLabTest->lab_test_id,
                                'item_name' => $appointmentLabTest->labTest->name,
                                'item_description' => "Lab test: {$appointmentLabTest->labTest->name}",
                                'quantity' => 1,
                                'unit_price' => $appointmentLabTest->unit_price,
                                'total_price' => $appointmentLabTest->total_price
                            ]);
                            $totalLabAmount += $appointmentLabTest->total_price;
                        }
                    }
                }
                
                // Update transaction amounts if needed
                if ($totalLabAmount > 0) {
                    $newTotalAmount = $transaction->total_amount + $totalLabAmount;
                    $newAmount = $transaction->amount + $totalLabAmount;
                    
                    // Apply senior citizen discount if applicable
                    if ($transaction->is_senior_citizen && $transaction->senior_discount_amount > 0) {
                        $seniorDiscountAmount = $totalLabAmount * 0.20; // 20% discount on lab tests too
                        $newAmount = $newAmount - $seniorDiscountAmount;
                        $transaction->update([
                            'total_amount' => $newTotalAmount,
                            'amount' => $newAmount,
                            'senior_discount_amount' => $transaction->senior_discount_amount + $seniorDiscountAmount,
                            'is_itemized' => true
                        ]);
                    } else {
                        $transaction->update([
                            'total_amount' => $newTotalAmount,
                            'amount' => $newAmount,
                            'is_itemized' => true
                        ]);
                    }
                    
                    $fixed++;
                    $this->info("  ✓ Fixed transaction {$transaction->transaction_id} - Added lab test items");
                }
            } else {
                $this->line("  - Transaction {$transaction->transaction_id} already has lab test items");
            }
        }

        $this->info("Fixed {$fixed} transactions");
        $this->info('Done!');
    }
}
