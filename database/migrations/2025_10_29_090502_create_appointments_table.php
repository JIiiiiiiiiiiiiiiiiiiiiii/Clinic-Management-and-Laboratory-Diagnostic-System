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
        // Skip if table already exists (idempotent migration)
        if (!Schema::hasTable('appointments')) {
            Schema::create('appointments', function (Blueprint $table) {
                $table->id();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Only drop if this migration created the minimal table structure
        // Don't drop if other migrations added columns
        if (Schema::hasTable('appointments')) {
            // Check if this is the minimal version (only id and timestamps)
            $columns = Schema::getColumnListing('appointments');
            if (count($columns) <= 3 && in_array('id', $columns) && in_array('created_at', $columns) && in_array('updated_at', $columns)) {
                Schema::dropIfExists('appointments');
            }
        }
    }
};

