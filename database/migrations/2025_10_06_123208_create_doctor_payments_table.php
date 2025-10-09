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
        Schema::create('doctor_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');
            $table->date('payment_period_from');
            $table->date('payment_period_to');
            $table->decimal('amount_paid', 10, 2);
            $table->enum('payment_method', ['cash', 'card', 'bank_transfer', 'check'])->default('cash');
            $table->string('payment_reference')->nullable();
            $table->text('remarks')->nullable();
            $table->enum('status', ['draft', 'pending', 'paid', 'cancelled'])->default('pending');
            $table->datetime('payment_date');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->softDeletes();
            $table->timestamps();
            
            $table->index(['doctor_id', 'status']);
            $table->index(['payment_date', 'status']);
            $table->index(['payment_period_from', 'payment_period_to']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctor_payments');
    }
};
