<?php

namespace App\Console\Commands;

use App\Models\BillingTransaction;
use Illuminate\Console\Command;

class FixSeniorCitizenDiscounts extends Command
{
    protected $signature = 'billing:fix-senior-discounts';
    protected $description = 'Fix senior citizen discounts for existing billing transactions';

    public function handle()
    {
        $this->info('Starting to fix senior citizen discounts...');

        // Find all transactions with senior citizen flag but no discount amount
        $transactions = BillingTransaction::where('is_senior_citizen', true)
            ->where(function($query) {
                $query->whereNull('senior_discount_amount')
                      ->orWhere('senior_discount_amount', 0);
            })
            ->get();

        $this->info("Found {$transactions->count()} transactions to fix");

        $fixed = 0;
        foreach ($transactions as $transaction) {
            $this->line("Processing transaction {$transaction->transaction_id}...");
            
            // Try to calculate senior citizen discount from appointment links first
            $consultationAmount = 0;
            $seniorDiscountAmount = 0;
            
            if ($transaction->appointmentLinks->count() > 0) {
                // Calculate from appointment links
                $consultationItems = $transaction->appointmentLinks->filter(function($link) {
                    return in_array($link->appointment->appointment_type, ['consultation', 'general_consultation']);
                });
                $consultationAmount = $consultationItems->sum('appointment_price');
                
                // If no consultation items found, check if it's a medical procedure that should get senior discount
                if ($consultationAmount == 0) {
                    // For medical procedures like lab tests, apply discount to the full amount
                    $consultationAmount = $transaction->appointmentLinks->sum('appointment_price');
                }
            } else {
                // If no appointment links, assume the total amount is consultation amount
                $consultationAmount = $transaction->total_amount;
            }
            
            $seniorDiscountAmount = $consultationAmount * 0.20; // 20% discount
            
            if ($seniorDiscountAmount > 0) {
                $newAmount = $transaction->total_amount - $seniorDiscountAmount;
                
                $transaction->update([
                    'senior_discount_amount' => $seniorDiscountAmount,
                    'senior_discount_percentage' => 20.00,
                    'amount' => $newAmount
                ]);
                
                $fixed++;
                $this->line("Fixed transaction {$transaction->transaction_id}: Original ₱{$transaction->total_amount}, Discount ₱{$seniorDiscountAmount}, New amount ₱{$newAmount}");
            } else {
                $this->line("Skipped transaction {$transaction->transaction_id}: No consultation amount found");
            }
        }

        $this->info("Fixed {$fixed} transactions");
        $this->info('Senior citizen discount fix completed!');
    }
}
