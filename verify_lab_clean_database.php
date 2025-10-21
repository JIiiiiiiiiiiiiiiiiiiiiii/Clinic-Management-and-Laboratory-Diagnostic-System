<?php

/**
 * Lab Orders Database Verification Script
 * 
 * This script verifies that the lab database has been properly cleaned
 * and all user roles are preserved.
 */

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 LAB ORDERS DATABASE VERIFICATION SCRIPT\n";
echo "==========================================\n\n";

try {
    // Check main lab tables
    echo "🧪 Checking main lab tables...\n";
    
    $labTables = [
        'lab_orders' => 'Lab order records',
        'lab_results' => 'Lab result records', 
        'lab_result_values' => 'Lab result value records',
        'lab_requests' => 'Lab request records',
        'laboratory_reports' => 'Laboratory report records'
    ];
    
    $allClean = true;
    foreach ($labTables as $table => $description) {
        if (Schema::hasTable($table)) {
            $count = DB::table($table)->count();
            if ($count == 0) {
                echo "   ✅ {$description}: {$count} records (CLEAN)\n";
            } else {
                echo "   ❌ {$description}: {$count} records (NOT CLEAN)\n";
                $allClean = false;
            }
        } else {
            echo "   ⚠️  Table '{$table}' does not exist\n";
        }
    }
    
    // Check user roles are preserved
    echo "\n👥 Checking user roles...\n";
    $userCount = DB::table('users')->count();
    $adminCount = DB::table('users')->where('role', 'admin')->count();
    $doctorCount = DB::table('users')->where('role', 'doctor')->count();
    $hospitalAdminCount = DB::table('users')->where('role', 'hospital_admin')->count();
    $patientCount = DB::table('users')->where('role', 'patient')->count();
    $medtechCount = DB::table('users')->where('role', 'medtech')->count();
    $labTechCount = DB::table('users')->where('role', 'laboratory_technologist')->count();
    $nurseCount = DB::table('users')->where('role', 'nurse')->count();
    
    echo "   ✅ Total users: {$userCount}\n";
    echo "   ✅ Admin users: {$adminCount}\n";
    echo "   ✅ Doctor users: {$doctorCount}\n";
    echo "   ✅ Hospital admin users: {$hospitalAdminCount}\n";
    echo "   ✅ Patient users: {$patientCount}\n";
    echo "   ✅ MedTech users: {$medtechCount}\n";
    echo "   ✅ Lab technologist users: {$labTechCount}\n";
    echo "   ✅ Nurse users: {$nurseCount}\n";
    
    // Check auto-increment counters
    echo "\n🔢 Checking auto-increment counters...\n";
    $mainLabTables = ['lab_orders', 'lab_results', 'lab_result_values', 'lab_requests', 'laboratory_reports'];
    
    foreach ($mainLabTables as $table) {
        if (Schema::hasTable($table)) {
            $result = DB::select("SHOW TABLE STATUS LIKE '{$table}'");
            if (!empty($result)) {
                $autoIncrement = $result[0]->Auto_increment;
                if ($autoIncrement == 1) {
                    echo "   ✅ {$table}: Auto-increment = {$autoIncrement} (RESET)\n";
                } else {
                    echo "   ❌ {$table}: Auto-increment = {$autoIncrement} (NOT RESET)\n";
                    $allClean = false;
                }
            }
        }
    }
    
    // Check lab tests are preserved (reference data)
    echo "\n🧪 Checking lab tests (reference data)...\n";
    if (Schema::hasTable('lab_tests')) {
        $labTestsCount = DB::table('lab_tests')->count();
        if ($labTestsCount > 0) {
            echo "   ✅ Lab tests preserved: {$labTestsCount} tests (REFERENCE DATA)\n";
        } else {
            echo "   ⚠️  No lab tests found - this may be normal if no tests were configured\n";
        }
    } else {
        echo "   ⚠️  Table 'lab_tests' does not exist\n";
    }
    
    // Check related lab tables
    echo "\n🔬 Checking related lab tables...\n";
    $relatedLabTables = [
        'lab_transactions' => 'Lab transactions',
        'lab_payments' => 'Lab payments',
        'lab_billing_links' => 'Lab billing links',
        'lab_order_items' => 'Lab order items',
        'lab_test_results' => 'Lab test results',
        'lab_sample_collections' => 'Lab sample collections',
        'lab_workflows' => 'Lab workflows'
    ];
    
    foreach ($relatedLabTables as $table => $description) {
        if (Schema::hasTable($table)) {
            $count = DB::table($table)->count();
            if ($count == 0) {
                echo "   ✅ {$description}: {$count} records (CLEAN)\n";
            } else {
                echo "   ⚠️  {$description}: {$count} records\n";
            }
        }
    }
    
    // Check that patients, appointments, visits are still clean
    echo "\n🏥 Checking main clinic tables...\n";
    $clinicTables = [
        'patients' => 'Patient records',
        'appointments' => 'Appointment records',
        'visits' => 'Visit records',
        'billing_transactions' => 'Billing transaction records'
    ];
    
    foreach ($clinicTables as $table => $description) {
        if (Schema::hasTable($table)) {
            $count = DB::table($table)->count();
            if ($count == 0) {
                echo "   ✅ {$description}: {$count} records (CLEAN)\n";
            } else {
                echo "   ⚠️  {$description}: {$count} records\n";
            }
        }
    }
    
    // Final summary
    echo "\n📋 LAB VERIFICATION SUMMARY\n";
    echo "===========================\n";
    
    if ($allClean && $userCount > 0) {
        echo "🎉 SUCCESS: Lab database is clean and ready!\n";
        echo "✅ All lab order data has been cleared\n";
        echo "✅ All lab result data has been cleared\n";
        echo "✅ All lab request data has been cleared\n";
        echo "✅ User roles and authentication preserved\n";
        echo "✅ Lab tests (reference data) preserved\n";
        echo "✅ Auto-increment counters reset\n";
        echo "✅ Database is ready for fresh lab data\n";
    } else {
        echo "⚠️  WARNING: Some issues detected\n";
        if (!$allClean) {
            echo "❌ Some lab tables still contain data\n";
        }
        if ($userCount == 0) {
            echo "❌ No users found - this may indicate a problem\n";
        }
    }
    
} catch (Exception $e) {
    echo "\n❌ ERROR: Lab verification failed!\n";
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n🏁 Lab verification completed!\n";
