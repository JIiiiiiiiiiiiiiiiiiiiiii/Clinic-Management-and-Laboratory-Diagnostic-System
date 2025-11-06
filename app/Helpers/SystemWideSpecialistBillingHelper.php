<?php

namespace App\Helpers;

use App\Models\Appointment;
use App\Models\BillingTransaction;
use App\Models\BillingTransactionItem;
use App\Models\AppointmentBillingLink;
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
        $existingTransaction = BillingTransaction::where("appointment_id", $appointment->id)
            ->first();
        
        if ($existingTransaction) {
            Log::info("SYSTEM-WIDE: Billing transaction already exists for appointment {$appointmentId}");
            return $existingTransaction;
        }
        
        // STEP 5: Use final_total_amount if available (includes lab tests), otherwise use price
        if (!isset($transactionData["total_amount"])) {
            $transactionData["total_amount"] = $appointment->final_total_amount ?? $appointment->price;
        }
        if (!isset($transactionData["amount"])) {
            $transactionData["amount"] = $transactionData["total_amount"];
        }
        $transactionData["is_itemized"] = true; // Always itemize for proper breakdown
        
        // STEP 6: Create transaction with proper specialist data (SYSTEM-WIDE CREATION)
        $transaction = BillingTransaction::create($transactionData);
        
        // STEP 7: Create itemized billing transaction items (SYSTEM-WIDE ITEMIZATION)
        // Get base consultation price using calculatePrice() method
        $appointmentTypeLabel = $appointment->appointment_type === 'general_consultation' ? 'Consultation' : ucfirst($appointment->appointment_type);
        
        // SPECIAL HANDLING: For "manual_transaction" appointments, use ₱350 if price >= 350
        $baseConsultationPrice = $appointment->calculatePrice();
        if ($appointment->appointment_type === 'manual_transaction' && $appointment->price >= 350) {
            $baseConsultationPrice = 350.00;
        }
        
        // Create consultation item with base price (not inflated price that includes lab tests)
        BillingTransactionItem::create([
            'billing_transaction_id' => $transaction->id,
            'item_type' => 'consultation',
            'item_name' => $appointmentTypeLabel . ' Appointment',
            'item_description' => "Appointment for {$appointment->patient_name} on " . ($appointment->appointment_date ? $appointment->appointment_date->format('M d, Y') : 'N/A') . " at " . ($appointment->appointment_time ? $appointment->appointment_time->format('g:i A') : 'N/A'),
            'quantity' => 1,
            'unit_price' => $baseConsultationPrice,
            'total_price' => $baseConsultationPrice
        ]);
        
        // CRITICAL: Directly query appointment_lab_tests table to ensure we get ALL lab tests
        $appointmentLabTests = \App\Models\AppointmentLabTest::where('appointment_id', $appointment->id)
            ->with('labTest')
            ->get();
        
        // Create lab test items if they exist
        if ($appointmentLabTests->isNotEmpty()) {
            foreach ($appointmentLabTests as $appointmentLabTest) {
                if ($appointmentLabTest->labTest) {
                    $unitPrice = $appointmentLabTest->unit_price ?? $appointmentLabTest->labTest->price ?? 0;
                    $totalPrice = $appointmentLabTest->total_price ?? $appointmentLabTest->labTest->price ?? 0;
                    
                    BillingTransactionItem::create([
                        'billing_transaction_id' => $transaction->id,
                        'item_type' => 'laboratory',
                        'lab_test_id' => $appointmentLabTest->lab_test_id,
                        'item_name' => $appointmentLabTest->labTest->name,
                        'item_description' => "Lab test: {$appointmentLabTest->labTest->name}",
                        'quantity' => 1,
                        'unit_price' => $unitPrice,
                        'total_price' => $totalPrice
                    ]);
                }
            }
        }
        
        // STEP 8: Create appointment billing link (CRITICAL for auto-fix to work)
        $existingLink = AppointmentBillingLink::where('appointment_id', $appointment->id)
            ->where('billing_transaction_id', $transaction->id)
            ->first();
            
        if (!$existingLink) {
            AppointmentBillingLink::create([
                'appointment_id' => $appointment->id,
                'billing_transaction_id' => $transaction->id,
                'appointment_type' => $appointment->appointment_type,
                'appointment_price' => $appointment->price,
                'status' => 'pending',
            ]);
            Log::info("SYSTEM-WIDE: Created appointment billing link for appointment {$appointmentId}");
        }
        
        Log::info("SYSTEM-WIDE: Billing transaction created for appointment {$appointmentId} with doctor_id {$doctorId} and itemized items", [
            'items_count' => $transaction->items()->count(),
            'total_amount' => $transaction->total_amount,
            'has_appointment_link' => true
        ]);
        
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