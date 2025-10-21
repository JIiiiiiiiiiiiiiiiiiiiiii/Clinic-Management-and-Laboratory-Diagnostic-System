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
        // Fix visits table columns
        Schema::table('visits', function (Blueprint $table) {
            // Make attending_staff_id nullable
            if (Schema::hasColumn('visits', 'attending_staff_id')) {
                $table->unsignedBigInteger('attending_staff_id')->nullable()->change();
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

