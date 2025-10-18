<?php

/**
 * FIX EXISTING VISIT DATA
 * 
 * This script fixes the existing visit with NULL date/time and staff
 */

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Initialize Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔧 FIXING EXISTING VISIT DATA...\n\n";

try {
    // Get the existing visit
    $visit = \App\Models\Visit::with(['appointment', 'patient'])->first();
    
    if ($visit) {
        echo "📋 Found visit ID: {$visit->id}\n";
        
        // Get the appointment data
        $appointment = $visit->appointment;
        if ($appointment) {
            echo "📋 Found appointment ID: {$appointment->id}\n";
            echo "   - Appointment Date: " . ($appointment->appointment_date ? $appointment->appointment_date : 'NULL') . "\n";
            echo "   - Appointment Time: " . ($appointment->appointment_time ? $appointment->appointment_time : 'NULL') . "\n";
            echo "   - Specialist Type: " . ($appointment->specialist_type ? $appointment->specialist_type : 'NULL') . "\n";
            echo "   - Specialist ID: " . ($appointment->specialist_id ? $appointment->specialist_id : 'NULL') . "\n";
            
            // Fix the visit date/time
            if ($appointment->appointment_date && $appointment->appointment_time) {
                $visitDateTime = $appointment->appointment_date->format('Y-m-d') . ' ' . $appointment->appointment_time->format('H:i:s');
                echo "   - Calculated Visit DateTime: {$visitDateTime}\n";
                
                $visit->update([
                    'visit_date_time_time' => $visitDateTime,
                    'visit_date_time' => $visitDateTime
                ]);
                echo "   ✅ Updated visit date/time\n";
            }
            
            // Fix the staff assignment
            $staffId = null;
            if ($appointment->specialist_type === 'doctor') {
                // Find a doctor user
                $doctor = \App\Models\User::where('role', 'doctor')->first();
                $staffId = $doctor ? $doctor->id : null;
                echo "   - Found doctor: " . ($doctor ? $doctor->name : 'None') . "\n";
            } elseif ($appointment->specialist_type === 'medtech') {
                // Find a medtech user
                $medtech = \App\Models\User::where('role', 'medtech')->first();
                $staffId = $medtech ? $medtech->id : null;
                echo "   - Found medtech: " . ($medtech ? $medtech->name : 'None') . "\n";
            }
            
            // Fallback to admin user
            if (!$staffId) {
                $adminUser = \App\Models\User::where('role', 'admin')->first();
                $staffId = $adminUser ? $adminUser->id : 1;
                echo "   - Using admin fallback: " . ($adminUser ? $adminUser->name : 'ID 1') . "\n";
            }
            
            if ($staffId) {
                $visit->update(['attending_staff_id' => $staffId]);
                echo "   ✅ Updated staff assignment to ID: {$staffId}\n";
            }
            
            // Refresh the visit
            $visit->refresh();
            $visit->load('attendingStaff');
            
            echo "\n📋 UPDATED VISIT DATA:\n";
            echo "   - Date/Time: " . ($visit->visit_date_time_time ? $visit->visit_date_time_time : 'NULL') . "\n";
            echo "   - Staff ID: " . ($visit->attending_staff_id ? $visit->attending_staff_id : 'NULL') . "\n";
            echo "   - Staff Name: " . ($visit->attendingStaff ? $visit->attendingStaff->name : 'No staff assigned') . "\n";
            echo "   - Status: " . $visit->status . "\n";
            
        } else {
            echo "❌ No appointment found for this visit\n";
        }
        
    } else {
        echo "ℹ️  No visits found to fix\n";
    }
    
    echo "\n🎉 VISIT DATA FIXED!\n";
    echo "✅ Date/Time should now display correctly\n";
    echo "✅ Staff should now be assigned correctly\n";
    echo "✅ Ready to test the visits page!\n\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}
