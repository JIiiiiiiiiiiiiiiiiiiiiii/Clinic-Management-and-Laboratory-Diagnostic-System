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
        if (!Schema::hasTable('visits')) {
            Schema::create('visits', function (Blueprint $table) {
            $table->id('visit_id');
            $table->string('visit_code', 10)->unique();
            $table->unsignedBigInteger('appointment_id')->unique(); // one-to-one with appointment
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('doctor_id')->nullable();
            $table->unsignedBigInteger('nurse_id')->nullable();
            $table->unsignedBigInteger('medtech_id')->nullable();
            $table->string('purpose', 255)->nullable();
            $table->dateTime('visit_date')->nullable();
            $table->enum('status', ['Ongoing', 'Completed'])->default('Ongoing');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('appointment_id')->references('appointment_id')->on('appointments')->onDelete('cascade');
            $table->foreign('patient_id')->references('patient_id')->on('patients')->onDelete('restrict');
            $table->foreign('doctor_id')->references('specialist_id')->on('specialists')->onDelete('set null');
            $table->foreign('nurse_id')->references('specialist_id')->on('specialists')->onDelete('set null');
            $table->foreign('medtech_id')->references('specialist_id')->on('specialists')->onDelete('set null');

            // Indexes
            $table->index('patient_id');
            $table->index('doctor_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visits');
    }
};