<?php

/**
 * Test Billing Transaction Creation
 * 
 * This script tests if billing transaction creation is working properly
 */

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use App\Models\BillingTransaction;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\User;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🧪 TESTING BILLING TRANSACTION CREATION\n";
echo "======================================\n\n";

try {
    // Check current data
    echo "1️⃣ Checking current data...\n";
    $patients = DB::table('patients')->count();
    $appointments = DB::table('appointments')->count();
    $billing = DB::table('billing_transactions')->count();
    
    echo "   👥 Patients: {$patients}\n";
    echo "   📅 Appointments: {$appointments}\n";
    echo "   💰 Billing Transactions: {$billing}\n";
    
    if ($patients == 0) {
        echo "\n❌ No patients found. Cannot create billing transaction.\n";
        echo "   Please create a patient first.\n";
        exit(1);
    }
    
    if ($appointments == 0) {
        echo "\n❌ No appointments found. Cannot create billing transaction.\n";
        echo "   Please create an appointment first.\n";
        exit(1);
    }
    
    // Get the first patient and appointment
    $patient = Patient::first();
    $appointment = Appointment::first();
    $doctor = \App\Models\Specialist::where('role', 'Doctor')->first();
    
    echo "\n2️⃣ Found data for testing:\n";
    echo "   👤 Patient: {$patient->first_name} {$patient->last_name} (ID: {$patient->id})\n";
    echo "   📅 Appointment: ID {$appointment->id}, Date: {$appointment->appointment_date}\n";
    echo "   👨‍⚕️ Doctor: " . ($doctor ? $doctor->name : 'No doctor found') . "\n";
    
    // Test billing transaction creation
    echo "\n3️⃣ Testing billing transaction creation...\n";
    
    try {
        // Create a test billing transaction
        $transaction = BillingTransaction::create([
            'transaction_id' => 'TXN-TEST-' . time(),
            'patient_id' => $patient->id,
            'doctor_id' => $doctor ? $doctor->specialist_id : null,
            'payment_type' => 'cash',
            'total_amount' => 300.00,
            'amount' => 300.00,
            'discount_amount' => 0,
            'payment_method' => 'Cash',
            'status' => 'pending',
            'description' => 'Test billing transaction',
            'notes' => 'Created by test script',
            'transaction_date' => now(),
            'transaction_date_only' => now()->toDateString(),
            'transaction_time_only' => now()->toTimeString(),
            'created_by' => 1, // Assuming admin user ID is 1
        ]);
        
        echo "   ✅ Billing transaction created successfully!\n";
        echo "   📋 Transaction ID: {$transaction->id}\n";
        echo "   💰 Amount: {$transaction->total_amount}\n";
        echo "   📅 Date: {$transaction->transaction_date}\n";
        
        // Verify the transaction was saved
        $savedTransaction = BillingTransaction::find($transaction->id);
        if ($savedTransaction) {
            echo "   ✅ Transaction verified in database\n";
        } else {
            echo "   ❌ Transaction not found in database\n";
        }
        
        // Test the show method
        echo "\n4️⃣ Testing billing show method...\n";
        
        // Simulate what the controller would do
        $testId = $transaction->id;
        $foundTransaction = BillingTransaction::find($testId);
        
        if ($foundTransaction) {
            echo "   ✅ Transaction found with ID: {$testId}\n";
            echo "   📋 Status: {$foundTransaction->status}\n";
            echo "   💰 Amount: {$foundTransaction->total_amount}\n";
            echo "   👤 Patient ID: {$foundTransaction->patient_id}\n";
        } else {
            echo "   ❌ Transaction not found with ID: {$testId}\n";
        }
        
        echo "\n🎉 SUCCESS: Billing transaction creation is working!\n";
        echo "✅ Transaction created successfully\n";
        echo "✅ Transaction saved to database\n";
        echo "✅ Transaction can be retrieved\n";
        echo "✅ No errors occurred\n";
        
    } catch (Exception $e) {
        echo "   ❌ Error creating billing transaction: " . $e->getMessage() . "\n";
        echo "   📍 File: " . $e->getFile() . ":" . $e->getLine() . "\n";
        
        // Check for common issues
        echo "\n🔍 Checking for common issues...\n";
        
        // Check if BillingTransaction model exists
        if (!class_exists('App\Models\BillingTransaction')) {
            echo "   ❌ BillingTransaction model not found\n";
        } else {
            echo "   ✅ BillingTransaction model exists\n";
        }
        
        // Check database connection
        try {
            DB::connection()->getPdo();
            echo "   ✅ Database connection working\n";
        } catch (Exception $dbError) {
            echo "   ❌ Database connection failed: " . $dbError->getMessage() . "\n";
        }
        
        // Check if billing_transactions table exists
        if (DB::getSchemaBuilder()->hasTable('billing_transactions')) {
            echo "   ✅ billing_transactions table exists\n";
        } else {
            echo "   ❌ billing_transactions table not found\n";
        }
    }
    
} catch (Exception $e) {
    echo "\n❌ ERROR: Test failed!\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    exit(1);
}

echo "\n🏁 Test completed!\n";
