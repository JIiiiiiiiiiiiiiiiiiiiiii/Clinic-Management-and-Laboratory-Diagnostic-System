<?php

/**
 * Setup Verification Script
 * 
 * This script verifies that all components are properly configured
 * and the system is ready for use.
 */

echo "🏥 Clinic Management System - Setup Verification\n";
echo "===============================================\n\n";

$checks = [];
$errors = [];

// Check PHP version
$phpVersion = phpversion();
$requiredVersion = '8.2.0';
if (version_compare($phpVersion, $requiredVersion, '>=')) {
    $checks[] = "✅ PHP Version: {$phpVersion} (Required: {$requiredVersion}+)";
} else {
    $errors[] = "❌ PHP Version: {$phpVersion} (Required: {$requiredVersion}+)";
}

// Check if .env exists
if (file_exists('.env')) {
    $checks[] = "✅ Environment file (.env) exists";
} else {
    $errors[] = "❌ Environment file (.env) missing";
}

// Check if database file exists
if (file_exists('database/database.sqlite')) {
    $checks[] = "✅ SQLite database file exists";
} else {
    $errors[] = "❌ SQLite database file missing";
}

// Check if vendor directory exists
if (is_dir('vendor')) {
    $checks[] = "✅ Composer dependencies installed";
} else {
    $errors[] = "❌ Composer dependencies not installed (run: composer install)";
}

// Check if node_modules exists
if (is_dir('node_modules')) {
    $checks[] = "✅ Node.js dependencies installed";
} else {
    $errors[] = "❌ Node.js dependencies not installed (run: npm install)";
}

// Check if build directory exists
if (is_dir('public/build')) {
    $checks[] = "✅ Frontend assets built";
} else {
    $errors[] = "❌ Frontend assets not built (run: npm run build)";
}

// Check Laravel key
if (file_exists('.env')) {
    $envContent = file_get_contents('.env');
    if (strpos($envContent, 'APP_KEY=') !== false && strpos($envContent, 'APP_KEY=base64:') !== false) {
        $checks[] = "✅ Application key configured";
    } else {
        $errors[] = "❌ Application key not configured (run: php artisan key:generate)";
    }
}

// Check database connection
try {
    if (file_exists('database/database.sqlite')) {
        $pdo = new PDO('sqlite:database/database.sqlite');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Check if tables exist
        $tables = ['users', 'inventory_items', 'inventory_movements', 'patients', 'appointments'];
        $existingTables = [];
        
        foreach ($tables as $table) {
            $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='{$table}'");
            if ($stmt->fetch()) {
                $existingTables[] = $table;
            }
        }
        
        if (count($existingTables) >= 3) {
            $checks[] = "✅ Database tables exist (" . count($existingTables) . "/" . count($tables) . ")";
        } else {
            $errors[] = "❌ Database tables missing (run: php artisan migrate)";
        }
        
    } else {
        $errors[] = "❌ Database file not found";
    }
} catch (Exception $e) {
    $errors[] = "❌ Database connection failed: " . $e->getMessage();
}

// Check if storage is writable
if (is_writable('storage')) {
    $checks[] = "✅ Storage directory is writable";
} else {
    $errors[] = "❌ Storage directory not writable (run: chmod -R 755 storage)";
}

// Check if bootstrap/cache is writable
if (is_writable('bootstrap/cache')) {
    $checks[] = "✅ Bootstrap cache is writable";
} else {
    $errors[] = "❌ Bootstrap cache not writable (run: chmod -R 755 bootstrap/cache)";
}

// Display results
echo "System Checks:\n";
echo "--------------\n";
foreach ($checks as $check) {
    echo $check . "\n";
}

if (!empty($errors)) {
    echo "\nIssues Found:\n";
    echo "-------------\n";
    foreach ($errors as $error) {
        echo $error . "\n";
    }
    
    echo "\n🔧 Quick Fix Commands:\n";
    echo "--------------------\n";
    echo "composer install\n";
    echo "npm install\n";
    echo "php artisan key:generate\n";
    echo "php artisan migrate\n";
    echo "php artisan db:seed\n";
    echo "npm run build\n";
    echo "chmod -R 755 storage bootstrap/cache\n";
    
    echo "\n❌ Setup incomplete. Please run the commands above.\n";
    exit(1);
} else {
    echo "\n🎉 All checks passed! System is ready to use.\n";
    echo "\n🚀 Start the application with: php artisan serve\n";
    echo "📱 Access the system at: http://localhost:8000\n";
    echo "\n🔐 Default login credentials:\n";
    echo "   Admin: admin@clinic.com / password\n";
    echo "   Doctor: doctor@clinic.com / password\n";
    echo "   Nurse: nurse@clinic.com / password\n";
    echo "   Med Tech: medtech@clinic.com / password\n";
    exit(0);
}
