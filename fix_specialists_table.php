<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "=== Fixing Specialists Table ===\n\n";

try {
    // Check if specialists table exists
    if (!Schema::hasTable('specialists')) {
        echo "❌ Specialists table does not exist. Creating it...\n";
        
        // Create the specialists table
        Schema::create('specialists', function ($table) {
            $table->id('specialist_id');
            $table->string('specialist_code', 10)->unique()->nullable();
            $table->string('name', 255);
            $table->enum('role', ['Doctor','Nurse','MedTech','Admin']);
            $table->string('specialization', 100)->nullable();
            $table->string('contact', 20)->nullable();
            $table->string('email', 150)->nullable();
            $table->enum('status', ['Active','Inactive'])->default('Active');
            $table->timestamps();
        });
        
        echo "✅ Specialists table created successfully!\n";
    } else {
        echo "✅ Specialists table exists.\n";
        
        // Check if status column exists
        if (!Schema::hasColumn('specialists', 'status')) {
            echo "❌ Status column missing. Adding it...\n";
            
            Schema::table('specialists', function ($table) {
                $table->enum('status', ['Active','Inactive'])->default('Active')->after('email');
            });
            
            echo "✅ Status column added successfully!\n";
        } else {
            echo "✅ Status column exists.\n";
        }
    }
    
    // Check current specialists data
    $specialists = DB::table('specialists')->get();
    echo "📊 Current specialists count: " . $specialists->count() . "\n";
    
    if ($specialists->count() > 0) {
        echo "📋 Current specialists:\n";
        foreach ($specialists as $specialist) {
            echo "  - ID: {$specialist->specialist_id}, Name: {$specialist->name}, Role: {$specialist->role}, Status: " . ($specialist->status ?? 'NULL') . "\n";
        }
    } else {
        echo "📝 No specialists found. Creating sample data...\n";
        
        // Create sample specialists
        $sampleSpecialists = [
            [
                'specialist_code' => 'DOC001',
                'name' => 'Dr. John Smith',
                'role' => 'Doctor',
                'specialization' => 'General Medicine',
                'contact' => '09123456789',
                'email' => 'john.smith@clinic.com',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'specialist_code' => 'MED001',
                'name' => 'Jane Doe',
                'role' => 'MedTech',
                'specialization' => 'Laboratory',
                'contact' => '09123456790',
                'email' => 'jane.doe@clinic.com',
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];
        
        DB::table('specialists')->insert($sampleSpecialists);
        echo "✅ Sample specialists created!\n";
    }
    
    echo "\n=== Fix Complete ===\n";
    echo "The specialists table is now properly configured with the status column.\n";
    echo "The appointment system should work correctly now.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
