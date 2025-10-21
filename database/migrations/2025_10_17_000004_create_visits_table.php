<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('visits', function (Blueprint $table) {
            $table->id('visit_id');
            $table->string('visit_code', 10)->unique()->nullable();
            $table->foreignId('appointment_id')->constrained('appointments', 'appointment_id')->onDelete('cascade');
            $table->foreignId('patient_id')->constrained('patients', 'patient_id')->onDelete('cascade');
            $table->foreignId('doctor_id')->nullable()->constrained('specialists', 'specialist_id')->onDelete('set null');
            $table->foreignId('nurse_id')->nullable()->constrained('specialists', 'specialist_id')->onDelete('set null');
            $table->foreignId('medtech_id')->nullable()->constrained('specialists', 'specialist_id')->onDelete('set null');
            $table->string('purpose', 255);
            $table->enum('status', ['Ongoing','Completed','Cancelled'])->default('Ongoing');
            $table->datetime('visit_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }
    public function down() {
        Schema::dropIfExists('visits');
    }
};
