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
        if (!Schema::hasTable('visits')) {
            return; // Table doesn't exist, skip
        }

        Schema::table('visits', function (Blueprint $table) {
            // Arrival Information
            if (!Schema::hasColumn('visits', 'arrival_date')) {
                $table->date('arrival_date')->nullable();
            }
            if (!Schema::hasColumn('visits', 'arrival_time')) {
                $table->string('arrival_time', 10)->nullable();
            }
            
            // Mode of Arrival
            if (!Schema::hasColumn('visits', 'mode_of_arrival')) {
                $table->string('mode_of_arrival', 100)->nullable();
            }
            
            // Vital Signs
            if (!Schema::hasColumn('visits', 'blood_pressure')) {
                $table->string('blood_pressure', 20)->nullable();
            }
            if (!Schema::hasColumn('visits', 'heart_rate')) {
                $table->string('heart_rate', 20)->nullable();
            }
            if (!Schema::hasColumn('visits', 'respiratory_rate')) {
                $table->string('respiratory_rate', 20)->nullable();
            }
            if (!Schema::hasColumn('visits', 'temperature')) {
                $table->string('temperature', 20)->nullable();
            }
            if (!Schema::hasColumn('visits', 'weight_kg')) {
                $table->decimal('weight_kg', 5, 2)->nullable();
            }
            if (!Schema::hasColumn('visits', 'height_cm')) {
                $table->decimal('height_cm', 5, 2)->nullable();
            }
            if (!Schema::hasColumn('visits', 'pain_assessment_scale')) {
                $table->string('pain_assessment_scale', 20)->nullable();
            }
            if (!Schema::hasColumn('visits', 'oxygen_saturation')) {
                $table->string('oxygen_saturation', 20)->nullable();
            }
            
            // Clinical Information
            if (!Schema::hasColumn('visits', 'reason_for_consult')) {
                $table->text('reason_for_consult')->nullable();
            }
            if (!Schema::hasColumn('visits', 'time_seen')) {
                $table->string('time_seen', 10)->nullable();
            }
            if (!Schema::hasColumn('visits', 'history_of_present_illness')) {
                $table->text('history_of_present_illness')->nullable();
            }
            if (!Schema::hasColumn('visits', 'pertinent_physical_findings')) {
                $table->text('pertinent_physical_findings')->nullable();
            }
            if (!Schema::hasColumn('visits', 'assessment_diagnosis')) {
                $table->text('assessment_diagnosis')->nullable();
            }
            if (!Schema::hasColumn('visits', 'plan_management')) {
                $table->text('plan_management')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visits', function (Blueprint $table) {
            $columns = [
                'arrival_date', 'arrival_time', 'mode_of_arrival',
                'blood_pressure', 'heart_rate', 'respiratory_rate', 'temperature',
                'weight_kg', 'height_cm', 'pain_assessment_scale', 'oxygen_saturation',
                'reason_for_consult', 'time_seen', 'history_of_present_illness',
                'pertinent_physical_findings', 'assessment_diagnosis', 'plan_management'
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('visits', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
