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
        if (!Schema::hasTable('patient_transfers')) {
            return; // Skip if table doesn't exist
        }

        // First, ensure all patient_transfers have valid requested_by values
        if (Schema::hasColumn('patient_transfers', 'requested_by')) {
            try {
                $defaultUser = \App\Models\User::first();
                if ($defaultUser) {
                    DB::table('patient_transfers')
                        ->whereNull('requested_by')
                        ->update(['requested_by' => $defaultUser->id]);
                }
            } catch (\Exception $e) {
                // Ignore if update fails
            }
        }
        
        // Now add the foreign key constraints if they don't exist
        Schema::table('patient_transfers', function (Blueprint $table) {
            // Check if foreign keys exist before adding them
            $foreignKeys = DB::select("
                SELECT CONSTRAINT_NAME 
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'patient_transfers' 
                AND CONSTRAINT_NAME IN ('patient_transfers_requested_by_foreign', 'patient_transfers_approved_by_foreign')
            ");
            
            $existingKeys = array_column($foreignKeys, 'CONSTRAINT_NAME');
            
            if (!in_array('patient_transfers_requested_by_foreign', $existingKeys) && Schema::hasColumn('patient_transfers', 'requested_by')) {
                try {
                    $table->foreign('requested_by')->references('id')->on('users')->onDelete('cascade');
                } catch (\Exception $e) {
                    // Ignore if foreign key creation fails
                }
            }
            
            if (!in_array('patient_transfers_approved_by_foreign', $existingKeys) && Schema::hasColumn('patient_transfers', 'approved_by')) {
                try {
                    $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
                } catch (\Exception $e) {
                    // Ignore if foreign key creation fails
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patient_transfers', function (Blueprint $table) {
            // Drop foreign keys if they exist
            try {
                $table->dropForeign(['requested_by']);
            } catch (\Exception $e) {
                // Ignore if foreign key doesn't exist
            }
            
            try {
                $table->dropForeign(['approved_by']);
            } catch (\Exception $e) {
                // Ignore if foreign key doesn't exist
            }
        });
    }
};
