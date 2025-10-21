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
        Schema::table('billing_transactions', function (Blueprint $table) {
            // Add new columns for visit-based billing
            $table->foreignId('visit_id')->nullable()->constrained('visits')->onDelete('set null');
            $table->boolean('is_visit_based')->default(false);
            $table->decimal('consultation_amount', 10, 2)->default(0);
            $table->decimal('lab_amount', 10, 2)->default(0);
            $table->decimal('follow_up_amount', 10, 2)->default(0);
            $table->integer('total_visits')->default(1);
            
            // Indexes for better performance
            $table->index(['visit_id']);
            $table->index(['is_visit_based']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('billing_transactions', function (Blueprint $table) {
            $table->dropForeign(['visit_id']);
            $table->dropColumn([
                'visit_id',
                'is_visit_based',
                'consultation_amount',
                'lab_amount',
                'follow_up_amount',
                'total_visits'
            ]);
        });
    }
};
