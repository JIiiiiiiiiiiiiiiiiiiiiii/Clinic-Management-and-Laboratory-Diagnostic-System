<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('patients', function (Blueprint $table) {
            $table->id('patient_id');
            $table->string('patient_code', 10)->unique()->nullable();
            $table->string('last_name', 100);
            $table->string('first_name', 100);
            $table->string('middle_name', 100)->nullable();
            $table->date('birthdate')->nullable();
            $table->integer('age')->nullable();
            $table->enum('sex', ['Male','Female'])->nullable();
            $table->string('nationality', 50)->nullable();
            $table->string('civil_status', 50)->nullable();
            $table->text('address')->nullable();
            $table->string('telephone_no', 20)->nullable();
            $table->string('mobile_no', 20)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('emergency_name', 100)->nullable();
            $table->string('emergency_relation', 50)->nullable();
            $table->string('insurance_company', 100)->nullable();
            $table->string('hmo_name', 100)->nullable();
            $table->string('hmo_id_no', 100)->nullable();
            $table->string('approval_code', 100)->nullable();
            $table->date('validity')->nullable();
            $table->text('drug_allergies')->nullable();
            $table->text('past_medical_history')->nullable();
            $table->text('family_history')->nullable();
            $table->text('social_history')->nullable();
            $table->text('obgyn_history')->nullable();
            $table->enum('status', ['Active','Inactive'])->default('Active');
            $table->timestamps();
        });
    }
    public function down() {
        Schema::dropIfExists('patients');
    }
};
