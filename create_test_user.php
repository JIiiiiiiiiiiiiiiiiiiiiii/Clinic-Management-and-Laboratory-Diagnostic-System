<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    // Create a test user
    $user = new \App\Models\User();
    $user->name = 'Admin User';
    $user->email = 'admin@clinic.com';
    $user->password = bcrypt('password');
    $user->save();
    
    echo "✅ User created successfully! ID: {$user->id}\n";
    echo "✅ Email: {$user->email}\n";
    echo "✅ Name: {$user->name}\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
