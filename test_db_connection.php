<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Database Connection Test ===\n";

try {
    // Test database connection
    $pdo = \Illuminate\Support\Facades\DB::connection()->getPdo();
    echo "Database connection: SUCCESS\n";
    
    // Check if visit_lab_requests table exists
    $tableExists = \Illuminate\Support\Facades\Schema::hasTable('visit_lab_requests');
    echo "visit_lab_requests table exists: " . ($tableExists ? 'YES' : 'NO') . "\n";
    
    if ($tableExists) {
        // Try to query the table
        $count = \Illuminate\Support\Facades\DB::table('visit_lab_requests')->count();
        echo "visit_lab_requests count: {$count}\n";
        
        // Try to get all records
        $records = \Illuminate\Support\Facades\DB::table('visit_lab_requests')->get();
        echo "Records found: " . $records->count() . "\n";
        
        if ($records->count() > 0) {
            echo "Sample record:\n";
            $first = $records->first();
            print_r($first);
        }
    }
    
} catch (Exception $e) {
    echo "Database connection: FAILED\n";
    echo "Error: " . $e->getMessage() . "\n";
}
