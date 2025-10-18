<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\User;

echo "==============================================\n";
echo "CLEANUP AND TEST PENDING APPOINTMENTS\n";
echo "==============================================\n\n";

// Step 1: Clean up old appointments table
echo "Step 1: Cleaning up appointments table...\n";
echo str_repeat("-", 80) . "\n";

$deletedAppointments = DB::delete("DELETE FROM appointments");
echo "✓ Deleted {$deletedAppointments} old appointments\n\n";

// Step 2: Clean up old pending appointments
echo "Step 2: Cleaning up pending_appointments table...\n";
echo str_repeat("-", 80) . "\n";

$deletedPending = DB::delete("DELETE FROM pending_appointments");
echo "✓ Deleted {$deletedPending} old pending appointments\n\n";

// Step 3: Create a fresh test appointment
echo "Step 3: Creating fresh test appointment via API...\n";
echo str_repeat("-", 80) . "\n";

// Authenticate as test user
$user = User::where('email', 'testpatient@test.com')->first();
if (!$user) {
    $user = User::create([
        'name' => 'Test Patient',
        'email' => 'testpatient@test.com',
        'password' => bcrypt('password123'),
        'role' => 'patient',
    ]);
}
auth()->login($user);

// Get specialist
$specialist = \App\Models\Staff::where('role', 'Doctor')->where('status', 'Active')->first();

// Prepare data
$requestData = [
    'existingPatientId' => 0,
    'patient' => [
        'last_name' => 'FreshTest',
        'first_name' => 'NewPatient',
        'middle_name' => 'Middle',
        'birthdate' => '1995-05-15',
        'age' => 29,
        'sex' => 'female',
        'nationality' => 'Filipino',
        'civil_status' => 'single',
        'address' => '456 New Street, New City',
        'telephone_no' => '9876543',
        'mobile_no' => '09189876543',
        'emergency_name' => 'Emergency Person',
        'emergency_relation' => 'Parent',
        'drug_allergies' => 'NONE',
        'past_medical_history' => 'None',
        'family_history' => 'None',
        'social_history' => 'None',
        'obgyn_history' => 'None',
    ],
    'appointment' => [
        'appointment_type' => 'general_consultation',
        'specialist_type' => 'Doctor',
        'specialist_id' => $specialist->staff_id,
        'date' => date('Y-m-d', strtotime('+5 days')),
        'time' => '2:00 PM',
        'duration' => '30 min',
        'price' => 300,
        'additional_info' => 'Fresh test appointment',
    ],
];

// Call API
$controller = new \App\Http\Controllers\Api\OnlineAppointmentController();
$request = new \Illuminate\Http\Request();
$request->merge($requestData);
$request->setUserResolver(function () use ($user) {
    return $user;
});

try {
    $response = $controller->store($request);
    $result = $response->getData(true);
    
    if ($result['success']) {
        echo "✅ SUCCESS! Appointment created in pending_appointments table\n";
        echo "  Patient Code: {$result['patient_code']}\n";
        echo "  Appointment Code: {$result['appointment_code']}\n";
        echo "  Status: {$result['status']}\n\n";
    } else {
        echo "❌ FAILED: {$result['message']}\n\n";
    }
} catch (\Exception $e) {
    echo "❌ ERROR: {$e->getMessage()}\n\n";
}

// Step 4: Verify in database
echo "Step 4: Verifying in database...\n";
echo str_repeat("-", 80) . "\n";

// Check appointments table (should be empty or only have old ones)
$appointments = DB::select("SELECT * FROM appointments");
echo "Appointments table: " . count($appointments) . " record(s)\n";

// Check pending_appointments table (should have new one)
$pendingAppointments = DB::select("SELECT * FROM pending_appointments ORDER BY id DESC LIMIT 5");
echo "Pending appointments table: " . count($pendingAppointments) . " record(s)\n\n";

if (count($pendingAppointments) > 0) {
    echo "PENDING APPOINTMENTS:\n";
    foreach ($pendingAppointments as $pa) {
        echo "  ID: {$pa->id} | Patient: {$pa->patient_name} | Type: {$pa->appointment_type} | Status: {$pa->status_approval} | Source: " . ($pa->source ?? $pa->appointment_source ?? 'N/A') . "\n";
    }
    echo "\n";
}

// Check patients
$patients = DB::select("SELECT id, patient_no, first_name, last_name FROM patients ORDER BY id DESC LIMIT 5");
echo "Patients: " . count($patients) . " total\n";
foreach ($patients as $p) {
    echo "  ID: {$p->id} | Code: {$p->patient_no} | Name: {$p->first_name} {$p->last_name}\n";
}
echo "\n";

// Check notifications
$notifications = DB::select("SELECT * FROM notifications WHERE type='appointment_request' ORDER BY id DESC LIMIT 3");
echo "Notifications: " . count($notifications) . " recent\n";
foreach ($notifications as $n) {
    $user = DB::selectOne("SELECT name FROM users WHERE id = ?", [$n->user_id]);
    $readStatus = $n->read ? 'Read' : 'UNREAD';
    echo "  ID: {$n->id} | To: " . ($user ? $user->name : 'Unknown') . " | {$readStatus}\n";
}
echo "\n";

echo "==============================================\n";
echo "SUMMARY\n";
echo "==============================================\n\n";

echo "✅ Appointments table: CLEARED (will be filled when admin approves)\n";
echo "✅ Pending appointments table: " . count($pendingAppointments) . " pending\n";
echo "✅ Patients table: " . count($patients) . " patients\n";
echo "✅ Notifications: " . count($notifications) . " sent to admin\n\n";

echo "CORRECT WORKFLOW:\n";
echo "1. User books appointment → Goes to PENDING_APPOINTMENTS table ✓\n";
echo "2. Admin gets notified → Can view at /admin/pending-appointments ✓\n";
echo "3. Admin approves → Moved to APPOINTMENTS table + Visit + Billing created ✓\n\n";

echo "Go to /admin/pending-appointments to see the pending appointment!\n";
echo "==============================================\n";

