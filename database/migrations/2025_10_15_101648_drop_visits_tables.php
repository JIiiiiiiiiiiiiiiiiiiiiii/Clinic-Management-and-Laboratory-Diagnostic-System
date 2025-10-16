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
        // First, remove foreign key constraints that reference these tables
        
        // Check if lab_orders table has patient_visit_id column and remove the foreign key
        if (Schema::hasTable('lab_orders') && Schema::hasColumn('lab_orders', 'patient_visit_id')) {
            Schema::table('lab_orders', function (Blueprint $table) {
                $table->dropForeign(['patient_visit_id']);
                $table->dropColumn('patient_visit_id');
            });
        }
        
        // Drop visits table if it exists
        Schema::dropIfExists('visits');
        
        // Drop patient_visits table if it exists
        Schema::dropIfExists('patient_visits');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: This migration only drops tables, so we don't recreate them
        // If you need to restore the tables, you would need to run the original migrations
    }
};
