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
        Schema::table('visits', function (Blueprint $table) {
            if (!Schema::hasColumn('visits', 'transfer_required')) {
                $table->boolean('transfer_required')->default(false)->after('plan_management');
                $table->text('transfer_reason_notes')->nullable()->after('transfer_required');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visits', function (Blueprint $table) {
            if (Schema::hasColumn('visits', 'transfer_reason_notes')) {
                $table->dropColumn('transfer_reason_notes');
            }
            if (Schema::hasColumn('visits', 'transfer_required')) {
                $table->dropColumn('transfer_required');
            }
        });
    }
};
