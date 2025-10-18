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
        Schema::create('billing_transactions', function (Blueprint $table) {
            $table->id('transaction_id');
            $table->string('transaction_code', 20)->unique();
            $table->unsignedBigInteger('appointment_id')->unique(); // one-to-one with appointment
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('doctor_id')->nullable();
            $table->unsignedBigInteger('medtech_id')->nullable();
            $table->unsignedBigInteger('nurse_id')->nullable();
            $table->decimal('amount', 10, 2)->default(0.00);
            $table->enum('payment_method', ['Cash', 'Card', 'HMO'])->nullable();
            $table->string('reference_no', 100)->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['Pending', 'Paid', 'Cancelled'])->default('Pending');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('appointment_id')->references('appointment_id')->on('appointments')->onDelete('cascade');
            $table->foreign('patient_id')->references('patient_id')->on('patients')->onDelete('restrict');
            $table->foreign('doctor_id')->references('specialist_id')->on('specialists')->onDelete('set null');

            // Indexes
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_transactions');
    }
};