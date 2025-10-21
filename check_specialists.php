<?php

/**
 * Check Specialists Table
 * 
 * This script checks the specialists table to understand the foreign key issue
 */

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "👨‍⚕️ CHECKING SPECIALISTS TABLE\n";
echo "=============================\n\n";

try {
    // Check if specialists table exists
    if (!DB::getSchemaBuilder()->hasTable('specialists')) {
        echo "❌ Specialists table does not exist!\n";
        echo "This is why billing transactions are failing.\n";
        exit(1);
    }
    
    // Check specialists count
    $specialistsCount = DB::table('specialists')->count();
    echo "📊 Total specialists: {$specialistsCount}\n";
    
    if ($specialistsCount == 0) {
        echo "\n❌ No specialists found in the database!\n";
        echo "This is why billing transactions are failing.\n";
        echo "The foreign key constraint requires a valid specialist_id.\n";
        
        echo "\n💡 SOLUTION: We need to create some specialists.\n";
        
        // Create some default specialists
        echo "\n🔧 Creating default specialists...\n";
        
        $defaultSpecialists = [
            [
                'name' => 'Dr. Maria Santos',
                'role' => 'Doctor',
                'specialization' => 'General Medicine',
                'contact' => '09123456789',
                'email' => 'maria.santos@clinic.com',
                'status' => 'Active'
            ],
            [
                'name' => 'Dr. Juan Dela Cruz',
                'role' => 'Doctor', 
                'specialization' => 'Internal Medicine',
                'contact' => '09123456790',
                'email' => 'juan.delacruz@clinic.com',
                'status' => 'Active'
            ],
            [
                'name' => 'MedTech Robert Wilson',
                'role' => 'MedTech',
                'specialization' => 'Laboratory',
                'contact' => '09123456791',
                'email' => 'robert.wilson@clinic.com',
                'status' => 'Active'
            ]
        ];
        
        foreach ($defaultSpecialists as $specialist) {
            $id = DB::table('specialists')->insertGetId([
                'name' => $specialist['name'],
                'role' => $specialist['role'],
                'specialization' => $specialist['specialization'],
                'contact' => $specialist['contact'],
                'email' => $specialist['email'],
                'status' => $specialist['status'],
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            echo "   ✅ Created {$specialist['role']}: {$specialist['name']} (ID: {$id})\n";
        }
        
        echo "\n🎉 Default specialists created successfully!\n";
        
    } else {
        echo "\n📋 Existing specialists:\n";
        $specialists = DB::table('specialists')->get();
        foreach ($specialists as $specialist) {
            echo "   - ID: {$specialist->specialist_id}, Name: {$specialist->name}, Role: {$specialist->role}\n";
        }
    }
    
    // Check users table for doctors
    echo "\n👥 Checking users table for doctors...\n";
    $doctors = DB::table('users')->where('role', 'doctor')->get();
    echo "📊 Doctor users: {$doctors->count()}\n";
    
    foreach ($doctors as $doctor) {
        echo "   - ID: {$doctor->id}, Name: {$doctor->name}, Role: {$doctor->role}\n";
    }
    
    // Check the foreign key constraint
    echo "\n🔗 Checking foreign key constraints...\n";
    $constraints = DB::select("
        SELECT 
            CONSTRAINT_NAME,
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = 'billing_transactions' 
        AND REFERENCED_TABLE_NAME IS NOT NULL
    ");
    
    foreach ($constraints as $constraint) {
        echo "   - {$constraint->COLUMN_NAME} → {$constraint->REFERENCED_TABLE_NAME}.{$constraint->REFERENCED_COLUMN_NAME}\n";
    }
    
} catch (Exception $e) {
    echo "\n❌ ERROR: Check failed!\n";
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\n🏁 Check completed!\n";
