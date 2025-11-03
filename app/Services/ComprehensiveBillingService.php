<?php

namespace App\Services;

use App\Models\BillingTransaction;
use App\Models\BillingTransactionItem;
use App\Models\AppointmentBillingLink;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Specialist;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ComprehensiveBillingService
{
    /**
     * Create billing transaction from appointment
     */
    public function createTransactionFromAppointment(Appointment $appointment, array $options = []): BillingTransaction
    {
        return DB::transaction(function () use ($appointment, $options) {
            // Get doctor ID
            $doctorId = null;
            if ($appointment->specialist_type === "doctor") {
                $doctorId = $appointment->specialist_id;
            }
            
            // Use final_total_amount if available (includes lab tests), otherwise use price
            $totalAmount = $appointment->final_total_amount ?? $appointment->price;
            
            // Generate transaction ID
            $nextId = BillingTransaction::max("id") + 1;
            $transactionId = "TXN-" . str_pad($nextId, 6, "0", STR_PAD_LEFT);
            
            // Create billing transaction
            $transaction = BillingTransaction::create([
                "transaction_id" => $transactionId,
                "patient_id" => $appointment->patient_id,
                "doctor_id" => $doctorId,
                "payment_type" => $options["payment_type"] ?? "cash",
                "total_amount" => $totalAmount,
                "amount" => $totalAmount,
                "discount_amount" => $options["discount_amount"] ?? 0,
                "payment_method" => $options["payment_method"] ?? "cash",
                "status" => $options["status"] ?? "pending",
                "description" => "Payment for " . ucfirst($appointment->appointment_type) . " appointment",
                "notes" => $options["notes"] ?? null,
                "transaction_date" => now(),
                "transaction_date_only" => now()->toDateString(),
                "transaction_time_only" => now()->toTimeString(),
                "created_by" => auth()->id() ?? 1,
                "is_itemized" => true, // Always itemize for proper breakdown
            ]);
            
            // Create appointment billing link
            AppointmentBillingLink::create([
                "appointment_id" => $appointment->id,
                "billing_transaction_id" => $transaction->id,
                "appointment_type" => $appointment->appointment_type,
                "appointment_price" => $appointment->price,
                "status" => "pending",
            ]);
            
            // Create itemized billing transaction items
            // 1. Get base consultation price using calculatePrice() method
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
            
            // 2. CRITICAL: Directly query appointment_lab_tests table to ensure we get ALL lab tests
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
            
            // Update appointment billing status
            $appointment->update(["billing_status" => "in_transaction"]);
            
            Log::info("Billing transaction created from appointment with itemized items", [
                "transaction_id" => $transaction->id,
                "appointment_id" => $appointment->id,
                "patient_id" => $appointment->patient_id,
                "total_amount" => $totalAmount,
                "appointment_price" => $appointment->price,
                "lab_amount" => $appointment->total_lab_amount ?? 0,
                "items_count" => $transaction->items()->count()
            ]);
            
            return $transaction;
        });
    }
    
    /**
     * Create billing transaction from multiple appointments
     */
    public function createTransactionFromAppointments(array $appointmentIds, array $options = []): BillingTransaction
    {
        return DB::transaction(function () use ($appointmentIds, $options) {
            $appointments = Appointment::whereIn("id", $appointmentIds)
                ->where("billing_status", "pending")
                ->get();
            
            if ($appointments->isEmpty()) {
                throw new \Exception("No valid pending appointments found");
            }
            
            // Calculate total including lab tests
            $totalAmount = $appointments->sum(function($apt) {
                return $apt->final_total_amount ?? $apt->price;
            });
            $firstAppointment = $appointments->first();
            
            // Get doctor ID from first appointment
            $doctorId = null;
            if ($firstAppointment->specialist_type === "doctor") {
                $doctorId = $firstAppointment->specialist_id;
            }
            
            // Generate transaction ID
            $nextId = BillingTransaction::max("id") + 1;
            $transactionId = "TXN-" . str_pad($nextId, 6, "0", STR_PAD_LEFT);
            
            // Create billing transaction
            $transaction = BillingTransaction::create([
                "transaction_id" => $transactionId,
                "patient_id" => $firstAppointment->patient_id,
                "doctor_id" => $doctorId,
                "payment_type" => $options["payment_type"] ?? "cash",
                "total_amount" => $totalAmount,
                "amount" => $totalAmount,
                "discount_amount" => $options["discount_amount"] ?? 0,
                "payment_method" => $options["payment_method"] ?? "cash",
                "status" => $options["status"] ?? "pending",
                "description" => "Payment for " . $appointments->count() . " appointment(s)",
                "notes" => $options["notes"] ?? null,
                "transaction_date" => now(),
                "transaction_date_only" => now()->toDateString(),
                "transaction_time_only" => now()->toTimeString(),
                "created_by" => auth()->id() ?? 1,
                "is_itemized" => true, // Always itemize for proper breakdown
            ]);
            
            // Create appointment billing links and itemized items
            foreach ($appointments as $appointment) {
                $appointment->refresh(); // Refresh to get latest data
                AppointmentBillingLink::create([
                    "appointment_id" => $appointment->id,
                    "billing_transaction_id" => $transaction->id,
                    "appointment_type" => $appointment->appointment_type,
                    "appointment_price" => $appointment->price,
                    "status" => "pending",
                ]);
                
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
                
                // Update appointment billing status
                $appointment->update(["billing_status" => "in_transaction"]);
            }
            
            Log::info("Billing transaction created from multiple appointments", [
                "transaction_id" => $transaction->id,
                "appointments_count" => $appointments->count(),
                "total_amount" => $totalAmount
            ]);
            
            return $transaction;
        });
    }
    
    /**
     * Mark transaction as paid
     */
    public function markTransactionAsPaid(BillingTransaction $transaction, array $options = []): void
    {
        DB::transaction(function () use ($transaction, $options) {
            // Update transaction
            $transaction->update([
                "status" => "paid",
                "payment_method" => $options["payment_method"] ?? $transaction->payment_method,
                "payment_reference" => $options["payment_reference"] ?? null,
                "notes" => $options["notes"] ?? $transaction->notes,
                "updated_by" => auth()->id() ?? 1,
            ]);
            
            // Update appointment links
            $transaction->appointmentLinks()->update(["status" => "paid"]);
            
            // Update appointments billing status
            $transaction->appointments()->update(["billing_status" => "paid"]);
            
            Log::info("Transaction marked as paid", [
                "transaction_id" => $transaction->id,
                "amount" => $transaction->total_amount
            ]);
        });
    }
    
    /**
     * Get pending appointments for billing
     */
    public function getPendingAppointments()
    {
        return Appointment::where("billing_status", "pending")
            ->with(["patient", "specialist"])
            ->orderBy("appointment_date", "asc")
            ->get();
    }
    
    /**
     * Get billing transactions with relationships
     */
    public function getBillingTransactions($filters = [])
    {
        $query = BillingTransaction::with(["patient", "doctor", "appointmentLinks"]);
        
        if (isset($filters["status"]) && $filters["status"] !== "all") {
            $query->where("status", $filters["status"]);
        }
        
        if (isset($filters["payment_method"]) && $filters["payment_method"] !== "all") {
            $query->where("payment_method", $filters["payment_method"]);
        }
        
        if (isset($filters["doctor_id"]) && $filters["doctor_id"] !== "all") {
            $query->where("doctor_id", $filters["doctor_id"]);
        }
        
        if (isset($filters["date_from"])) {
            $query->whereDate("transaction_date", ">=", $filters["date_from"]);
        }
        
        if (isset($filters["date_to"])) {
            $query->whereDate("transaction_date", "<=", $filters["date_to"]);
        }
        
        return $query->orderBy("created_at", "desc")->paginate(15);
    }
}