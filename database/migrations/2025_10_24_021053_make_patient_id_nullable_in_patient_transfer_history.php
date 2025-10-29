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
        Schema::table('patient_transfer_history', function (Blueprint $table) {
            // Drop the foreign key constraint first
            $table->dropForeign(['patient_id']);
            
            // Make patient_id nullable
            $table->unsignedBigInteger('patient_id')->nullable()->change();
            
            // Re-add the foreign key constraint but allow nulls
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patient_transfer_history', function (Blueprint $table) {
            // Drop the foreign key constraint
            $table->dropForeign(['patient_id']);
            
            // Make patient_id not nullable again
            $table->unsignedBigInteger('patient_id')->nullable(false)->change();
            
            // Re-add the foreign key constraint
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
        });
    }
};