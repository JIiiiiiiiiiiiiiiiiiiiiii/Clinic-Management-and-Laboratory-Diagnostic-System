<?php

/**
 * Direct API Test - Simulate Online Appointment Submission
 * This tests the exact flow that happens when a user submits the form
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

echo "==============================================\n";
echo "TESTING ONLINE APPOINTMENT API DIRECTLY\n";
echo "==============================================\n\n";

// Step 1: Get or create a test user
echo "Step 1: Setting up test user...\n";
$user = User::where('email', 'testpatient@test.com')->first();
if (!$user) {
    $user = User::create([
        'name' => 'Test Patient',
        'email' => 'testpatient@test.com',
        'password' => bcrypt('password123'),
        'role' => 'patient',
    ]);
    echo "  ✓ Created new test user\n";
} else {
    echo "  ✓ Using existing test user\n";
}
echo "  User ID: {$user->id}\n";
echo "  Email: {$user->email}\n\n";

// Step 2: Authenticate the user
echo "Step 2: Authenticating user...\n";
auth()->login($user);
echo "  ✓ User authenticated\n";
echo "  Auth ID: " . auth()->id() . "\n\n";

// Step 3: Get a specialist
echo "Step 3: Getting specialist...\n";
$specialist = \App\Models\Staff::where('role', 'Doctor')->where('status', 'Active')->first();
if (!$specialist) {
    echo "  ✗ No active doctors found!\n";
    exit(1);
}
echo "  ✓ Found specialist: {$specialist->name}\n";
echo "  Specialist ID: {$specialist->staff_id}\n\n";

// Step 4: Prepare test data (EXACTLY as frontend sends it)
echo "Step 4: Preparing appointment data...\n";
$requestData = [
    'existingPatientId' => 0,
    'patient' => [
        'last_name' => 'TestLastName',
        'first_name' => 'TestFirstName',
        'middle_name' => 'TestMiddle',
        'birthdate' => '1990-01-01',
        'age' => 34,
        'sex' => 'male',
        'nationality' => 'Filipino',
        'civil_status' => 'single',
        'address' => '123 Test Street, Test City',
        'telephone_no' => '1234567',
        'mobile_no' => '09171234567',
        'email' => 'testpatient@test.com',
        'emergency_name' => 'Emergency Contact',
        'emergency_relation' => 'Sibling',
        'insurance_company' => 'Test Insurance',
        'hmo_name' => 'Test HMO',
        'hmo_id_no' => 'HMO123',
        'approval_code' => 'APPR123',
        'validity' => '2025-12-31',
        'drug_allergies' => 'NONE',
        'past_medical_history' => 'None',
        'family_history' => 'None',
        'social_history' => 'None',
        'obgyn_history' => 'N/A',
    ],
    'appointment' => [
        'appointment_type' => 'consultation',
        'specialist_type' => 'Doctor',
        'specialist_id' => $specialist->staff_id,
        'date' => date('Y-m-d', strtotime('+3 days')),
        'time' => '10:00 AM',
        'duration' => '30 min',
        'price' => 300,
        'additional_info' => 'Test appointment via API',
    ],
];

echo "  ✓ Data prepared\n";
echo "  Patient: {$requestData['patient']['first_name']} {$requestData['patient']['last_name']}\n";
echo "  Appointment Type: {$requestData['appointment']['appointment_type']}\n";
echo "  Date: {$requestData['appointment']['date']}\n";
echo "  Time: {$requestData['appointment']['time']}\n\n";

// Step 5: Call the controller method directly
echo "Step 5: Calling OnlineAppointmentController@store...\n";
try {
    $controller = new \App\Http\Controllers\Api\OnlineAppointmentController();
    $request = new \Illuminate\Http\Request();
    $request->merge($requestData);
    $request->setUserResolver(function () use ($user) {
        return $user;
    });
    
    $response = $controller->store($request);
    $result = $response->getData(true);
    
    echo "\n✓ API CALL SUCCESSFUL\n\n";
    echo "Response:\n";
    print_r($result);
    echo "\n";
    
    if (isset($result['success']) && $result['success']) {
        echo "✅ SUCCESS!\n";
        echo "  Patient ID: " . ($result['patient_id'] ?? 'N/A') . "\n";
        echo "  Patient Code: " . ($result['patient_code'] ?? 'N/A') . "\n";
        echo "  Appointment ID: " . ($result['appointment_id'] ?? 'N/A') . "\n";
        echo "  Appointment Code: " . ($result['appointment_code'] ?? 'N/A') . "\n";
        echo "  Status: " . ($result['status'] ?? 'N/A') . "\n\n";
        
        // Verify in database
        echo "Step 6: Verifying in database...\n";
        
        $patient = \App\Models\Patient::find($result['patient_id']);
        if ($patient) {
            echo "  ✓ Patient found in database\n";
            echo "    ID: {$patient->id}\n";
            echo "    Code: {$patient->patient_no}\n";
            echo "    Name: {$patient->first_name} {$patient->last_name}\n";
        } else {
            echo "  ✗ Patient NOT found in database!\n";
        }
        
        $appointment = \App\Models\Appointment::find($result['appointment_id']);
        if ($appointment) {
            echo "  ✓ Appointment found in database\n";
            echo "    ID: {$appointment->id}\n";
            echo "    Status: {$appointment->status}\n";
            echo "    Source: " . ($appointment->source ?? 'N/A') . "\n";
            echo "    Patient ID: {$appointment->patient_id}\n";
        } else {
            echo "  ✗ Appointment NOT found in database!\n";
        }
        
        $notifications = \App\Models\Notification::where('type', 'appointment_request')
            ->where('related_id', $result['appointment_id'])
            ->get();
        echo "  ✓ Found {$notifications->count()} admin notification(s)\n";
        
        foreach ($notifications as $notif) {
            $admin = \App\Models\User::find($notif->user_id);
            echo "    - To: " . ($admin ? $admin->name : 'Unknown') . " (Read: " . ($notif->read ? 'Yes' : 'No') . ")\n";
        }
        
    } else {
        echo "❌ FAILED!\n";
        echo "  Message: " . ($result['message'] ?? 'Unknown error') . "\n";
        if (isset($result['errors'])) {
            echo "  Errors:\n";
            print_r($result['errors']);
        }
    }
    
} catch (\Exception $e) {
    echo "\n❌ EXCEPTION CAUGHT!\n";
    echo "  Error: {$e->getMessage()}\n";
    echo "  File: {$e->getFile()}:{$e->getLine()}\n";
    echo "\n  Stack trace:\n";
    echo $e->getTraceAsString();
}

echo "\n==============================================\n";
echo "TEST COMPLETE\n";
echo "==============================================\n";

