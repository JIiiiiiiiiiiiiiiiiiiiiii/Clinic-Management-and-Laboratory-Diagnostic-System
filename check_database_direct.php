<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CHECKING DATABASE DIRECTLY ===\n";

// Check billing transaction items directly
$items = DB::table('billing_transaction_items')->where('billing_transaction_id', 1)->get();
echo "Billing Transaction Items Count: " . $items->count() . "\n";
foreach ($items as $item) {
    echo "ID: " . $item->id . " | Type: " . $item->item_type . " | Name: " . $item->item_name . " | Price: " . $item->total_price . "\n";
}

echo "\n--- Billing Transaction ---\n";
$transaction = DB::table('billing_transactions')->where('id', 1)->first();
if ($transaction) {
    echo "Transaction ID: " . $transaction->id . "\n";
    echo "Total Amount: " . $transaction->total_amount . "\n";
    echo "Amount: " . $transaction->amount . "\n";
    echo "Is Itemized: " . ($transaction->is_itemized ? 'Yes' : 'No') . "\n";
}

echo "\n--- Appointment ---\n";
$appointment = DB::table('appointments')->where('id', 1)->first();
if ($appointment) {
    echo "Appointment ID: " . $appointment->id . "\n";
    echo "Price: " . $appointment->price . "\n";
    echo "Total Lab Amount: " . $appointment->total_lab_amount . "\n";
    echo "Final Total Amount: " . $appointment->final_total_amount . "\n";
}

echo "\n=== DONE ===\n";
