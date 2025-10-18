<?php

namespace App\Helpers;

use App\Models\Appointment;
use App\Models\BillingTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SpecialistBillingHelper
{
    /**
     * Ensure appointment has valid specialist data before creating billing
     */
    public static function ensureAppointmentSpecialist($appointmentId)
    {
        $appointment = Appointment::find($appointmentId);
        if (!$appointment) {
            return false;
        }
        
        // Check if specialist_id is missing or invalid
        if (empty($appointment->specialist_id)) {
            Log::warning("Appointment {$appointmentId} has missing specialist_id, assigning default specialist");
            
            // Find appropriate specialist based on specialist_type from specialists table
            $specialist = null;
            if ($appointment->specialist_type === "doctor") {
                $specialist = DB::select("SELECT specialist_id, name FROM specialists WHERE role = \"Doctor\" LIMIT 1")[0] ?? null;
            } elseif ($appointment->specialist_type === "medtech") {
                $specialist = DB::select("SELECT specialist_id, name FROM specialists WHERE role = \"MedTech\" LIMIT 1")[0] ?? null;
            }
            
            // If no specialist found, use default doctor
            if (!$specialist) {
                $specialist = DB::select("SELECT specialist_id, name FROM specialists WHERE role = \"Doctor\" LIMIT 1")[0] ?? null;
            }
            
            if ($specialist) {
                $appointment->update([
                    "specialist_id" => $specialist->specialist_id,
                    "specialist_name" => $specialist->name
                ]);
                Log::info("Assigned specialist {$specialist->name} to appointment {$appointmentId}");
                return true;
            }
        }
        
        return true;
    }
    
    /**
     * Create billing transaction with proper specialist mapping
     */
    public static function createBillingTransactionSafely($appointmentId, $transactionData)
    {
        // Ensure appointment has valid specialist
        self::ensureAppointmentSpecialist($appointmentId);
        
        $appointment = Appointment::find($appointmentId);
        if (!$appointment) {
            throw new \Exception("Appointment not found");
        }
        
        // Map specialist to doctor_id for billing
        $doctorId = null;
        if ($appointment->specialist_type === "doctor") {
            $doctorId = $appointment->specialist_id;
        }
        
        // Add doctor_id to transaction data
        $transactionData["doctor_id"] = $doctorId;
        
        // Check for existing transaction to prevent duplicates
        $existingTransaction = BillingTransaction::where("patient_id", $appointment->patient_id)
            ->where("doctor_id", $doctorId)
            ->where("total_amount", $transactionData["total_amount"] ?? $appointment->price)
            ->where("status", $transactionData["status"] ?? "pending")
            ->first();
        
        if ($existingTransaction) {
            Log::info("Billing transaction already exists for appointment {$appointmentId}");
            return $existingTransaction;
        }
        
        $transaction = BillingTransaction::create($transactionData);
        Log::info("Billing transaction created for appointment {$appointmentId} with doctor_id {$doctorId}");
        
        return $transaction;
    }
    
    /**
     * Validate all appointments have proper specialist data
     */
    public static function validateAllAppointments()
    {
        $invalidAppointments = Appointment::whereNull("specialist_id")
            ->orWhere("specialist_id", "")
            ->get();
        
        foreach ($invalidAppointments as $appointment) {
            self::ensureAppointmentSpecialist($appointment->id);
        }
        
        return $invalidAppointments->count();
    }
}