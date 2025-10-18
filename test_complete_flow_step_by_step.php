<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Patient;
use App\Models\PendingAppointment;

echo "==============================================\n";
echo "COMPLETE FLOW TEST - STEP BY STEP\n";
echo "==============================================\n\n";

// Step 1: Create a brand new user (simulate registration)
echo "Step 1: Creating new user account...\n";
echo str_repeat("-", 80) . "\n";

$testEmail = 'brandnew' . time() . '@test.com';
$user = User::create([
    'name' => 'Brand New User',
    'email' => $testEmail,
    'password' => bcrypt('password123'),
    'role' => 'patient',
]);

echo "✓ User created:\n";
echo "  ID: {$user->id}\n";
echo "  Email: {$user->email}\n";
echo "  Role: {$user->role}\n\n";

// Step 2: Authenticate and book appointment
echo "Step 2: Booking online appointment as this user...\n";
echo str_repeat("-", 80) . "\n";

auth()->login($user);

$specialist = \App\Models\Staff::where('role', 'Doctor')->where('status', 'Active')->first();

$requestData = [
    'existingPatientId' => 0,
    'patient' => [
        'last_name' => 'BrandNew',
        'first_name' => 'Patient',
        'middle_name' => 'Test',
        'birthdate' => '1992-03-20',
        'age' => 32,
        'sex' => 'male',
        'nationality' => 'Filipino',
        'civil_status' => 'single',
        'address' => '789 Brand New Street',
        'telephone_no' => '1112233',
        'mobile_no' => '09198887766',
        'emergency_name' => 'Emergency Contact',
        'emergency_relation' => 'Spouse',
        'drug_allergies' => 'NONE',
        'past_medical_history' => 'None',
        'family_history' => 'None',
        'social_history' => 'None',
        'obgyn_history' => 'N/A',
    ],
    'appointment' => [
        'appointment_type' => 'checkup',
        'specialist_type' => 'Doctor',
        'specialist_id' => $specialist->staff_id,
        'date' => date('Y-m-d', strtotime('+7 days')),
        'time' => '3:30 PM',
        'duration' => '30 min',
        'price' => 300,
        'additional_info' => 'Complete flow test',
    ],
];

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
        echo "✅ Appointment submission SUCCESS!\n";
        echo "  Patient Code: {$result['patient_code']}\n";
        echo "  Patient ID: {$result['patient_id']}\n";
        echo "  Appointment Code: {$result['appointment_code']}\n\n";
        
        $patientId = $result['patient_id'];
        $pendingAppointmentId = $result['pending_appointment_id'];
        
        // Step 3: Verify patient was created
        echo "Step 3: Verifying patient record...\n";
        echo str_repeat("-", 80) . "\n";
        
        $patient = Patient::find($patientId);
        if ($patient) {
            echo "✅ Patient FOUND in database:\n";
            echo "  ID: {$patient->id}\n";
            echo "  Patient No: {$patient->patient_no}\n";
            echo "  Name: {$patient->first_name} {$patient->last_name}\n";
            echo "  Mobile: {$patient->mobile_no}\n";
            echo "  Address: {$patient->address}\n";
            echo "  User ID: " . ($patient->user_id ?? 'NULL') . "\n\n";
        } else {
            echo "❌ Patient NOT FOUND! ID was: {$patientId}\n\n";
        }
        
        // Step 4: Verify pending appointment
        echo "Step 4: Verifying pending appointment...\n";
        echo str_repeat("-", 80) . "\n";
        
        $pendingAppt = PendingAppointment::find($pendingAppointmentId);
        if ($pendingAppt) {
            echo "✅ Pending appointment FOUND:\n";
            echo "  ID: {$pendingAppt->id}\n";
            echo "  Patient ID: {$pendingAppt->patient_id}\n";
            echo "  Patient Name: {$pendingAppt->patient_name}\n";
            echo "  Type: {$pendingAppt->appointment_type}\n";
            echo "  Status: {$pendingAppt->status_approval}\n\n";
        } else {
            echo "❌ Pending appointment NOT FOUND!\n\n";
        }
        
        // Step 5: Check notification
        echo "Step 5: Checking admin notification...\n";
        echo str_repeat("-", 80) . "\n";
        
        $notification = DB::selectOne("
            SELECT * FROM notifications 
            WHERE type='appointment_request' 
            AND related_id = ? 
            ORDER BY id DESC LIMIT 1
        ", [$pendingAppointmentId]);
        
        if ($notification) {
            $admin = User::find($notification->user_id);
            echo "✅ Notification FOUND:\n";
            echo "  ID: {$notification->id}\n";
            echo "  To: " . ($admin ? $admin->name : 'Unknown') . "\n";
            echo "  Title: {$notification->title}\n";
            echo "  Read: " . ($notification->read ? 'Yes' : 'NO') . "\n\n";
        } else {
            echo "❌ Notification NOT FOUND!\n\n";
        }
        
        // Step 6: Count records in all tables
        echo "Step 6: Counting all records...\n";
        echo str_repeat("-", 80) . "\n";
        
        $counts = [
            'Patients' => Patient::count(),
            'Pending Appointments' => PendingAppointment::count(),
            'Appointments' => \App\Models\Appointment::count(),
            'Visits' => DB::table('visits')->count(),
            'Billing Transactions' => DB::table('billing_transactions')->count(),
            'Notifications (unread)' => DB::table('notifications')->where('read', 0)->count(),
        ];
        
        foreach ($counts as $label => $count) {
            echo "  {$label}: {$count}\n";
        }
        echo "\n";
        
    } else {
        echo "❌ Appointment submission FAILED!\n";
        echo "  Message: {$result['message']}\n";
        if (isset($result['errors'])) {
            print_r($result['errors']);
        }
    }
    
} catch (\Exception $e) {
    echo "❌ EXCEPTION: {$e->getMessage()}\n";
    echo "  Line: {$e->getLine()}\n";
    echo "  File: {$e->getFile()}\n";
}

echo "==============================================\n";
echo "WHAT SHOULD HAPPEN:\n";
echo "==============================================\n\n";
echo "IMMEDIATELY (when user submits):\n";
echo "  ✓ Patient record created in 'patients' table\n";
echo "  ✓ Pending appointment created in 'pending_appointments' table\n";
echo "  ✓ Admin notification created\n";
echo "  ✗ NO appointment in 'appointments' table yet\n";
echo "  ✗ NO visit record yet\n";
echo "  ✗ NO billing transaction yet\n\n";

echo "AFTER ADMIN APPROVES:\n";
echo "  ✓ Pending appointment moved/copied to 'appointments' table\n";
echo "  ✓ Visit record created\n";
echo "  ✓ Billing transaction created\n";
echo "  ✓ Patient notified\n\n";

echo "==============================================\n";

