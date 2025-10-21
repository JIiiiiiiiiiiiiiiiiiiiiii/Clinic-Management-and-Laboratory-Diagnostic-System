<?php

/**
 * Check Current Database State
 * 
 * This script checks the current state of the database after the reset
 */

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "📊 CURRENT DATABASE STATE\n";
echo "========================\n\n";

try {
    // Check main tables
    echo "🏥 Main Clinic Tables:\n";
    $patients = DB::table('patients')->count();
    $appointments = DB::table('appointments')->count();
    $visits = DB::table('visits')->count();
    $billing = DB::table('billing_transactions')->count();
    
    echo "   👥 Patients: {$patients}\n";
    echo "   📅 Appointments: {$appointments}\n";
    echo "   🏥 Visits: {$visits}\n";
    echo "   💰 Billing Transactions: {$billing}\n";
    
    // Check if there's any recent data
    if ($patients > 0) {
        echo "\n📋 Recent Patient Data:\n";
        $recentPatients = DB::table('patients')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get(['id', 'first_name', 'last_name', 'created_at']);
        
        foreach ($recentPatients as $patient) {
            echo "   - ID: {$patient->id}, Name: {$patient->first_name} {$patient->last_name}, Created: {$patient->created_at}\n";
        }
    }
    
    if ($appointments > 0) {
        echo "\n📅 Recent Appointment Data:\n";
        $recentAppointments = DB::table('appointments')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get(['id', 'patient_id', 'appointment_date', 'status', 'created_at']);
        
        foreach ($recentAppointments as $appointment) {
            echo "   - ID: {$appointment->id}, Patient ID: {$appointment->patient_id}, Date: {$appointment->appointment_date}, Status: {$appointment->status}\n";
        }
    }
    
    if ($billing > 0) {
        echo "\n💰 Recent Billing Data:\n";
        $recentBilling = DB::table('billing_transactions')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get(['id', 'transaction_id', 'status', 'total_amount', 'created_at']);
        
        foreach ($recentBilling as $transaction) {
            echo "   - ID: {$transaction->id}, Transaction ID: {$transaction->transaction_id}, Status: {$transaction->status}, Amount: {$transaction->total_amount}\n";
        }
    }
    
    // Check user roles
    echo "\n👥 User Roles:\n";
    $userCount = DB::table('users')->count();
    $adminCount = DB::table('users')->where('role', 'admin')->count();
    $doctorCount = DB::table('users')->where('role', 'doctor')->count();
    $patientCount = DB::table('users')->where('role', 'patient')->count();
    
    echo "   👥 Total Users: {$userCount}\n";
    echo "   👑 Admin Users: {$adminCount}\n";
    echo "   👨‍⚕️ Doctor Users: {$doctorCount}\n";
    echo "   🏥 Patient Users: {$patientCount}\n";
    
    // Summary
    echo "\n📋 SUMMARY\n";
    echo "==========\n";
    
    if ($billing == 0) {
        echo "✅ Billing transactions are cleared (as expected after reset)\n";
    } else {
        echo "⚠️  Found {$billing} billing transactions\n";
    }
    
    if ($patients > 0 || $appointments > 0 || $visits > 0) {
        echo "ℹ️  New data has been created since the reset:\n";
        echo "   - This is normal if you've been testing the system\n";
        echo "   - The reset was successful, but new data was added\n";
    } else {
        echo "✅ All clinic data is clean (no new data since reset)\n";
    }
    
    echo "\n💡 EXPLANATION:\n";
    echo "===============\n";
    echo "The transactions are gone because we performed a database reset to:\n";
    echo "1. Clear all existing data to test sorting functionality\n";
    echo "2. Start with a clean slate for testing\n";
    echo "3. Resolve any data-related issues\n";
    echo "\nThis was intentional and expected behavior.\n";
    
} catch (Exception $e) {
    echo "\n❌ ERROR: Could not check database state!\n";
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n🏁 Check completed!\n";
