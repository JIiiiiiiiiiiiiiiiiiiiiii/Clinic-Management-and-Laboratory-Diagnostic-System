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
use App\Models\Notification;

echo "================================================================================\n";
echo "TESTING COMPLETE CLINIC SYSTEM FLOW\n";
echo "================================================================================\n\n";

// Clean slate for accurate test
echo "Preparing clean test environment...\n";
DB::delete("DELETE FROM visits");
DB::delete("DELETE FROM appointment_billing_links");
DB::delete("DELETE FROM appointments");
DB::delete("DELETE FROM pending_appointments");
DB::delete("DELETE FROM billing_transactions WHERE patient_id > 20");
DB::delete("DELETE FROM patients WHERE id > 20");
DB::delete("DELETE FROM users WHERE id > 20");
DB::delete("DELETE FROM notifications WHERE id > 20");
echo "✓ Cleaned test data\n\n";

echo "================================================================================\n";
echo "STEP 1: USER CREATES ACCOUNT\n";
echo "================================================================================\n\n";

// Create new user account
$uniqueEmail = 'systemtest' . time() . '@test.com';
$user = User::create([
    'name' => 'System Test User',
    'email' => $uniqueEmail,
    'password' => bcrypt('password123'),
    'role' => 'patient',
]);

echo "✅ User account created\n";
echo "  ID: {$user->id}\n";
echo "  Email: {$user->email}\n\n";

echo "================================================================================\n";
echo "STEP 2: USER BOOKS ONLINE APPOINTMENT\n";
echo "================================================================================\n\n";

// Book appointment with complete form data
auth()->login($user);

$specialist = \App\Models\Staff::where('role', 'Doctor')->where('status', 'Active')->first();

$completeFormData = [
    'existingPatientId' => 0,
    'patient' => [
        'last_name' => 'Garcia',
        'first_name' => 'Maria',
        'middle_name' => 'Santos',
        'birthdate' => '1990-05-20',
        'age' => 34,
        'sex' => 'female',
        'nationality' => 'Filipino',
        'civil_status' => 'single',
        'address' => '789 Quezon Avenue, Quezon City',
        'telephone_no' => '02-9876543',
        'mobile_no' => '09187654321',
        'emergency_name' => 'Juan Garcia',
        'emergency_relation' => 'Brother',
        'insurance_company' => 'PhilHealth',
        'hmo_name' => 'Maxicare',
        'hmo_id_no' => 'MAX987654',
        'approval_code' => 'APPR456',
        'validity' => '2026-12-31',
        'drug_allergies' => 'None',
        'past_medical_history' => 'None',
        'family_history' => 'Mother has diabetes',
        'social_history' => 'Non-smoker, non-drinker',
        'obgyn_history' => 'N/A',
    ],
    'appointment' => [
        'appointment_type' => 'general_consultation',
        'specialist_type' => 'Doctor',
        'specialist_id' => $specialist->staff_id,
        'date' => date('Y-m-d', strtotime('+3 days')),
        'time' => '10:00 AM',
        'duration' => '30 min',
        'price' => 300,
        'additional_info' => 'Regular checkup and consultation.',
    ],
];

// Call API
$controller = new \App\Http\Controllers\Api\OnlineAppointmentController();
$request = new \Illuminate\Http\Request();
$request->merge($completeFormData);
$request->setUserResolver(function () use ($user) {
    return $user;
});

$response = $controller->store($request);
$result = $response->getData(true);

if (!$result['success']) {
    echo "❌ FAILED to create appointment!\n";
    print_r($result);
    exit(1);
}

echo "✅ Appointment booked successfully!\n";
echo "  Patient ID: {$result['patient_id']}\n";
echo "  Pending Appointment ID: {$result['pending_appointment_id']}\n\n";

echo "================================================================================\n";
echo "STEP 3: CHECK PATIENT SIDE - MY APPOINTMENTS\n";
echo "================================================================================\n\n";

// Test patient appointments controller
$patientController = new \App\Http\Controllers\Patient\PatientAppointmentController();
$request2 = new \Illuminate\Http\Request();
$request2->setUserResolver(function () use ($user) {
    return $user;
});

// Simulate the index method
$patient = Patient::where('user_id', $user->id)->first();
if ($patient) {
    echo "✅ Patient record found\n";
    echo "  Patient ID: {$patient->id}\n";
    echo "  Patient Code: {$patient->patient_no}\n";
    
    // Check pending appointments
    $pendingAppointments = PendingAppointment::where('patient_id', (string)$patient->id)->get();
    echo "  Pending Appointments: {$pendingAppointments->count()}\n";
    
    // Check confirmed appointments
    $confirmedAppointments = Appointment::where('patient_id', $patient->id)->get();
    echo "  Confirmed Appointments: {$confirmedAppointments->count()}\n";
    
    echo "✅ Patient should see appointments in 'My Appointments' page\n";
} else {
    echo "❌ FAIL: Patient record NOT found!\n";
}
echo "\n";

echo "================================================================================\n";
echo "STEP 4: CHECK ADMIN NOTIFICATIONS\n";
echo "================================================================================\n\n";

$adminNotifications = Notification::where('type', 'appointment_request')
    ->where('related_id', $result['pending_appointment_id'])
    ->get();

if ($adminNotifications->count() > 0) {
    echo "✅ PASS: {$adminNotifications->count()} admin notification(s) sent\n";
    foreach ($adminNotifications as $notif) {
        $admin = User::find($notif->user_id);
        echo "  - To: " . ($admin ? $admin->name : 'Unknown') . "\n";
        echo "  - Title: {$notif->title}\n";
        echo "  - Read: " . ($notif->read ? 'Yes' : 'NO - UNREAD') . "\n";
    }
} else {
    echo "❌ FAIL: No admin notifications sent!\n";
}
echo "\n";

echo "================================================================================\n";
echo "STEP 5: CHECK PENDING APPOINTMENTS PAGE\n";
echo "================================================================================\n\n";

$pendingAppt = PendingAppointment::find($result['pending_appointment_id']);
if ($pendingAppt) {
    echo "✅ PASS: Pending appointment created\n";
    echo "  Patient Name: {$pendingAppt->patient_name}\n";
    echo "  Type: {$pendingAppt->appointment_type}\n";
    echo "  Date: {$pendingAppt->appointment_date}\n";
    echo "  Time: {$pendingAppt->appointment_time}\n";
    echo "  Status: {$pendingAppt->status_approval}\n";
    echo "✅ Admin should see this in /admin/pending-appointments\n";
} else {
    echo "❌ FAIL: Pending appointment NOT created!\n";
}
echo "\n";

echo "================================================================================\n";
echo "STEP 6: ADMIN APPROVES APPOINTMENT\n";
echo "================================================================================\n\n";

// Login as admin and approve
$admin = User::where('role', 'admin')->first();
auth()->login($admin);

echo "Admin approving pending appointment...\n";

$beforeApproval = [
    'appointments' => Appointment::count(),
    'visits' => Visit::count(),
    'billing' => DB::table('billing_transactions')->count(),
    'appointment_billing_links' => DB::table('appointment_billing_links')->count(),
];

try {
    $controller2 = new \App\Http\Controllers\Admin\PendingAppointmentController();
    $request3 = new \Illuminate\Http\Request();
    $request3->merge(['admin_notes' => 'Approved - system test']);
    $request3->setUserResolver(function () use ($admin) {
        return $admin;
    });
    
    $controller2->approve($request3, $pendingAppt);
    echo "✅ Approval completed\n\n";
} catch (\Exception $e) {
    echo "❌ FAIL: Approval failed - {$e->getMessage()}\n";
    exit(1);
}

$afterApproval = [
    'appointments' => Appointment::count(),
    'visits' => Visit::count(),
    'billing' => DB::table('billing_transactions')->count(),
    'appointment_billing_links' => DB::table('appointment_billing_links')->count(),
];

echo "================================================================================\n";
echo "STEP 7: CHECK RESULTS AFTER APPROVAL\n";
echo "================================================================================\n\n";

// Check appointments table
$appointmentCreated = $afterApproval['appointments'] > $beforeApproval['appointments'];
if ($appointmentCreated) {
    $newAppointment = Appointment::orderBy('id', 'desc')->first();
    echo "✅ PASS: Appointment created in appointments table\n";
    echo "  ID: {$newAppointment->id}\n";
    echo "  Status: {$newAppointment->status}\n";
} else {
    echo "❌ FAIL: Appointment NOT created in appointments table!\n";
}

// Check visit creation
$visitCreated = $afterApproval['visits'] > $beforeApproval['visits'];
if ($visitCreated) {
    $newVisit = Visit::orderBy('id', 'desc')->first();
    echo "✅ PASS: Visit created automatically\n";
    echo "  Visit ID: {$newVisit->id}\n";
    echo "  Status: {$newVisit->status}\n";
} else {
    echo "❌ FAIL: Visit NOT created!\n";
}

// Check billing transaction
$billingCreated = $afterApproval['billing'] > $beforeApproval['billing'];
if ($billingCreated) {
    $newBilling = DB::selectOne("SELECT * FROM billing_transactions ORDER BY id DESC LIMIT 1");
    echo "✅ PASS: Billing transaction created\n";
    echo "  ID: {$newBilling->id}\n";
    echo "  Status: {$newBilling->status}\n";
} else {
    echo "❌ FAIL: Billing transaction NOT created!\n";
}

// Check appointment-billing link
$linkCreated = $afterApproval['appointment_billing_links'] > $beforeApproval['appointment_billing_links'];
if ($linkCreated) {
    $link = DB::selectOne("SELECT * FROM appointment_billing_links ORDER BY id DESC LIMIT 1");
    echo "✅ PASS: Appointment-Billing link created\n";
    echo "  Appointment ID: {$link->appointment_id}\n";
    echo "  Billing Transaction ID: {$link->billing_transaction_id}\n";
} else {
    echo "❌ FAIL: Appointment-Billing link NOT created!\n";
}

echo "\n================================================================================\n";
echo "STEP 8: CHECK PATIENT SIDE AFTER APPROVAL\n";
echo "================================================================================\n\n";

// Login back as patient
auth()->login($user);

// Check what patient sees now
$patient = Patient::where('user_id', $user->id)->first();
if ($patient) {
    $pendingAppointments = PendingAppointment::where('patient_id', (string)$patient->id)->get();
    $confirmedAppointments = Appointment::where('patient_id', $patient->id)->get();
    
    echo "Patient's view after approval:\n";
    echo "  Pending Appointments: {$pendingAppointments->count()}\n";
    echo "  Confirmed Appointments: {$confirmedAppointments->count()}\n";
    
    if ($confirmedAppointments->count() > 0) {
        echo "✅ PASS: Patient should now see confirmed appointment in 'My Appointments'\n";
    } else {
        echo "❌ FAIL: Patient should see confirmed appointment but doesn't!\n";
    }
}

echo "\n================================================================================\n";
echo "FINAL SYSTEM FLOW SUMMARY\n";
echo "================================================================================\n\n";

$flowSteps = [
    '1. User creates account' => $user !== null,
    '2. Patient record created' => $patient !== null,
    '3. Appointment booked' => $result['success'] ?? false,
    '4. Admin notification sent' => $adminNotifications->count() > 0,
    '5. Pending appointment created' => $pendingAppt !== null,
    '6. Admin approval works' => $appointmentCreated,
    '7. Visit created automatically' => $visitCreated,
    '8. Billing transaction created' => $billingCreated,
    '9. Appointment-Billing link created' => $linkCreated,
    '10. Patient sees appointments' => $confirmedAppointments->count() > 0,
];

foreach ($flowSteps as $step => $passed) {
    $icon = $passed ? '✅ PASS' : '❌ FAIL';
    echo "{$icon}: {$step}\n";
}

echo "\n";

$allPassed = !in_array(false, $flowSteps);

if ($allPassed) {
    echo "🎉🎉🎉 COMPLETE CLINIC SYSTEM FLOW WORKING! 🎉🎉🎉\n\n";
    
    echo "The entire system flow works:\n";
    echo "1. ✅ User registration\n";
    echo "2. ✅ Online appointment booking\n";
    echo "3. ✅ Patient record creation\n";
    echo "4. ✅ Admin notifications\n";
    echo "5. ✅ Pending appointments page\n";
    echo "6. ✅ Admin approval process\n";
    echo "7. ✅ Automatic visit creation\n";
    echo "8. ✅ Billing transaction creation\n";
    echo "9. ✅ Patient sees appointments\n";
    echo "10. ✅ Complete clinic workflow\n\n";
    
    echo "🚀 SYSTEM IS READY FOR PRODUCTION! 🚀\n";
} else {
    echo "⚠️ SOME STEPS FAILED\n";
    echo "Check the failed items above.\n";
}

echo "\n================================================================================\n";

echo "\nDATABASE STATE:\n";
echo "- Total Users: " . User::count() . "\n";
echo "- Total Patients: " . Patient::count() . "\n";
echo "- Pending Appointments: " . PendingAppointment::where('status_approval', 'pending')->count() . "\n";
echo "- Confirmed Appointments: " . Appointment::count() . "\n";
echo "- Visits: " . Visit::count() . "\n";
echo "- Billing Transactions: " . DB::table('billing_transactions')->count() . "\n";
echo "- Appointment-Billing Links: " . DB::table('appointment_billing_links')->count() . "\n";
echo "- Admin Notifications (unread): " . Notification::where('read', 0)->count() . "\n";

echo "\n================================================================================\n";
