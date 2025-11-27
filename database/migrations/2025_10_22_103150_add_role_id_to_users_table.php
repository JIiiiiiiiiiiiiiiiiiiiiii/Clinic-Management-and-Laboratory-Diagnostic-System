<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if roles table exists
        if (!Schema::hasTable('roles')) {
            return; // Skip if roles table doesn't exist
        }

        // Add role_id column if it doesn't exist
        if (!Schema::hasColumn('users', 'role_id')) {
            Schema::table('users', function (Blueprint $table) {
                $afterColumn = Schema::hasColumn('users', 'id') ? 'id' : null;
                if ($afterColumn) {
                    $table->unsignedBigInteger('role_id')->nullable()->after($afterColumn);
                } else {
                    $table->unsignedBigInteger('role_id')->nullable();
                }
            });
        }

        // Try to add foreign key constraint if it doesn't exist
        try {
            // Check if foreign key already exists
            $foreignKeys = DB::select("
                SELECT CONSTRAINT_NAME 
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'users' 
                AND CONSTRAINT_NAME = 'users_role_id_foreign'
            ");
            
            if (empty($foreignKeys)) {
                Schema::table('users', function (Blueprint $table) {
                    // Verify roles table has id column with proper key
                    if (Schema::hasColumn('roles', 'id')) {
                        try {
                            $table->foreign('role_id')->references('id')->on('roles')->onDelete('set null');
                        } catch (\Exception $e) {
                            // If foreign key creation fails, continue without it
                            \Log::warning('Failed to create foreign key for role_id: ' . $e->getMessage());
                        }
                    }
                });
            }
        } catch (\Exception $e) {
            // If foreign key creation fails, log and continue
            \Log::warning('Failed to add foreign key constraint for role_id: ' . $e->getMessage());
        }

        // Map existing role enum to role_id if role column exists
        if (Schema::hasColumn('users', 'role') && Schema::hasColumn('users', 'role_id')) {
            // Get actual role IDs from database
            $roles = DB::table('roles')->pluck('id', 'name')->toArray();
            
            $roleMapping = [
                'admin' => $roles['admin'] ?? null,
                'doctor' => $roles['doctor'] ?? null,
                'nurse' => $roles['nurse'] ?? null,
                'medtech' => $roles['medtech'] ?? null,
                'cashier' => $roles['cashier'] ?? null,
                'hospital_admin' => $roles['hospital_admin'] ?? null,
                'hospital_staff' => $roles['hospital_staff'] ?? null,
                'patient' => $roles['patient'] ?? null
            ];

            foreach ($roleMapping as $roleName => $roleId) {
                if ($roleId) {
                    DB::table('users')
                        ->where('role', $roleName)
                        ->whereNull('role_id')
                        ->update(['role_id' => $roleId]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop foreign key if it exists
            try {
                $table->dropForeign(['role_id']);
            } catch (\Exception $e) {
                // Ignore if foreign key doesn't exist
            }
            
            // Drop column if it exists
            if (Schema::hasColumn('users', 'role_id')) {
                $table->dropColumn('role_id');
            }
        });
    }
};