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
        Schema::create('custom_clinical_records', function (Blueprint $table) {
            $table->id('record_id');
            $table->string('record_name', 100); // Name of the custom record type
            $table->text('description')->nullable();
            $table->json('fields'); // JSON structure defining the custom fields
            $table->unsignedBigInteger('created_by_user_id'); // Who created this custom record type
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('created_by_user_id')->references('user_id')->on('users');
        });

        Schema::create('custom_clinical_record_values', function (Blueprint $table) {
            $table->id('value_id');
            $table->unsignedBigInteger('custom_clinical_record_id');
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('consultation_id')->nullable();
            $table->json('field_values'); // JSON containing the actual values for the custom fields
            $table->unsignedBigInteger('recorded_by_user_id');
            $table->timestamps();

            $table->foreign('custom_clinical_record_id')->references('record_id')->on('custom_clinical_records');
            $table->foreign('patient_id')->references('patient_id')->on('patients');
            $table->foreign('consultation_id')->references('consultation_id')->on('consultations');
            $table->foreign('recorded_by_user_id')->references('user_id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('custom_clinical_record_values');
        Schema::dropIfExists('custom_clinical_records');
    }
};
