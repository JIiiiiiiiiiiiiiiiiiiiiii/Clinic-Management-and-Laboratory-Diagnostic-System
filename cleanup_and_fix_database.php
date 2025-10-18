<?php

/**
 * Clean up old broken appointments and verify system
 */

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "==============================================\n";
echo "DATABASE CLEANUP AND FIX\n";
echo "==============================================\n\n";

// Step 1: Check current state
echo "Step 1: Checking current state...\n";
echo str_repeat("-", 80) . "\n";

$totalAppointments = DB::scalar("SELECT COUNT(*) FROM appointments");
$nullPatientAppointments = DB::scalar("SELECT COUNT(*) FROM appointments WHERE patient_id IS NULL OR patient_id = ''");
$validAppointments = DB::scalar("SELECT COUNT(*) FROM appointments WHERE patient_id IS NOT NULL AND patient_id != ''");

echo "Total appointments: {$totalAppointments}\n";
echo "Appointments with NULL patient_id: {$nullPatientAppointments}\n";
echo "Appointments with valid patient_id: {$validAppointments}\n\n";

// Step 2: Show appointments with NULL patient_id
if ($nullPatientAppointments > 0) {
    echo "Step 2: Showing appointments with NULL patient_id...\n";
    echo str_repeat("-", 80) . "\n";
    
    $brokenAppointments = DB::select("
        SELECT id, patient_name, appointment_type, status, source, created_at 
        FROM appointments 
        WHERE patient_id IS NULL OR patient_id = ''
        ORDER BY id ASC
    ");
    
    foreach ($brokenAppointments as $apt) {
        echo "ID: {$apt->id} | {$apt->patient_name} | {$apt->appointment_type} | Status: {$apt->status} | Created: {$apt->created_at}\n";
    }
    echo "\n";
    
    // Step 3: Delete them
    echo "Step 3: Deleting appointments with NULL patient_id...\n";
    echo str_repeat("-", 80) . "\n";
    
    $deleted = DB::delete("DELETE FROM appointments WHERE patient_id IS NULL OR patient_id = ''");
    echo "✓ Deleted {$deleted} old/broken appointments\n\n";
} else {
    echo "Step 2: No broken appointments found. Skipping cleanup.\n\n";
}

// Step 4: Show remaining appointments
echo "Step 4: Showing remaining appointments...\n";
echo str_repeat("-", 80) . "\n";

$remainingAppointments = DB::select("
    SELECT id, patient_id, patient_name, appointment_type, status, source, created_at 
    FROM appointments 
    ORDER BY id DESC 
    LIMIT 10
");

if (count($remainingAppointments) > 0) {
    echo "Found " . count($remainingAppointments) . " appointment(s):\n\n";
    foreach ($remainingAppointments as $apt) {
        echo sprintf("ID: %-5s | Patient: %-5s | Name: %-30s | Type: %-20s | Status: %-10s | Source: %-8s\n",
            $apt->id,
            $apt->patient_id,
            substr($apt->patient_name, 0, 30),
            substr($apt->appointment_type, 0, 20),
            $apt->status,
            $apt->source
        );
    }
} else {
    echo "No appointments found!\n";
}
echo "\n";

// Step 5: Show patients
echo "Step 5: Showing patient records...\n";
echo str_repeat("-", 80) . "\n";

$patients = DB::select("
    SELECT id, patient_no, first_name, last_name, user_id, created_at 
    FROM patients 
    ORDER BY id DESC 
    LIMIT 10
");

if (count($patients) > 0) {
    echo "Found " . count($patients) . " patient(s):\n\n";
    foreach ($patients as $p) {
        echo sprintf("ID: %-5s | Code: %-8s | Name: %-30s | User: %-5s | Created: %s\n",
            $p->id,
            $p->patient_no,
            $p->first_name . ' ' . $p->last_name,
            $p->user_id ?? 'NULL',
            $p->created_at
        );
    }
} else {
    echo "No patients found!\n";
}
echo "\n";

// Step 6: Check visits
echo "Step 6: Checking visit records...\n";
echo str_repeat("-", 80) . "\n";

$visits = DB::select("SELECT COUNT(*) as count FROM visits");
$visitCount = $visits[0]->count ?? 0;

echo "Total visits: {$visitCount}\n";

if ($visitCount > 0) {
    $recentVisits = DB::select("
        SELECT id, appointment_id, patient_id, visit_date, status 
        FROM visits 
        ORDER BY id DESC 
        LIMIT 5
    ");
    
    foreach ($recentVisits as $v) {
        echo "  Visit ID: {$v->id} | Appointment: {$v->appointment_id} | Patient: {$v->patient_id} | Status: {$v->status}\n";
    }
}
echo "\n";

// Step 7: Check billing
echo "Step 7: Checking billing transactions...\n";
echo str_repeat("-", 80) . "\n";

$billing = DB::select("SELECT COUNT(*) as count FROM billing_transactions");
$billingCount = $billing[0]->count ?? 0;

echo "Total billing transactions: {$billingCount}\n";

if ($billingCount > 0) {
    $recentBilling = DB::select("
        SELECT id, patient_id, amount, status, created_at 
        FROM billing_transactions 
        ORDER BY id DESC 
        LIMIT 5
    ");
    
    foreach ($recentBilling as $b) {
        echo "  Billing ID: {$b->id} | Patient: {$b->patient_id} | Amount: {$b->amount} | Status: {$b->status}\n";
    }
}
echo "\n";

// Step 8: Check notifications
echo "Step 8: Checking notifications...\n";
echo str_repeat("-", 80) . "\n";

$notifications = DB::select("SELECT COUNT(*) as count FROM notifications WHERE type='appointment_request'");
$notifCount = $notifications[0]->count ?? 0;

echo "Total appointment notifications: {$notifCount}\n";

if ($notifCount > 0) {
    $recentNotifs = DB::select("
        SELECT n.id, n.type, n.user_id, n.related_id, n.`read`, n.created_at, u.name as user_name
        FROM notifications n
        LEFT JOIN users u ON n.user_id = u.id
        WHERE n.type = 'appointment_request'
        ORDER BY n.id DESC 
        LIMIT 5
    ");
    
    foreach ($recentNotifs as $n) {
        $readStatus = $n->read ? 'Read' : 'Unread';
        echo "  Notif ID: {$n->id} | To: {$n->user_name} | Appointment: {$n->related_id} | Status: {$readStatus}\n";
    }
}
echo "\n";

// Final summary
echo "==============================================\n";
echo "FINAL STATUS\n";
echo "==============================================\n\n";

$finalStats = [
    'Appointments' => DB::scalar("SELECT COUNT(*) FROM appointments"),
    'Pending Appointments' => DB::scalar("SELECT COUNT(*) FROM appointments WHERE status='Pending'"),
    'Online Appointments' => DB::scalar("SELECT COUNT(*) FROM appointments WHERE source='Online'"),
    'Patients' => DB::scalar("SELECT COUNT(*) FROM patients"),
    'Visits' => DB::scalar("SELECT COUNT(*) FROM visits"),
    'Billing Transactions' => DB::scalar("SELECT COUNT(*) FROM billing_transactions"),
    'Notifications' => DB::scalar("SELECT COUNT(*) FROM notifications WHERE type='appointment_request'"),
];

foreach ($finalStats as $label => $count) {
    $icon = $count > 0 ? '✓' : '✗';
    echo "{$icon} {$label}: {$count}\n";
}

echo "\n";

if ($finalStats['Appointments'] > 0 && $finalStats['Patients'] > 0) {
    echo "✅ DATABASE IS WORKING!\n\n";
    echo "Next steps:\n";
    echo "1. Run: php artisan cache:clear\n";
    echo "2. Open browser in INCOGNITO mode\n";
    echo "3. Login as admin: admin@clinic.com\n";
    echo "4. Go to: /admin/appointments\n";
    echo "5. You should see {$finalStats['Pending Appointments']} pending appointment(s)!\n\n";
    
    echo "If you still see 0, the issue is in the FRONTEND, not database.\n";
    echo "Check browser console (F12) for JavaScript errors.\n";
} else {
    echo "⚠️ WARNING: No data in database!\n";
    echo "Please create a new test appointment to verify system.\n";
}

echo "\n==============================================\n";

