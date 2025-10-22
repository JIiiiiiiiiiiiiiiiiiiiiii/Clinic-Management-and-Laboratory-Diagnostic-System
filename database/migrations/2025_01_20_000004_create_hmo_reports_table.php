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
        Schema::create('hmo_reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_name');
            $table->enum('report_type', ['summary', 'detailed', 'claims_analysis', 'provider_performance', 'patient_coverage']);
            $table->enum('period', ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom']);
            $table->date('start_date');
            $table->date('end_date');
            $table->json('filters')->nullable(); // Store filter criteria
            $table->json('summary_data')->nullable(); // Store calculated summary
            $table->json('detailed_data')->nullable(); // Store detailed report data
            $table->json('provider_breakdown')->nullable(); // HMO provider specific data
            $table->json('claims_analysis')->nullable(); // Claims processing analysis
            $table->decimal('total_claims_amount', 10, 2)->default(0.00);
            $table->decimal('total_approved_amount', 10, 2)->default(0.00);
            $table->decimal('total_rejected_amount', 10, 2)->default(0.00);
            $table->integer('total_claims_count')->default(0);
            $table->integer('approved_claims_count')->default(0);
            $table->integer('rejected_claims_count')->default(0);
            $table->decimal('approval_rate', 5, 2)->default(0.00); // Percentage
            $table->string('status')->default('active'); // active, archived
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('exported_at')->nullable();
            $table->string('export_format')->nullable(); // pdf, excel
            $table->timestamps();
            
            $table->index(['report_type', 'period', 'start_date', 'end_date']);
            $table->index(['created_by', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hmo_reports');
    }
};
