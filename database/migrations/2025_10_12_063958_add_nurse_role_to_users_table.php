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
        // Update the role enum to include 'nurse'
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('patient', 'laboratory_technologist', 'medtech', 'cashier', 'doctor', 'admin', 'hospital_admin', 'nurse') DEFAULT 'patient'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove 'nurse' from the role enum
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('patient', 'laboratory_technologist', 'medtech', 'cashier', 'doctor', 'admin', 'hospital_admin') DEFAULT 'patient'");
    }
};
