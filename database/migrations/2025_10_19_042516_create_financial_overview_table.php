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
        Schema::create('financial_overview', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique(); // Unique date constraint
            $table->integer('total_transactions')->default(0);
            $table->decimal('total_revenue', 10, 2)->default(0.00);
            $table->decimal('pending_amount', 10, 2)->default(0.00);
            $table->decimal('cash_total', 10, 2)->default(0.00);
            $table->decimal('hmo_total', 10, 2)->default(0.00);
            $table->decimal('other_payment_total', 10, 2)->default(0.00);
            $table->integer('paid_transactions')->default(0);
            $table->integer('pending_transactions')->default(0);
            $table->integer('cancelled_transactions')->default(0);
            $table->timestamps();
            
            // Indexes for better performance
            $table->index('date');
            $table->index(['date', 'total_revenue']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_overview');
    }
};