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
        Schema::table('lab_orders', function (Blueprint $table) {
            // Add patient_visit_id column to link lab orders to patient visits
            $table->unsignedBigInteger('patient_visit_id')->nullable()->after('patient_id');
            
            // Add foreign key constraint to visits table
            $table->foreign('patient_visit_id')->references('id')->on('visits')->onDelete('set null');
            
            // Add index for performance
            $table->index('patient_visit_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lab_orders', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['patient_visit_id']);
            
            // Drop index
            $table->dropIndex(['patient_visit_id']);
            
            // Drop column
            $table->dropColumn('patient_visit_id');
        });
    }
};
