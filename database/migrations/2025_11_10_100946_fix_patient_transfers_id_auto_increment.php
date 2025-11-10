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
        // Fix the id column to ensure it's AUTO_INCREMENT and PRIMARY KEY
        // First, check if id is already a primary key
        $hasPrimaryKey = \DB::select("SHOW KEYS FROM `patient_transfers` WHERE Key_name = 'PRIMARY'");
        
        if (empty($hasPrimaryKey)) {
            // If no primary key, add it
            \DB::statement('ALTER TABLE `patient_transfers` ADD PRIMARY KEY (`id`)');
        }
        
        // Then ensure AUTO_INCREMENT
        \DB::statement('ALTER TABLE `patient_transfers` MODIFY COLUMN `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is not reversible as it fixes a structural issue
    }
};
