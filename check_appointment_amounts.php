<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CHECKING APPOINTMENT AMOUNTS ===\n";

// Check appointment 1
$appointment = App\Models\Appointment::find(1);
if ($appointment) {
    echo "Appointment ID: " . $appointment->id . "\n";
    echo "Price: " . $appointment->price . "\n";
    echo "Total Lab Amount: " . $appointment->total_lab_amount . "\n";
    echo "Final Total Amount: " . $appointment->final_total_amount . "\n";
    echo "Appointment Type: " . $appointment->appointment_type . "\n";
    echo "Status: " . $appointment->status . "\n";
} else {
    echo "Appointment 1 not found\n";
}

echo "\n=== CHECKING BILLING TRANSACTION ===\n";

// Check billing transaction
$billingTransaction = App\Models\BillingTransaction::where('patient_id', $appointment->patient_id ?? 0)->first();
if ($billingTransaction) {
    echo "Billing Transaction ID: " . $billingTransaction->id . "\n";
    echo "Total Amount: " . $billingTransaction->total_amount . "\n";
    echo "Amount: " . $billingTransaction->amount . "\n";
    echo "Is Itemized: " . ($billingTransaction->is_itemized ? 'Yes' : 'No') . "\n";
    
    echo "\n--- Billing Items ---\n";
    $items = $billingTransaction->items;
    foreach ($items as $item) {
        echo "Item: " . $item->item_name . " | Type: " . $item->item_type . " | Price: " . $item->total_price . "\n";
    }
} else {
    echo "No billing transaction found\n";
}

echo "\n=== CHECKING APPOINTMENT LAB TESTS ===\n";

// Check lab tests added to appointment
$labTests = App\Models\AppointmentLabTest::where('appointment_id', 1)->get();
echo "Lab Tests Count: " . $labTests->count() . "\n";
foreach ($labTests as $labTest) {
    echo "Lab Test: " . $labTest->labTest->name . " | Price: " . $labTest->total_price . " | Status: " . $labTest->status . "\n";
}

echo "\n=== DONE ===\n";
