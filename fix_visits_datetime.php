<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== FIXING VISITS DATETIME ISSUES ===\n";

try {
    // Check for invalid datetime values
    echo "Checking for invalid datetime values...\n";
    $invalidDates = \DB::select("
        SELECT id, visit_date_time 
        FROM visits 
        WHERE visit_date_time = '0000-00-00 00:00:00' OR visit_date_time IS NULL
    ");

    if (count($invalidDates) > 0) {
        echo "Found invalid datetime values:\n";
        foreach($invalidDates as $visit) {
            echo "Visit ID: {$visit->id}, visit_date_time: {$visit->visit_date_time}\n";
        }
        
        echo "Fixing invalid datetime values...\n";
        // Set invalid dates to current datetime
        \DB::statement("UPDATE visits SET visit_date_time = NOW() WHERE visit_date_time = '0000-00-00 00:00:00' OR visit_date_time IS NULL");
    } else {
        echo "No invalid datetime values found.\n";
    }

    echo "\nVisits datetime issues fixed!\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

