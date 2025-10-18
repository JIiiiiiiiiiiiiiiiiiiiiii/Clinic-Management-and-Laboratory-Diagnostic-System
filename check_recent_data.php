<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "===========================================\n";
echo "CHECKING RECENT DATABASE RECORDS\n";
echo "===========================================\n\n";

// Check recent patients
echo "RECENT PATIENTS (Last 5):\n";
echo str_repeat("-", 100) . "\n";
$patients = DB::select("SELECT id, patient_no, first_name, last_name, user_id, created_at FROM patients ORDER BY id DESC LIMIT 5");
foreach ($patients as $p) {
    echo sprintf("ID: %-5s | Code: %-8s | Name: %-30s | User: %-5s | Created: %s\n", 
        $p->id, 
        $p->patient_no, 
        $p->first_name . ' ' . $p->last_name,
        $p->user_id ?? 'NULL',
        $p->created_at
    );
}
echo "\n";

// Check recent appointments
echo "RECENT APPOINTMENTS (Last 5):\n";
echo str_repeat("-", 120) . "\n";
$appointments = DB::select("SELECT id, patient_id, patient_name, appointment_type, status, source, created_at FROM appointments ORDER BY id DESC LIMIT 5");
foreach ($appointments as $a) {
    echo sprintf("ID: %-5s | Patient ID: %-5s | Name: %-25s | Type: %-20s | Status: %-10s | Source: %-8s | Created: %s\n",
        $a->id,
        $a->patient_id,
        $a->patient_name,
        $a->appointment_type,
        $a->status,
        $a->source ?? 'NULL',
        $a->created_at
    );
}
echo "\n";

// Check recent notifications
echo "RECENT NOTIFICATIONS (Last 5):\n";
echo str_repeat("-", 100) . "\n";
$notifications = DB::select("SELECT id, type, title, user_id, related_id, `read`, created_at FROM notifications ORDER BY id DESC LIMIT 5");
foreach ($notifications as $n) {
    $user = DB::select("SELECT name, email FROM users WHERE id = ?", [$n->user_id]);
    $userName = $user ? $user[0]->name : 'Unknown';
    echo sprintf("ID: %-5s | Type: %-25s | To: %-20s | Related: %-5s | Read: %-3s | Created: %s\n",
        $n->id,
        $n->type,
        $userName,
        $n->related_id ?? 'NULL',
        $n->read ? 'Yes' : 'No',
        $n->created_at
    );
}
echo "\n";

// Totals
echo "TOTALS:\n";
echo str_repeat("-", 50) . "\n";
$totals = [
    'Total Patients' => DB::scalar("SELECT COUNT(*) FROM patients"),
    'Total Appointments' => DB::scalar("SELECT COUNT(*) FROM appointments"),
    'Pending Appointments' => DB::scalar("SELECT COUNT(*) FROM appointments WHERE status='Pending'"),
    'Online Appointments' => DB::scalar("SELECT COUNT(*) FROM appointments WHERE source='Online'"),
    'Total Notifications' => DB::scalar("SELECT COUNT(*) FROM notifications"),
    'Unread Notifications' => DB::scalar("SELECT COUNT(*) FROM notifications WHERE `read`=0"),
];

foreach ($totals as $label => $count) {
    echo sprintf("%-25s: %d\n", $label, $count);
}

echo "\n===========================================\n";

