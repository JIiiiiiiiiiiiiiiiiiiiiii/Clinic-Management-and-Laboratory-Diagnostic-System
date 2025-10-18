<?php

require_once 'vendor/autoload.php';

use App\Services\SystemWideDataIntegrityService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * COMPREHENSIVE SYSTEM FIX TEST
 * 
 * This script tests the complete system fix to ensure all issues are resolved
 */

echo "🚀 COMPREHENSIVE SYSTEM FIX TEST\n";
echo "================================\n\n";

try {
    // Initialize Laravel
    $app = require_once 'bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

    echo "✅ Laravel application initialized\n";

    // Test database connection
    echo "\n📊 Testing Database Connection...\n";
    try {
        DB::connection()->getPdo();
        echo "✅ Database connection successful\n";
    } catch (Exception $e) {
        echo "❌ Database connection failed: " . $e->getMessage() . "\n";
        exit(1);
    }

    // Test table structure
    echo "\n🏗️  Testing Table Structure...\n";
    $requiredTables = [
        'users', 'patients', 'appointments', 'visits', 
        'billing_transactions', 'appointment_billing_links', 
        'daily_transactions', 'pending_appointments'
    ];

    $missingTables = [];
    foreach ($requiredTables as $table) {
        if (DB::getSchemaBuilder()->hasTable($table)) {
            echo "✅ Table '{$table}' exists\n";
        } else {
            echo "❌ Table '{$table}' missing\n";
            $missingTables[] = $table;
        }
    }

    if (!empty($missingTables)) {
        echo "\n⚠️  Missing tables detected. Running migrations...\n";
        try {
            Artisan::call('migrate', ['--force' => true]);
            echo "✅ Migrations completed\n";
        } catch (Exception $e) {
            echo "❌ Migration failed: " . $e->getMessage() . "\n";
        }
    }

    // Test data integrity
    echo "\n🔍 Testing Data Integrity...\n";
    $dataIntegrityService = new SystemWideDataIntegrityService();
    
    // Check for data issues
    $issues = [];
    
    // Check patients without user_id
    $patientsWithoutUser = DB::table('patients')->whereNull('user_id')->count();
    if ($patientsWithoutUser > 0) {
        $issues[] = "{$patientsWithoutUser} patients without user_id";
    }
    
    // Check appointments without patient_id
    $appointmentsWithoutPatient = DB::table('appointments')->whereNull('patient_id')->count();
    if ($appointmentsWithoutPatient > 0) {
        $issues[] = "{$appointmentsWithoutPatient} appointments without patient_id";
    }
    
    // Check visits without appointment_id
    $visitsWithoutAppointment = DB::table('visits')->whereNull('appointment_id')->count();
    if ($visitsWithoutAppointment > 0) {
        $issues[] = "{$visitsWithoutAppointment} visits without appointment_id";
    }
    
    // Check billing transactions without patient_id
    $billingWithoutPatient = DB::table('billing_transactions')->whereNull('patient_id')->count();
    if ($billingWithoutPatient > 0) {
        $issues[] = "{$billingWithoutPatient} billing transactions without patient_id";
    }

    if (empty($issues)) {
        echo "✅ No data integrity issues found\n";
    } else {
        echo "⚠️  Data integrity issues found:\n";
        foreach ($issues as $issue) {
            echo "  • {$issue}\n";
        }
        
        echo "\n🔧 Running data integrity fix...\n";
        try {
            $result = $dataIntegrityService->fixAllDataIntegrityIssues();
            if ($result['success']) {
                echo "✅ Data integrity fix completed successfully\n";
            } else {
                echo "❌ Data integrity fix failed: " . $result['message'] . "\n";
            }
        } catch (Exception $e) {
            echo "❌ Data integrity fix failed: " . $e->getMessage() . "\n";
        }
    }

    // Test foreign key relationships
    echo "\n🔗 Testing Foreign Key Relationships...\n";
    try {
        $foreignKeys = DB::select("
            SELECT 
                TABLE_NAME,
                COLUMN_NAME,
                CONSTRAINT_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
            AND REFERENCED_TABLE_NAME IS NOT NULL
        ");

        if (count($foreignKeys) > 0) {
            echo "✅ Foreign keys exist (" . count($foreignKeys) . " found)\n";
        } else {
            echo "⚠️  No foreign keys found\n";
        }
    } catch (Exception $e) {
        echo "❌ Failed to check foreign keys: " . $e->getMessage() . "\n";
    }

    // Test indexes
    echo "\n📈 Testing Database Indexes...\n";
    try {
        $indexes = DB::select("
            SELECT 
                TABLE_NAME,
                INDEX_NAME,
                COLUMN_NAME
            FROM information_schema.STATISTICS 
            WHERE TABLE_SCHEMA = DATABASE()
            AND INDEX_NAME != 'PRIMARY'
        ");

        if (count($indexes) > 0) {
            echo "✅ Indexes exist (" . count($indexes) . " found)\n";
        } else {
            echo "⚠️  No indexes found\n";
        }
    } catch (Exception $e) {
        echo "❌ Failed to check indexes: " . $e->getMessage() . "\n";
    }

    // Test data relationships
    echo "\n🔗 Testing Data Relationships...\n";
    $relationshipIssues = [];
    
    // Check appointments without visits
    $appointmentsWithoutVisits = DB::table('appointments')
        ->leftJoin('visits', 'appointments.id', '=', 'visits.appointment_id')
        ->whereNull('visits.id')
        ->whereIn('appointments.status', ['Confirmed', 'Completed'])
        ->count();

    if ($appointmentsWithoutVisits > 0) {
        $relationshipIssues[] = "{$appointmentsWithoutVisits} confirmed appointments without visits";
    }

    // Check appointments without billing
    $appointmentsWithoutBilling = DB::table('appointments')
        ->leftJoin('appointment_billing_links', 'appointments.id', '=', 'appointment_billing_links.appointment_id')
        ->whereNull('appointment_billing_links.id')
        ->whereIn('appointments.status', ['Confirmed', 'Completed'])
        ->count();

    if ($appointmentsWithoutBilling > 0) {
        $relationshipIssues[] = "{$appointmentsWithoutBilling} confirmed appointments without billing";
    }

    if (empty($relationshipIssues)) {
        echo "✅ All data relationships are intact\n";
    } else {
        echo "⚠️  Data relationship issues found:\n";
        foreach ($relationshipIssues as $issue) {
            echo "  • {$issue}\n";
        }
    }

    // Test API endpoints
    echo "\n🌐 Testing API Endpoints...\n";
    $apiEndpoints = [
        '/api/system/health-check',
        '/api/online-appointment',
        '/api/billing/pending',
        '/api/specialists'
    ];

    foreach ($apiEndpoints as $endpoint) {
        try {
            $response = file_get_contents('http://localhost' . $endpoint);
            if ($response !== false) {
                echo "✅ API endpoint '{$endpoint}' is accessible\n";
            } else {
                echo "❌ API endpoint '{$endpoint}' is not accessible\n";
            }
        } catch (Exception $e) {
            echo "⚠️  API endpoint '{$endpoint}' test skipped (server not running)\n";
        }
    }

    // Final system health check
    echo "\n🏥 Final System Health Check...\n";
    $healthScore = 0;
    $totalChecks = 6;

    // Database connection
    try {
        DB::connection()->getPdo();
        $healthScore++;
        echo "✅ Database connection: Healthy\n";
    } catch (Exception $e) {
        echo "❌ Database connection: Unhealthy\n";
    }

    // Table structure
    if (empty($missingTables)) {
        $healthScore++;
        echo "✅ Table structure: Healthy\n";
    } else {
        echo "❌ Table structure: Unhealthy\n";
    }

    // Data integrity
    if (empty($issues)) {
        $healthScore++;
        echo "✅ Data integrity: Healthy\n";
    } else {
        echo "❌ Data integrity: Unhealthy\n";
    }

    // Foreign keys
    if (count($foreignKeys) > 0) {
        $healthScore++;
        echo "✅ Foreign keys: Healthy\n";
    } else {
        echo "❌ Foreign keys: Unhealthy\n";
    }

    // Indexes
    if (count($indexes) > 0) {
        $healthScore++;
        echo "✅ Indexes: Healthy\n";
    } else {
        echo "❌ Indexes: Unhealthy\n";
    }

    // Data relationships
    if (empty($relationshipIssues)) {
        $healthScore++;
        echo "✅ Data relationships: Healthy\n";
    } else {
        echo "❌ Data relationships: Unhealthy\n";
    }

    $healthPercentage = ($healthScore / $totalChecks) * 100;
    echo "\n📊 Overall System Health: {$healthPercentage}%\n";

    if ($healthPercentage >= 90) {
        echo "🎉 System is in excellent condition!\n";
    } elseif ($healthPercentage >= 70) {
        echo "✅ System is in good condition\n";
    } elseif ($healthPercentage >= 50) {
        echo "⚠️  System needs attention\n";
    } else {
        echo "❌ System has critical issues\n";
    }

    echo "\n🏁 System fix test completed!\n";

} catch (Exception $e) {
    echo "❌ System fix test failed: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
