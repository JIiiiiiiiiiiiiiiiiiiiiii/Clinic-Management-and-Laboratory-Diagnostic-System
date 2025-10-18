<?php

/**
 * RELATIONSHIP VERIFICATION SCRIPT
 * 
 * This script verifies all relationships between:
 * - Patient, Appointment, Visit, BillingTransaction
 * - User, Patient relationships
 * - Specialist relationships
 */

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Initialize Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 VERIFYING DATABASE RELATIONSHIPS...\n\n";

try {
    echo "1️⃣ CHECKING TABLE STRUCTURE...\n";
    
    $requiredTables = [
        'users', 'patients', 'appointments', 'visits', 
        'billing_transactions', 'appointment_billing_links',
        'specialists', 'pending_appointments', 'daily_transactions'
    ];
    
    foreach ($requiredTables as $table) {
        $exists = Schema::hasTable($table);
        $status = $exists ? '✅' : '❌';
        echo "   {$status} {$table}\n";
    }
    
    echo "\n2️⃣ CHECKING FOREIGN KEY RELATIONSHIPS...\n";
    
    // Check appointments.patient_id → patients.id
    $appointmentsWithValidPatients = DB::table('appointments')
        ->whereExists(function($query) {
            $query->select(DB::raw(1))
                  ->from('patients')
                  ->whereColumn('patients.id', 'appointments.patient_id');
        })
        ->count();
    
    echo "   ✅ Appointments with valid patients: {$appointmentsWithValidPatients}\n";
    
    // Check appointments.specialist_id → specialists.specialist_id
    $appointmentsWithValidSpecialists = DB::table('appointments')
        ->whereExists(function($query) {
            $query->select(DB::raw(1))
                  ->from('specialists')
                  ->whereColumn('specialists.specialist_id', 'appointments.specialist_id');
        })
        ->count();
    
    echo "   ✅ Appointments with valid specialists: {$appointmentsWithValidSpecialists}\n";
    
    // Check visits.appointment_id → appointments.id
    $visitsWithValidAppointments = DB::table('visits')
        ->whereExists(function($query) {
            $query->select(DB::raw(1))
                  ->from('appointments')
                  ->whereColumn('appointments.id', 'visits.appointment_id');
        })
        ->count();
    
    echo "   ✅ Visits with valid appointments: {$visitsWithValidAppointments}\n";
    
    // Check billing_transactions.patient_id → patients.id
    $billingWithValidPatients = DB::table('billing_transactions')
        ->whereExists(function($query) {
            $query->select(DB::raw(1))
                  ->from('patients')
                  ->whereColumn('patients.id', 'billing_transactions.patient_id');
        })
        ->count();
    
    echo "   ✅ Billing transactions with valid patients: {$billingWithValidPatients}\n";
    
    // Check appointment_billing_links relationships
    $linksWithValidAppointments = DB::table('appointment_billing_links')
        ->whereExists(function($query) {
            $query->select(DB::raw(1))
                  ->from('appointments')
                  ->whereColumn('appointments.id', 'appointment_billing_links.appointment_id');
        })
        ->count();
    
    echo "   ✅ Billing links with valid appointments: {$linksWithValidAppointments}\n";
    
    $linksWithValidTransactions = DB::table('appointment_billing_links')
        ->whereExists(function($query) {
            $query->select(DB::raw(1))
                  ->from('billing_transactions')
                  ->whereColumn('billing_transactions.id', 'appointment_billing_links.billing_transaction_id');
        })
        ->count();
    
    echo "   ✅ Billing links with valid transactions: {$linksWithValidTransactions}\n";
    
    echo "\n3️⃣ CHECKING DATA INTEGRITY...\n";
    
    // Check for orphaned records
    $orphanedAppointments = DB::table('appointments')
        ->leftJoin('patients', 'appointments.patient_id', '=', 'patients.id')
        ->whereNull('patients.id')
        ->count();
    
    echo "   " . ($orphanedAppointments === 0 ? '✅' : '❌') . " Orphaned appointments: {$orphanedAppointments}\n";
    
    $orphanedVisits = DB::table('visits')
        ->leftJoin('appointments', 'visits.appointment_id', '=', 'appointments.id')
        ->whereNull('appointments.id')
        ->count();
    
    echo "   " . ($orphanedVisits === 0 ? '✅' : '❌') . " Orphaned visits: {$orphanedVisits}\n";
    
    $orphanedBilling = DB::table('billing_transactions')
        ->leftJoin('patients', 'billing_transactions.patient_id', '=', 'patients.id')
        ->whereNull('patients.id')
        ->count();
    
    echo "   " . ($orphanedBilling === 0 ? '✅' : '❌') . " Orphaned billing transactions: {$orphanedBilling}\n";
    
    echo "\n4️⃣ CHECKING MODEL RELATIONSHIPS...\n";
    
    // Test Patient model relationships
    $patient = new \App\Models\Patient();
    $patientRelationships = [
        'appointments' => method_exists($patient, 'appointments'),
        'visits' => method_exists($patient, 'visits'),
        'billingTransactions' => method_exists($patient, 'billingTransactions'),
        'user' => method_exists($patient, 'user')
    ];
    
    foreach ($patientRelationships as $relationship => $exists) {
        $status = $exists ? '✅' : '❌';
        echo "   {$status} Patient->{$relationship}\n";
    }
    
    // Test Appointment model relationships
    $appointment = new \App\Models\Appointment();
    $appointmentRelationships = [
        'patient' => method_exists($appointment, 'patient'),
        'specialist' => method_exists($appointment, 'specialist'),
        'visit' => method_exists($appointment, 'visit'),
        'billingLinks' => method_exists($appointment, 'billingLinks'),
        'billingTransactions' => method_exists($appointment, 'billingTransactions')
    ];
    
    foreach ($appointmentRelationships as $relationship => $exists) {
        $status = $exists ? '✅' : '❌';
        echo "   {$status} Appointment->{$relationship}\n";
    }
    
    // Test BillingTransaction model relationships
    $billing = new \App\Models\BillingTransaction();
    $billingRelationships = [
        'patient' => method_exists($billing, 'patient'),
        'doctor' => method_exists($billing, 'doctor'),
        'appointmentLinks' => method_exists($billing, 'appointmentLinks'),
        'appointments' => method_exists($billing, 'appointments')
    ];
    
    foreach ($billingRelationships as $relationship => $exists) {
        $status = $exists ? '✅' : '❌';
        echo "   {$status} BillingTransaction->{$relationship}\n";
    }
    
    echo "\n5️⃣ CHECKING CRITICAL FIELDS...\n";
    
    // Check for required fields
    $requiredFields = [
        'patients' => ['id', 'patient_no', 'first_name', 'last_name'],
        'appointments' => ['id', 'patient_id', 'appointment_type', 'status'],
        'visits' => ['id', 'appointment_id', 'patient_id'],
        'billing_transactions' => ['id', 'patient_id', 'total_amount', 'status']
    ];
    
    foreach ($requiredFields as $table => $fields) {
        if (Schema::hasTable($table)) {
            foreach ($fields as $field) {
                $exists = Schema::hasColumn($table, $field);
                $status = $exists ? '✅' : '❌';
                echo "   {$status} {$table}.{$field}\n";
            }
        }
    }
    
    echo "\n6️⃣ SUMMARY...\n";
    
    $totalTables = count($requiredTables);
    $existingTables = 0;
    foreach ($requiredTables as $table) {
        if (Schema::hasTable($table)) $existingTables++;
    }
    
    echo "   📊 Tables: {$existingTables}/{$totalTables} exist\n";
    echo "   📊 Data integrity: " . ($orphanedAppointments + $orphanedVisits + $orphanedBilling === 0 ? '✅ Good' : '❌ Issues found') . "\n";
    echo "   📊 Relationships: " . (array_sum($patientRelationships) + array_sum($appointmentRelationships) + array_sum($billingRelationships) >= 12 ? '✅ Good' : '❌ Issues found') . "\n";
    
    echo "\n🎉 RELATIONSHIP VERIFICATION COMPLETED!\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
