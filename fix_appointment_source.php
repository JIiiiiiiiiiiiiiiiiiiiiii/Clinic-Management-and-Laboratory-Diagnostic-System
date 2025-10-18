<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔧 Fixing Appointment Source Information\n";
echo "=======================================\n\n";

try {
    // Step 1: Add source column to appointments table if it doesn't exist
    echo "1. Adding 'source' column to appointments table...\n";
    
    try {
        DB::statement("ALTER TABLE appointments ADD COLUMN source ENUM('online', 'walk_in') DEFAULT 'online'");
        echo "   ✅ Added 'source' column to appointments table\n";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
            echo "   ✅ 'source' column already exists in appointments table\n";
        } else {
            echo "   ❌ Error adding source column: " . $e->getMessage() . "\n";
        }
    }
    
    // Step 2: Update all pending appointments to have 'online' source
    echo "\n2. Updating all pending appointments to 'online' source...\n";
    
    $updated = DB::table('appointments')
        ->where('status', 'Pending')
        ->update(['source' => 'online']);
    
    echo "   ✅ Updated {$updated} pending appointments to 'online' source\n";
    
    // Step 3: Update the pending_appointments view to include source
    echo "\n3. Updating pending_appointments view to include source...\n";
    
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
    echo "   ✅ Updated pending_appointments view to include source\n";
    
    // Step 4: Verify the changes
    echo "\n4. Verifying the changes...\n";
    
    $pendingAppointments = DB::select("SELECT id, appointment_source FROM pending_appointments");
    echo "   ✅ Found " . count($pendingAppointments) . " pending appointments\n";
    
    foreach ($pendingAppointments as $appointment) {
        echo "      - ID: {$appointment->id}, Source: {$appointment->appointment_source}\n";
    }
    
    echo "\n🎉 APPOINTMENT SOURCE FIX COMPLETED!\n";
    echo "====================================\n";
    echo "✅ Added 'source' column to appointments table\n";
    echo "✅ Updated all pending appointments to 'online' source\n";
    echo "✅ Updated pending_appointments view to include source\n";
    echo "✅ All pending appointments now show as 'online' source\n";
    
    echo "\n🏥 APPOINTMENT SOURCE SYSTEM IS READY!\n";
    echo "All pending appointments now correctly show as 'online' source.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n";
