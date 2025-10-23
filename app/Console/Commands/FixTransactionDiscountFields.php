<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BillingTransaction;
use Illuminate\Support\Facades\DB;

class FixTransactionDiscountFields extends Command
{
    protected $signature = 'billing:fix-discount-fields';
    protected $description = 'Fix transactions where senior citizen discount is stored in discount_amount field';

    public function handle()
    {
        $this->info('Starting to fix transaction discount fields...');

        // Find transactions where discount_amount > 0 and is_senior_citizen = true
        // and senior_discount_amount is 0 or null
        $transactions = BillingTransaction::where('is_senior_citizen', true)
            ->where('discount_amount', '>', 0)
            ->where(function($query) {
                $query->whereNull('senior_discount_amount')
                      ->orWhere('senior_discount_amount', 0);
            })
            ->get();

        $this->info("Found {$transactions->count()} transactions to fix");

        $fixed = 0;
        foreach ($transactions as $transaction) {
            $this->line("Processing transaction {$transaction->transaction_id}...");
            
            // Move the discount_amount to senior_discount_amount
            $seniorDiscountAmount = $transaction->discount_amount;
            
            // Update the transaction
            $transaction->update([
                'discount_amount' => 0, // Clear regular discount
                'senior_discount_amount' => $seniorDiscountAmount,
                'senior_discount_percentage' => 20.00
            ]);
            
            $this->line("  - Fixed: Moved ₱{$seniorDiscountAmount} from discount_amount to senior_discount_amount");
            $fixed++;
        }

        $this->info("Successfully fixed {$fixed} transactions");
        
        return 0;
    }
}
