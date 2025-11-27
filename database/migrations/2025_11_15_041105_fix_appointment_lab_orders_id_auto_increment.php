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
        // Fix the id column to have AUTO_INCREMENT
        // This ensures the id field has a default value (auto-increment)
        DB::statement('ALTER TABLE appointment_lab_orders MODIFY COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: We can't easily reverse this without knowing the original state
        // In practice, this should not be reversed as AUTO_INCREMENT is the expected behavior
    }
};
