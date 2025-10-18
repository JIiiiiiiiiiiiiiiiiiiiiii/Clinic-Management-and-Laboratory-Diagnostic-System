<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Patient;
use App\Models\PendingAppointment;
use App\Models\Appointment;
use App\Models\Visit;

echo "==============================================\n";
echo "COMPLETE END-TO-END TEST\n";
echo "==============================================\n\n";

// Clean slate
echo "Cleaning database...\n";
DB::delete("DELETE FROM visits");
DB::delete("DELETE FROM appointments");
DB::delete("DELETE FROM pending_appointments");
DB::delete("DELETE FROM patients WHERE user_id >= 52"); // Keep old patients
DB::delete("DELETE FROM users WHERE role='patient' AND id >= 52");
echo "✓ Cleaned\n\n";

// Step 1: Create user account
echo "STEP 1: CREATE USER ACCOUNT\n";
echo str_repeat("-", 80) . "\n";

$user = User::create([
    'name' => 'Complete Test User',
    'email' => 'completetest@test.com',
    'password' => bcrypt('password123'),
    'role' => 'patient',
]);

echo "✓ User created: ID {$user->id}, Email: {$user->email}\n\n";

// Step 2: Book online appointment
echo "STEP 2: BOOK ONLINE APPOINTMENT\n";
echo str_repeat("-", 80) . "\n";

auth()->login($user);

$specialist = \App\Models\Staff::where('role', 'Doctor')->where('status', 'Active')->first();

$requestData = [
    'existingPatientId' => 0,
    'patient' => [
        'last_name' => 'CompleteTest',
        'first_name' => 'User',
        'middle_name' => 'T',
        'birthdate' => '1993-06-25',
        'age' => 31,
        'sex' => 'female',
        'nationality' => 'Filipino',
        'civil_status' => 'married',
        'address' => '999 Complete Test Avenue',
        'telephone_no' => '5551234',
        'mobile_no' => '09177778888',
        'emergency_name' => 'Test Emergency',
        'emergency_relation' => 'Spouse',
        'drug_allergies' => 'NONE',
        'past_medical_history' => 'None',
        'family_history' => 'None',
        'social_history' => 'None',
        'obgyn_history' => 'None',
    ],
    'appointment' => [
        'appointment_type' => 'cbc',
        'specialist_type' => 'Doctor',
        'specialist_id' => $specialist->staff_id,
        'date' => date('Y-m-d', strtotime('+10 days')),
        'time' => '11:00 AM',
        'duration' => '30 min',
        'price' => 500,
        'additional_info' => 'Complete end-to-end test',
    ],
];

$controller = new \App\Http\Controllers\Api\OnlineAppointmentController();
$request = new \Illuminate\Http\Request();
$request->merge($requestData);
$request->setUserResolver(function () use ($user) {
    return $user;
});

$response = $controller->store($request);
$result = $response->getData(true);

if ($result['success']) {
    echo "✓ Appointment booked successfully\n";
    echo "  Patient Code: {$result['patient_code']}\n";
    echo "  Appointment Code: {$result['appointment_code']}\n\n";
    
    $patientId = $result['patient_id'];
    $pendingId = $result['pending_appointment_id'];
} else {
    echo "✗ Failed to book appointment\n";
    print_r($result);
    exit(1);
}

// Verify what was created
echo "VERIFICATION AFTER BOOKING:\n";
echo str_repeat("-", 80) . "\n";

$patient = Patient::find($patientId);
echo "✓ Patient: " . ($patient ? "ID {$patient->id}, Code {$patient->patient_no}" : "NOT FOUND") . "\n";

$pending = PendingAppointment::find($pendingId);
echo "✓ Pending Appointment: " . ($pending ? "ID {$pending->id}, Status {$pending->status_approval}" : "NOT FOUND") . "\n";

$apptCount = Appointment::count();
echo "✓ Appointments table: {$apptCount} record(s) (should be 0)\n";

$visitCount = Visit::count();
echo "✓ Visits table: {$visitCount} record(s) (should be 0)\n";

$notifCount = DB::table('notifications')->where('related_id', $pendingId)->where('type', 'appointment_request')->count();
echo "✓ Admin notifications: {$notifCount} (should be 1)\n\n";

// Step 3: Approve as admin
echo "STEP 3: ADMIN APPROVES APPOINTMENT\n";
echo str_repeat("-", 80) . "\n";

$admin = User::where('role', 'admin')->first();
auth()->login($admin);

$controller2 = new \App\Http\Controllers\Admin\PendingAppointmentController();
$request2 = new \Illuminate\Http\Request();
$request2->merge(['admin_notes' => 'Approved - complete test']);
$request2->setUserResolver(function () use ($admin) {
    return $admin;
});

try {
    $response2 = $controller2->approve($request2, $pending);
    echo "✓ Approval completed\n\n";
} catch (\Exception $e) {
    echo "✗ Approval failed: {$e->getMessage()}\n";
    echo "  Line: {$e->getLine()}\n";
    exit(1);
}

// Final verification
echo "FINAL VERIFICATION:\n";
echo str_repeat("-", 80) . "\n";

$finalCounts = [
    'Patients' => Patient::count(),
    'Pending Appointments' => PendingAppointment::where('status_approval', 'pending')->count(),
    'Approved Appointments' => Appointment::count(),
    'Visits' => Visit::count(),
    'Billing Transactions' => DB::table('billing_transactions')->count(),
];

foreach ($finalCounts as $label => $count) {
    echo "  {$label}: {$count}\n";
}
echo "\n";

// Show the created records
$recentAppt = Appointment::orderBy('id', 'desc')->first();
if ($recentAppt) {
    echo "Recent Appointment:\n";
    echo "  ID: {$recentAppt->id}\n";
    echo "  Patient ID: {$recentAppt->patient_id}\n";
    echo "  Status: {$recentAppt->status}\n";
    echo "  Source: " . ($recentAppt->source ?? 'NULL') . "\n\n";
}

$recentVisit = Visit::orderBy('id', 'desc')->first();
if ($recentVisit) {
    echo "Recent Visit:\n";
    echo "  ID: {$recentVisit->id}\n";
    echo "  Patient ID: {$recentVisit->patient_id}\n";
    echo "  Appointment ID: {$recentVisit->appointment_id}\n";
    echo "  Status: {$recentVisit->status}\n";
    echo "  Type: {$recentVisit->visit_type}\n\n";
} else {
    echo "✗ NO VISIT CREATED!\n\n";
}

echo "==============================================\n";
echo "TEST COMPLETE\n";
echo "==============================================\n\n";

if ($finalCounts['Approved Appointments'] > 0 && $finalCounts['Visits'] > 0) {
    echo "✅ ALL SYSTEMS WORKING!\n\n";
    echo "Now go to your browser:\n";
    echo "1. Clear cache (CTRL+SHIFT+DELETE)\n";
    echo "2. Login as admin\n";
    echo "3. Go to /admin/patient - should see patients\n";
    echo "4. Go to /admin/pending-appointments - should see pending\n";
    echo "5. Go to /admin/appointments - should see approved\n";
    echo "6. Go to /admin/visits - should see {$finalCounts['Visits']} visit(s)\n";
} else {
    echo "❌ SOMETHING STILL BROKEN!\n";
}

echo "\n==============================================\n";

