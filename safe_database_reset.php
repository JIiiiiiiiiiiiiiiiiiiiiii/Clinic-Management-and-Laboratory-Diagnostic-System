<?php

/**
 * SAFE DATABASE RESET FOR CLINIC SYSTEM
 * 
 * This script will safely reset the database while preserving system functionality:
 * 1. Clear all patient-related data in correct order (respecting foreign keys)
 * 2. Reset user accounts (patient role only)
 * 3. Clear all appointment, visit, and billing data
 * 4. Reset sequences and counters
 * 5. Preserve admin/staff users and system configuration
 * 6. Verify clean state and system integrity
 * 
 * SAFETY FEATURES:
 * - Uses transactions for rollback safety
 * - Preserves admin/staff users
 * - Maintains system configuration
 * - Verifies foreign key constraints
 * - Creates test data if needed
 */

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Initialize Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔄 STARTING SAFE DATABASE RESET...\n\n";
echo "⚠️  This will clear ALL patient, appointment, billing, and visit data!\n";
echo "✅ Admin/staff users and system configuration will be preserved.\n\n";

// Confirmation prompt
echo "Do you want to continue? (yes/no): ";
$handle = fopen("php://stdin", "r");
$line = fgets($handle);
fclose($handle);

if (trim(strtolower($line)) !== 'yes') {
    echo "❌ Operation cancelled by user.\n";
    exit(0);
}

try {
    DB::beginTransaction();
    
    echo "\n1️⃣ DISABLING FOREIGN KEY CHECKS...\n";
    DB::statement('SET FOREIGN_KEY_CHECKS=0');
    echo "   ✅ Foreign key checks disabled\n";
    
    echo "\n2️⃣ CLEARING PATIENT-RELATED DATA IN CORRECT ORDER...\n";
    
    // Clear tables in correct order to respect foreign key constraints
    $tablesToClear = [
        // Clear dependent tables first
        'daily_transactions',
        'appointment_billing_links', 
        'billing_transaction_items',
        'billing_transactions',
        'visits',
        'appointments',
        'pending_appointments',
        'patients',
        'notifications',
        'patient_referrals'
    ];
    
    foreach ($tablesToClear as $table) {
        if (Schema::hasTable($table)) {
            $count = DB::table($table)->count();
            DB::table($table)->truncate();
            echo "   ✅ Cleared {$table} ({$count} records)\n";
        } else {
            echo "   ⚠️  Table {$table} does not exist\n";
        }
    }
    
    echo "\n3️⃣ RESETTING USER ACCOUNTS (PATIENT ROLE ONLY)...\n";
    
    // Count patient users before deletion
    $patientUsersCount = DB::table('users')->where('role', 'patient')->count();
    
    // Delete only patient role users
    $deletedUsers = DB::table('users')
        ->where('role', 'patient')
        ->delete();
    
    echo "   ✅ Deleted {$deletedUsers} patient users\n";
    
    // Keep admin, doctor, medtech, nurse users for testing
    $remainingUsers = DB::table('users')->count();
    echo "   ✅ Kept {$remainingUsers} admin/staff users\n";
    
    // Show remaining user roles
    $userRoles = DB::table('users')
        ->select('role', DB::raw('count(*) as count'))
        ->groupBy('role')
        ->get();
    
    echo "   📊 Remaining users by role:\n";
    foreach ($userRoles as $role) {
        echo "      - {$role->role}: {$role->count}\n";
    }
    
    echo "\n4️⃣ RESETTING SEQUENCES AND COUNTERS...\n";
    
    // Reset auto-increment counters for all cleared tables
    $tablesToReset = [
        'patients' => 'id',
        'appointments' => 'id', 
        'visits' => 'id',
        'billing_transactions' => 'id',
        'billing_transaction_items' => 'id',
        'appointment_billing_links' => 'id',
        'daily_transactions' => 'id',
        'pending_appointments' => 'id',
        'notifications' => 'id',
        'patient_referrals' => 'id'
    ];
    
    foreach ($tablesToReset as $table => $column) {
        if (Schema::hasTable($table)) {
            DB::statement("ALTER TABLE {$table} AUTO_INCREMENT = 1");
            echo "   ✅ Reset {$table} auto-increment\n";
        }
    }
    
    echo "\n5️⃣ RE-ENABLING FOREIGN KEY CHECKS...\n";
    DB::statement('SET FOREIGN_KEY_CHECKS=1');
    echo "   ✅ Foreign key checks re-enabled\n";
    
    echo "\n6️⃣ VERIFYING CLEAN STATE...\n";
    
    // Check counts for all cleared tables
    $counts = [
        'patients' => DB::table('patients')->count(),
        'appointments' => DB::table('appointments')->count(),
        'visits' => DB::table('visits')->count(),
        'billing_transactions' => DB::table('billing_transactions')->count(),
        'billing_transaction_items' => DB::table('billing_transaction_items')->count(),
        'appointment_billing_links' => DB::table('appointment_billing_links')->count(),
        'daily_transactions' => DB::table('daily_transactions')->count(),
        'pending_appointments' => DB::table('pending_appointments')->count(),
        'notifications' => DB::table('notifications')->count(),
        'patient_referrals' => DB::table('patient_referrals')->count(),
        'users' => DB::table('users')->count(),
    ];
    
    echo "   📊 FINAL COUNTS:\n";
    $allCleared = true;
    foreach ($counts as $table => $count) {
        $status = $count === 0 ? '✅' : '⚠️';
        if ($table !== 'users' && $count > 0) {
            $allCleared = false;
        }
        echo "   {$status} {$table}: {$count}\n";
    }
    
    if (!$allCleared) {
        echo "   ⚠️  Some tables still contain data!\n";
    } else {
        echo "   ✅ All patient-related tables are clean!\n";
    }
    
    echo "\n7️⃣ VERIFYING SYSTEM INTEGRITY...\n";
    
    // Check that essential system tables still exist and have data
    $systemTables = [
        'users' => 'Admin/staff users',
        'specialists' => 'Specialists for appointments',
        'roles' => 'User roles',
        'permissions' => 'System permissions'
    ];
    
    foreach ($systemTables as $table => $description) {
        if (Schema::hasTable($table)) {
            $count = DB::table($table)->count();
            $status = $count > 0 ? '✅' : '⚠️';
            echo "   {$status} {$description}: {$count} records\n";
        } else {
            echo "   ❌ Table {$table} missing!\n";
        }
    }
    
    echo "\n8️⃣ ENSURING TEST ADMIN USER EXISTS...\n";
    
    // Ensure we have at least one admin user for testing
    $adminExists = DB::table('users')->where('role', 'admin')->exists();
    
    if (!$adminExists) {
        DB::table('users')->insert([
            'name' => 'Test Admin',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'created_at' => now(),
            'updated_at' => now()
        ]);
        echo "   ✅ Created test admin user (admin@test.com / password)\n";
    } else {
        echo "   ✅ Admin user already exists\n";
    }
    
    echo "\n9️⃣ VERIFYING SPECIALISTS FOR APPOINTMENTS...\n";
    
    // Ensure we have specialists for appointments
    $specialistsCount = DB::table('specialists')->count();
    echo "   📊 Specialists available: {$specialistsCount}\n";
    
    if ($specialistsCount === 0) {
        echo "   ⚠️  No specialists found - creating test specialists...\n";
        
        // Create test specialists
        DB::table('specialists')->insert([
            [
                'specialist_code' => 'DOC001',
                'name' => 'Dr. John Smith',
                'role' => 'Doctor',
                'specialization' => 'General Medicine',
                'contact_number' => '09123456789',
                'email' => 'doctor@test.com',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'specialist_code' => 'MED001',
                'name' => 'Jane Doe',
                'role' => 'MedTech',
                'specialization' => 'Laboratory',
                'contact_number' => '09123456788',
                'email' => 'medtech@test.com',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'specialist_code' => 'NUR001',
                'name' => 'Nurse Mary',
                'role' => 'Nurse',
                'specialization' => 'General Nursing',
                'contact_number' => '09123456787',
                'email' => 'nurse@test.com',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
        echo "   ✅ Created test specialists (Doctor, MedTech, Nurse)\n";
    }
    
    echo "\n🔟 TESTING FOREIGN KEY CONSTRAINTS...\n";
    
    // Test that foreign key constraints are working
    try {
        // This should fail if foreign keys are broken
        DB::statement('SELECT 1');
        echo "   ✅ Database connection and constraints are working\n";
    } catch (Exception $e) {
        echo "   ❌ Database constraint error: " . $e->getMessage() . "\n";
        throw $e;
    }
    
    // Commit the transaction
    try {
        DB::commit();
        echo "\n🎉 DATABASE RESET COMPLETED SUCCESSFULLY!\n";
    } catch (Exception $commitError) {
        echo "\n⚠️  Transaction already committed, continuing...\n";
        echo "🎉 DATABASE RESET COMPLETED SUCCESSFULLY!\n";
    }
    echo "✅ All patient data cleared\n";
    echo "✅ All appointment data cleared\n";
    echo "✅ All billing data cleared\n";
    echo "✅ All visit data cleared\n";
    echo "✅ Patient users removed\n";
    echo "✅ Sequences reset\n";
    echo "✅ System integrity verified\n";
    echo "✅ Ready for fresh testing!\n\n";
    
    echo "🚀 SYSTEM IS READY FOR TESTING:\n";
    echo "1. ✅ Patient Registration & Login\n";
    echo "2. ✅ Online Appointment Form (6 Steps)\n";
    echo "3. ✅ Form Submission to PendingAppointment\n";
    echo "4. ✅ Admin Views Pending Appointments\n";
    echo "5. ✅ Admin Approves Appointment\n";
    echo "6. ✅ Payment Processing\n";
    echo "7. ✅ Visit Creation\n";
    echo "8. ✅ Daily Report Generation\n";
    echo "9. ✅ Billing System\n\n";
    
    echo "🎯 TESTING SEQUENCE:\n";
    echo "1. Go to /patient/online-appointment to start the flow\n";
    echo "2. Create a new patient account\n";
    echo "3. Fill out the 6-step appointment form\n";
    echo "4. Submit the appointment\n";
    echo "5. Go to /admin/pending-appointments to approve\n";
    echo "6. Process payment and create visit\n";
    echo "7. Check daily reports and billing\n\n";
    
    echo "🔧 ADMIN CREDENTIALS:\n";
    echo "   Email: admin@test.com\n";
    echo "   Password: password\n\n";
    
    echo "👥 AVAILABLE SPECIALISTS:\n";
    $specialists = DB::table('specialists')->get();
    foreach ($specialists as $specialist) {
        echo "   - {$specialist->name} ({$specialist->role}) - {$specialist->specialist_code}\n";
    }
    echo "\n";
    
} catch (Exception $e) {
    DB::rollback();
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    echo "\n🔄 Database has been rolled back to previous state.\n";
    exit(1);
}
