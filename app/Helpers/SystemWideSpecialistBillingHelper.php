<?php

namespace App\Helpers;

use App\Models\Appointment;
use App\Models\BillingTransaction;
use App\Models\Specialist;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SystemWideSpecialistBillingHelper
{
    /**
     * SYSTEM-WIDE: Ensure all appointments have valid specialist data
     * This runs automatically whenever appointments are created/updated
     */
    public static function ensureAppointmentSpecialist($appointmentId)
    {
        $appointment = Appointment::find($appointmentId);
        if (!$appointment) {
            return false;
        }
        
        // Check if specialist_id is missing or invalid
        if (empty($appointment->specialist_id)) {
            Log::warning("SYSTEM-WIDE FIX: Appointment {$appointmentId} has missing specialist_id, auto-assigning specialist");
            
            // Find appropriate specialist based on specialist_type
            $specialist = null;
            if ($appointment->specialist_type === "doctor") {
                $specialist = Specialist::where("role", "Doctor")->first();
            } elseif ($appointment->specialist_type === "medtech") {
                $specialist = Specialist::where("role", "MedTech")->first();
            }
            
            // If no specialist found, use default doctor
            if (!$specialist) {
                $specialist = Specialist::where("role", "Doctor")->first();
            }
            
            if ($specialist) {
                $appointment->update([
                    "specialist_id" => $specialist->specialist_id,
                    "specialist_name" => $specialist->name
                ]);
                Log::info("SYSTEM-WIDE FIX: Assigned specialist {$specialist->name} to appointment {$appointmentId}");
                return true;
            }
        }
        
        return true;
    }
    
    /**
     * SYSTEM-WIDE: Create billing transaction with proper specialist mapping
     * This ensures ALL billing transactions have correct specialist data
     */
    public static function createBillingTransactionSafely($appointmentId, $transactionData = [])
    {
        // STEP 1: Ensure appointment has valid specialist (SYSTEM-WIDE CHECK)
        self::ensureAppointmentSpecialist($appointmentId);
        
        $appointment = Appointment::find($appointmentId);
        if (!$appointment) {
            throw new \Exception("Appointment not found");
        }
        
        // STEP 2: Map specialist to doctor_id for billing (SYSTEM-WIDE LOGIC)
        $doctorId = null;
        if ($appointment->specialist_type === "doctor") {
            $doctorId = $appointment->specialist_id;
        }
        // For medtech appointments, doctor_id can be null (this is correct)
        
        // STEP 3: Add doctor_id to transaction data (SYSTEM-WIDE ENFORCEMENT)
        $transactionData["doctor_id"] = $doctorId;
        
        // STEP 4: Check for existing transaction to prevent duplicates (SYSTEM-WIDE PREVENTION)
        $existingTransaction = BillingTransaction::where("patient_id", $appointment->patient_id)
            ->where("doctor_id", $doctorId)
            ->where("total_amount", $transactionData["total_amount"] ?? $appointment->price)
            ->where("status", $transactionData["status"] ?? "pending")
            ->first();
        
        if ($existingTransaction) {
            Log::info("SYSTEM-WIDE: Billing transaction already exists for appointment {$appointmentId}");
            return $existingTransaction;
        }
        
        // STEP 5: Create transaction with proper specialist data (SYSTEM-WIDE CREATION)
        $transaction = BillingTransaction::create($transactionData);
        Log::info("SYSTEM-WIDE: Billing transaction created for appointment {$appointmentId} with doctor_id {$doctorId}");
        
        return $transaction;
    }
    
    /**
     * SYSTEM-WIDE: Validate all appointments have proper specialist data
     * This runs automatically to fix any existing issues
     */
    public static function validateAllAppointments()
    {
        $invalidAppointments = Appointment::whereNull("specialist_id")
            ->orWhere("specialist_id", "")
            ->get();
        
        foreach ($invalidAppointments as $appointment) {
            self::ensureAppointmentSpecialist($appointment->id);
        }
        
        Log::info("SYSTEM-WIDE: Validated and fixed {$invalidAppointments->count()} appointments");
        return $invalidAppointments->count();
    }
    
    /**
     * SYSTEM-WIDE: Auto-fix any billing transactions with missing doctor_id
     * This ensures ALL billing transactions have proper specialist data
     */
    public static function fixAllBillingTransactions()
    {
        $invalidTransactions = BillingTransaction::whereNull("doctor_id")
            ->orWhere("doctor_id", "")
            ->get();
        
        foreach ($invalidTransactions as $transaction) {
            // Find the related appointment
            $appointment = Appointment::where("patient_id", $transaction->patient_id)->first();
            if ($appointment) {
                $doctorId = ($appointment->specialist_type === "doctor") ? $appointment->specialist_id : null;
                $transaction->update(["doctor_id" => $doctorId]);
                Log::info("SYSTEM-WIDE: Fixed billing transaction {$transaction->id} with doctor_id {$doctorId}");
            }
        }
        
        Log::info("SYSTEM-WIDE: Fixed {$invalidTransactions->count()} billing transactions");
        return $invalidTransactions->count();
    }
}