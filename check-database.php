<?php
/**
 * Database Health Check Script
 * Run this to verify your database setup
 */

echo "========================================\n";
echo "St. James Clinic - Database Health Check\n";
echo "========================================\n\n";

// Load Laravel environment
require_once 'vendor/autoload.php';

try {
    // Bootstrap Laravel
    $app = require_once 'bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    echo "✅ Laravel application loaded successfully\n";
    
    // Test database connection
    $pdo = DB::connection()->getPdo();
    echo "✅ Database connection successful\n";
    
    // Check required tables
    $requiredTables = [
        'users',
        'patients', 
        'lab_tests',
        'lab_orders',
        'lab_results',
        'inventory_products',
        'inventory_transactions',
        'appointments',
        'billing_transactions',
        'reports'
    ];
    
    echo "\n📊 Checking required tables:\n";
    foreach ($requiredTables as $table) {
        if (Schema::hasTable($table)) {
            $count = DB::table($table)->count();
            echo "✅ {$table}: {$count} records\n";
        } else {
            echo "❌ {$table}: Table missing\n";
        }
    }
    
    // Check for required data
    echo "\n🔍 Checking required data:\n";
    
    $userCount = DB::table('users')->count();
    echo "👥 Users: {$userCount} (minimum 1 required)\n";
    
    $roleCount = DB::table('roles')->count();
    echo "🔐 Roles: {$roleCount} (minimum 5 required)\n";
    
    $labTestCount = DB::table('lab_tests')->count();
    echo "🧪 Lab Tests: {$labTestCount} (minimum 1 required)\n";
    
    // Check for admin user
    $adminUser = DB::table('users')->where('email', 'admin@stjames.com')->first();
    if ($adminUser) {
        echo "✅ Admin user exists\n";
    } else {
        echo "❌ Admin user missing - run: php artisan db:seed --class=UserRoleSeeder\n";
    }
    
    echo "\n========================================\n";
    echo "Database Health Check Complete!\n";
    echo "========================================\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "\nTroubleshooting:\n";
    echo "1. Check your .env file database configuration\n";
    echo "2. Ensure MySQL is running\n";
    echo "3. Verify database exists\n";
    echo "4. Run: php artisan migrate --force\n";
    echo "5. Run: php artisan db:seed --class=UserRoleSeeder\n";
    exit(1);
}
