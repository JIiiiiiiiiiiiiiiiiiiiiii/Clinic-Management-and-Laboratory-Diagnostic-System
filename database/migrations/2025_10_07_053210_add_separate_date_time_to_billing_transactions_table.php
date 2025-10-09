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
        Schema::table('billing_transactions', function (Blueprint $table) {
            // Add separate date and time fields
            $table->date('transaction_date_only')->nullable()->after('transaction_date');
            $table->time('transaction_time_only')->nullable()->after('transaction_date_only');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('billing_transactions', function (Blueprint $table) {
            // Remove the separate date and time fields
            $table->dropColumn(['transaction_date_only', 'transaction_time_only']);
        });
    }
};
