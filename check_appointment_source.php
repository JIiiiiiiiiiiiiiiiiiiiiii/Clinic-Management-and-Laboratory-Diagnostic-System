<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔧 Checking Appointment Source Information\n";
echo "==========================================\n\n";

try {
    // Check if appointments table has a source column
    echo "1. Checking appointments table columns...\n";
    
    $columns = DB::select("SHOW COLUMNS FROM appointments");
    $hasSource = false;
    foreach ($columns as $column) {
        if ($column->Field === 'source') {
            $hasSource = true;
            echo "   ✅ Found 'source' column in appointments table\n";
            break;
        }
    }
    
    if (!$hasSource) {
        echo "   ❌ No 'source' column found in appointments table\n";
    }
    
    // Check pending appointments data
    echo "\n2. Checking pending appointments data...\n";
    
    $pendingAppointments = DB::select("SELECT * FROM pending_appointments LIMIT 3");
    echo "   ✅ Found " . count($pendingAppointments) . " pending appointments\n";
    
    if (count($pendingAppointments) > 0) {
        echo "   📋 Sample pending appointment data:\n";
        $first = $pendingAppointments[0];
        foreach ($first as $key => $value) {
            echo "      - {$key}: {$value}\n";
        }
    }
    
    // Check if we need to add source column to appointments table
    echo "\n3. Checking if we need to add source column...\n";
    
    if (!$hasSource) {
        echo "   📝 Need to add 'source' column to appointments table\n";
        echo "   📝 Then update the pending_appointments view to include source\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n";
