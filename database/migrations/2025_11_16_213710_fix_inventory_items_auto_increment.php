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
        // Fix AUTO_INCREMENT on id column
        // Get the current max id to set AUTO_INCREMENT properly
        $maxId = DB::table('inventory_items')->max('id') ?? 0;
        $nextId = $maxId + 1;
        
        // Set AUTO_INCREMENT on the id column
        DB::statement("ALTER TABLE `inventory_items` MODIFY `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT");
        DB::statement("ALTER TABLE `inventory_items` AUTO_INCREMENT = {$nextId}");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse - AUTO_INCREMENT should remain
    }
};
