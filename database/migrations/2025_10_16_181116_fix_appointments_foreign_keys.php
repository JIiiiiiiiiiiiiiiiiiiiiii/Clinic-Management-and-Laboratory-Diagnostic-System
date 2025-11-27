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
        // First, let's check if there are any appointments with invalid specialist_id values
        $invalidAppointments = DB::table('appointments')
            ->whereNotIn('specialist_id', function($query) {
                $query->select('id')->from('users');
            })
            ->get();

        // If there are invalid appointments, we need to handle them
        if ($invalidAppointments->count() > 0) {
            // For now, let's just remove the foreign key constraint and make the fields nullable
            try {
                Schema::table('appointments', function (Blueprint $table) {
                    // Drop the foreign key constraints if they exist; guard by column existence
                    if (Schema::hasColumn('appointments', 'specialist_id_fk')) {
                        try { $table->dropForeign(['specialist_id_fk']); } catch (\Throwable $e) {}
                    }
                    if (Schema::hasColumn('appointments', 'patient_id_fk')) {
                        try { $table->dropForeign(['patient_id_fk']); } catch (\Throwable $e) {}
                    }
                });
            } catch (\Throwable $e) {
                // Ignore if table/constraints not present in this environment
            }
        }

        // Now let's add the fields without foreign key constraints first
        Schema::table('appointments', function (Blueprint $table) {
            if (!Schema::hasColumn('appointments', 'appointment_code')) {
                $table->string('appointment_code', 10)->unique()->after('id');
            }
            if (!Schema::hasColumn('appointments', 'patient_id_fk')) {
                $table->unsignedBigInteger('patient_id_fk')->nullable()->after('appointment_code');
            }
            if (!Schema::hasColumn('appointments', 'specialist_id_fk')) {
                $table->unsignedBigInteger('specialist_id_fk')->nullable()->after('patient_id_fk');
            }
            if (!Schema::hasColumn('appointments', 'specialist_type')) {
                $table->enum('specialist_type', ['Doctor', 'MedTech'])->nullable()->after('specialist_id_fk');
            }
            if (!Schema::hasColumn('appointments', 'source')) {
                $table->enum('source', ['Online', 'Walk-in'])->default('Walk-in')->after('special_requirements');
            }
            if (!Schema::hasColumn('appointments', 'admin_notes')) {
                $table->text('admin_notes')->nullable()->after('source');
            }
        });

        // Now let's add the foreign key constraints (only if they don't exist)
        try {
            Schema::table('appointments', function (Blueprint $table) {
                $table->foreign('patient_id_fk')->references('id')->on('patients')->onDelete('cascade');
            });
        } catch (\Exception $e) {
            echo "Foreign key constraint for patient_id_fk may already exist: " . $e->getMessage() . "\n";
        }
        
        try {
            Schema::table('appointments', function (Blueprint $table) {
                $table->foreign('specialist_id_fk')->references('id')->on('users')->onDelete('cascade');
            });
        } catch (\Exception $e) {
            echo "Foreign key constraint for specialist_id_fk may already exist: " . $e->getMessage() . "\n";
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['patient_id_fk']);
            $table->dropForeign(['specialist_id_fk']);
            $table->dropColumn(['appointment_code', 'patient_id_fk', 'specialist_id_fk', 'specialist_type', 'source', 'admin_notes']);
        });
    }
};