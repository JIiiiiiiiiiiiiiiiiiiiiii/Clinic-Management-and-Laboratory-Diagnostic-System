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
            $table->id('appointment_id');
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('scheduled_by_user_id');
            $table->enum('scheduled_by_role', ['Patient', 'Staff', 'Doctor', 'System']);
            $table->dateTime('appointment_date_time');
            $table->enum('status', ['Requested', 'Scheduled', 'Confirmed', 'Completed', 'Cancelled'])->default('Scheduled');
            $table->text('reason')->nullable();
            $table->dateTime('checked_in_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->unsignedBigInteger('slot_id')->nullable();
            $table->timestamps();

            $table->foreign('patient_id')->references('patient_id')->on('patients');
            $table->foreign('scheduled_by_user_id')->references('user_id')->on('users');
            $table->foreign('slot_id')->references('slot_id')->on('appointment_slots');
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
