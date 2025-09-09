<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // MySQL enum alteration: recreate enum set to include adjustment_in and adjustment_out
        DB::statement("ALTER TABLE supply_transactions MODIFY COLUMN subtype ENUM('received','consumed','used','rejected','expired','damaged','adjustment','transfer_in','transfer_out','adjustment_in','adjustment_out') NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE supply_transactions MODIFY COLUMN subtype ENUM('received','consumed','used','rejected','expired','damaged','adjustment','transfer_in','transfer_out') NULL");
    }
};


