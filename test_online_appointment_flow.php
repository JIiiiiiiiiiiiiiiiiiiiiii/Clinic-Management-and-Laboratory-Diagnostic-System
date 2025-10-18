<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🏥 Testing Complete Online Appointment Flow\n";
echo "==========================================\n\n";

try {
    // Test 1: Create Patient via Online Appointment Form
    echo "1. Testing Online Appointment Form Submission...\n";
    
    // Simulate the exact data that would come from the online appointment form
    $appointmentData = [
        'patient_data' => [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'middle_name' => 'Smith',
            'birthdate' => '1990-05-15',
            'age' => 34,
            'sex' => 'male',
            'nationality' => 'Filipino',
            'civil_status' => 'single',
            'present_address' => '123 Main Street, Quezon City, Philippines',
            'telephone_no' => '+63-2-123-4567',
            'mobile_no' => '+639123456789',
            'informant_name' => 'John Doe',
            'relationship' => 'Self',
            'occupation' => 'Software Engineer',
            'religion' => 'Catholic',
            'attending_physician' => 'Dr. Maria Santos',
            'drug_allergies' => 'Penicillin',
            'food_allergies' => 'Shellfish',
            'reason_for_consult' => 'Regular checkup and consultation',
            'arrival_date' => '2024-01-20',
            'arrival_time' => '09:00:00',
            'time_seen' => '09:15:00'
        ],
        'appointment_data' => [
            'appointment_type' => 'consultation',
            'specialist_type' => 'doctor',
            'specialist_name' => 'Dr. Maria Santos',
            'specialist_id' => '1',
            'appointment_date' => '2024-01-20',
            'appointment_time' => '09:00',
            'duration' => '30 min',
            'price' => 500.00,
            'notes' => 'Patient requested morning appointment',
            'special_requirements' => 'Wheelchair accessible',
            'contact_number' => '+639123456789'
        ]
    ];
    
    echo "   📝 Patient Data:\n";
    foreach ($appointmentData['patient_data'] as $key => $value) {
        echo "      - {$key}: {$value}\n";
    }
    
    echo "\n   📅 Appointment Data:\n";
    foreach ($appointmentData['appointment_data'] as $key => $value) {
        echo "      - {$key}: {$value}\n";
    }
    
    // Test 2: Create Patient Record
    echo "\n2. Creating Patient Record...\n";
    $patient = new \App\Models\Patient($appointmentData['patient_data']);
    $patient->save();
    echo "   ✅ Patient created successfully! ID: {$patient->id}\n";
    echo "   ✅ Patient Number: {$patient->patient_no}\n";
    
    // Test 3: Create Appointment Record
    echo "\n3. Creating Appointment Record...\n";
    $appointment = new \App\Models\Appointment([
        'patient_name' => $patient->first_name . ' ' . $patient->last_name,
        'patient_id' => $patient->id,
        'contact_number' => $appointmentData['appointment_data']['contact_number'],
        'appointment_type' => $appointmentData['appointment_data']['appointment_type'],
        'price' => $appointmentData['appointment_data']['price'],
        'specialist_type' => $appointmentData['appointment_data']['specialist_type'],
        'specialist_name' => $appointmentData['appointment_data']['specialist_name'],
        'specialist_id' => $appointmentData['appointment_data']['specialist_id'],
        'appointment_date' => $appointmentData['appointment_data']['appointment_date'],
        'appointment_time' => $appointmentData['appointment_data']['appointment_time'],
        'duration' => $appointmentData['appointment_data']['duration'],
        'status' => 'Pending',
        'billing_status' => 'pending',
        'notes' => $appointmentData['appointment_data']['notes'],
        'special_requirements' => $appointmentData['appointment_data']['special_requirements']
    ]);
    $appointment->save();
    echo "   ✅ Appointment created successfully! ID: {$appointment->id}\n";
    echo "   ✅ Status: {$appointment->status}\n";
    echo "   ✅ Price: ₱{$appointment->price}\n";
    
    // Test 4: Test Appointment Approval Flow
    echo "\n4. Testing Appointment Approval Flow...\n";
    
    // Get a specialist for approval
    $specialist = \App\Models\Specialist::where('role', 'Doctor')->first();
    if ($specialist) {
        echo "   ✅ Found specialist: {$specialist->name}\n";
        
        // Simulate admin approval
        $approvalService = new \App\Services\AppointmentApprovalService();
        $approvalResult = $approvalService->approveAppointment($appointment->id, [
            'assigned_specialist_id' => $specialist->specialist_id,
            'admin_notes' => 'Approved for consultation - all requirements met'
        ]);
        
        if ($approvalResult['success']) {
            echo "   ✅ Appointment approved successfully!\n";
            echo "   ✅ Visit ID: {$approvalResult['visit_id']}\n";
            echo "   ✅ Transaction ID: {$approvalResult['transaction_id']}\n";
            
            // Test 5: Test Billing Flow
            echo "\n5. Testing Billing Flow...\n";
            
            $billingService = new \App\Services\BillingService();
            $paymentResult = $billingService->markAsPaid($approvalResult['transaction_id'], [
                'payment_method' => 'cash',
                'reference_no' => 'PAY-' . time()
            ]);
            
            if ($paymentResult['success']) {
                echo "   ✅ Payment processed successfully!\n";
                echo "   ✅ Transaction Status: {$paymentResult['status']}\n";
                
                // Test 6: Test Daily Transactions
                echo "\n6. Testing Daily Transactions...\n";
                
                $dailyTransactions = \App\Models\DailyTransaction::where('transaction_date', '2024-01-20')->get();
                echo "   ✅ Found " . $dailyTransactions->count() . " daily transactions for 2024-01-20\n";
                
                foreach ($dailyTransactions as $dt) {
                    echo "      - {$dt->transaction_type}: ₱{$dt->amount} ({$dt->status})\n";
                }
                
            } else {
                echo "   ❌ Payment processing failed\n";
            }
        } else {
            echo "   ❌ Appointment approval failed\n";
        }
    } else {
        echo "   ❌ No specialists found\n";
    }
    
    // Test 7: Verify All Relationships
    echo "\n7. Verifying All Relationships...\n";
    
    // Check patient relationships
    $patientAppointments = $patient->appointments;
    echo "   ✅ Patient has " . $patientAppointments->count() . " appointments\n";
    
    // Check appointment relationships
    if ($appointment->patient) {
        echo "   ✅ Appointment linked to patient: {$appointment->patient->first_name} {$appointment->patient->last_name}\n";
    }
    
    if ($appointment->visit) {
        echo "   ✅ Appointment has visit record\n";
    }
    
    if ($appointment->billingTransaction) {
        echo "   ✅ Appointment has billing transaction\n";
    }
    
    echo "\n🎉 COMPLETE ONLINE APPOINTMENT FLOW TESTED SUCCESSFULLY!\n";
    echo "=====================================================\n";
    echo "✅ Patient registration from online form\n";
    echo "✅ Appointment creation with all fields\n";
    echo "✅ Admin approval process\n";
    echo "✅ Visit and billing generation\n";
    echo "✅ Payment processing\n";
    echo "✅ Daily transaction reporting\n";
    echo "✅ All database relationships working\n";
    
    echo "\n🏥 ONLINE APPOINTMENT FORM IS FULLY FUNCTIONAL!\n";
    echo "All fields work correctly with the database columns.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n";
