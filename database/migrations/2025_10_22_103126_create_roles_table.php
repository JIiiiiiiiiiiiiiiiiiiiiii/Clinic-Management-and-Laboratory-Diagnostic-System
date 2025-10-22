<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('display_name');
            $table->text('description')->nullable();
            $table->json('permissions')->nullable(); // Store permissions as JSON
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Insert default roles
        DB::table('roles')->insert([
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'Full system access with all permissions',
                'permissions' => json_encode([
                    'patients' => ['create', 'read', 'update', 'delete'],
                    'appointments' => ['create', 'read', 'update', 'delete'],
                    'laboratory' => ['create', 'read', 'update', 'delete'],
                    'inventory' => ['create', 'read', 'update', 'delete'],
                    'billing' => ['create', 'read', 'update', 'delete'],
                    'reports' => ['read', 'export'],
                    'settings' => ['read', 'update'],
                    'users' => ['create', 'read', 'update', 'delete']
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'doctor',
                'display_name' => 'Doctor',
                'description' => 'Patient care, consultations, and medical records',
                'permissions' => json_encode([
                    'patients' => ['create', 'read', 'update'],
                    'appointments' => ['create', 'read', 'update'],
                    'laboratory' => ['read'],
                    'inventory' => ['read'],
                    'reports' => ['read']
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'nurse',
                'display_name' => 'Nurse',
                'description' => 'Patient care and consultation support',
                'permissions' => json_encode([
                    'patients' => ['create', 'read', 'update'],
                    'appointments' => ['create', 'read', 'update'],
                    'inventory' => ['read']
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'medtech',
                'display_name' => 'Medical Technologist',
                'description' => 'Laboratory diagnostics and testing',
                'permissions' => json_encode([
                    'patients' => ['read'],
                    'laboratory' => ['create', 'read', 'update'],
                    'inventory' => ['read'],
                    'reports' => ['read']
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'cashier',
                'display_name' => 'Cashier',
                'description' => 'Financial management and billing',
                'permissions' => json_encode([
                    'patients' => ['read'],
                    'billing' => ['create', 'read', 'update'],
                    'reports' => ['read']
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'hospital_staff',
                'display_name' => 'Hospital Staff',
                'description' => 'Hospital operations and reporting',
                'permissions' => json_encode([
                    'patients' => ['read'],
                    'reports' => ['read', 'export']
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'name' => 'patient',
                'display_name' => 'Patient',
                'description' => 'Patient portal access',
                'permissions' => json_encode([
                    'patients' => ['read'] // Can only read their own data
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};