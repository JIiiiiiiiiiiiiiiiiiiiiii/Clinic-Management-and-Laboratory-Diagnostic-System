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
        Schema::create('manual_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id')->unique();
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('specialist_id')->nullable();
            $table->string('transaction_type'); // consultation, laboratory, radiology, other
            $table->string('specialist_type')->nullable(); // doctor, medtech, nurse
            $table->decimal('amount', 10, 2);
            $table->string('payment_method'); // cash, hmo
            $table->string('payment_type')->default('cash'); // cash, health_card, discount
            $table->string('hmo_provider')->nullable();
            $table->string('hmo_reference_number')->nullable();
            $table->string('payment_reference')->nullable();
            $table->boolean('is_senior_citizen')->default(false);
            $table->decimal('senior_discount_amount', 10, 2)->default(0);
            $table->decimal('senior_discount_percentage', 5, 2)->default(20.00);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->decimal('final_amount', 10, 2);
            $table->string('status')->default('pending'); // pending, paid, cancelled
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            $table->date('transaction_date');
            $table->time('transaction_time')->nullable();
            $table->date('due_date')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('specialist_id')->references('specialist_id')->on('specialists')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');

            // Indexes
            $table->index(['patient_id', 'transaction_date']);
            $table->index(['specialist_id', 'transaction_date']);
            $table->index('status');
            $table->index('transaction_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('manual_transactions');
    }
};
