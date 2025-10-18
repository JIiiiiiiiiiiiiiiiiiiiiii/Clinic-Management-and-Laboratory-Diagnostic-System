<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Appointment;
use App\Models\Patient;
use Illuminate\Support\Facades\DB;

echo "===========================================\n";
echo "TESTING ADMIN APPOINTMENT VIEW\n";
echo "===========================================\n\n";

// Test 1: Get all appointments like the controller does
echo "Test 1: Querying appointments like AppointmentController@index...\n";
echo str_repeat("-", 100) . "\n";

try {
    $appointments = Appointment::with(['patient', 'specialist'])
        ->orderBy('appointment_date', 'asc')
        ->orderBy('appointment_time', 'asc')
        ->get();
    
    echo "✓ Found {$appointments->count()} appointment(s)\n\n";
    
    foreach ($appointments->take(5) as $appointment) {
        echo "Appointment ID: {$appointment->id}\n";
        echo "  Patient ID: {$appointment->patient_id}\n";
        echo "  Patient Name (DB): {$appointment->patient_name}\n";
        
        if ($appointment->patient) {
            echo "  Patient Object: Found (ID: {$appointment->patient->id}, Name: {$appointment->patient->first_name} {$appointment->patient->last_name})\n";
        } else {
            echo "  Patient Object: NOT FOUND!\n";
            echo "  ERROR: Patient relationship failed!\n";
        }
        
        if ($appointment->specialist) {
            echo "  Specialist Object: Found (ID: {$appointment->specialist->staff_id}, Name: {$appointment->specialist->name})\n";
        } else {
            echo "  Specialist Object: NOT FOUND (this might be OK if NULL)\n";
        }
        
        echo "  Status: {$appointment->status}\n";
        echo "  Source: " . ($appointment->source ?? 'NULL') . "\n";
        echo "  Created: {$appointment->created_at}\n";
        echo "\n";
    }
    
} catch (\Exception $e) {
    echo "✗ ERROR: {$e->getMessage()}\n";
    echo "  File: {$e->getFile()}:{$e->getLine()}\n";
}

// Test 2: Check specific recent appointments
echo "\nTest 2: Checking specific recent appointments...\n";
echo str_repeat("-", 100) . "\n";

$recentIds = [57, 56, 55, 54];
foreach ($recentIds as $id) {
    $appointment = Appointment::find($id);
    if ($appointment) {
        echo "✓ Appointment #{$id}:\n";
        echo "  patient_id = {$appointment->patient_id}\n";
        echo "  patient_name = {$appointment->patient_name}\n";
        echo "  status = {$appointment->status}\n";
        echo "  source = " . ($appointment->source ?? 'NULL') . "\n";
        
        // Check if patient exists
        $patient = Patient::find($appointment->patient_id);
        if ($patient) {
            echo "  ✓ Patient #{$patient->id} EXISTS in database\n";
        } else {
            echo "  ✗ Patient #{$appointment->patient_id} NOT FOUND in database!\n";
        }
        echo "\n";
    } else {
        echo "✗ Appointment #{$id} NOT FOUND\n\n";
    }
}

// Test 3: Check Patient model primary key
echo "Test 3: Checking Patient model configuration...\n";
echo str_repeat("-", 100) . "\n";
$patient = new Patient();
echo "Patient model primary key: " . $patient->getKeyName() . "\n";
echo "Appointment model primary key: " . (new Appointment())->getKeyName() . "\n\n";

// Test 4: Test the relationship manually
echo "Test 4: Testing appointment->patient relationship manually...\n";
echo str_repeat("-", 100) . "\n";
$testAppointment = Appointment::find(57);
if ($testAppointment) {
    echo "Testing with Appointment #57:\n";
    echo "  appointment->patient_id = {$testAppointment->patient_id}\n";
    
    try {
        $relatedPatient = $testAppointment->patient;
        if ($relatedPatient) {
            echo "  ✓ Relationship works! Patient: {$relatedPatient->first_name} {$relatedPatient->last_name}\n";
        } else {
            echo "  ✗ Relationship returned NULL!\n";
            
            // Check if patient exists manually
            $manualCheck = Patient::where('id', $testAppointment->patient_id)->first();
            if ($manualCheck) {
                echo "  BUT Patient #{$testAppointment->patient_id} EXISTS in database!\n";
                echo "  PROBLEM: Relationship configuration is wrong!\n";
            } else {
                echo "  AND Patient #{$testAppointment->patient_id} does NOT exist in database.\n";
            }
        }
    } catch (\Exception $e) {
        echo "  ✗ Error loading relationship: {$e->getMessage()}\n";
    }
}

echo "\n===========================================\n";
echo "DIAGNOSIS\n";
echo "===========================================\n\n";

$allAppointments = Appointment::count();
$pendingAppointments = Appointment::where('status', 'Pending')->count();
$onlineAppointments = Appointment::where('source', 'Online')->count();
$allPatients = Patient::count();

echo "Database has:\n";
echo "  - {$allAppointments} total appointments\n";
echo "  - {$pendingAppointments} pending appointments\n";
echo "  - {$onlineAppointments} online appointments\n";
echo "  - {$allPatients} total patients\n\n";

if ($pendingAppointments > 0 && $allPatients > 0) {
    echo "✓ Data exists in database!\n";
    echo "If admin portal shows 0, the problem is:\n";
    echo "  1. Frontend not displaying data correctly\n";
    echo "  2. Filtering hiding the data\n";
    echo "  3. Cache issues\n";
    echo "  4. JavaScript errors preventing render\n";
} else {
    echo "✗ Data missing from database!\n";
}

echo "\n===========================================\n";

