<?php

namespace App\Helpers;

use App\Models\BillingTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BillingTransactionHelper
{
    /**
     * Safely create a billing transaction, preventing duplicates
     * 
     * @param array $transactionData
     * @return BillingTransaction
     */
    public static function createTransactionSafely($transactionData)
    {
        // Check if identical transaction already exists
        $existingTransaction = BillingTransaction::where("patient_id", $transactionData["patient_id"])
            ->where("doctor_id", $transactionData["doctor_id"] ?? null)
            ->where("total_amount", $transactionData["total_amount"])
            ->where("status", $transactionData["status"])
            ->first();
        
        if ($existingTransaction) {
            Log::info("Billing transaction already exists for patient {$transactionData["patient_id"]}, returning existing transaction");
            return $existingTransaction;
        }
        
        // Create transaction only if it doesn't exist
        $transaction = BillingTransaction::create($transactionData);
        Log::info("Billing transaction created successfully for patient {$transactionData["patient_id"]}");
        
        return $transaction;
    }
    
    /**
     * Check if a billing transaction exists for the given criteria
     * 
     * @param int $patientId
     * @param int|null $doctorId
     * @param float $totalAmount
     * @param string $status
     * @return bool
     */
    public static function transactionExists($patientId, $doctorId, $totalAmount, $status)
    {
        return BillingTransaction::where("patient_id", $patientId)
            ->where("doctor_id", $doctorId)
            ->where("total_amount", $totalAmount)
            ->where("status", $status)
            ->exists();
    }
    
    /**
     * Get existing transaction for the given criteria
     * 
     * @param int $patientId
     * @param int|null $doctorId
     * @param float $totalAmount
     * @param string $status
     * @return BillingTransaction|null
     */
    public static function getExistingTransaction($patientId, $doctorId, $totalAmount, $status)
    {
        return BillingTransaction::where("patient_id", $patientId)
            ->where("doctor_id", $doctorId)
            ->where("total_amount", $totalAmount)
            ->where("status", $status)
            ->first();
    }
}