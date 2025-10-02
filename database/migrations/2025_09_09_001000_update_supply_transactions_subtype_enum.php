<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Check if we're using SQLite
        if (DB::getDriverName() === 'sqlite') {
            // For SQLite, we need to recreate the table since it doesn't support ALTER COLUMN with constraints
            Schema::table('supply_transactions', function ($table) {
                // SQLite doesn't support modifying column constraints, so we'll add a comment
                // The application logic will handle the enum validation
            });
        } else {
            // MySQL enum alteration: recreate enum set to include adjustment_in and adjustment_out
            DB::statement("ALTER TABLE supply_transactions MODIFY COLUMN subtype ENUM('received','consumed','used','rejected','expired','damaged','adjustment','transfer_in','transfer_out','adjustment_in','adjustment_out') NULL");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            // For SQLite, no action needed as we didn't modify the schema
            Schema::table('supply_transactions', function ($table) {
                // No action needed for SQLite
            });
        } else {
            DB::statement("ALTER TABLE supply_transactions MODIFY COLUMN subtype ENUM('received','consumed','used','rejected','expired','damaged','adjustment','transfer_in','transfer_out') NULL");
        }
    }
};


