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
        Schema::create('pending_appointments', function (Blueprint $table) {
            $table->id();
            $table->string('patient_name');
            $table->string('patient_id');
            $table->string('contact_number');
            $table->string('appointment_type');
            $table->string('specialist_type');
            $table->string('specialist_name');
            $table->string('specialist_id');
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->string('duration')->default('30 min');
            $table->string('status')->default('Pending Approval');
            $table->string('billing_status')->default('pending');
            $table->text('notes')->nullable();
            $table->text('special_requirements')->nullable();
            $table->string('booking_method')->default('Online');
            $table->decimal('price', 10, 2)->nullable();
            $table->string('status_approval')->default('pending'); // pending, approved, rejected
            $table->text('admin_notes')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pending_appointments');
    }
};
