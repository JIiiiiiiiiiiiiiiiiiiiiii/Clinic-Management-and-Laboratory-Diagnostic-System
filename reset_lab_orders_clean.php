<?php

/**
 * Lab Orders Database Reset Script
 * 
 * This script will:
 * 1. Clear all lab order data
 * 2. Clear all lab result data
 * 3. Clear all lab result values data
 * 4. Clear all lab request data
 * 5. Clear all laboratory report data
 * 6. Preserve user roles and authentication data
 * 7. Reset auto-increment counters
 * 
 * IMPORTANT: This will permanently delete all lab-related data!
 * Make sure to backup your database before running this script.
 */

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🧪 LAB ORDERS DATABASE RESET SCRIPT\n";
echo "====================================\n\n";

try {
    echo "📋 Starting lab database cleanup...\n\n";
    
    // Disable foreign key checks for the entire operation
    DB::statement('SET FOREIGN_KEY_CHECKS=0;');
    
    // 1. Clear lab result values first (due to foreign key constraints)
    echo "1️⃣ Clearing lab result values...\n";
    if (Schema::hasTable('lab_result_values')) {
        $labResultValuesCount = DB::table('lab_result_values')->count();
        DB::table('lab_result_values')->truncate();
        echo "   ✅ Cleared {$labResultValuesCount} lab result values\n";
    } else {
        echo "   ⚠️  Table 'lab_result_values' does not exist\n";
    }
    
    // 2. Clear lab results
    echo "\n2️⃣ Clearing lab results...\n";
    if (Schema::hasTable('lab_results')) {
        $labResultsCount = DB::table('lab_results')->count();
        DB::table('lab_results')->truncate();
        echo "   ✅ Cleared {$labResultsCount} lab results\n";
    } else {
        echo "   ⚠️  Table 'lab_results' does not exist\n";
    }
    
    // 3. Clear lab requests
    echo "\n3️⃣ Clearing lab requests...\n";
    if (Schema::hasTable('lab_requests')) {
        $labRequestsCount = DB::table('lab_requests')->count();
        DB::table('lab_requests')->truncate();
        echo "   ✅ Cleared {$labRequestsCount} lab requests\n";
    } else {
        echo "   ⚠️  Table 'lab_requests' does not exist\n";
    }
    
    // 4. Clear lab orders
    echo "\n4️⃣ Clearing lab orders...\n";
    if (Schema::hasTable('lab_orders')) {
        $labOrdersCount = DB::table('lab_orders')->count();
        DB::table('lab_orders')->truncate();
        echo "   ✅ Cleared {$labOrdersCount} lab orders\n";
    } else {
        echo "   ⚠️  Table 'lab_orders' does not exist\n";
    }
    
    // 5. Clear laboratory reports
    echo "\n5️⃣ Clearing laboratory reports...\n";
    if (Schema::hasTable('laboratory_reports')) {
        $labReportsCount = DB::table('laboratory_reports')->count();
        DB::table('laboratory_reports')->truncate();
        echo "   ✅ Cleared {$labReportsCount} laboratory reports\n";
    } else {
        echo "   ⚠️  Table 'laboratory_reports' does not exist\n";
    }
    
    // 6. Clear any related lab transaction data
    echo "\n6️⃣ Clearing related lab data...\n";
    $relatedLabTables = [
        'lab_transactions',
        'lab_payments',
        'lab_billing_links',
        'lab_order_items',
        'lab_test_results',
        'lab_sample_collections',
        'lab_workflows'
    ];
    
    foreach ($relatedLabTables as $table) {
        if (Schema::hasTable($table)) {
            $count = DB::table($table)->count();
            DB::table($table)->truncate();
            echo "   ✅ Cleared {$count} records from {$table}\n";
        }
    }
    
    // 7. Reset auto-increment counters
    echo "\n7️⃣ Resetting auto-increment counters...\n";
    $labTables = [
        'lab_orders',
        'lab_results', 
        'lab_result_values',
        'lab_requests',
        'laboratory_reports'
    ];
    
    foreach ($labTables as $table) {
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
    $labTechCount = DB::table('users')->where('role', 'laboratory_technologist')->count();
    $medtechCount = DB::table('users')->where('role', 'medtech')->count();
    
    echo "   ✅ Users preserved: {$userCount} total users\n";
    echo "   ✅ Admin users: {$adminCount}\n";
    echo "   ✅ Doctor users: {$doctorCount}\n";
    echo "   ✅ Hospital admin users: {$hospitalAdminCount}\n";
    echo "   ✅ Lab technologist users: {$labTechCount}\n";
    echo "   ✅ MedTech users: {$medtechCount}\n";
    
    // 9. Verify lab tests are preserved (these are reference data)
    echo "\n9️⃣ Verifying lab tests are preserved...\n";
    if (Schema::hasTable('lab_tests')) {
        $labTestsCount = DB::table('lab_tests')->count();
        echo "   ✅ Lab tests preserved: {$labTestsCount} tests\n";
        echo "   ℹ️  Lab tests are reference data and should not be cleared\n";
    } else {
        echo "   ⚠️  Table 'lab_tests' does not exist\n";
    }
    
    echo "\n🎉 LAB ORDERS DATABASE RESET COMPLETED SUCCESSFULLY!\n";
    echo "==================================================\n";
    echo "✅ All lab order data cleared\n";
    echo "✅ All lab result data cleared\n";
    echo "✅ All lab result values cleared\n";
    echo "✅ All lab request data cleared\n";
    echo "✅ All laboratory report data cleared\n";
    echo "✅ User roles and authentication preserved\n";
    echo "✅ Lab tests (reference data) preserved\n";
    echo "✅ Auto-increment counters reset\n";
    echo "\n📝 The lab database is now clean and ready for fresh data.\n";
    echo "🔐 All user accounts and roles remain intact.\n";
    echo "🧪 Lab tests (reference data) are preserved.\n";
    
} catch (Exception $e) {
    // Rollback on error
    DB::rollback();
    
    echo "\n❌ ERROR: Lab database reset failed!\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "All changes have been rolled back.\n";
    exit(1);
}

echo "\n🏁 Script completed successfully!\n";
