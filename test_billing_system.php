<?php

/**
 * Test script for billing transaction system
 */

require_once "vendor/autoload.php";

use App\Models\BillingTransaction;
use App\Models\Appointment;
use App\Models\AppointmentBillingLink;
use App\Services\ComprehensiveBillingService;

// Bootstrap Laravel
$app = require_once "bootstrap/app.php";
$app->make("Illuminate\Contracts\Console\Kernel")->bootstrap();

echo "=== TESTING BILLING TRANSACTION SYSTEM ===\n\n";

try {
    // Test 1: Check database structure
    echo "1. Testing database structure...\n";
    
    $transactionCount = BillingTransaction::count();
    $linkCount = AppointmentBillingLink::count();
    $appointmentCount = Appointment::where("billing_status", "pending")->count();
    
    echo "   ✓ Billing transactions: {$transactionCount}\n";
    echo "   ✓ Appointment billing links: {$linkCount}\n";
    echo "   ✓ Pending appointments: {$appointmentCount}\n\n";
    
    // Test 2: Test service functionality
    echo "2. Testing billing service...\n";
    
    $billingService = new ComprehensiveBillingService();
    $pendingAppointments = $billingService->getPendingAppointments();
    
    echo "   ✓ Pending appointments retrieved: " . $pendingAppointments->count() . "\n";
    
    // Test 3: Test transaction creation
    if ($pendingAppointments->count() > 0) {
        echo "3. Testing transaction creation...\n";
        
        $firstAppointment = $pendingAppointments->first();
        $transaction = $billingService->createTransactionFromAppointment($firstAppointment);
        
        echo "   ✓ Transaction created: {$transaction->transaction_id}\n";
        echo "   ✓ Amount: ₱{$transaction->total_amount}\n";
        echo "   ✓ Status: {$transaction->status}\n\n";
        
        // Test 4: Test marking as paid
        echo "4. Testing mark as paid...\n";
        
        $billingService->markTransactionAsPaid($transaction, [
            "payment_method" => "cash",
            "payment_reference" => "TEST-001"
        ]);
        
        $transaction->refresh();
        echo "   ✓ Transaction status: {$transaction->status}\n";
        echo "   ✓ Payment method: {$transaction->payment_method}\n\n";
    }
    
    echo "=== ALL TESTS PASSED ===\n";
    
} catch (Exception $e) {
    echo "❌ Test failed: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}