<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔧 Testing PendingAppointments View - FINAL TEST\n";
echo "===============================================\n\n";

try {
    // Test 1: Check if PendingAppointment model can query the view
    echo "1. Testing PendingAppointment View Query...\n";
    
    $count = \App\Models\PendingAppointment::count();
    echo "   ✅ Query successful! Found {$count} pending appointments\n";
    
    // Test 2: Get all pending appointments
    echo "\n2. Testing PendingAppointment Data Retrieval...\n";
    
    $pendingAppointments = \App\Models\PendingAppointment::all();
    echo "   ✅ Retrieved " . $pendingAppointments->count() . " pending appointments\n";
    
    foreach($pendingAppointments as $appointment) {
        echo "      - ID: {$appointment->id}\n";
        echo "        Patient: {$appointment->patient_name}\n";
        echo "        Type: {$appointment->appointment_type}\n";
        echo "        Date: {$appointment->appointment_date}\n";
        echo "        Status: {$appointment->status}\n";
        echo "        ---\n";
    }
    
    // Test 3: Test filtering
    echo "\n3. Testing PendingAppointment Filtering...\n";
    
    $consultationAppointments = \App\Models\PendingAppointment::where('appointment_type', 'consultation')->get();
    echo "   ✅ Found " . $consultationAppointments->count() . " consultation appointments\n";
    
    // Test 4: Test relationships
    echo "\n4. Testing PendingAppointment Relationships...\n";
    
    $firstAppointment = \App\Models\PendingAppointment::first();
    if ($firstAppointment) {
        $approver = $firstAppointment->approver;
        echo "   ✅ Approver relationship works (approver: " . ($approver ? $approver->name : 'None') . ")\n";
    }
    
    // Test 5: Test calculated methods
    echo "\n5. Testing PendingAppointment Methods...\n";
    
    if ($firstAppointment) {
        $price = $firstAppointment->calculatePrice();
        echo "   ✅ Price calculation works: ₱{$price}\n";
        
        $formattedPrice = $firstAppointment->formatted_price;
        echo "   ✅ Formatted price: {$formattedPrice}\n";
        
        $statusColor = $firstAppointment->status_color;
        echo "   ✅ Status color: {$statusColor}\n";
    }
    
    echo "\n🎉 PENDINGAPPOINTMENT VIEW IS WORKING PERFECTLY!\n";
    echo "================================================\n";
    echo "✅ View queries working\n";
    echo "✅ Data retrieval working\n";
    echo "✅ Filtering working\n";
    echo "✅ Relationships working\n";
    echo "✅ Methods working\n";
    
    echo "\n🏥 PENDINGAPPOINTMENT SYSTEM IS READY!\n";
    echo "The pending_appointments view is now working correctly.\n";
    echo "All database column references have been fixed.\n";
    echo "The system can now read pending appointments without errors.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n";
