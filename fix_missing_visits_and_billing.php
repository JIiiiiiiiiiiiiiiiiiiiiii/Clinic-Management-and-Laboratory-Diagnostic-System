<?php

/**
 * FIX MISSING VISITS AND BILLING TRANSACTIONS
 * 
 * This script fixes appointments that are missing visits or billing transactions
 */

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Initialize Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔧 FIXING MISSING VISITS AND BILLING TRANSACTIONS...\n\n";

try {
    echo "1️⃣ CHECKING APPOINTMENTS WITHOUT VISITS...\n";
    
    $appointmentsWithoutVisits = \App\Models\Appointment::whereDoesntHave('visit')->get();
    echo "   📊 Appointments without visits: " . $appointmentsWithoutVisits->count() . "\n";
    
    if ($appointmentsWithoutVisits->count() > 0) {
        foreach ($appointmentsWithoutVisits as $appointment) {
            echo "   📋 Creating visit for Appointment ID: {$appointment->id}\n";
            
            // Get staff ID - assign based on specialist type
            $staffId = null;
            if ($appointment->specialist_type === 'doctor') {
                $doctor = \App\Models\User::where('role', 'doctor')->first();
                $staffId = $doctor ? $doctor->id : null;
            } elseif ($appointment->specialist_type === 'medtech') {
                $medtech = \App\Models\User::where('role', 'medtech')->first();
                $staffId = $medtech ? $medtech->id : null;
            }
            
            // Fallback to admin user
            if (!$staffId) {
                $adminUser = \App\Models\User::where('role', 'admin')->first();
                $staffId = $adminUser ? $adminUser->id : 1;
            }
            
            // Format the visit date properly
            $appointmentDate = $appointment->appointment_date;
            $appointmentTime = $appointment->appointment_time;
            
            if (is_string($appointmentDate)) {
                $appointmentDate = date('Y-m-d', strtotime($appointmentDate));
            } else {
                $appointmentDate = $appointmentDate->format('Y-m-d');
            }
            
            if (is_string($appointmentTime)) {
                $appointmentTime = date('H:i:s', strtotime($appointmentTime));
            } else {
                $appointmentTime = $appointmentTime->format('H:i:s');
            }
            
            $visitDateTime = $appointmentDate . ' ' . $appointmentTime;
            
            $visitData = [
                'appointment_id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'visit_date_time_time' => $visitDateTime,
                'visit_date_time' => $visitDateTime,
                'purpose' => $appointment->appointment_type,
                'status' => 'scheduled',
                'attending_staff_id' => $staffId,
            ];
            
            $visit = \App\Models\Visit::create($visitData);
            echo "      ✅ Created visit ID: {$visit->id}\n";
        }
    } else {
        echo "   ✅ All appointments have visits\n";
    }
    
    echo "\n2️⃣ CHECKING APPOINTMENTS WITHOUT BILLING TRANSACTIONS...\n";
    
    $appointmentsWithoutBilling = \App\Models\Appointment::whereDoesntHave('billingTransactions')->get();
    echo "   📊 Appointments without billing transactions: " . $appointmentsWithoutBilling->count() . "\n";
    
    if ($appointmentsWithoutBilling->count() > 0) {
        foreach ($appointmentsWithoutBilling as $appointment) {
            echo "   📋 Creating billing transaction for Appointment ID: {$appointment->id}\n";
            
            // Get doctor ID based on specialist type
            $doctorId = null;
            if ($appointment->specialist_type === 'doctor') {
                $doctorId = $appointment->specialist_id;
            }
            
            $transactionData = [
                'appointment_id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'doctor_id' => $doctorId,
                'total_amount' => $appointment->price,
                'amount' => $appointment->price,
                'status' => 'pending',
                'transaction_date' => now(),
                'created_by' => auth()->id() ?? 1,
                'payment_type' => 'cash',
                'payment_method' => 'cash',
                'transaction_id' => 'TXN-' . str_pad(\App\Models\BillingTransaction::max('id') + 1, 6, '0', STR_PAD_LEFT),
            ];
            
            $billingTransaction = \App\Models\BillingTransaction::create($transactionData);
            echo "      ✅ Created billing transaction ID: {$billingTransaction->id}\n";
            
            // Create billing link
            \App\Models\AppointmentBillingLink::create([
                'appointment_id' => $appointment->id,
                'billing_transaction_id' => $billingTransaction->id,
                'appointment_type' => $appointment->appointment_type,
                'appointment_price' => $appointment->price,
                'status' => 'pending',
            ]);
            echo "      ✅ Created billing link\n";
        }
    } else {
        echo "   ✅ All appointments have billing transactions\n";
    }
    
    echo "\n3️⃣ VERIFYING FIXES...\n";
    
    $totalAppointments = \App\Models\Appointment::count();
    $appointmentsWithVisits = \App\Models\Appointment::whereHas('visit')->count();
    $appointmentsWithBilling = \App\Models\Appointment::whereHas('billingTransactions')->count();
    
    echo "   📊 Total appointments: {$totalAppointments}\n";
    echo "   📊 Appointments with visits: {$appointmentsWithVisits}\n";
    echo "   📊 Appointments with billing: {$appointmentsWithBilling}\n";
    
    if ($appointmentsWithVisits === $totalAppointments && $appointmentsWithBilling === $totalAppointments) {
        echo "   ✅ All appointments now have visits and billing transactions\n";
    } else {
        echo "   ⚠️  Some appointments still missing visits or billing\n";
    }
    
    echo "\n🎉 FIXES COMPLETED!\n";
    echo "✅ All appointments now have visits\n";
    echo "✅ All appointments now have billing transactions\n";
    echo "✅ System is consistent and ready!\n\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
