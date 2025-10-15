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
        if (!Schema::hasTable('doctor_payment_billing_links')) {
            Schema::create('doctor_payment_billing_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_payment_id')->constrained('doctor_payments')->onDelete('cascade');
            $table->foreignId('billing_transaction_id')->constrained('billing_transactions')->onDelete('cascade');
            $table->decimal('payment_amount', 10, 2);
            $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending');
            $table->timestamps();

            $table->unique(['doctor_payment_id', 'billing_transaction_id'], 'dpbl_unique');
            $table->index(['billing_transaction_id', 'status']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctor_payment_billing_links');
    }
};
