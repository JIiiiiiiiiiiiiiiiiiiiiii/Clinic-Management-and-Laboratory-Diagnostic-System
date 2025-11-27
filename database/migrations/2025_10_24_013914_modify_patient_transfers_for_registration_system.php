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

        Schema::table('patient_transfers', function (Blueprint $table) {
            // Add new columns for patient registration system if they don't exist
            if (!Schema::hasColumn('patient_transfers', 'patient_data')) {
                $table->json('patient_data')->nullable(); // Store complete patient registration data
            }
            if (!Schema::hasColumn('patient_transfers', 'registration_type')) {
                $table->enum('registration_type', ['admin', 'hospital'])->default('admin');
            }
            if (!Schema::hasColumn('patient_transfers', 'approval_status')) {
                $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('pending');
            }
            if (!Schema::hasColumn('patient_transfers', 'requested_by')) {
                $table->unsignedBigInteger('requested_by')->nullable(); // Make nullable first
            }
            if (!Schema::hasColumn('patient_transfers', 'approved_by')) {
                $table->unsignedBigInteger('approved_by')->nullable();
            }
            if (!Schema::hasColumn('patient_transfers', 'approval_date')) {
                $table->datetime('approval_date')->nullable();
            }
            if (!Schema::hasColumn('patient_transfers', 'approval_notes')) {
                $table->text('approval_notes')->nullable();
            }
            
            // Modify existing columns only if they exist
            if (Schema::hasColumn('patient_transfers', 'transfer_reason')) {
                try {
                    $table->string('transfer_reason')->nullable()->change(); // Make nullable since it's not always a transfer
                } catch (\Exception $e) {
                    // Ignore if change fails
                }
            }
            if (Schema::hasColumn('patient_transfers', 'from_hospital')) {
                try {
                    $table->boolean('from_hospital')->default(false)->change();
                } catch (\Exception $e) {
                    // Ignore if change fails
                }
            }
            if (Schema::hasColumn('patient_transfers', 'to_clinic')) {
                try {
                    $table->boolean('to_clinic')->default(false)->change();
                } catch (\Exception $e) {
                    // Ignore if change fails
                }
            }
        });
        
        // Update existing records to have a default requested_by user
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
            
            // Add indexes if they don't exist
            if (Schema::hasColumn('patient_transfers', 'registration_type') && Schema::hasColumn('patient_transfers', 'approval_status')) {
                try {
                    $table->index(['registration_type', 'approval_status']);
                } catch (\Exception $e) {
                    // Ignore if index already exists
                }
            }
            if (Schema::hasColumn('patient_transfers', 'requested_by') && Schema::hasColumn('patient_transfers', 'approval_status')) {
                try {
                    $table->index(['requested_by', 'approval_status']);
                } catch (\Exception $e) {
                    // Ignore if index already exists
                }
            }
            if (Schema::hasColumn('patient_transfers', 'approved_by') && Schema::hasColumn('patient_transfers', 'approval_date')) {
                try {
                    $table->index(['approved_by', 'approval_date']);
                } catch (\Exception $e) {
                    // Ignore if index already exists
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
            // Drop the new columns
            $table->dropColumn([
                'patient_data',
                'registration_type', 
                'approval_status',
                'requested_by',
                'approved_by',
                'approval_date',
                'approval_notes'
            ]);
            
            // Drop indexes
            $table->dropIndex(['registration_type', 'approval_status']);
            $table->dropIndex(['requested_by', 'approval_status']);
            $table->dropIndex(['approved_by', 'approval_date']);
        });
    }
};
