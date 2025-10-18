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
            // Add new fields that don't exist
            if (!Schema::hasColumn('visits', 'visit_code')) {
                $table->string('visit_code', 10)->unique()->after('id');
            }
            
            if (!Schema::hasColumn('visits', 'staff_id')) {
                $table->foreignId('staff_id')->constrained('users')->onDelete('cascade')->after('patient_id');
            }
            
            if (!Schema::hasColumn('visits', 'visit_date')) {
                $table->datetime('visit_date')->after('staff_id');
            }
            
            if (!Schema::hasColumn('visits', 'status')) {
                $table->enum('status', ['Ongoing', 'Completed'])->default('Ongoing')->after('visit_date');
            }
            
            // Rename existing fields to match specification (only if they exist and new ones don't)
            if (Schema::hasColumn('visits', 'attending_staff_id') && !Schema::hasColumn('visits', 'staff_id')) {
                $table->renameColumn('attending_staff_id', 'staff_id');
            } elseif (Schema::hasColumn('visits', 'attending_staff_id') && Schema::hasColumn('visits', 'staff_id')) {
                // Drop foreign key constraint first, then drop column
                $table->dropForeign(['attending_staff_id']);
                $table->dropColumn('attending_staff_id');
            }
            
            if (Schema::hasColumn('visits', 'visit_date_time') && !Schema::hasColumn('visits', 'visit_date')) {
                $table->renameColumn('visit_date_time', 'visit_date');
            } elseif (Schema::hasColumn('visits', 'visit_date_time') && Schema::hasColumn('visits', 'visit_date')) {
                $table->dropColumn('visit_date_time');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visits', function (Blueprint $table) {
            // Remove new fields
            $table->dropColumn([
                'visit_code',
                'staff_id',
                'visit_date',
                'status'
            ]);
            
            // Rename columns back
            $table->renameColumn('staff_id', 'attending_staff_id');
            $table->renameColumn('visit_date', 'visit_date_time');
        });
    }
};
