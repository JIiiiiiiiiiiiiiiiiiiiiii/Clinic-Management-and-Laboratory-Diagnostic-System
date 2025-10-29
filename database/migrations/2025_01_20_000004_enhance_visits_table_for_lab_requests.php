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
        Schema::table('visits', function (Blueprint $table) {
            // Add new columns for lab request functionality
            $table->boolean('lab_result_review_required')->default(false);
            $table->date('follow_up_scheduled_date')->nullable();
            $table->boolean('lab_results_ready')->default(false);
            $table->foreignId('parent_visit_id')->nullable()->constrained('visits')->onDelete('set null');
            $table->integer('visit_sequence')->default(1);
            
            // Indexes for better performance
            $table->index(['lab_result_review_required']);
            $table->index(['lab_results_ready']);
            $table->index(['parent_visit_id']);
            $table->index(['visit_sequence']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visits', function (Blueprint $table) {
            $table->dropForeign(['parent_visit_id']);
            $table->dropColumn([
                'lab_result_review_required',
                'follow_up_scheduled_date',
                'lab_results_ready',
                'parent_visit_id',
                'visit_sequence'
            ]);
        });
    }
};
