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
            // Add performance indexes for common queries (only if they don't exist)
            if (!$this->indexExists('visits', 'visits_attending_staff_id_status_index')) {
                $table->index(['attending_staff_id', 'status']);
            }
            if (!$this->indexExists('visits', 'visits_visit_type_status_index')) {
                $table->index(['visit_type', 'status']);
            }
            if (!$this->indexExists('visits', 'visits_visit_date_time_time_status_index')) {
                $table->index(['visit_date_time_time', 'status']);
            }
            if (!$this->indexExists('visits', 'visits_patient_id_visit_date_time_time_index')) {
                $table->index(['patient_id', 'visit_date_time_time']);
            }
            if (!$this->indexExists('visits', 'visits_status_visit_date_time_time_index')) {
                $table->index(['status', 'visit_date_time_time']);
            }
            if (!$this->indexExists('visits', 'visits_visit_type_index')) {
                $table->index('visit_type');
            }
            if (!$this->indexExists('visits', 'visits_status_index')) {
                $table->index('status');
            }
        });
    }

    private function indexExists($table, $index)
    {
        $indexes = \DB::select("SHOW INDEX FROM {$table} WHERE Key_name = '{$index}'");
        return count($indexes) > 0;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visits', function (Blueprint $table) {
            // Drop the indexes
            $table->dropIndex(['attending_staff_id', 'status']);
            $table->dropIndex(['visit_type', 'status']);
            $table->dropIndex(['visit_date_time_time', 'status']);
            $table->dropIndex(['patient_id', 'visit_date_time_time']);
            $table->dropIndex(['status', 'visit_date_time_time']);
            $table->dropIndex(['visit_type']);
            $table->dropIndex(['status']);
        });
    }
};