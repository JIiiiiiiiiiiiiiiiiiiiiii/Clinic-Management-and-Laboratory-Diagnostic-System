<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "Creating Admin User...\n\n";

// Check if admin exists
$existingAdmin = User::where('role', 'admin')->first();

if ($existingAdmin) {
    echo "✓ Admin user already exists:\n";
    echo "  Name: {$existingAdmin->name}\n";
    echo "  Email: {$existingAdmin->email}\n";
    echo "  Role: {$existingAdmin->role}\n";
} else {
    echo "No admin user found. Creating one...\n\n";
    
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin@clinic.com',
        'password' => Hash::make('admin123'),
        'role' => 'admin',
    ]);
    
    echo "✅ Admin user created successfully!\n\n";
    echo "Login Credentials:\n";
    echo "  Email: admin@clinic.com\n";
    echo "  Password: admin123\n";
    echo "  Role: admin\n\n";
    echo "You can now login to the admin portal with these credentials.\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "All admin users in database:\n";
echo str_repeat("=", 50) . "\n";

$allAdmins = User::where('role', 'admin')->get();
foreach ($allAdmins as $admin) {
    echo "- {$admin->name} ({$admin->email})\n";
}

echo "\nTotal admin users: " . $allAdmins->count() . "\n";

