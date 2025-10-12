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
        Schema::create('laboratory_reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_type'); // 'daily', 'monthly', 'yearly'
            $table->date('report_date');
            $table->integer('total_orders')->default(0);
            $table->integer('pending_orders')->default(0);
            $table->integer('completed_orders')->default(0);
            $table->json('order_details'); // Store detailed order information
            $table->json('test_summary'); // Store test type counts (fecalysis, cbc, urinary, etc.)
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['report_type', 'report_date']);
            $table->index('report_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laboratory_reports');
    }
};
