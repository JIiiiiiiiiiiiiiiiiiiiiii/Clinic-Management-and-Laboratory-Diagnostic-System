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
        // Update the role enum to include hospital_admin
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['patient', 'laboratory_technologist', 'medtech', 'cashier', 'doctor', 'admin', 'hospital_admin'])
                  ->default('patient')
                  ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original enum values
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['patient', 'laboratory_technologist', 'medtech', 'cashier', 'doctor', 'admin'])
                  ->default('patient')
                  ->change();
        });
    }
};