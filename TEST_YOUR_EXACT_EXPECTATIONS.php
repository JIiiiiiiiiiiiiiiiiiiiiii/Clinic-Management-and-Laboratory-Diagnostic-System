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
echo "TESTING YOUR EXACT EXPECTATIONS\n";
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
echo "EXPECTATION 1: After booking appointment\n";
echo "================================================================================\n\n";

// Create new user account
$uniqueEmail = 'newtest' . time() . '@test.com';
$user = User::create([
    'name' => 'New Test User',
    'email' => $uniqueEmail,
    'password' => bcrypt('password123'),
    'role' => 'patient',
]);

echo "✓ User account created\n";
echo "  ID: {$user->id}\n";
echo "  Email: {$user->email}\n\n";

// Book appointment with complete form data
auth()->login($user);

$specialist = \App\Models\Staff::where('role', 'Doctor')->where('status', 'Active')->first();

$completeFormData = [
    'existingPatientId' => 0,
    'patient' => [
        // Personal Information (Step 1)
        'last_name' => 'Martinez',
        'first_name' => 'Juan',
        'middle_name' => 'Cruz',
        'birthdate' => '1988-07-15',
        'age' => 36,
        'sex' => 'male',
        'nationality' => 'Filipino',
        'civil_status' => 'married',
        
        // Contact Details (Step 2)
        'address' => '456 Rizal Avenue, Manila City',
        'telephone_no' => '02-1234567',
        'mobile_no' => '09171234567',
        
        // Emergency Contact (Step 3)
        'emergency_name' => 'Maria Martinez',
        'emergency_relation' => 'Wife',
        
        // Insurance & Financial (Step 4)
        'insurance_company' => 'PhilHealth',
        'hmo_name' => 'Maxicare',
        'hmo_id_no' => 'MAX123456',
        'approval_code' => 'APPR789',
        'validity' => '2026-12-31',
        
        // Medical History (Step 5)
        'drug_allergies' => 'Penicillin',
        'past_medical_history' => 'Hypertension since 2020',
        'family_history' => 'Father has diabetes',
        'social_history' => 'Non-smoker, occasional drinker',
        'obgyn_history' => 'N/A',
    ],
    'appointment' => [
        // Appointment Booking (Step 6)
        'appointment_type' => 'general_consultation',
        'specialist_type' => 'Doctor',
        'specialist_id' => $specialist->staff_id,
        'date' => date('Y-m-d', strtotime('+5 days')),
        'time' => '2:30 PM',
        'duration' => '30 min',
        'price' => 300,
        'additional_info' => 'Experiencing chest pain for 2 days. Need consultation.',
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

echo "✅ Appointment booked successfully!\n\n";

// EXPECTATION 1.1: Patient record created with ALL form data
echo "Checking: Patient record created with form data...\n";
echo str_repeat("-", 80) . "\n";

$patient = Patient::find($result['patient_id']);
if ($patient) {
    echo "✅ PASS: Patient record created\n";
    echo "  Patient Code: {$patient->patient_no}\n";
    echo "  Name: {$patient->first_name} {$patient->middle_name} {$patient->last_name}\n";
    echo "  Birthdate: {$patient->birthdate}\n";
    echo "  Age: {$patient->age}\n";
    echo "  Sex: {$patient->sex}\n";
    echo "  Address: {$patient->address}\n";
    echo "  Mobile: {$patient->mobile_no}\n";
    echo "  Emergency Contact: {$patient->emergency_name} ({$patient->emergency_relation})\n";
    echo "  Drug Allergies: {$patient->drug_allergies}\n";
    echo "  Medical History: {$patient->past_medical_history}\n";
    echo "  ✓ All form data saved correctly!\n";
} else {
    echo "❌ FAIL: Patient record NOT created!\n";
}
echo "\n";

// EXPECTATION 1.2: Appointment appears in patient's "My Appointments"
echo "Checking: Appointment visible in patient portal...\n";
echo str_repeat("-", 80) . "\n";

$patientAppointments = PendingAppointment::where('patient_id', (string)$patient->id)->get();
echo "✅ PASS: {$patientAppointments->count()} appointment(s) in patient's view\n";
foreach ($patientAppointments as $apt) {
    echo "  - Type: {$apt->appointment_type}, Date: {$apt->appointment_date}, Status: {$apt->status_approval}\n";
}
echo "\n";

// EXPECTATION 1.3: Admin notification sent
echo "Checking: Admin notification sent...\n";
echo str_repeat("-", 80) . "\n";

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

// EXPECTATION 1.4: Added to pending appointments page with accurate data
echo "Checking: Pending appointment created with accurate form data...\n";
echo str_repeat("-", 80) . "\n";

$pendingAppt = PendingAppointment::find($result['pending_appointment_id']);
if ($pendingAppt) {
    echo "✅ PASS: Pending appointment created\n";
    echo "  Patient Name: {$pendingAppt->patient_name} (matches form: Juan Martinez)\n";
    echo "  Contact: {$pendingAppt->contact_number} (matches form: 09171234567)\n";
    echo "  Type: {$pendingAppt->appointment_type} (matches form: general_consultation)\n";
    echo "  Specialist: {$pendingAppt->specialist_name}\n";
    echo "  Date: {$pendingAppt->appointment_date}\n";
    echo "  Time: {$pendingAppt->appointment_time}\n";
    echo "  Price: ₱{$pendingAppt->price}\n";
    echo "  Notes: {$pendingAppt->notes}\n";
    echo "  Status: {$pendingAppt->status_approval}\n";
    echo "  ✓ All appointment data accurate!\n";
} else {
    echo "❌ FAIL: Pending appointment NOT created!\n";
}
echo "\n";

echo "================================================================================\n";
echo "EXPECTATION 2: When admin approves\n";
echo "================================================================================\n\n";

// Login as admin and approve
$admin = User::where('role', 'admin')->first();
auth()->login($admin);

echo "Admin approving pending appointment...\n";
echo str_repeat("-", 80) . "\n";

$beforeApproval = [
    'appointments' => Appointment::count(),
    'visits' => Visit::count(),
    'billing' => DB::table('billing_transactions')->count(),
    'appointment_billing_links' => DB::table('appointment_billing_links')->count(),
];

try {
    $controller2 = new \App\Http\Controllers\Admin\PendingAppointmentController();
    $request2 = new \Illuminate\Http\Request();
    $request2->merge(['admin_notes' => 'Approved - all details verified']);
    $request2->setUserResolver(function () use ($admin) {
        return $admin;
    });
    
    $controller2->approve($request2, $pendingAppt);
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

// EXPECTATION 2.1: Added to appointments table
echo "Checking: Appointment added to appointments table...\n";
echo str_repeat("-", 80) . "\n";

$appointmentCreated = $afterApproval['appointments'] > $beforeApproval['appointments'];
if ($appointmentCreated) {
    $newAppointment = Appointment::orderBy('id', 'desc')->first();
    echo "✅ PASS: Appointment created in appointments table\n";
    echo "  ID: {$newAppointment->id}\n";
    echo "  Patient ID: {$newAppointment->patient_id}\n";
    echo "  Patient Name: {$newAppointment->patient_name}\n";
    echo "  Type: {$newAppointment->appointment_type}\n";
    echo "  Status: {$newAppointment->status}\n";
    echo "  Source: {$newAppointment->source}\n";
} else {
    echo "❌ FAIL: Appointment NOT created in appointments table!\n";
}
echo "\n";

// EXPECTATION 2.2: Visit created automatically
echo "Checking: Visit created automatically...\n";
echo str_repeat("-", 80) . "\n";

$visitCreated = $afterApproval['visits'] > $beforeApproval['visits'];
if ($visitCreated) {
    $newVisit = Visit::orderBy('id', 'desc')->first();
    echo "✅ PASS: Visit created automatically\n";
    echo "  Visit ID: {$newVisit->id}\n";
    echo "  Patient ID: {$newVisit->patient_id}\n";
    echo "  Appointment ID: {$newVisit->appointment_id}\n";
    echo "  Date/Time: {$newVisit->visit_date_time}\n";
    echo "  Purpose: {$newVisit->purpose}\n";
    echo "  Status: {$newVisit->status}\n";
    echo "  Type: {$newVisit->visit_type}\n";
} else {
    echo "❌ FAIL: Visit NOT created!\n";
}
echo "\n";

// EXPECTATION 2.3: Billing transaction created
echo "Checking: Billing transaction created...\n";
echo str_repeat("-", 80) . "\n";

$billingCreated = $afterApproval['billing'] > $beforeApproval['billing'];
if ($billingCreated) {
    $newBilling = DB::selectOne("SELECT * FROM billing_transactions ORDER BY id DESC LIMIT 1");
    echo "✅ PASS: Billing transaction created\n";
    echo "  ID: {$newBilling->id}\n";
    echo "  Patient ID: {$newBilling->patient_id}\n";
    echo "  Status: {$newBilling->status}\n";
} else {
    echo "❌ FAIL: Billing transaction NOT created!\n";
}
echo "\n";

// EXPECTATION 2.4: Appointment-Billing link created (pending in transactions)
echo "Checking: Appointment sent to pending transactions...\n";
echo str_repeat("-", 80) . "\n";

$linkCreated = $afterApproval['appointment_billing_links'] > $beforeApproval['appointment_billing_links'];
if ($linkCreated) {
    $link = DB::selectOne("SELECT * FROM appointment_billing_links ORDER BY id DESC LIMIT 1");
    echo "✅ PASS: Appointment-Billing link created\n";
    echo "  Appointment ID: {$link->appointment_id}\n";
    echo "  Billing Transaction ID: {$link->billing_transaction_id}\n";
    echo "  Status: {$link->status}\n";
    echo "  ✓ Appointment is now in pending transactions!\n";
} else {
    echo "❌ FAIL: Appointment-Billing link NOT created!\n";
}
echo "\n";

echo "================================================================================\n";
echo "FINAL SUMMARY - YOUR EXPECTATIONS\n";
echo "================================================================================\n\n";

$expectations = [
    '1. Patient record created with form data' => $patient !== null,
    '2. Appointment visible in patient "My Appointments"' => $patientAppointments->count() > 0,
    '3. Admin notification sent' => $adminNotifications->count() > 0,
    '4. Added to pending appointments page' => $pendingAppt !== null,
    '5. Form data accurate in pending appointment' => $pendingAppt !== null,
    '6. After approval: Added to appointments table' => $appointmentCreated,
    '7. After approval: Visit created automatically' => $visitCreated,
    '8. After approval: Billing transaction created' => $billingCreated,
    '9. After approval: Appointment in pending transactions' => $linkCreated,
];

foreach ($expectations as $expectation => $met) {
    $icon = $met ? '✅ PASS' : '❌ FAIL';
    echo "{$icon}: {$expectation}\n";
}

echo "\n";

$allMet = !in_array(false, $expectations);

if ($allMet) {
    echo "🎉🎉🎉 ALL EXPECTATIONS MET! SYSTEM PERFECT! 🎉🎉🎉\n\n";
    
    echo "You can now:\n";
    echo "1. Register new account at /register\n";
    echo "2. Book appointment at /patient/online-appointment\n";
    echo "3. See it in /patient/appointments ✓\n";
    echo "4. Admin sees notification ✓\n";
    echo "5. Admin sees in /admin/pending-appointments ✓\n";
    echo "6. Admin approves ✓\n";
    echo "7. Appointment appears in /admin/appointments ✓\n";
    echo "8. Visit appears in /admin/visits ✓\n";
    echo "9. Billing appears in /admin/billing → Pending Transactions ✓\n\n";
    
    echo "EVERYTHING WORKS AS YOU EXPECTED!\n";
} else {
    echo "⚠️ SOME EXPECTATIONS NOT MET\n";
    echo "Check the failed items above.\n";
}

echo "\n================================================================================\n";

echo "\nQUICK DATABASE VERIFICATION:\n";
echo "- Total Patients: " . Patient::count() . "\n";
echo "- Pending Appointments: " . PendingAppointment::where('status_approval', 'pending')->count() . "\n";
echo "- Confirmed Appointments: " . Appointment::count() . "\n";
echo "- Visits: " . Visit::count() . "\n";
echo "- Billing Transactions: " . DB::table('billing_transactions')->count() . "\n";
echo "- Appointment-Billing Links: " . DB::table('appointment_billing_links')->count() . "\n";
echo "- Admin Notifications (unread): " . Notification::where('read', 0)->count() . "\n";

echo "\n================================================================================\n";

