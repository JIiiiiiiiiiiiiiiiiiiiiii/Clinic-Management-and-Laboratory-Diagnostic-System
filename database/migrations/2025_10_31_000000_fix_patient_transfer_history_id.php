<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('patient_transfer_history')) {
            // Ensure `id` is an unsigned INT AUTO_INCREMENT PRIMARY KEY
            try {
                DB::statement('ALTER TABLE patient_transfer_history MODIFY id INT UNSIGNED NOT NULL');
            } catch (\Throwable $e) {}
            try {
                // Add PK if missing
                DB::statement('ALTER TABLE patient_transfer_history ADD PRIMARY KEY (id)');
            } catch (\Throwable $e) {}
            try {
                DB::statement('ALTER TABLE patient_transfer_history MODIFY id INT UNSIGNED NOT NULL AUTO_INCREMENT');
            } catch (\Throwable $e) {}
        }
    }

    public function down(): void
    {
        // No-op. We don't want to revert PK/auto-increment fixes.
    }
};


