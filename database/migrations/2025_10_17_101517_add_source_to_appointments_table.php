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
        if (!Schema::hasColumn('appointments', 'source')) {
            Schema::table('appointments', function (Blueprint $table) {
                // Try to add after a column that exists, or at the end
                $afterColumn = null;
                if (Schema::hasColumn('appointments', 'special_requirements')) {
                    $afterColumn = 'special_requirements';
                } elseif (Schema::hasColumn('appointments', 'additional_info')) {
                    $afterColumn = 'additional_info';
                } elseif (Schema::hasColumn('appointments', 'appointment_type')) {
                    $afterColumn = 'appointment_type';
                }
                
                if ($afterColumn) {
                    $table->enum('source', ['online', 'walk_in'])->default('online')->after($afterColumn);
                } else {
                    $table->enum('source', ['online', 'walk_in'])->default('online');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('appointments', 'source')) {
            Schema::table('appointments', function (Blueprint $table) {
                $table->dropColumn('source');
            });
        }
    }
};
