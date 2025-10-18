<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔧 Testing and Fixing Appointment Source\n";
echo "=======================================\n\n";

try {
    // Check if source column exists
    echo "1. Checking if source column exists...\n";
    
    $columns = DB::select("SHOW COLUMNS FROM appointments LIKE 'source'");
    if (count($columns) > 0) {
        echo "   ✅ Source column exists\n";
    } else {
        echo "   ❌ Source column does not exist, adding it...\n";
        DB::statement("ALTER TABLE appointments ADD COLUMN source ENUM('online', 'walk_in') DEFAULT 'online'");
        echo "   ✅ Source column added\n";
    }
    
    // Update all pending appointments to online
    echo "\n2. Updating all pending appointments to 'online' source...\n";
    
    $updated = DB::table('appointments')
        ->where('status', 'Pending')
        ->update(['source' => 'online']);
    
    echo "   ✅ Updated {$updated} pending appointments to 'online' source\n";
    
    // Update the pending_appointments view
    echo "\n3. Updating pending_appointments view...\n";
    
    $viewSQL = "
    DROP VIEW IF EXISTS pending_appointments;
    
    CREATE VIEW pending_appointments AS 
    SELECT 
        a.id AS id,
        a.id AS appointment_id,
        CONCAT('A', LPAD(a.id, 4, '0')) AS appointment_code,
        a.patient_id,
        a.specialist_id,
        a.appointment_type,
        a.specialist_type,
        a.appointment_date,
        a.appointment_time,
        a.duration,
        a.price,
        a.status,
        a.status AS status_approval,
        a.notes AS admin_notes,
        a.source AS appointment_source,
        a.created_at,
        a.updated_at,
        p.patient_no AS patient_code,
        CONCAT(p.last_name, ', ', p.first_name, ' ', COALESCE(p.middle_name, '')) AS patient_name,
        p.mobile_no AS patient_mobile,
        p.telephone_no AS patient_email,
        s.name AS specialist_name,
        s.specialist_id AS specialist_code
    FROM appointments a 
    LEFT JOIN patients p ON a.patient_id = p.id 
    LEFT JOIN specialists s ON a.specialist_id = s.specialist_id 
    WHERE a.status = 'Pending';
    ";
    
    DB::unprepared($viewSQL);
    echo "   ✅ Updated pending_appointments view\n";
    
    // Verify the changes
    echo "\n4. Verifying changes...\n";
    
    $pendingAppointments = DB::select("SELECT id, appointment_source FROM pending_appointments");
    echo "   ✅ Found " . count($pendingAppointments) . " pending appointments\n";
    
    foreach ($pendingAppointments as $appointment) {
        echo "      - ID: {$appointment->id}, Source: {$appointment->appointment_source}\n";
    }
    
    echo "\n🎉 APPOINTMENT SOURCE FIX COMPLETED!\n";
    echo "====================================\n";
    echo "✅ All pending appointments now show as 'online' source\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n";
