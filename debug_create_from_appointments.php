<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Debugging create-from-appointments functionality...\n";

// Get all pending appointments
$pendingAppointments = \App\Models\Appointment::where('billing_status', 'pending')
    ->with(['labTests.labTest'])
    ->get();

echo "Total pending appointments: " . $pendingAppointments->count() . "\n";

foreach ($pendingAppointments as $appointment) {
    echo "Appointment ID: " . $appointment->id . "\n";
    echo "  Patient: " . $appointment->patient_name . "\n";
    echo "  Source: " . $appointment->source . "\n";
    echo "  Status: " . $appointment->status . "\n";
    echo "  Billing Status: " . $appointment->billing_status . "\n";
    echo "  Price: " . $appointment->price . "\n";
    echo "  Final Total Amount: " . ($appointment->final_total_amount ?? 'N/A') . "\n";
    echo "  Lab Tests: " . $appointment->labTests->count() . "\n";
    
    // Check if this appointment would be found by the query in storeFromAppointments
    $wouldBeFound = $appointment->status === 'Confirmed' && 
                   (is_null($appointment->billing_status) || 
                    $appointment->billing_status === 'pending' || 
                    $appointment->billing_status === 'not_billed');
    
    echo "  Would be found by query: " . ($wouldBeFound ? 'YES' : 'NO') . "\n";
    echo "---\n";
}

// Test the exact query from the controller
echo "\nTesting the exact query from storeFromAppointments:\n";
$testAppointmentIds = $pendingAppointments->pluck('id')->toArray();
echo "Testing with appointment IDs: " . json_encode($testAppointmentIds) . "\n";

$foundAppointments = \App\Models\Appointment::whereIn('id', $testAppointmentIds)
    ->where('status', 'Confirmed')
    ->where(function($query) {
        $query->whereNull('billing_status')
              ->orWhere('billing_status', 'pending')
              ->orWhere('billing_status', 'not_billed');
    })
    ->with(['labTests.labTest'])
    ->get();

echo "Found appointments by query: " . $foundAppointments->count() . "\n";

foreach ($foundAppointments as $appointment) {
    echo "  - ID: " . $appointment->id . " (" . $appointment->patient_name . ")\n";
}

// Check for any appointments that might have billing_status issues
echo "\nChecking for potential issues:\n";
$allAppointments = \App\Models\Appointment::whereIn('id', $testAppointmentIds)->get();
foreach ($allAppointments as $appointment) {
    if ($appointment->status !== 'Confirmed') {
        echo "  - ID " . $appointment->id . ": Status is '" . $appointment->status . "' (not Confirmed)\n";
    }
    if (!in_array($appointment->billing_status, [null, 'pending', 'not_billed'])) {
        echo "  - ID " . $appointment->id . ": Billing status is '" . $appointment->billing_status . "' (not valid)\n";
    }
}
