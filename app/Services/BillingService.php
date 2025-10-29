<?php

namespace App\Services;

use App\Models\BillingTransaction;
use App\Models\DailyTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BillingService
{
    /**
     * Mark billing transaction as paid
     * 
     * @param int $transactionId
     * @param array $paymentData
     * @return array
     */
    public function markAsPaid(int $transactionId, array $paymentData): array
    {
        return DB::transaction(function () use ($transactionId, $paymentData) {
            try {
                $transaction = BillingTransaction::where('id', $transactionId)
                    ->where('status', 'pending')
                    ->lockForUpdate()
                    ->first();

                if (!$transaction) {
                    throw new \Exception('Transaction not found or already processed');
                }

                // Update transaction
                $transaction->update([
                    'status' => 'paid',
                    'payment_method' => $paymentData['payment_method'] ?? 'cash',
                    'payment_reference' => $paymentData['reference_no'] ?? null,
                ]);

                // Update appointment and visit status
                $this->updateRelatedStatuses($transaction);

                // Sync to daily transactions
                $this->syncToDailyTransactions($transaction);

                Log::info('Billing transaction marked as paid', [
                    'transaction_id' => $transaction->id,
                    'amount' => $transaction->total_amount,
                    'payment_method' => $transaction->payment_method
                ]);

                return [
                    'success' => true,
                    'transaction_id' => $transaction->id,
                    'status' => 'Paid'
                ];

            } catch (\Exception $e) {
                Log::error('Failed to mark transaction as paid', [
                    'transaction_id' => $transactionId,
                    'error' => $e->getMessage()
                ]);
                throw $e;
            }
        });
    }

    /**
     * Sync billing transaction to daily transactions
     * 
     * @param BillingTransaction $transaction
     * @return void
     */
    private function syncToDailyTransactions(BillingTransaction $transaction): void
    {
        // Check if already synced
        $existing = DailyTransaction::where('original_transaction_id', $transaction->id)
            ->where('original_table', 'billing_transactions')
            ->first();

        if ($existing) {
            // Update existing record
            $existing->update([
                'status' => $transaction->status,
                'payment_method' => $transaction->payment_method,
                'amount' => $transaction->amount, // Use final amount after discounts
            ]);
        } else {
            // Create new record
            DailyTransaction::create([
                'transaction_date' => $transaction->transaction_date->format('Y-m-d'),
                'transaction_type' => 'billing',
                'transaction_id' => $transaction->transaction_id,
                'patient_name' => $transaction->patient->first_name . ' ' . $transaction->patient->last_name ?? 'Unknown',
                'specialist_name' => $this->getSpecialistName($transaction),
                'amount' => $transaction->amount, // Use final amount after discounts
                'total_amount' => $transaction->total_amount, // Original amount before discounts
                'final_amount' => $transaction->amount, // Final amount after discounts
                'discount_amount' => $transaction->discount_amount ?? 0,
                'senior_discount_amount' => $transaction->senior_discount_amount ?? 0,
                'is_senior_citizen' => $transaction->is_senior_citizen ?? false,
                'payment_method' => $transaction->payment_method,
                'status' => $transaction->status,
                'description' => "Payment for medical services",
                'items_count' => 1,
                'appointments_count' => 1,
                'original_transaction_id' => $transaction->id,
                'original_table' => 'billing_transactions',
            ]);
        }
    }

    /**
     * Update appointment and visit status after payment
     * 
     * @param BillingTransaction $transaction
     * @return void
     */
    private function updateRelatedStatuses(BillingTransaction $transaction): void
    {
        // Get appointments linked to this transaction
        $appointmentLinks = \App\Models\AppointmentBillingLink::where('billing_transaction_id', $transaction->id)->get();
        
        foreach ($appointmentLinks as $link) {
            // Update appointment status
            $appointment = \App\Models\Appointment::find($link->appointment_id);
            if ($appointment) {
                $appointment->update([
                    'status' => 'Completed',
                    'billing_status' => 'paid'
                ]);
                
                // Update visit status
                $visit = \App\Models\Visit::where('appointment_id', $appointment->id)->first();
                if ($visit) {
                    $visit->update([
                        'status' => 'Completed'
                    ]);
                }
            }
            
            // Update the link status
            $link->update(['status' => 'paid']);
        }
    }

    /**
     * Get specialist name for daily transaction
     * 
     * @param BillingTransaction $transaction
     * @return string
     */
    private function getSpecialistName(BillingTransaction $transaction): string
    {
        if ($transaction->doctor) {
            return $transaction->doctor->name;
        }
        return 'Unknown';
    }
}
