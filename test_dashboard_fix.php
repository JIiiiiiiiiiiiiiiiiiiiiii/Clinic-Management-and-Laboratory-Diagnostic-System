<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔧 Testing Dashboard Fix\n";
echo "======================\n\n";

try {
    // Test the exact query that was failing
    echo "1. Testing Patient query (the one that was failing)...\n";
    $patients = \App\Models\Patient::orderByDesc('created_at')->limit(5)->get(['id','first_name','last_name','created_at']);
    echo "   ✅ Query successful! Found " . $patients->count() . " patients\n";
    
    foreach($patients as $patient) {
        echo "      - ID: {$patient->id}, Name: {$patient->first_name} {$patient->last_name}\n";
    }
    
    echo "\n2. Testing LabOrder query...\n";
    $labOrders = \App\Models\LabOrder::orderByDesc('created_at')->limit(5)->get(['id','patient_id','created_at']);
    echo "   ✅ LabOrder query successful! Found " . $labOrders->count() . " lab orders\n";
    
    foreach($labOrders as $order) {
        echo "      - ID: {$order->id}, Patient ID: {$order->patient_id}\n";
    }
    
    echo "\n3. Testing Item query...\n";
    $items = \App\Models\Item::orderByDesc('created_at')->limit(5)->get(['id','name','code']);
    echo "   ✅ Item query successful! Found " . $items->count() . " items\n";
    
    echo "\n🎉 ALL DASHBOARD QUERIES WORKING!\n";
    echo "The DashboardController error has been fixed.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n";
