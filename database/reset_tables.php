<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Database Reset Script
 * 
 * This script resets the following tables in the correct order to handle foreign key constraints:
 * - patient, appointment, visit, billing, lab orders, users (only patient roles), doctor payments, hmo transactions
 */

echo "Starting database reset...\n";

try {
    // Disable foreign key checks temporarily
    DB::statement('SET FOREIGN_KEY_CHECKS=0;');
    
    // 1. Reset billing_transaction_items first (child of billing_transactions)
    if (Schema::hasTable('billing_transaction_items')) {
        DB::table('billing_transaction_items')->truncate();
        echo "✓ Cleared billing_transaction_items table\n";
    }
    
    // 2. Reset billing_transactions
    if (Schema::hasTable('billing_transactions')) {
        DB::table('billing_transactions')->truncate();
        echo "✓ Cleared billing_transactions table\n";
    }
    
    // 3. Reset doctor_payment_billing_links (child of doctor_payments)
    if (Schema::hasTable('doctor_payment_billing_links')) {
        DB::table('doctor_payment_billing_links')->truncate();
        echo "✓ Cleared doctor_payment_billing_links table\n";
    }
    
    // 4. Reset doctor_payments
    if (Schema::hasTable('doctor_payments')) {
        DB::table('doctor_payments')->truncate();
        echo "✓ Cleared doctor_payments table\n";
    }
    
    // 5. Reset lab-related tables
    if (Schema::hasTable('lab_result_values')) {
        DB::table('lab_result_values')->truncate();
        echo "✓ Cleared lab_result_values table\n";
    }
    
    if (Schema::hasTable('lab_results')) {
        DB::table('lab_results')->truncate();
        echo "✓ Cleared lab_results table\n";
    }
    
    if (Schema::hasTable('lab_orders')) {
        DB::table('lab_orders')->truncate();
        echo "✓ Cleared lab_orders table\n";
    }
    
    if (Schema::hasTable('appointment_lab_orders')) {
        DB::table('appointment_lab_orders')->truncate();
        echo "✓ Cleared appointment_lab_orders table\n";
    }
    
    if (Schema::hasTable('appointment_lab_tests')) {
        DB::table('appointment_lab_tests')->truncate();
        echo "✓ Cleared appointment_lab_tests table\n";
    }
    
    if (Schema::hasTable('lab_requests')) {
        DB::table('lab_requests')->truncate();
        echo "✓ Cleared lab_requests table\n";
    }
    
    // 6. Reset HMO-related tables
    if (Schema::hasTable('hmo_claims')) {
        DB::table('hmo_claims')->truncate();
        echo "✓ Cleared hmo_claims table\n";
    }
    
    if (Schema::hasTable('hmo_patient_coverage')) {
        DB::table('hmo_patient_coverage')->truncate();
        echo "✓ Cleared hmo_patient_coverage table\n";
    }
    
    if (Schema::hasTable('hmo_reports')) {
        DB::table('hmo_reports')->truncate();
        echo "✓ Cleared hmo_reports table\n";
    }
    
    // 7. Reset visits (depends on appointments)
    if (Schema::hasTable('visits')) {
        DB::table('visits')->truncate();
        echo "✓ Cleared visits table\n";
    }
    
    // 8. Reset appointments (depends on patients)
    if (Schema::hasTable('appointments')) {
        DB::table('appointments')->truncate();
        echo "✓ Cleared appointments table\n";
    }
    
    // 9. Reset users with patient role only
    if (Schema::hasTable('users')) {
        DB::table('users')->where('role', 'patient')->delete();
        echo "✓ Cleared patient users from users table\n";
    }
    
    // 10. Reset patients (parent table)
    if (Schema::hasTable('patients')) {
        DB::table('patients')->truncate();
        echo "✓ Cleared patients table\n";
    }
    
    // Re-enable foreign key checks
    DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    
    echo "\n✅ Database reset completed successfully!\n";
    echo "The following tables have been cleared:\n";
    echo "- patients\n";
    echo "- appointments\n";
    echo "- visits\n";
    echo "- billing_transactions\n";
    echo "- billing_transaction_items\n";
    echo "- lab_orders\n";
    echo "- lab_results\n";
    echo "- lab_result_values\n";
    echo "- appointment_lab_orders\n";
    echo "- appointment_lab_tests\n";
    echo "- lab_requests\n";
    echo "- users (patient role only)\n";
    echo "- doctor_payments\n";
    echo "- doctor_payment_billing_links\n";
    echo "- hmo_claims\n";
    echo "- hmo_patient_coverage\n";
    echo "- hmo_reports\n";
    
} catch (Exception $e) {
    echo "❌ Error during database reset: " . $e->getMessage() . "\n";
    // Re-enable foreign key checks even if there was an error
    DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    exit(1);
}
