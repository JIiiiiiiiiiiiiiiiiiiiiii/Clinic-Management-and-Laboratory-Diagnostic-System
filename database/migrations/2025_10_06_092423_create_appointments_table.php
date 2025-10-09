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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            
            // Patient Information
            $table->string('patient_name');
            $table->string('patient_id')->unique(); // P001, P002, etc.
            $table->string('contact_number')->nullable();
            
            // Appointment Details
            $table->string('appointment_type'); // consultation, checkup, fecalysis, cbc, urinalysis
            $table->string('specialist_type'); // doctor, medtech
            $table->string('specialist_name'); // Dr. Smith, Sarah Johnson, etc.
            $table->string('specialist_id'); // D001, MT001, etc.
            
            // Scheduling
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->string('duration')->default('30 min');
            
            // Status and Booking
            $table->enum('status', ['Pending', 'Confirmed', 'Completed', 'Cancelled'])->default('Pending');
            $table->string('booking_method')->default('Admin'); // Admin, Online, Phone
            $table->boolean('confirmation_sent')->default(false);
            
            // Additional Information
            $table->text('notes')->nullable();
            $table->text('special_requirements')->nullable();
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for better performance
            $table->index(['appointment_date', 'appointment_time']);
            $table->index(['status']);
            $table->index(['specialist_type', 'specialist_id']);
            $table->index(['appointment_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};