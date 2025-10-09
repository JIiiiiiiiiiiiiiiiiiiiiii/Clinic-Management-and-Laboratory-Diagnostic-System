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
        // Update the billing_status enum to include 'in_transaction'
        DB::statement("ALTER TABLE appointments MODIFY COLUMN billing_status ENUM('pending', 'in_transaction', 'paid', 'cancelled') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original enum values
        DB::statement("ALTER TABLE appointments MODIFY COLUMN billing_status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending'");
    }
};