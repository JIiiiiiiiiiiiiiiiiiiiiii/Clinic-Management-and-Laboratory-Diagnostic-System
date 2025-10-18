<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🧹 Cleaning up test data...\n";

try {
    // Clean up test appointments and patients
    $testPatients = \App\Models\Patient::where('first_name', 'Test')
        ->orWhere('first_name', 'Patient')
        ->orWhere('last_name', 'Test')
        ->get();
    
    echo "Found " . $testPatients->count() . " test patients\n";
    
    foreach ($testPatients as $patient) {
        // Delete appointments first
        \App\Models\Appointment::where('patient_id', $patient->patient_id)->delete();
        echo "Deleted appointments for patient: " . $patient->first_name . " " . $patient->last_name . "\n";
        
        // Delete patient
        $patient->delete();
        echo "Deleted patient: " . $patient->first_name . " " . $patient->last_name . "\n";
    }
    
    // Clean up any orphaned appointments
    $orphanedAppointments = \App\Models\Appointment::whereDoesntHave('patient')->get();
    echo "Found " . $orphanedAppointments->count() . " orphaned appointments\n";
    
    foreach ($orphanedAppointments as $appointment) {
        $appointment->delete();
        echo "Deleted orphaned appointment: " . $appointment->appointment_id . "\n";
    }
    
    echo "✅ Cleanup completed!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
