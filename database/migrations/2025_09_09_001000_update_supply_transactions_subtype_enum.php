<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // SQLite doesn't support MODIFY COLUMN, so we'll skip this migration for SQLite
        // The enum constraint will be handled by the application layer
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE supply_transactions MODIFY COLUMN subtype ENUM('received','consumed','used','rejected','expired','damaged','adjustment','transfer_in','transfer_out','adjustment_in','adjustment_out') NULL");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE supply_transactions MODIFY COLUMN subtype ENUM('received','consumed','used','rejected','expired','damaged','adjustment','transfer_in','transfer_out') NULL");
        }
    }
};


