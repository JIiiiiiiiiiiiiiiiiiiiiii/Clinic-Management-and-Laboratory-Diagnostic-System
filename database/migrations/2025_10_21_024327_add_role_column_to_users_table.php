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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role')) {
                $afterColumn = Schema::hasColumn('users', 'email') ? 'email' : null;
                if ($afterColumn) {
                    $table->enum('role', ['admin', 'doctor', 'medtech', 'cashier', 'patient', 'hospital_admin'])->default('patient')->after($afterColumn);
                } else {
                    $table->enum('role', ['admin', 'doctor', 'medtech', 'cashier', 'patient', 'hospital_admin'])->default('patient');
                }
            }
            
            if (!Schema::hasColumn('users', 'is_active')) {
                $afterColumn = Schema::hasColumn('users', 'role') ? 'role' : (Schema::hasColumn('users', 'email') ? 'email' : null);
                if ($afterColumn) {
                    $table->boolean('is_active')->default(true)->after($afterColumn);
                } else {
                    $table->boolean('is_active')->default(true);
                }
            }
            
            if (!Schema::hasColumn('users', 'employee_id')) {
                $afterColumn = Schema::hasColumn('users', 'is_active') ? 'is_active' : (Schema::hasColumn('users', 'role') ? 'role' : null);
                if ($afterColumn) {
                    $table->string('employee_id')->nullable()->after($afterColumn);
                } else {
                    $table->string('employee_id')->nullable();
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('users', 'role')) {
                $columnsToDrop[] = 'role';
            }
            if (Schema::hasColumn('users', 'is_active')) {
                $columnsToDrop[] = 'is_active';
            }
            if (Schema::hasColumn('users', 'employee_id')) {
                $columnsToDrop[] = 'employee_id';
            }
            
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
