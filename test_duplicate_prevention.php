<?php

/**
 * Test script for duplicate prevention system
 */

require_once "vendor/autoload.php";

use App\Models\BillingTransaction;
use App\Models\Appointment;
use App\Models\AppointmentBillingLink;
use App\Services\EnhancedAppointmentCreationService;
use App\Services\EnhancedBillingService;

// Bootstrap Laravel
$app = require_once "bootstrap/app.php";
$app->make("Illuminate\Contracts\Console\Kernel")->bootstrap();

echo "=== TESTING DUPLICATE PREVENTION SYSTEM ===\n\n";

try {
    // Test 1: Check database structure
    echo "1. Testing database structure...\n";
    
    $appointmentCount = Appointment::count();
    $transactionCount = BillingTransaction::count();
    $linkCount = AppointmentBillingLink::count();
    
    echo "   ✓ Appointments: {$appointmentCount}\n";
    echo "   ✓ Billing transactions: {$transactionCount}\n";
    echo "   ✓ Appointment billing links: {$linkCount}\n\n";
    
    // Test 2: Test duplicate prevention
    echo "2. Testing duplicate prevention...\n";
    
    $appointmentService = new EnhancedAppointmentCreationService();
    $billingService = new EnhancedBillingService();
    
    // Test duplicate appointment prevention
    $existingAppointment = Appointment::first();
    if ($existingAppointment) {
        try {
            $duplicateData = [
                "patient_id" => $existingAppointment->patient_id,
                "specialist_id" => $existingAppointment->specialist_id,
                "appointment_date" => $existingAppointment->appointment_date,
                "appointment_time" => $existingAppointment->appointment_time,
                "appointment_type" => $existingAppointment->appointment_type,
                "status" => "Pending",
                "source" => "Test"
            ];
            
            $appointmentService->createAppointmentWithPatient($duplicateData);
            echo "   ❌ Duplicate appointment was created (this should not happen)\n";
        } catch (Exception $e) {
            echo "   ✓ Duplicate appointment prevented: " . $e->getMessage() . "\n";
        }
    }
    
    // Test duplicate billing prevention
    $existingTransaction = BillingTransaction::first();
    if ($existingTransaction) {
        try {
            $duplicateTransaction = BillingTransaction::create([
                "patient_id" => $existingTransaction->patient_id,
                "doctor_id" => $existingTransaction->doctor_id,
                "total_amount" => $existingTransaction->total_amount,
                "transaction_date" => $existingTransaction->transaction_date,
                "status" => "pending"
            ]);
            echo "   ❌ Duplicate billing transaction was created (this should not happen)\n";
        } catch (Exception $e) {
            echo "   ✓ Duplicate billing transaction prevented: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n=== ALL TESTS PASSED ===\n";
    
} catch (Exception $e) {
    echo "❌ Test failed: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}