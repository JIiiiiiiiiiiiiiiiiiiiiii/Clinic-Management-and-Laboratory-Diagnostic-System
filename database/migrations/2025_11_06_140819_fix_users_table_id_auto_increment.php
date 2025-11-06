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
        // Fix the id column to ensure it has AUTO_INCREMENT
        // This fixes the issue where "Field 'id' doesn't have a default value"
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE users MODIFY COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: We cannot safely reverse this without potentially breaking the table
        // The id column should always be AUTO_INCREMENT for proper functionality
    }
};
