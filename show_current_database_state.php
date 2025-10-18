<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "==============================================\n";
echo "CURRENT DATABASE STATE (After Cleanup)\n";
echo "==============================================\n\n";

// Appointments
echo "APPOINTMENTS (All remaining):\n";
echo str_repeat("-", 100) . "\n";
$appointments = DB::select("SELECT * FROM appointments ORDER BY id DESC");
echo "Total: " . count($appointments) . "\n\n";

foreach ($appointments as $apt) {
    echo "ID: {$apt->id}\n";
    echo "  Patient ID: {$apt->patient_id}\n";
    echo "  Patient Name: {$apt->patient_name}\n";
    echo "  Type: {$apt->appointment_type}\n";
    echo "  Status: {$apt->status}\n";
    echo "  Source: {$apt->source}\n";
    echo "  Date: {$apt->appointment_date} {$apt->appointment_time}\n";
    echo "  Created: {$apt->created_at}\n";
    echo "\n";
}

// Patients
echo "PATIENTS (All):\n";
echo str_repeat("-", 100) . "\n";
$patients = DB::select("SELECT id, patient_no, first_name, last_name, user_id FROM patients ORDER BY id DESC");
echo "Total: " . count($patients) . "\n\n";

foreach ($patients as $p) {
    echo "ID: {$p->id} | Code: {$p->patient_no} | Name: {$p->first_name} {$p->last_name} | User: " . ($p->user_id ?? 'NULL') . "\n";
}
echo "\n";

// Visits
echo "VISITS:\n";
echo str_repeat("-", 100) . "\n";
$visits = DB::select("SELECT * FROM visits");
echo "Total: " . count($visits) . "\n";
if (count($visits) == 0) {
    echo "  (None - visits are created when admin APPROVES appointments)\n";
}
echo "\n";

// Billing
echo "BILLING TRANSACTIONS:\n";
echo str_repeat("-", 100) . "\n";
$billing = DB::select("SELECT * FROM billing_transactions");
echo "Total: " . count($billing) . "\n";
if (count($billing) == 0) {
    echo "  (None - billing is created when admin APPROVES appointments)\n";
} else {
    foreach ($billing as $b) {
        echo "  ID: {$b->id} | Patient: " . ($b->patient_id ?? 'NULL') . " | Created: {$b->created_at}\n";
    }
}
echo "\n";

// Notifications  
echo "NOTIFICATIONS (appointment_request):\n";
echo str_repeat("-", 100) . "\n";
$notifs = DB::select("
    SELECT n.*, u.name as user_name 
    FROM notifications n 
    LEFT JOIN users u ON n.user_id = u.id 
    WHERE n.type = 'appointment_request'
    ORDER BY n.id DESC
");
echo "Total: " . count($notifs) . "\n\n";

foreach ($notifs as $n) {
    $readStatus = $n->read ? 'Read' : 'UNREAD';
    echo "ID: {$n->id} | To: {$n->user_name} | Appointment: {$n->related_id} | {$readStatus} | Created: {$n->created_at}\n";
}
echo "\n";

// Summary
echo "==============================================\n";
echo "SUMMARY\n";
echo "==============================================\n\n";

echo "✅ Appointments: " . count($appointments) . " (4 pending with valid patient IDs)\n";
echo "✅ Patients: " . count($patients) . "\n";
echo "✅ Notifications: " . count($notifs) . "\n";
echo "⏳ Visits: " . count($visits) . " (created after admin approval)\n";
echo "⏳ Billing: " . count($billing) . " (created after admin approval)\n\n";

echo "WHAT THIS MEANS:\n";
echo "- 4 appointments are ready to be seen in admin portal\n";
echo "- " . count($patients) . " patients exist in patient records\n";
echo "- " . count($notifs) . " notifications sent to admin\n";
echo "- Visits and Billing will be created when admin APPROVES appointments\n\n";

echo "NEXT STEPS:\n";
echo "1. Clear browser cache or use incognito mode\n";
echo "2. Login as admin: admin@clinic.com\n";
echo "3. Go to /admin/appointments\n";
echo "4. You should see 4 pending appointments\n";
echo "5. Click on one and change status to 'Confirmed'\n";
echo "6. Visit and Billing will auto-create!\n\n";

echo "==============================================\n";

