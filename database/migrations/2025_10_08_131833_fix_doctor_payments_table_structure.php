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
        // Drop existing tables if they exist
        Schema::dropIfExists('doctors_payment');
        Schema::dropIfExists('doctor_payment_billing_links');
        Schema::dropIfExists('doctors_summary_report');
        Schema::dropIfExists('doctor_payments');
        Schema::dropIfExists('doctor_summary_reports');
        
        // Create the correct doctor_payments table
        Schema::create('doctor_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');
            $table->decimal('basic_salary', 10, 2);
            $table->decimal('deductions', 10, 2)->default(0);
            $table->decimal('holiday_pay', 10, 2)->default(0);
            $table->decimal('incentives', 10, 2)->default(0);
            $table->decimal('net_payment', 10, 2);
            $table->date('payment_date');
            $table->enum('status', ['pending', 'paid', 'cancelled'])->default('pending');
            $table->date('paid_date')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->softDeletes();
            $table->timestamps();
            
            $table->index(['doctor_id', 'status']);
            $table->index(['payment_date', 'status']);
            $table->index('status');
        });
        
        // Create doctor_payment_billing_links table
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
        
        // Create doctor_summary_reports table
        Schema::create('doctor_summary_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('payment_id')->constrained('doctor_payments')->onDelete('cascade');
            $table->decimal('basic_salary', 10, 2);
            $table->decimal('deductions', 10, 2)->default(0);
            $table->decimal('holiday_pay', 10, 2)->default(0);
            $table->decimal('incentives', 10, 2)->default(0);
            $table->decimal('total_paid', 10, 2);
            $table->date('payment_date');
            $table->enum('status', ['pending', 'paid', 'cancelled'])->default('paid');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['doctor_id', 'payment_date']);
            $table->index(['payment_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctor_summary_reports');
        Schema::dropIfExists('doctor_payment_billing_links');
        Schema::dropIfExists('doctor_payments');
    }
};