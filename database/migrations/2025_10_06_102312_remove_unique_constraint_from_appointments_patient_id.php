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
        Schema::table('appointments', function (Blueprint $table) {
            // Remove the unique constraint from patient_id
            $table->dropUnique(['patient_id']);
            
            // Add a composite index instead to allow multiple appointments per patient
            // but prevent duplicate appointments for the same patient on the same date/time
            $table->index(['patient_id', 'appointment_date', 'appointment_time'], 'appointments_patient_datetime_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // Remove the composite index
            $table->dropIndex('appointments_patient_datetime_index');
            
            // Restore the unique constraint (not recommended for production)
            $table->unique('patient_id');
        });
    }
};