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
        // Add appointment_source to appointments table
        Schema::table('appointments', function (Blueprint $table) {
            $table->enum('appointment_source', ['online', 'walk_in'])->default('walk_in')->after('status');
        });

        // Add appointment_source to pending_appointments table
        Schema::table('pending_appointments', function (Blueprint $table) {
            $table->enum('appointment_source', ['online', 'walk_in'])->default('online')->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove appointment_source from appointments table
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn('appointment_source');
        });

        // Remove appointment_source from pending_appointments table
        Schema::table('pending_appointments', function (Blueprint $table) {
            $table->dropColumn('appointment_source');
        });
    }
};
