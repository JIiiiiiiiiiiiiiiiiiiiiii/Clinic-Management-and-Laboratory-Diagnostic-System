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
        // Fix invalid datetime values in visits table (check if column exists)
        if (Schema::hasColumn('visits', 'visit_date_time')) {
            DB::table('visits')
                ->where('visit_date_time', '0000-00-00 00:00:00')
                ->orWhereNull('visit_date_time')
                ->update(['visit_date_time' => now()]);
        } elseif (Schema::hasColumn('visits', 'visit_date')) {
            DB::table('visits')
                ->where('visit_date', '0000-00-00 00:00:00')
                ->orWhereNull('visit_date')
                ->update(['visit_date' => now()]);
        }

        // Now try to add the visit_date column
        Schema::table('visits', function (Blueprint $table) {
            if (!Schema::hasColumn('visits', 'visit_date')) {
                $table->datetime('visit_date')->nullable()->after('attending_staff_id');
            }
        });

        // Copy data from visit_date_time to visit_date (if both columns exist)
        if (Schema::hasColumn('visits', 'visit_date_time') && Schema::hasColumn('visits', 'visit_date')) {
            DB::table('visits')->whereNull('visit_date')->update([
                'visit_date' => DB::raw('visit_date_time')
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visits', function (Blueprint $table) {
            if (Schema::hasColumn('visits', 'visit_date')) {
                $table->dropColumn('visit_date');
            }
        });
    }
};