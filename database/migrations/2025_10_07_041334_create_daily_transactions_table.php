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
        Schema::create('daily_transactions', function (Blueprint $table) {
            $table->id();
            $table->date('transaction_date');
            $table->enum('transaction_type', ['billing', 'doctor_payment', 'expense', 'appointment']);
            $table->string('transaction_id');
            $table->string('patient_name')->nullable();
            $table->string('specialist_name')->nullable();
            $table->decimal('amount', 10, 2);
            $table->enum('payment_method', ['cash', 'card', 'bank_transfer', 'check', 'hmo'])->default('cash');
            $table->enum('status', ['pending', 'paid', 'cancelled', 'approved', 'refunded'])->default('pending');
            $table->text('description')->nullable();
            $table->integer('items_count')->default(0);
            $table->integer('appointments_count')->default(0);
            $table->foreignId('original_transaction_id')->nullable(); // Reference to original transaction
            $table->string('original_table')->nullable(); // Which table the original transaction came from
            $table->timestamps();
            
            $table->index(['transaction_date', 'transaction_type']);
            $table->index(['transaction_date', 'status']);
            $table->index('original_transaction_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_transactions');
    }
};
