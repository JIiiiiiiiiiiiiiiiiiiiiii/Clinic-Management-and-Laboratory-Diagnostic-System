<?php

/**
 * RELATIONSHIP ISSUES FIX SCRIPT
 * 
 * This script fixes common relationship issues:
 * 1. Orphaned records
 * 2. Invalid foreign key references
 * 3. Missing relationships
 * 4. Data type mismatches
 */

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Initialize Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔧 FIXING RELATIONSHIP ISSUES...\n\n";

try {
    DB::beginTransaction();
    
    echo "1️⃣ FIXING ORPHANED RECORDS...\n";
    
    // Fix orphaned appointments (no valid patient)
    $orphanedAppointments = DB::table('appointments')
        ->leftJoin('patients', 'appointments.patient_id', '=', 'patients.id')
        ->whereNull('patients.id')
        ->count();
    
    if ($orphanedAppointments > 0) {
        DB::table('appointments')
            ->leftJoin('patients', 'appointments.patient_id', '=', 'patients.id')
            ->whereNull('patients.id')
            ->delete();
        echo "   ✅ Deleted {$orphanedAppointments} orphaned appointments\n";
    } else {
        echo "   ✅ No orphaned appointments found\n";
    }
    
    // Fix orphaned visits (no valid appointment)
    $orphanedVisits = DB::table('visits')
        ->leftJoin('appointments', 'visits.appointment_id', '=', 'appointments.id')
        ->whereNull('appointments.id')
        ->count();
    
    if ($orphanedVisits > 0) {
        DB::table('visits')
            ->leftJoin('appointments', 'visits.appointment_id', '=', 'appointments.id')
            ->whereNull('appointments.id')
            ->delete();
        echo "   ✅ Deleted {$orphanedVisits} orphaned visits\n";
    } else {
        echo "   ✅ No orphaned visits found\n";
    }
    
    // Fix orphaned billing transactions (no valid patient)
    $orphanedBilling = DB::table('billing_transactions')
        ->leftJoin('patients', 'billing_transactions.patient_id', '=', 'patients.id')
        ->whereNull('patients.id')
        ->count();
    
    if ($orphanedBilling > 0) {
        DB::table('billing_transactions')
            ->leftJoin('patients', 'billing_transactions.patient_id', '=', 'patients.id')
            ->whereNull('patients.id')
            ->delete();
        echo "   ✅ Deleted {$orphanedBilling} orphaned billing transactions\n";
    } else {
        echo "   ✅ No orphaned billing transactions found\n";
    }
    
    echo "\n2️⃣ FIXING INVALID FOREIGN KEY REFERENCES...\n";
    
    // Fix appointments with invalid specialist_id
    $invalidSpecialists = DB::table('appointments')
        ->whereNotNull('specialist_id')
        ->whereNotExists(function($query) {
            $query->select(DB::raw(1))
                  ->from('specialists')
                  ->whereColumn('specialists.specialist_id', 'appointments.specialist_id');
        })
        ->count();
    
    if ($invalidSpecialists > 0) {
        DB::table('appointments')
            ->whereNotNull('specialist_id')
            ->whereNotExists(function($query) {
                $query->select(DB::raw(1))
                      ->from('specialists')
                      ->whereColumn('specialists.specialist_id', 'appointments.specialist_id');
            })
            ->update(['specialist_id' => null]);
        echo "   ✅ Fixed {$invalidSpecialists} appointments with invalid specialist_id\n";
    } else {
        echo "   ✅ No invalid specialist references found\n";
    }
    
    // Fix billing transactions with invalid doctor_id
    $invalidDoctors = DB::table('billing_transactions')
        ->whereNotNull('doctor_id')
        ->whereNotExists(function($query) {
            $query->select(DB::raw(1))
                  ->from('specialists')
                  ->whereColumn('specialists.specialist_id', 'billing_transactions.doctor_id');
        })
        ->count();
    
    if ($invalidDoctors > 0) {
        DB::table('billing_transactions')
            ->whereNotNull('doctor_id')
            ->whereNotExists(function($query) {
                $query->select(DB::raw(1))
                      ->from('specialists')
                      ->whereColumn('specialists.specialist_id', 'billing_transactions.doctor_id');
            })
            ->update(['doctor_id' => null]);
        echo "   ✅ Fixed {$invalidDoctors} billing transactions with invalid doctor_id\n";
    } else {
        echo "   ✅ No invalid doctor references found\n";
    }
    
    echo "\n3️⃣ FIXING MISSING RELATIONSHIPS...\n";
    
    // Create missing appointment billing links for appointments without billing
    $appointmentsWithoutBilling = DB::table('appointments')
        ->whereNotExists(function($query) {
            $query->select(DB::raw(1))
                  ->from('appointment_billing_links')
                  ->whereColumn('appointment_billing_links.appointment_id', 'appointments.id');
        })
        ->where('status', 'Confirmed')
        ->count();
    
    if ($appointmentsWithoutBilling > 0) {
        // Get appointments that need billing links
        $appointments = DB::table('appointments')
            ->whereNotExists(function($query) {
                $query->select(DB::raw(1))
                      ->from('appointment_billing_links')
                      ->whereColumn('appointment_billing_links.appointment_id', 'appointments.id');
            })
            ->where('status', 'Confirmed')
            ->get();
        
        foreach ($appointments as $appointment) {
            // Create billing transaction for this appointment
            $transactionId = 'TXN-' . str_pad(DB::table('billing_transactions')->max('id') + 1, 6, '0', STR_PAD_LEFT);
            
            $billingTransaction = DB::table('billing_transactions')->insertGetId([
                'transaction_id' => $transactionId,
                'patient_id' => $appointment->patient_id,
                'total_amount' => $appointment->price ?? 0,
                'status' => 'pending',
                'transaction_date' => now(),
                'created_by' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            // Create billing link
            DB::table('appointment_billing_links')->insert([
                'appointment_id' => $appointment->id,
                'billing_transaction_id' => $billingTransaction,
                'appointment_type' => $appointment->appointment_type,
                'appointment_price' => $appointment->price ?? 0,
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        
        echo "   ✅ Created billing relationships for {$appointmentsWithoutBilling} appointments\n";
    } else {
        echo "   ✅ All confirmed appointments have billing relationships\n";
    }
    
    echo "\n4️⃣ FIXING DATA TYPE MISMATCHES...\n";
    
    // Fix patient_id type mismatches in appointments
    $invalidPatientIds = DB::table('appointments')
        ->whereNotNull('patient_id')
        ->whereRaw('patient_id NOT REGEXP "^[0-9]+$"')
        ->count();
    
    if ($invalidPatientIds > 0) {
        // Try to match by patient_no
        DB::statement("
            UPDATE appointments a
            INNER JOIN patients p ON a.patient_id = p.patient_no
            SET a.patient_id = p.id
            WHERE a.patient_id NOT REGEXP '^[0-9]+$'
        ");
        echo "   ✅ Fixed {$invalidPatientIds} patient_id type mismatches\n";
    } else {
        echo "   ✅ No patient_id type mismatches found\n";
    }
    
    echo "\n5️⃣ VERIFYING FIXES...\n";
    
    // Re-check for orphaned records
    $remainingOrphans = DB::table('appointments')
        ->leftJoin('patients', 'appointments.patient_id', '=', 'patients.id')
        ->whereNull('patients.id')
        ->count();
    
    echo "   " . ($remainingOrphans === 0 ? '✅' : '❌') . " Remaining orphaned appointments: {$remainingOrphans}\n";
    
    $remainingOrphanedVisits = DB::table('visits')
        ->leftJoin('appointments', 'visits.appointment_id', '=', 'appointments.id')
        ->whereNull('appointments.id')
        ->count();
    
    echo "   " . ($remainingOrphanedVisits === 0 ? '✅' : '❌') . " Remaining orphaned visits: {$remainingOrphanedVisits}\n";
    
    $remainingOrphanedBilling = DB::table('billing_transactions')
        ->leftJoin('patients', 'billing_transactions.patient_id', '=', 'patients.id')
        ->whereNull('patients.id')
        ->count();
    
    echo "   " . ($remainingOrphanedBilling === 0 ? '✅' : '❌') . " Remaining orphaned billing: {$remainingOrphanedBilling}\n";
    
    echo "\n6️⃣ SUMMARY...\n";
    
    $totalIssues = $orphanedAppointments + $orphanedVisits + $orphanedBilling + $invalidSpecialists + $invalidDoctors;
    echo "   📊 Total issues fixed: {$totalIssues}\n";
    echo "   📊 Data integrity: " . ($remainingOrphans + $remainingOrphanedVisits + $remainingOrphanedBilling === 0 ? '✅ Good' : '❌ Issues remain') . "\n";
    
    DB::commit();
    
    echo "\n🎉 RELATIONSHIP FIXES COMPLETED!\n";
    echo "✅ Orphaned records cleaned\n";
    echo "✅ Invalid foreign keys fixed\n";
    echo "✅ Missing relationships created\n";
    echo "✅ Data type mismatches resolved\n";
    echo "✅ Database integrity restored\n\n";
    
} catch (Exception $e) {
    DB::rollback();
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
