<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\BillingTransaction;
use App\Models\Appointment;
use Illuminate\Support\Facades\DB;

echo "=== Fixing Transaction Amounts ===\n";

// Find the transaction
$transaction = BillingTransaction::where('transaction_id', 'TXN-000004')->first();

if (!$transaction) {
    echo "Transaction TXN-000004 not found!\n";
    exit;
}

echo "Found transaction: {$transaction->transaction_id}\n";
echo "Current amount: ₱{$transaction->total_amount}\n";

// Get all appointments linked to this transaction
$appointmentLinks = $transaction->appointmentLinks;
echo "Linked appointments: {$appointmentLinks->count()}\n";

$correctTotalAmount = 0;

foreach ($appointmentLinks as $link) {
    $appointment = $link->appointment;
    echo "\nAppointment ID: {$appointment->id}\n";
    echo "Base price: ₱{$appointment->price}\n";
    echo "Final total amount: ₱{$appointment->final_total_amount}\n";
    echo "Total lab amount: ₱{$appointment->total_lab_amount}\n";
    echo "Lab tests count: {$appointment->labTests->count()}\n";
    
    // Use final_total_amount if available, otherwise use price
    $appointmentAmount = $appointment->final_total_amount ?? $appointment->price;
    $correctTotalAmount += $appointmentAmount;
    
    echo "Appointment amount to use: ₱{$appointmentAmount}\n";
}

echo "\nCorrect total amount should be: ₱{$correctTotalAmount}\n";

if ($correctTotalAmount != $transaction->total_amount) {
    echo "Amounts don't match! Updating transaction...\n";
    
    DB::transaction(function() use ($transaction, $correctTotalAmount) {
        // Update the transaction amount
        $transaction->update([
            'total_amount' => $correctTotalAmount
        ]);
        
        echo "Updated transaction amount to: ₱{$correctTotalAmount}\n";
        
        // Also update any related daily transactions
        \App\Models\DailyTransaction::where('transaction_id', $transaction->transaction_id)
            ->update(['amount' => $correctTotalAmount]);
        
        echo "Updated daily transaction records\n";
    });
    
    echo "Transaction updated successfully!\n";
} else {
    echo "Amounts already match. No update needed.\n";
}

echo "\n=== Done ===\n";
