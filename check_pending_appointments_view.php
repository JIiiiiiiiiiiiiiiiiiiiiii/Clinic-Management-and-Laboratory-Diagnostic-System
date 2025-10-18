<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔧 Checking PendingAppointments View\n";
echo "===================================\n\n";

try {
    // Check if it's a view
    echo "1. Checking if pending_appointments is a view...\n";
    
    $result = DB::select("SHOW CREATE VIEW pending_appointments");
    if ($result) {
        echo "   ✅ Found view definition:\n";
        foreach ($result as $row) {
            echo "      " . $row->{'Create View'} . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "   ❌ Not a view or view doesn't exist: " . $e->getMessage() . "\n";
    
    // Check if it's a table
    echo "\n2. Checking if pending_appointments is a table...\n";
    try {
        $result = DB::select("SHOW CREATE TABLE pending_appointments");
        if ($result) {
            echo "   ✅ Found table definition:\n";
            foreach ($result as $row) {
                echo "      " . $row->{'Create Table'} . "\n";
            }
        }
    } catch (Exception $e2) {
        echo "   ❌ Not a table either: " . $e2->getMessage() . "\n";
    }
}

echo "\n";
