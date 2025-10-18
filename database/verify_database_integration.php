<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as DB;
use Illuminate\Support\Facades\Schema;

// Bootstrap Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Database Integration Verification ===\n\n";

// 1. Check menu structure integration
echo "1. Checking menu structure integration...\n";

$menus = [
    'Patients' => ['patients', 'patient_visits', 'patient_transfers'],
    'Laboratory' => ['lab_orders', 'lab_results', 'lab_result_values', 'lab_tests'],
    'Inventory' => ['inventory_items', 'inventory_movements'],
    'Appointments' => ['appointments', 'pending_appointments', 'appointment_billing_links'],
    'Reports' => ['reports'],
    'Specialist Management' => ['users'],
    'Billing' => ['billing_transactions', 'billing_transaction_items', 'doctor_payments', 'expenses', 'daily_transactions']
];

foreach ($menus as $menu => $tables) {
    echo "  {$menu}:\n";
    foreach ($tables as $table) {
        if (Schema::hasTable($table)) {
            $count = DB::table($table)->count();
            echo "    ✓ {$table} ({$count} records)\n";
        } else {
            echo "    ✗ {$table} (missing)\n";
        }
    }
}

// 2. Check data consistency
echo "\n2. Checking data consistency...\n";

// Check for orphaned records
$orphanedAppointments = DB::table('appointments')
    ->whereNotIn('patient_id', function($query) {
        $query->select('patient_id')->from('patients');
    })
    ->count();

echo "  Orphaned appointments: {$orphanedAppointments}\n";

$orphanedLabOrders = DB::table('lab_orders')
    ->whereNotIn('patient_id', function($query) {
        $query->select('patient_id')->from('patients');
    })
    ->count();

echo "  Orphaned lab orders: {$orphanedLabOrders}\n";

$orphanedBillingTransactions = DB::table('billing_transactions')
    ->whereNotNull('patient_id')
    ->whereNotIn('patient_id', function($query) {
        $query->select('patient_id')->from('patients');
    })
    ->count();

echo "  Orphaned billing transactions: {$orphanedBillingTransactions}\n";

// 3. Check for test data
echo "\n3. Checking for test data...\n";

$testPatients = DB::table('patients')
    ->where('first_name', 'like', '%test%')
    ->orWhere('last_name', 'like', '%test%')
    ->orWhere('patient_no', 'like', '%TEST%')
    ->count();

echo "  Test patients: {$testPatients}\n";

$testAppointments = DB::table('appointments')
    ->where('patient_name', 'like', '%test%')
    ->orWhere('specialist_name', 'like', '%test%')
    ->count();

echo "  Test appointments: {$testAppointments}\n";

$testBillingTransactions = DB::table('billing_transactions')
    ->where('transaction_id', 'like', '%TEST%')
    ->orWhere('description', 'like', '%test%')
    ->count();

echo "  Test billing transactions: {$testBillingTransactions}\n";

// 4. Check database performance
echo "\n4. Checking database performance...\n";

$indexes = [
    'patients' => ['created_at', 'patient_no'],
    'appointments' => ['appointment_date', 'status', 'patient_id'],
    'lab_orders' => ['created_at', 'status', 'patient_id'],
    'billing_transactions' => ['transaction_date', 'status', 'patient_id'],
    'users' => ['role', 'created_at']
];

foreach ($indexes as $table => $columns) {
    if (Schema::hasTable($table)) {
        $existingIndexes = DB::select("SHOW INDEX FROM {$table}");
        $indexNames = array_column($existingIndexes, 'Key_name');
        
        foreach ($columns as $column) {
            $hasIndex = false;
            foreach ($existingIndexes as $index) {
                if (in_array($column, $index)) {
                    $hasIndex = true;
                    break;
                }
            }
            
            if ($hasIndex) {
                echo "  ✓ {$table}.{$column} has index\n";
            } else {
                echo "  ✗ {$table}.{$column} missing index\n";
            }
        }
    }
}

// 5. Summary
echo "\n5. Summary:\n";

$totalTables = 0;
$existingTables = 0;

foreach ($menus as $menu => $tables) {
    foreach ($tables as $table) {
        $totalTables++;
        if (Schema::hasTable($table)) {
            $existingTables++;
        }
    }
}

echo "  Database tables: {$existingTables}/{$totalTables} exist\n";
echo "  Orphaned records: " . ($orphanedAppointments + $orphanedLabOrders + $orphanedBillingTransactions) . "\n";
echo "  Test data records: " . ($testPatients + $testAppointments + $testBillingTransactions) . "\n";

if ($orphanedAppointments + $orphanedLabOrders + $orphanedBillingTransactions > 0) {
    echo "\n⚠️  WARNING: Found orphaned records that should be cleaned up.\n";
}

if ($testPatients + $testAppointments + $testBillingTransactions > 0) {
    echo "\n⚠️  WARNING: Found test data that should be cleaned up.\n";
}

echo "\n=== Verification Complete ===\n";
