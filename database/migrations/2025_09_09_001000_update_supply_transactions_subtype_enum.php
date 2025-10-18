<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Check if table exists before modifying
        if (DB::getSchemaBuilder()->hasTable('supply_transactions')) {
            // MySQL enum alteration: recreate enum set to include adjustment_in and adjustment_out
            DB::statement("ALTER TABLE supply_transactions MODIFY COLUMN subtype ENUM('received','consumed','used','rejected','expired','damaged','adjustment','transfer_in','transfer_out','adjustment_in','adjustment_out') NULL");
        } else {
            echo "Table supply_transactions does not exist yet, skipping enum update\n";
        }
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE supply_transactions MODIFY COLUMN subtype ENUM('received','consumed','used','rejected','expired','damaged','adjustment','transfer_in','transfer_out') NULL");
    }
};


