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
            // Default role is 'patient' - all new signups automatically get patient role
            $table->enum('role', ['patient', 'laboratory_technologist', 'medtech', 'cashier', 'doctor', 'admin', 'hospital_admin'])->default('patient');
            $table->boolean('is_active')->default(true);
            $table->string('employee_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'is_active', 'employee_id']);
        });
    }
};
