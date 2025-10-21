<?php

/**
 * Clear Remaining Billing Data
 * 
 * This script clears any remaining billing data that wasn't cleared by the reset script
 */

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🧹 CLEARING REMAINING BILLING DATA\n";
echo "==================================\n\n";

try {
    // Check what billing data exists
    echo "1️⃣ Checking existing billing data...\n";
    
    $billingCount = DB::table('billing_transactions')->count();
    echo "   📊 Billing transactions: {$billingCount}\n";
    
    $itemsCount = DB::table('billing_transaction_items')->count();
    echo "   📊 Billing transaction items: {$itemsCount}\n";
    
    $linksCount = DB::table('appointment_billing_links')->count();
    echo "   📊 Appointment billing links: {$linksCount}\n";
    
    $doctorLinksCount = DB::table('doctor_payment_billing_links')->count();
    echo "   📊 Doctor payment billing links: {$doctorLinksCount}\n";
    
    if ($billingCount > 0) {
        echo "\n2️⃣ Clearing remaining billing data...\n";
        
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Clear in correct order
        DB::table('billing_transaction_items')->truncate();
        echo "   ✅ Cleared billing transaction items\n";
        
        DB::table('appointment_billing_links')->truncate();
        echo "   ✅ Cleared appointment billing links\n";
        
        DB::table('doctor_payment_billing_links')->truncate();
        echo "   ✅ Cleared doctor payment billing links\n";
        
        DB::table('billing_transactions')->truncate();
        echo "   ✅ Cleared billing transactions\n";
        
        // Reset auto-increment
        DB::statement("ALTER TABLE billing_transactions AUTO_INCREMENT = 1");
        echo "   ✅ Reset billing_transactions auto-increment\n";
        
        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        
        echo "\n3️⃣ Verifying cleanup...\n";
        $newBillingCount = DB::table('billing_transactions')->count();
        $newItemsCount = DB::table('billing_transaction_items')->count();
        $newLinksCount = DB::table('appointment_billing_links')->count();
        $newDoctorLinksCount = DB::table('doctor_payment_billing_links')->count();
        
        echo "   📊 Billing transactions: {$newBillingCount}\n";
        echo "   📊 Billing transaction items: {$newItemsCount}\n";
        echo "   📊 Appointment billing links: {$newLinksCount}\n";
        echo "   📊 Doctor payment billing links: {$newDoctorLinksCount}\n";
        
        if ($newBillingCount == 0 && $newItemsCount == 0 && $newLinksCount == 0 && $newDoctorLinksCount == 0) {
            echo "\n🎉 SUCCESS: All billing data cleared!\n";
            echo "✅ No billing transactions remaining\n";
            echo "✅ No billing items remaining\n";
            echo "✅ No billing links remaining\n";
            echo "✅ Auto-increment reset\n";
        } else {
            echo "\n⚠️  WARNING: Some data still remains\n";
        }
        
    } else {
        echo "\n✅ No billing data found - already clean!\n";
    }
    
    // Check user roles are still intact
    echo "\n4️⃣ Verifying user roles...\n";
    $userCount = DB::table('users')->count();
    $adminCount = DB::table('users')->where('role', 'admin')->count();
    echo "   👥 Total users: {$userCount}\n";
    echo "   👑 Admin users: {$adminCount}\n";
    
    if ($userCount > 0) {
        echo "   ✅ User roles preserved\n";
    } else {
        echo "   ❌ No users found - this may indicate a problem\n";
    }
    
} catch (Exception $e) {
    echo "\n❌ ERROR: Cleanup failed!\n";
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n🏁 Cleanup completed!\n";
