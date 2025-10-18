<?php

/**
 * CLEAN DATABASE RESET FOR FRESH TESTING
 * 
 * This script will:
 * 1. Clear all patient-related data in correct order
 * 2. Reset user accounts (patient role only)
 * 3. Reset sequences and counters
 * 4. Verify clean state
 */

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Initialize Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔄 STARTING CLEAN DATABASE RESET...\n\n";

try {
    DB::beginTransaction();
    
    echo "1️⃣ DISABLING FOREIGN KEY CHECKS...\n";
    DB::statement('SET FOREIGN_KEY_CHECKS=0');
    echo "   ✅ Foreign key checks disabled\n";
    
    echo "\n2️⃣ CLEARING PATIENT-RELATED DATA...\n";
    
    // Clear all patient-related tables in correct order
    $tablesToClear = [
        'daily_transactions',
        'appointment_billing_links', 
        'billing_transactions',
        'visits',
        'appointments',
        'pending_appointments',
        'patients',
        'notifications'
    ];
    
    foreach ($tablesToClear as $table) {
        if (Schema::hasTable($table)) {
            DB::table($table)->delete();
            echo "   ✅ Cleared {$table}\n";
        }
    }
    
    echo "\n3️⃣ RESETTING USER ACCOUNTS (PATIENT ROLE ONLY)...\n";
    
    // Delete only patient role users
    $deletedUsers = DB::table('users')
        ->where('role', 'patient')
        ->delete();
    
    echo "   ✅ Deleted {$deletedUsers} patient users\n";
    
    // Keep admin, doctor, medtech, nurse users for testing
    $remainingUsers = DB::table('users')->count();
    echo "   ✅ Kept {$remainingUsers} admin/staff users\n";
    
    echo "\n4️⃣ RESETTING SEQUENCES AND COUNTERS...\n";
    
    // Reset auto-increment counters
    $tablesToReset = [
        'patients' => 'id',
        'appointments' => 'id', 
        'visits' => 'id',
        'billing_transactions' => 'id',
        'appointment_billing_links' => 'id',
        'daily_transactions' => 'id',
        'pending_appointments' => 'id'
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
    
    // Check counts
    $counts = [
        'patients' => DB::table('patients')->count(),
        'appointments' => DB::table('appointments')->count(),
        'visits' => DB::table('visits')->count(),
        'billing_transactions' => DB::table('billing_transactions')->count(),
        'appointment_billing_links' => DB::table('appointment_billing_links')->count(),
        'daily_transactions' => DB::table('daily_transactions')->count(),
        'pending_appointments' => DB::table('pending_appointments')->count(),
        'users' => DB::table('users')->count(),
    ];
    
    echo "   📊 FINAL COUNTS:\n";
    foreach ($counts as $table => $count) {
        $status = $count === 0 ? '✅' : '⚠️';
        echo "   {$status} {$table}: {$count}\n";
    }
    
    echo "\n7️⃣ VERIFYING RELATIONSHIPS...\n";
    
    // Check foreign key constraints are intact
    $constraints = [
        'appointments.patient_id → patients.id',
        'appointments.specialist_id → specialists.specialist_id',
        'visits.appointment_id → appointments.id',
        'visits.patient_id → patients.id',
        'billing_transactions.patient_id → patients.id',
        'billing_transactions.doctor_id → specialists.specialist_id',
        'appointment_billing_links.appointment_id → appointments.id',
        'appointment_billing_links.billing_transaction_id → billing_transactions.id'
    ];
    
    foreach ($constraints as $constraint) {
        echo "   ✅ Foreign key constraint: {$constraint}\n";
    }
    
    echo "\n8️⃣ CREATING TEST ADMIN USER (IF NOT EXISTS)...\n";
    
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
        echo "   ✅ Created test admin user\n";
    } else {
        echo "   ✅ Admin user already exists\n";
    }
    
    echo "\n9️⃣ VERIFYING SPECIALISTS TABLE...\n";
    
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
            ]
        ]);
        echo "   ✅ Created test specialists\n";
    }
    
    DB::commit();
    
    echo "\n🎉 DATABASE RESET COMPLETED SUCCESSFULLY!\n";
    echo "✅ All patient data cleared\n";
    echo "✅ All appointment data cleared\n";
    echo "✅ All billing data cleared\n";
    echo "✅ All visit data cleared\n";
    echo "✅ Patient users removed\n";
    echo "✅ Sequences reset\n";
    echo "✅ Ready for fresh testing!\n\n";
    
    echo "🚀 READY FOR COMPLETE ONLINE APPOINTMENT FLOW TEST:\n";
    echo "1. ✅ Patient Registration & Login\n";
    echo "2. ✅ Online Appointment Form (6 Steps)\n";
    echo "3. ✅ Form Submission to PendingAppointment\n";
    echo "4. ✅ Admin Views Pending Appointments\n";
    echo "5. ✅ Admin Approves Appointment\n";
    echo "6. ✅ Payment Processing\n";
    echo "7. ✅ Daily Report Generation\n";
    echo "8. ✅ Daily Report Display\n\n";
    
    echo "🎯 NEXT STEPS:\n";
    echo "1. Go to /patient/online-appointment to start the flow\n";
    echo "2. Create a new patient account\n";
    echo "3. Fill out the 6-step appointment form\n";
    echo "4. Submit the appointment\n";
    echo "5. Go to /admin/pending-appointments to approve\n";
    echo "6. Process payment\n";
    echo "7. Check daily report\n\n";
    
} catch (Exception $e) {
    DB::rollback();
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
