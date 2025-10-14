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
        Schema::create('inventory_reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_name');
            $table->enum('report_type', ['used_rejected', 'in_out_supplies', 'stock_levels', 'daily_consumption', 'usage_by_location']);
            $table->enum('period', ['daily', 'weekly', 'monthly', 'yearly', 'custom']);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->json('filters')->nullable(); // Store filter criteria
            $table->json('summary_data')->nullable(); // Store calculated summary
            $table->json('detailed_data')->nullable(); // Store detailed report data
            $table->string('status')->default('active'); // active, archived
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('exported_at')->nullable();
            $table->string('export_format')->nullable(); // pdf, excel
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_reports');
    }
};
