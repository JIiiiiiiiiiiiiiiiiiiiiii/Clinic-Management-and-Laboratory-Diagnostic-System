<?php

namespace App\Console\Commands;

use App\Models\BillingTransaction;
use App\Models\DailyTransaction;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FixDiscountAmounts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'billing:fix-discount-amounts {--force : Force update even if data exists}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix discount amounts in daily transactions to use final amounts after discounts';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to fix discount amounts in daily transactions...');

        // Get all billing transactions
        $billingTransactions = BillingTransaction::with(['patient', 'appointmentLinks.appointment'])->get();
        
        $this->info("Found {$billingTransactions->count()} billing transactions");

        $updated = 0;
        $created = 0;
        $skipped = 0;

        DB::transaction(function () use ($billingTransactions, &$updated, &$created, &$skipped) {
            foreach ($billingTransactions as $transaction) {
                // Check if daily transaction already exists
                $existing = DailyTransaction::where('original_transaction_id', $transaction->id)
                    ->where('original_table', 'billing_transactions')
                    ->first();

                if ($existing) {
                    if (!$this->option('force')) {
                        $skipped++;
                        continue;
                    }
                    
                    // Update existing record with correct amounts
                    $existing->update([
                        'amount' => $transaction->amount, // Final amount after discounts
                        'total_amount' => $transaction->total_amount, // Original amount before discounts
                        'final_amount' => $transaction->amount, // Final amount after discounts
                        'discount_amount' => $transaction->discount_amount ?? 0,
                        'senior_discount_amount' => $transaction->senior_discount_amount ?? 0,
                        'is_senior_citizen' => $transaction->is_senior_citizen ?? false,
                        'status' => $transaction->status,
                        'payment_method' => $transaction->payment_method,
                    ]);
                    $updated++;
                } else {
                    // Create new daily transaction record
                    DailyTransaction::create([
                        'transaction_date' => $transaction->transaction_date->format('Y-m-d'),
                        'transaction_type' => 'billing',
                        'transaction_id' => $transaction->transaction_id,
                        'patient_name' => $transaction->patient ? 
                            $transaction->patient->first_name . ' ' . $transaction->patient->last_name : 
                            'Unknown',
                        'specialist_name' => $this->getSpecialistName($transaction),
                        'amount' => $transaction->amount, // Final amount after discounts
                        'total_amount' => $transaction->total_amount, // Original amount before discounts
                        'final_amount' => $transaction->amount, // Final amount after discounts
                        'discount_amount' => $transaction->discount_amount ?? 0,
                        'senior_discount_amount' => $transaction->senior_discount_amount ?? 0,
                        'is_senior_citizen' => $transaction->is_senior_citizen ?? false,
                        'payment_method' => $transaction->payment_method,
                        'status' => $transaction->status,
                        'description' => $transaction->description ?? 'Payment for medical services',
                        'items_count' => $transaction->appointmentLinks->count(),
                        'appointments_count' => $transaction->appointmentLinks->count(),
                        'original_transaction_id' => $transaction->id,
                        'original_table' => 'billing_transactions',
                    ]);
                    $created++;
                }
            }
        });

        $this->info("Fix completed!");
        $this->info("Updated: {$updated} existing daily transactions");
        $this->info("Created: {$created} new daily transactions");
        $this->info("Skipped: {$skipped} transactions (use --force to update existing)");
        
        return Command::SUCCESS;
    }

    /**
     * Get specialist name for transaction
     */
    private function getSpecialistName($transaction)
    {
        if ($transaction->doctor) {
            return $transaction->doctor->name;
        }
        
        // Try to get from appointment links
        if ($transaction->appointmentLinks && $transaction->appointmentLinks->count() > 0) {
            $appointment = $transaction->appointmentLinks->first()->appointment;
            if ($appointment && $appointment->specialist_name) {
                return $appointment->specialist_name;
            }
        }
        
        return 'Unknown Doctor';
    }
}
