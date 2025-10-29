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
        // Drop the existing foreign key constraint
        Schema::table('doctor_payments', function (Blueprint $table) {
            $table->dropForeign(['doctor_id']);
        });
        
        // Add the new foreign key constraint to reference specialists table
        Schema::table('doctor_payments', function (Blueprint $table) {
            $table->foreign('doctor_id')->references('specialist_id')->on('specialists')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the new foreign key constraint
        Schema::table('doctor_payments', function (Blueprint $table) {
            $table->dropForeign(['doctor_id']);
        });
        
        // Restore the original foreign key constraint
        Schema::table('doctor_payments', function (Blueprint $table) {
            $table->foreign('doctor_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};