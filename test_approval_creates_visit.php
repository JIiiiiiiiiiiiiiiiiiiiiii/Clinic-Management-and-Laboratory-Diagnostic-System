<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\PendingAppointment;
use App\Models\User;

echo "==============================================\n";
echo "TEST: APPROVING PENDING APPOINTMENT\n";
echo "==============================================\n\n";

// Login as admin
$admin = User::where('role', 'admin')->first();
if (!$admin) {
    echo "❌ No admin user found!\n";
    exit(1);
}

auth()->login($admin);
echo "✓ Logged in as admin: {$admin->name}\n\n";

// Get first pending appointment
$pendingAppointment = PendingAppointment::where('status_approval', 'pending')->first();

if (!$pendingAppointment) {
    echo "❌ No pending appointments found!\n";
    echo "Run: php test_complete_flow_step_by_step.php first\n";
    exit(1);
}

echo "Found pending appointment:\n";
echo "  ID: {$pendingAppointment->id}\n";
echo "  Patient ID: {$pendingAppointment->patient_id}\n";
echo "  Patient Name: {$pendingAppointment->patient_name}\n";
echo "  Type: {$pendingAppointment->appointment_type}\n\n";

// Count before approval
echo "BEFORE APPROVAL:\n";
echo str_repeat("-", 80) . "\n";
$beforeCounts = [
    'Appointments' => DB::table('appointments')->count(),
    'Visits' => DB::table('visits')->count(),
    'Billing Transactions' => DB::table('billing_transactions')->count(),
];
foreach ($beforeCounts as $label => $count) {
    echo "  {$label}: {$count}\n";
}
echo "\n";

// Approve the appointment
echo "Approving appointment...\n";
echo str_repeat("-", 80) . "\n";

try {
    $controller = new \App\Http\Controllers\Admin\PendingAppointmentController();
    $request = new \Illuminate\Http\Request();
    $request->merge(['admin_notes' => 'Approved for testing']);
    $request->setUserResolver(function () use ($admin) {
        return $admin;
    });
    
    $response = $controller->approve($request, $pendingAppointment);
    
    echo "✅ Approval completed!\n\n";
    
} catch (\Exception $e) {
    echo "❌ Error during approval: {$e->getMessage()}\n";
    echo "  File: {$e->getFile()}:{$e->getLine()}\n\n";
    
    // Show more detail
    echo "Full error:\n";
    echo $e->getTraceAsString() . "\n\n";
    exit(1);
}

// Count after approval
echo "AFTER APPROVAL:\n";
echo str_repeat("-", 80) . "\n";
$afterCounts = [
    'Appointments' => DB::table('appointments')->count(),
    'Visits' => DB::table('visits')->count(),
    'Billing Transactions' => DB::table('billing_transactions')->count(),
];
foreach ($afterCounts as $label => $count) {
    echo "  {$label}: {$count}\n";
}
echo "\n";

// Show what was created
echo "CHANGES:\n";
echo str_repeat("-", 80) . "\n";
foreach ($beforeCounts as $label => $before) {
    $after = $afterCounts[$label];
    $change = $after - $before;
    $icon = $change > 0 ? '✓' : '✗';
    echo "  {$icon} {$label}: {$before} → {$after} (";
    if ($change > 0) {
        echo "+{$change})";
    } else {
        echo "no change)";
    }
    echo "\n";
}
echo "\n";

// Show recent appointment
$recentAppointment = DB::selectOne("SELECT * FROM appointments ORDER BY id DESC LIMIT 1");
if ($recentAppointment) {
    echo "Recent Appointment:\n";
    echo "  ID: {$recentAppointment->id}\n";
    echo "  Patient ID: {$recentAppointment->patient_id}\n";
    echo "  Status: {$recentAppointment->status}\n";
    echo "  Source: " . ($recentAppointment->source ?? 'NULL') . "\n";
}
echo "\n";

// Show recent visit
$recentVisit = DB::selectOne("SELECT * FROM visits ORDER BY id DESC LIMIT 1");
if ($recentVisit) {
    echo "Recent Visit:\n";
    echo "  ID: {$recentVisit->id}\n";
    echo "  Patient ID: {$recentVisit->patient_id}\n";
    echo "  Appointment ID: {$recentVisit->appointment_id}\n";
    echo "  Status: {$recentVisit->status}\n";
} else {
    echo "❌ NO VISIT CREATED!\n";
}
echo "\n";

// Show recent billing
$recentBilling = DB::selectOne("SELECT * FROM billing_transactions ORDER BY id DESC LIMIT 1");
if ($recentBilling) {
    echo "Recent Billing:\n";
    echo "  ID: {$recentBilling->id}\n";
    echo "  Patient ID: {$recentBilling->patient_id}\n";
    echo "  Status: {$recentBilling->status}\n";
} else {
    echo "❌ NO BILLING CREATED!\n";
}

echo "\n==============================================\n";
echo "CONCLUSION:\n";
echo "==============================================\n\n";

if ($afterCounts['Appointments'] > $beforeCounts['Appointments']) {
    echo "✅ Appointment created in appointments table\n";
} else {
    echo "❌ Appointment NOT created!\n";
}

if ($afterCounts['Visits'] > $beforeCounts['Visits']) {
    echo "✅ Visit created automatically\n";
} else {
    echo "❌ Visit NOT created automatically!\n";
}

if ($afterCounts['Billing Transactions'] > $beforeCounts['Billing Transactions']) {
    echo "✅ Billing transaction created\n";
} else {
    echo "❌ Billing NOT created!\n";
}

echo "\n==============================================\n";

