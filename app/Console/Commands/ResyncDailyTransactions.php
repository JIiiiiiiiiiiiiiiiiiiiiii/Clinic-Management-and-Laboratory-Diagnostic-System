<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\DailyTransaction;
use App\Models\BillingTransaction;
use App\Http\Controllers\Admin\BillingReportController;
use Illuminate\Support\Facades\DB;

class ResyncDailyTransactions extends Command
{
    protected $signature = 'resync:daily-transactions {date?}';
    protected $description = 'Resync daily transactions with discount information';

    public function handle()
    {
        $date = $this->argument('date') ?? now()->format('Y-m-d');
        
        $this->info("Resyncing daily transactions for date: {$date}");

        // Clear existing records for the date
        DailyTransaction::where('transaction_date', $date)->delete();
        $this->info("Cleared existing daily transactions for {$date}");

        // Get billing transactions for the date
        $billingTransactions = BillingTransaction::whereDate('transaction_date', $date)
            ->with(['patient', 'doctor', 'appointmentLinks.appointment', 'items'])
            ->get();

        $this->info("Found {$billingTransactions->count()} billing transactions");

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

        $this->info("Successfully synced {$synced} transactions");
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
