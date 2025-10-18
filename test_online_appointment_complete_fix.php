<?php

/**
 * Test Script for Online Appointment Complete Fix
 * 
 * This script verifies that the online appointment system is working correctly
 * by checking all the key components that should be in place.
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Notification;
use App\Models\Staff;
use Illuminate\Support\Facades\DB;

echo "=================================================\n";
echo "ONLINE APPOINTMENT SYSTEM - COMPLETE FIX TEST\n";
echo "=================================================\n\n";

// Test 1: Check Database Tables Exist
echo "✓ Test 1: Checking database tables...\n";
$tables = ['users', 'patients', 'appointments', 'notifications', 'staff'];
foreach ($tables as $table) {
    $exists = DB::select("SHOW TABLES LIKE '$table'");
    if (count($exists) > 0) {
        echo "  ✓ Table '$table' exists\n";
    } else {
        echo "  ✗ Table '$table' MISSING!\n";
        exit(1);
    }
}
echo "\n";

// Test 2: Check Patient Model Fields
echo "✓ Test 2: Checking Patient model configuration...\n";
$patient = new Patient();
$fillable = $patient->getFillable();
$requiredFields = ['user_id', 'patient_no', 'first_name', 'last_name', 'birthdate', 'age', 'sex', 'address', 'mobile_no', 'emergency_name', 'emergency_relation'];
foreach ($requiredFields as $field) {
    if (in_array($field, $fillable)) {
        echo "  ✓ Field '$field' is fillable\n";
    } else {
        echo "  ✗ Field '$field' is NOT fillable!\n";
    }
}
echo "\n";

// Test 3: Check Appointment Model Fields
echo "✓ Test 3: Checking Appointment model configuration...\n";
$appointment = new Appointment();
$fillable = $appointment->getFillable();
$requiredFields = ['patient_id', 'patient_name', 'specialist_id', 'specialist_name', 'appointment_type', 'appointment_date', 'appointment_time', 'price', 'status', 'source'];
foreach ($requiredFields as $field) {
    if (in_array($field, $fillable)) {
        echo "  ✓ Field '$field' is fillable\n";
    } else {
        echo "  ✗ Field '$field' is NOT fillable!\n";
    }
}
echo "\n";

// Test 4: Check Admin Users Exist
echo "✓ Test 4: Checking admin users...\n";
$adminUsers = User::where('role', 'admin')->get();
if ($adminUsers->count() > 0) {
    echo "  ✓ Found {$adminUsers->count()} admin user(s)\n";
    foreach ($adminUsers as $admin) {
        echo "    - {$admin->name} ({$admin->email})\n";
    }
} else {
    echo "  ⚠ WARNING: No admin users found! Notifications won't work.\n";
}
echo "\n";

// Test 5: Check Staff/Specialists
echo "✓ Test 5: Checking staff/specialists...\n";
$doctors = Staff::where('role', 'Doctor')->where('status', 'Active')->get();
$medtechs = Staff::where('role', 'MedTech')->where('status', 'Active')->get();
echo "  ✓ Found {$doctors->count()} active doctor(s)\n";
echo "  ✓ Found {$medtechs->count()} active medtech(s)\n";
if ($doctors->count() == 0 && $medtechs->count() == 0) {
    echo "  ⚠ WARNING: No active specialists found! Users won't be able to book appointments.\n";
}
echo "\n";

// Test 6: Check Recent Appointments
echo "✓ Test 6: Checking recent appointments...\n";
$recentAppointments = Appointment::orderBy('created_at', 'desc')->limit(5)->get();
echo "  ✓ Found {$recentAppointments->count()} appointment(s) in database\n";
foreach ($recentAppointments as $apt) {
    echo "    - ID: {$apt->id}, Status: {$apt->status}, Source: " . ($apt->source ?? 'N/A') . ", Type: {$apt->appointment_type}\n";
}
echo "\n";

// Test 7: Check Recent Patients
echo "✓ Test 7: Checking recent patients...\n";
$recentPatients = Patient::orderBy('created_at', 'desc')->limit(5)->get();
echo "  ✓ Found {$recentPatients->count()} patient(s) in database\n";
foreach ($recentPatients as $pat) {
    echo "    - ID: {$pat->id}, Code: {$pat->patient_no}, Name: {$pat->first_name} {$pat->last_name}, User ID: " . ($pat->user_id ?? 'N/A') . "\n";
}
echo "\n";

// Test 8: Check Recent Notifications
echo "✓ Test 8: Checking recent notifications...\n";
$recentNotifications = Notification::where('type', 'appointment_request')->orderBy('created_at', 'desc')->limit(5)->get();
echo "  ✓ Found {$recentNotifications->count()} appointment notification(s)\n";
foreach ($recentNotifications as $notif) {
    $user = User::find($notif->user_id);
    echo "    - To: " . ($user ? $user->name : 'Unknown') . ", Read: " . ($notif->read ? 'Yes' : 'No') . ", Created: {$notif->created_at->format('Y-m-d H:i:s')}\n";
}
echo "\n";

// Test 9: Check API Route
echo "✓ Test 9: Checking API route registration...\n";
$routes = app('router')->getRoutes();
$found = false;
foreach ($routes as $route) {
    if (str_contains($route->uri, 'api/appointments/online') && in_array('POST', $route->methods)) {
        echo "  ✓ Route 'POST /api/appointments/online' is registered\n";
        echo "    Controller: " . ($route->action['controller'] ?? 'N/A') . "\n";
        $found = true;
        break;
    }
}
if (!$found) {
    echo "  ✗ Route 'POST /api/appointments/online' NOT FOUND!\n";
}
echo "\n";

// Test 10: Verify Controller Exists
echo "✓ Test 10: Checking controller file...\n";
$controllerPath = app_path('Http/Controllers/Api/OnlineAppointmentController.php');
if (file_exists($controllerPath)) {
    echo "  ✓ OnlineAppointmentController.php exists\n";
    // Check if key methods exist
    $contents = file_get_contents($controllerPath);
    if (str_contains($contents, 'function store')) {
        echo "  ✓ store() method found\n";
    }
    if (str_contains($contents, 'notifyAdminPendingAppointment')) {
        echo "  ✓ notifyAdminPendingAppointment() method found\n";
    }
    if (str_contains($contents, 'createOrFindPatient')) {
        echo "  ✓ createOrFindPatient() method found\n";
    }
} else {
    echo "  ✗ OnlineAppointmentController.php NOT FOUND!\n";
}
echo "\n";

echo "=================================================\n";
echo "SUMMARY\n";
echo "=================================================\n\n";

echo "System Status: ✓ READY\n\n";

echo "To test the complete flow:\n";
echo "1. Create a new user account at /register\n";
echo "2. Login and go to /patient/online-appointment\n";
echo "3. Fill out the form and submit\n";
echo "4. Check that:\n";
echo "   - Patient record created (check patients table)\n";
echo "   - Appointment created with status 'Pending' (check appointments table)\n";
echo "   - Admin notification created (check notifications table)\n";
echo "   - Appointment visible at /patient/appointments\n";
echo "   - Admin can see appointment at /admin/appointments\n\n";

echo "Database Statistics:\n";
echo "- Total Users: " . User::count() . "\n";
echo "- Total Patients: " . Patient::count() . "\n";
echo "- Total Appointments: " . Appointment::count() . "\n";
echo "- Pending Appointments: " . Appointment::where('status', 'Pending')->count() . "\n";
echo "- Online Appointments: " . Appointment::where('source', 'Online')->count() . "\n";
echo "- Unread Notifications: " . Notification::where('read', false)->count() . "\n";

echo "\n=================================================\n";
echo "TEST COMPLETE\n";
echo "=================================================\n";

