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
            $table->string('appointment_code', 10)->unique();
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('specialist_id')->nullable(); // main assigned specialist (Doctor or MedTech)
            $table->unsignedBigInteger('nurse_id')->nullable(); // optional assisting nurse
            $table->string('appointment_type', 100)->nullable();
            $table->enum('specialist_type', ['Doctor', 'Nurse', 'MedTech'])->nullable();
            $table->date('appointment_date')->nullable();
            $table->time('appointment_time')->nullable();
            $table->string('duration', 50)->nullable();
            $table->decimal('price', 10, 2)->default(0.00);
            $table->text('additional_info')->nullable();
            $table->enum('source', ['Online', 'Walk-in']);
            $table->enum('status', ['Pending', 'Confirmed', 'Cancelled', 'Completed'])->default('Pending');
            $table->text('admin_notes')->nullable();
            $table->string('created_by', 50)->nullable(); // who created (patient_id or admin user)
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('patient_id')->references('patient_id')->on('patients')->onDelete('restrict');
            $table->foreign('specialist_id')->references('specialist_id')->on('specialists')->onDelete('set null');
            $table->foreign('nurse_id')->references('specialist_id')->on('specialists')->onDelete('set null');

            // Indexes
            $table->index('patient_id');
            $table->index('specialist_id');
            $table->index('status');
            $table->index('created_at');
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