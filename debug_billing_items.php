<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== DEBUGGING BILLING TRANSACTION ITEMS ===\n";

// Check billing transaction 1
$transaction = App\Models\BillingTransaction::find(1);
if ($transaction) {
    echo "Transaction ID: " . $transaction->id . "\n";
    echo "Total Amount: " . $transaction->total_amount . "\n";
    echo "Amount: " . $transaction->amount . "\n";
    echo "Is Itemized: " . ($transaction->is_itemized ? 'Yes' : 'No') . "\n";
    
    echo "\n--- Billing Transaction Items ---\n";
    $items = $transaction->items;
    echo "Items Count: " . $items->count() . "\n";
    foreach ($items as $item) {
        echo "Item: " . $item->item_name . " | Type: " . $item->item_type . " | Price: " . $item->total_price . "\n";
    }
    
    echo "\n--- Appointment Links ---\n";
    $appointmentLinks = $transaction->appointmentLinks;
    echo "Appointment Links Count: " . $appointmentLinks->count() . "\n";
    foreach ($appointmentLinks as $link) {
        $appointment = $link->appointment;
        if ($appointment) {
            echo "Appointment ID: " . $appointment->id . "\n";
            echo "Appointment Price: " . $appointment->price . "\n";
            echo "Total Lab Amount: " . $appointment->total_lab_amount . "\n";
            echo "Final Total Amount: " . $appointment->final_total_amount . "\n";
        }
    }
} else {
    echo "Transaction 1 not found\n";
}

echo "\n=== DONE ===\n";
