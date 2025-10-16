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
        // Add sequence number to appointments table
        Schema::table('appointments', function (Blueprint $table) {
            $table->integer('sequence_number')->nullable()->after('id');
            $table->index('sequence_number');
        });

        // Add sequence number to patients table
        Schema::table('patients', function (Blueprint $table) {
            $table->integer('sequence_number')->nullable()->after('id');
            $table->index('sequence_number');
        });

        // Update existing records with sequential numbers
        $this->updateExistingRecords();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex(['sequence_number']);
            $table->dropColumn('sequence_number');
        });

        Schema::table('patients', function (Blueprint $table) {
            $table->dropIndex(['sequence_number']);
            $table->dropColumn('sequence_number');
        });
    }

    /**
     * Update existing records with sequential numbers
     */
    private function updateExistingRecords(): void
    {
        // Update appointments with sequential numbers
        $appointments = \App\Models\Appointment::orderBy('id')->get();
        foreach ($appointments as $index => $appointment) {
            $appointment->sequence_number = $index + 1;
            $appointment->save();
        }

        // Update patients with sequential numbers
        $patients = \App\Models\Patient::orderBy('id')->get();
        foreach ($patients as $index => $patient) {
            $patient->sequence_number = $index + 1;
            $patient->save();
        }
    }
};
