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
        Schema::create('patients', function (Blueprint $table) {
            $table->id();

            // Arrival Information
            $table->date('arrival_date');
            $table->time('arrival_time');

            // Patient Identification
            $table->string('last_name');
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->date('birthdate');
            $table->integer('age');
            $table->enum('sex', ['male', 'female']);
            $table->string('patient_no')->nullable()->unique();

            // Demographics
            $table->string('occupation')->nullable();
            $table->string('religion')->nullable();
            $table->string('attending_physician');
            $table->enum('civil_status', ['single', 'married', 'widowed', 'divorced', 'separated']);
            $table->string('nationality')->default('Filipino');

            // Contact Information
            $table->text('present_address');
            $table->string('telephone_no')->nullable();
            $table->string('mobile_no');

            // Emergency Contact
            $table->string('informant_name');
            $table->string('relationship');

            // Financial/Insurance
            $table->string('company_name')->nullable();
            $table->string('hmo_name')->nullable();
            $table->string('hmo_company_id_no')->nullable();
            $table->string('validation_approval_code')->nullable();
            $table->string('validity')->nullable();

            // Emergency Staff Nurse Section
            $table->string('mode_of_arrival')->nullable();
            $table->string('drug_allergies')->default('NONE');
            $table->string('food_allergies')->default('NONE');

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
            $table->text('reason_for_consult')->nullable();
            $table->time('time_seen');
            $table->text('history_of_present_illness')->nullable();
            $table->text('pertinent_physical_findings')->nullable();
            $table->text('plan_management')->nullable();
            $table->text('past_medical_history')->nullable();
            $table->text('family_history')->nullable();
            $table->text('social_personal_history')->nullable();
            $table->text('obstetrics_gynecology_history')->nullable();
            $table->string('lmp')->nullable(); // Last Menstrual Period
            $table->text('assessment_diagnosis')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
