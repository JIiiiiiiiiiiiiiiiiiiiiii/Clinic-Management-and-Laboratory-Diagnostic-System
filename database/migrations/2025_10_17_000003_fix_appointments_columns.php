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
        // Fix appointments table columns
        Schema::table('appointments', function (Blueprint $table) {
            // Make specialist_id_fk nullable if it's not already
            if (Schema::hasColumn('appointments', 'specialist_id_fk')) {
                $table->unsignedBigInteger('specialist_id_fk')->nullable()->change();
            }
            
            // Make specialist_id nullable if it's not already
            if (Schema::hasColumn('appointments', 'specialist_id')) {
                $table->unsignedBigInteger('specialist_id')->nullable()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is not reversible
    }
};

