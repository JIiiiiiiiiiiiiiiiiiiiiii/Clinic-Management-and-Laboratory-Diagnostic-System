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
        Schema::create('patient_visits', function (Blueprint $table) {
            $table->id();

            // Foreign key to patients table
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');

            // Arrival Information
            $table->date('arrival_date');
            $table->time('arrival_time');
            $table->string('mode_of_arrival')->nullable();

            // Visit Details
            $table->string('attending_physician');
            $table->text('reason_for_consult')->nullable();
            $table->time('time_seen');

            // Vital Signs
            $table->string('blood_pressure')->nullable();
            $table->string('heart_rate')->nullable();
            $table->string('respiratory_rate')->nullable();
            $table->string('temperature')->nullable();
            $table->decimal('weight_kg', 5, 2)->nullable();
            $table->decimal('height_cm', 5, 2)->nullable();
            $table->string('pain_assessment_scale')->nullable();
            $table->string('oxygen_saturation')->nullable();

            // Medical Assessment
            $table->text('history_of_present_illness')->nullable();
            $table->text('pertinent_physical_findings')->nullable();
            $table->text('plan_management')->nullable();
            $table->text('assessment_diagnosis')->nullable();
            $table->string('lmp')->nullable(); // Last Menstrual Period

            // Visit Status
            $table->enum('status', ['active', 'completed', 'discharged'])->default('active');
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_visits');
    }
};
