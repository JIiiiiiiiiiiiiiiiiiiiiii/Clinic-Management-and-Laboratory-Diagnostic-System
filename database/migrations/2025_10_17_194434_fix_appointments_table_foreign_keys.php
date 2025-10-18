<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Fix the appointments table to use proper foreign keys instead of varchar fields
     * This ensures data integrity and proper relationships
     */
    public function up(): void
    {
        // First, we need to backup the existing data
        // Then modify the table structure
        
        // Step 1: Add new columns with correct data types
        Schema::table('appointments', function (Blueprint $table) {
            $table->unsignedBigInteger('patient_id_new')->nullable()->after('patient_name');
            $table->unsignedBigInteger('specialist_id_new')->nullable()->after('specialist_name');
        });
        
        // Step 2: Migrate data from old columns to new columns
        // Convert patient_id (varchar patient_no) to patient_id_new (bigint id)
        DB::statement("
            UPDATE appointments a
            INNER JOIN patients p ON a.patient_id = p.patient_no
            SET a.patient_id_new = p.id
        ");
        
        // Convert specialist_id (varchar specialist_code) to specialist_id_new (bigint id)
        DB::statement("
            UPDATE appointments a
            INNER JOIN specialists s ON a.specialist_id = s.specialist_code
            SET a.specialist_id_new = s.specialist_id
        ");
        
        // Step 3: Drop old columns and rename new ones
        Schema::table('appointments', function (Blueprint $table) {
            // Drop old columns
            $table->dropColumn('patient_id');
            $table->dropColumn('specialist_id');
        });
        
        Schema::table('appointments', function (Blueprint $table) {
            // Rename new columns to original names
            $table->renameColumn('patient_id_new', 'patient_id');
            $table->renameColumn('specialist_id_new', 'specialist_id');
        });
        
        // Step 4: Add foreign key constraints
        Schema::table('appointments', function (Blueprint $table) {
            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('specialist_id')->references('specialist_id')->on('specialists')->onDelete('set null');
        });
        
        // Step 5: Fix source enum to match code expectations
        DB::statement("ALTER TABLE appointments MODIFY source ENUM('Online', 'Walk-in') DEFAULT 'Online'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove foreign keys
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['patient_id']);
            $table->dropForeign(['specialist_id']);
        });
        
        // Add temporary columns with old data types
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('patient_id_old')->nullable()->after('patient_name');
            $table->string('specialist_id_old')->nullable()->after('specialist_name');
        });
        
        // Convert back to varchar values
        DB::statement("
            UPDATE appointments a
            INNER JOIN patients p ON a.patient_id = p.id
            SET a.patient_id_old = p.patient_no
        ");
        
        DB::statement("
            UPDATE appointments a
            INNER JOIN specialists s ON a.specialist_id = s.specialist_id
            SET a.specialist_id_old = s.specialist_code
        ");
        
        // Drop new columns and rename old ones back
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn('patient_id');
            $table->dropColumn('specialist_id');
        });
        
        Schema::table('appointments', function (Blueprint $table) {
            $table->renameColumn('patient_id_old', 'patient_id');
            $table->renameColumn('specialist_id_old', 'specialist_id');
        });
        
        // Revert source enum
        DB::statement("ALTER TABLE appointments MODIFY source ENUM('online', 'walk_in') DEFAULT 'online'");
    }
};
