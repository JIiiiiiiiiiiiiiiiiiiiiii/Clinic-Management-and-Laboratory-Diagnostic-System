<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\DailyTransaction;
use App\Models\BillingTransaction;
use Carbon\Carbon;

class ResyncAllDailyTransactions extends Command
{
    protected $signature = 'resync:all-daily-transactions {--days=7}';
    protected $description = 'Resync all daily transactions for the last N days';

    public function handle()
    {
        $days = $this->option('days');
        $this->info("Resyncing daily transactions for the last {$days} days...");

        $startDate = Carbon::now()->subDays($days);
        $endDate = Carbon::now();

        $dates = [];
        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            $dates[] = $date->format('Y-m-d');
        }

        $totalSynced = 0;
        foreach ($dates as $date) {
            $this->line("Processing date: {$date}");
            
            // Clear existing records for the date
            DailyTransaction::where('transaction_date', $date)->delete();
            
            // Get billing transactions for the date
            $billingTransactions = BillingTransaction::whereDate('transaction_date', $date)
                ->with(['patient', 'doctor', 'appointmentLinks.appointment', 'items'])
                ->get();

            $synced = 0;
            foreach ($billingTransactions as $transaction) {
                $transactionType = $transaction->payment_type === 'doctor_payment' ? 'doctor_payment' : 'billing';
                $amount = $transaction->payment_type === 'doctor_payment' ? -$transaction->total_amount : $transaction->amount;
                
                DailyTransaction::create([
                    'transaction_date' => $date,
                    'transaction_type' => $transactionType,
                    'transaction_id' => $transaction->transaction_id,
                    'patient_name' => $transaction->payment_type === 'doctor_payment' ? 'Doctor Payment' : $this->getPatientName($transaction),
                    'specialist_name' => $this->getSpecialistName($transaction),
                    'amount' => $amount,
                    'total_amount' => $transaction->total_amount,
                    'final_amount' => $transaction->amount,
                    'discount_amount' => $transaction->discount_amount ?? 0,
                    'senior_discount_amount' => $transaction->senior_discount_amount ?? 0,
                    'is_senior_citizen' => $transaction->is_senior_citizen ?? false,
                    'payment_method' => $transaction->payment_method,
                    'status' => $transaction->status,
                    'description' => $transaction->description ?: ($transaction->payment_type === 'doctor_payment' ? 'Doctor Payment - Incentives' : 'Payment for ' . $transaction->appointmentLinks->count() . ' appointment(s)'),
                    'items_count' => $transaction->items->count(),
                    'appointments_count' => $transaction->appointmentLinks->count(),
                    'original_transaction_id' => $transaction->id,
                    'original_table' => 'billing_transactions',
                ]);
                
                $synced++;
            }
            
            $totalSynced += $synced;
            $this->info("  ✓ Synced {$synced} transactions for {$date}");
        }

        $this->info("Successfully synced {$totalSynced} transactions across " . count($dates) . " days");
        $this->info('Done!');
    }

    private function getPatientName($transaction)
    {
        if ($transaction->patient) {
            return $transaction->patient->first_name . ' ' . $transaction->patient->last_name;
        }
        
        // Try to get from appointment links
        $appointment = $transaction->appointmentLinks->first()?->appointment;
        if ($appointment && $appointment->patient) {
            return $appointment->patient->first_name . ' ' . $appointment->patient->last_name;
        }
        
        return 'Unknown Patient';
    }

    private function getSpecialistName($transaction)
    {
        if ($transaction->doctor) {
            return $transaction->doctor->name;
        }
        
        // Try to get from appointment links
        $appointment = $transaction->appointmentLinks->first()?->appointment;
        if ($appointment && $appointment->specialist) {
            return $appointment->specialist->name;
        }
        
        return 'Unknown Specialist';
    }
}
