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
        // First, let's make the foreign key fields nullable to avoid constraint issues
        try {
            Schema::table('visits', function (Blueprint $table) {
                if (Schema::hasColumn('visits', 'staff_id')) {
                    try { $table->dropForeign(['staff_id']); } catch (\Throwable $e) {}
                    $table->unsignedBigInteger('staff_id')->nullable()->change();
                }
            });
        } catch (\Throwable $e) {
            // Ignore if constraint/column not present
        }

        // Now let's add the foreign key constraint back
        try {
            Schema::table('visits', function (Blueprint $table) {
                if (Schema::hasColumn('visits', 'staff_id')) {
                    try { $table->foreign('staff_id')->references('id')->on('users')->onDelete('set null'); } catch (\Throwable $e) {}
                }
            });
        } catch (\Throwable $e) {
            // Ignore if cannot create in this environment
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            Schema::table('visits', function (Blueprint $table) {
                if (Schema::hasColumn('visits', 'staff_id')) {
                    try { $table->dropForeign(['staff_id']); } catch (\Throwable $e) {}
                }
            });
        } catch (\Throwable $e) {
            // no-op
        }
    }
};