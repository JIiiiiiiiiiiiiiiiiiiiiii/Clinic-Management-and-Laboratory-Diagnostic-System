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
            // Check if column doesn't exist before adding it
            if (!Schema::hasColumn('billing_transactions', 'hmo_reference_number')) {
                $table->string('hmo_reference_number')->nullable()->after('hmo_provider');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('billing_transactions', function (Blueprint $table) {
            // Check if column exists before dropping it
            if (Schema::hasColumn('billing_transactions', 'hmo_reference_number')) {
                $table->dropColumn('hmo_reference_number');
            }
        });
    }
};
