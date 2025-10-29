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
        // Add validation constraints to appointments table
        Schema::table('appointments', function (Blueprint $table) {
            // Add check constraints for date validation
            DB::statement('ALTER TABLE appointments ADD CONSTRAINT chk_appointment_date_valid 
                CHECK (appointment_date IS NULL OR appointment_date >= "1900-01-01" AND appointment_date <= "2100-12-31")');
            
            DB::statement('ALTER TABLE appointments ADD CONSTRAINT chk_appointment_time_valid 
                CHECK (appointment_time IS NULL OR appointment_time REGEXP "^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$")');
        });

        // Add validation constraints to billing_transactions table
        Schema::table('billing_transactions', function (Blueprint $table) {
            // Add check constraints for date validation
            DB::statement('ALTER TABLE billing_transactions ADD CONSTRAINT chk_transaction_date_valid 
                CHECK (transaction_date IS NULL OR transaction_date >= "1900-01-01" AND transaction_date <= "2100-12-31")');
            
            DB::statement('ALTER TABLE billing_transactions ADD CONSTRAINT chk_due_date_valid 
                CHECK (due_date IS NULL OR due_date >= "1900-01-01" AND due_date <= "2100-12-31")');
        });

        // Add validation constraints to patients table
        Schema::table('patients', function (Blueprint $table) {
            DB::statement('ALTER TABLE patients ADD CONSTRAINT chk_created_at_valid 
                CHECK (created_at IS NULL OR created_at >= "1900-01-01" AND created_at <= "2100-12-31")');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove constraints from appointments table
        DB::statement('ALTER TABLE appointments DROP CONSTRAINT IF EXISTS chk_appointment_date_valid');
        DB::statement('ALTER TABLE appointments DROP CONSTRAINT IF EXISTS chk_appointment_time_valid');
        
        // Remove constraints from billing_transactions table
        DB::statement('ALTER TABLE billing_transactions DROP CONSTRAINT IF EXISTS chk_transaction_date_valid');
        DB::statement('ALTER TABLE billing_transactions DROP CONSTRAINT IF EXISTS chk_due_date_valid');
        
        // Remove constraints from patients table
        DB::statement('ALTER TABLE patients DROP CONSTRAINT IF EXISTS chk_created_at_valid');
    }
};

