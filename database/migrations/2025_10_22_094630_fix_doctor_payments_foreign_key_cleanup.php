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
        // Drop all existing foreign key constraints on doctor_id
        DB::statement('ALTER TABLE doctor_payments DROP FOREIGN KEY IF EXISTS doctor_payments_doctor_id_foreign');
        
        // Add the correct foreign key constraint to reference specialists table
        Schema::table('doctor_payments', function (Blueprint $table) {
            $table->foreign('doctor_id')->references('specialist_id')->on('specialists')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the foreign key constraint
        DB::statement('ALTER TABLE doctor_payments DROP FOREIGN KEY IF EXISTS doctor_payments_doctor_id_foreign');
        
        // Restore the original foreign key constraint
        Schema::table('doctor_payments', function (Blueprint $table) {
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};