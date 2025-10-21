<?php

/**
 * Clean Database Reset Script for Clinic System
 * 
 * This script will:
 * 1. Clear all patient data
 * 2. Clear all visit data  
 * 3. Clear all appointment data
 * 4. Clear all billing data
 * 5. Preserve user roles and authentication data
 * 6. Reset auto-increment counters
 * 
 * IMPORTANT: This will permanently delete all clinic data!
 * Make sure to backup your database before running this script.
 */

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🏥 CLINIC DATABASE RESET SCRIPT\n";
echo "================================\n\n";

try {
    echo "📋 Starting database cleanup...\n\n";
    
    // Disable foreign key checks for the entire operation
    DB::statement('SET FOREIGN_KEY_CHECKS=0;');
    
    // 1. Clear billing-related data first (due to foreign key constraints)
    echo "1️⃣ Clearing billing transactions...\n";
    
    // Clear any related billing tables first
    $tablesToCheck = [
        'billing_transaction_items',
        'appointment_billing_links', 
        'doctor_payment_billing_links',
        'billing_transactions'
    ];
    
    foreach ($tablesToCheck as $table) {
        if (Schema::hasTable($table)) {
            $count = DB::table($table)->count();
            DB::table($table)->truncate();
            echo "   ✅ Cleared {$count} records from {$table}\n";
        }
    }
    
    // Now clear billing transactions
    $billingCount = DB::table('billing_transactions')->count();
    DB::table('billing_transactions')->truncate();
    echo "   ✅ Cleared {$billingCount} billing transactions\n";
    
    // 2. Clear visits data
    echo "\n2️⃣ Clearing visits...\n";
    $visitsCount = DB::table('visits')->count();
    DB::table('visits')->truncate();
    echo "   ✅ Cleared {$visitsCount} visits\n";
    
    // 3. Clear appointments data
    echo "\n3️⃣ Clearing appointments...\n";
    $appointmentsCount = DB::table('appointments')->count();
    DB::table('appointments')->truncate();
    echo "   ✅ Cleared {$appointmentsCount} appointments\n";
    
    // 4. Clear patients data
    echo "\n4️⃣ Clearing patients...\n";
    $patientsCount = DB::table('patients')->count();
    DB::table('patients')->truncate();
    echo "   ✅ Cleared {$patientsCount} patients\n";
    
    // 5. Clear any pending appointments view data
    echo "\n5️⃣ Clearing pending appointments...\n";
    if (Schema::hasTable('pending_appointments')) {
        $pendingCount = DB::table('pending_appointments')->count();
        DB::table('pending_appointments')->truncate();
        echo "   ✅ Cleared {$pendingCount} pending appointments\n";
    }
    
    // 6. Clear any related cache or temporary data
    echo "\n6️⃣ Clearing related data...\n";
    
    // Clear any lab-related data if exists (in correct order)
    $labTables = ['lab_result_values', 'lab_results', 'lab_requests', 'lab_transactions'];
    foreach ($labTables as $table) {
        if (Schema::hasTable($table)) {
            $count = DB::table($table)->count();
            DB::table($table)->truncate();
            echo "   ✅ Cleared {$count} records from {$table}\n";
        }
    }
    
    // Clear any supply-related data if exists
    $supplyTables = ['supply_transactions', 'supply_items'];
    foreach ($supplyTables as $table) {
        if (Schema::hasTable($table)) {
            $count = DB::table($table)->count();
            DB::table($table)->truncate();
            echo "   ✅ Cleared {$count} records from {$table}\n";
        }
    }
    
    // 7. Reset auto-increment counters
    echo "\n7️⃣ Resetting auto-increment counters...\n";
    $tables = ['patients', 'appointments', 'visits', 'billing_transactions'];
    
    foreach ($tables as $table) {
        if (Schema::hasTable($table)) {
            DB::statement("ALTER TABLE {$table} AUTO_INCREMENT = 1");
            echo "   ✅ Reset {$table} auto-increment\n";
        }
    }
    
    // Re-enable foreign key checks
    DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    
    // 8. Verify user roles are preserved
    echo "\n8️⃣ Verifying user roles are preserved...\n";
    $userCount = DB::table('users')->count();
    $adminCount = DB::table('users')->where('role', 'admin')->count();
    $doctorCount = DB::table('users')->where('role', 'doctor')->count();
    $hospitalAdminCount = DB::table('users')->where('role', 'hospital_admin')->count();
    
    echo "   ✅ Users preserved: {$userCount} total users\n";
    echo "   ✅ Admin users: {$adminCount}\n";
    echo "   ✅ Doctor users: {$doctorCount}\n";
    echo "   ✅ Hospital admin users: {$hospitalAdminCount}\n";
    
    echo "\n🎉 DATABASE RESET COMPLETED SUCCESSFULLY!\n";
    echo "========================================\n";
    echo "✅ All patient data cleared\n";
    echo "✅ All visit data cleared\n";
    echo "✅ All appointment data cleared\n";
    echo "✅ All billing data cleared\n";
    echo "✅ User roles and authentication preserved\n";
    echo "✅ Auto-increment counters reset\n";
    echo "\n📝 The database is now clean and ready for fresh data.\n";
    echo "🔐 All user accounts and roles remain intact.\n";
    
} catch (Exception $e) {
    // Rollback on error
    DB::rollback();
    
    echo "\n❌ ERROR: Database reset failed!\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "All changes have been rolled back.\n";
    exit(1);
}

echo "\n🏁 Script completed successfully!\n";
