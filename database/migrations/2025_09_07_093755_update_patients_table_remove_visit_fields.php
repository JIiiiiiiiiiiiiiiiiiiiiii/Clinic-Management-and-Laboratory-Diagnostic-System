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
        Schema::table('patients', function (Blueprint $table) {
            // Remove visit-specific fields that will be moved to patient_visits table
            $table->dropColumn([
                'arrival_date',
                'arrival_time',
                'mode_of_arrival',
                'attending_physician',
                'reason_for_consult',
                'time_seen',
                'blood_pressure',
                'heart_rate',
                'respiratory_rate',
                'temperature',
                'weight_kg',
                'height_cm',
                'pain_assessment_scale',
                'oxygen_saturation',
                'history_of_present_illness',
                'pertinent_physical_findings',
                'plan_management',
                'assessment_diagnosis',
                'lmp',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            // Add back the visit-specific fields
            $table->date('arrival_date');
            $table->time('arrival_time');
            $table->string('mode_of_arrival')->nullable();
            $table->string('attending_physician');
            $table->text('reason_for_consult')->nullable();
            $table->time('time_seen');
            $table->string('blood_pressure')->nullable();
            $table->string('heart_rate')->nullable();
            $table->string('respiratory_rate')->nullable();
            $table->string('temperature')->nullable();
            $table->decimal('weight_kg', 5, 2)->nullable();
            $table->decimal('height_cm', 5, 2)->nullable();
            $table->string('pain_assessment_scale')->nullable();
            $table->string('oxygen_saturation')->nullable();
            $table->text('history_of_present_illness')->nullable();
            $table->text('pertinent_physical_findings')->nullable();
            $table->text('plan_management')->nullable();
            $table->text('assessment_diagnosis')->nullable();
            $table->string('lmp')->nullable();
        });
    }
};
