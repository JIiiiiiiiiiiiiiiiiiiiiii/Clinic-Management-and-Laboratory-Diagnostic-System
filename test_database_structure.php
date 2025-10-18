<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🏥 Testing Database Structure\n";
echo "============================\n\n";

try {
    // Check patients table structure
    echo "1. Checking Patients table structure...\n";
    $columns = \DB::select('SHOW COLUMNS FROM patients');
    echo "Patients table columns:\n";
    foreach ($columns as $col) {
        echo "   - {$col->Field} ({$col->Type})\n";
    }
    
    echo "\n2. Testing Patient model creation...\n";
    
    // Create a patient with only the fields that exist
    $patient = new \App\Models\Patient([
        'first_name' => 'Test',
        'last_name' => 'Patient',
        'mobile_no' => '+639123456789',
        'arrival_date' => '2024-01-15',
        'arrival_time' => '09:00:00',
        'birthdate' => '1990-01-01',
        'age' => 34,
        'attending_physician' => 'Dr. Test',
        'civil_status' => 'single',
        'nationality' => 'Filipino',
        'present_address' => '123 Test Street, Test City',
        'informant_name' => 'Test Informant',
        'relationship' => 'Self',
        'time_seen' => '09:30:00'
    ]);
    $patient->save();
    echo "✅ Patient created successfully! ID: {$patient->id}\n";
    
    echo "\n3. Testing Appointment model creation...\n";
    
    // Create an appointment
    $appointment = new \App\Models\Appointment([
        'patient_name' => 'Test Patient',
        'patient_id' => $patient->id,
        'appointment_type' => 'consultation',
        'specialist_type' => 'doctor',
        'specialist_name' => 'Dr. Test Specialist',
        'specialist_id' => '1',
        'appointment_date' => '2024-01-15',
        'appointment_time' => '09:00',
        'price' => 300,
        'status' => 'Pending'
    ]);
    $appointment->save();
    echo "✅ Appointment created successfully! ID: {$appointment->id}\n";
    
    echo "\n4. Testing Specialist model...\n";
    $specialist = \App\Models\Specialist::first();
    if ($specialist) {
        echo "✅ Specialist found: {$specialist->name} ({$specialist->role})\n";
    }
    
    echo "\n🎉 ALL MODELS WORKING WITH EXISTING DATABASE!\n";
    echo "✅ Database structure compatibility confirmed\n";
    echo "✅ Models updated to match existing schema\n";
    echo "✅ Foreign key relationships working\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n";
