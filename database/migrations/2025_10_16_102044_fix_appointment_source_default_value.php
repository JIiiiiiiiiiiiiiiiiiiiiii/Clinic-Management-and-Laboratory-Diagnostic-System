<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Change the default value for appointment_source in appointments table
        Schema::table('appointments', function (Blueprint $table) {
            $table->enum('appointment_source', ['online', 'walk_in'])->default('online')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert the default value back to walk_in
        Schema::table('appointments', function (Blueprint $table) {
            $table->enum('appointment_source', ['online', 'walk_in'])->default('walk_in')->change();
        });
    }
};