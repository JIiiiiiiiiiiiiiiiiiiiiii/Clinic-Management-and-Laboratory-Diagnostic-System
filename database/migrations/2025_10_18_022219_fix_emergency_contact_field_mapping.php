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
        // Check if patients table has the old column names and migrate data
        if (Schema::hasColumn('patients', 'informant_name') && !Schema::hasColumn('patients', 'emergency_name')) {
            // Add new columns if they don't exist
            Schema::table('patients', function (Blueprint $table) {
                $table->string('emergency_name', 255)->nullable()->after('mobile_no');
                $table->string('emergency_relation', 255)->nullable()->after('emergency_name');
            });
            
            // Copy data from old columns to new columns
            DB::statement('UPDATE patients SET emergency_name = informant_name WHERE informant_name IS NOT NULL');
            DB::statement('UPDATE patients SET emergency_relation = relationship WHERE relationship IS NOT NULL');
            
            // Drop old columns
            Schema::table('patients', function (Blueprint $table) {
                $table->dropColumn(['informant_name', 'relationship']);
            });
        } elseif (Schema::hasColumn('patients', 'informant_name') && Schema::hasColumn('patients', 'emergency_name')) {
            // Both columns exist, copy data and drop old ones
            DB::statement('UPDATE patients SET emergency_name = COALESCE(emergency_name, informant_name) WHERE informant_name IS NOT NULL');
            DB::statement('UPDATE patients SET emergency_relation = COALESCE(emergency_relation, relationship) WHERE relationship IS NOT NULL');
            
            Schema::table('patients', function (Blueprint $table) {
                $table->dropColumn(['informant_name', 'relationship']);
            });
        }
        
        // Ensure all patients have emergency contact data
        DB::statement("UPDATE patients SET emergency_name = 'Not provided' WHERE emergency_name IS NULL OR emergency_name = ''");
        DB::statement("UPDATE patients SET emergency_relation = 'Not provided' WHERE emergency_relation IS NULL OR emergency_relation = ''");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add back old columns if they don't exist
        if (!Schema::hasColumn('patients', 'informant_name')) {
            Schema::table('patients', function (Blueprint $table) {
                $table->string('informant_name', 255)->nullable()->after('mobile_no');
                $table->string('relationship', 255)->nullable()->after('informant_name');
            });
        }
        
        // Copy data back to old columns
        DB::statement('UPDATE patients SET informant_name = emergency_name WHERE emergency_name IS NOT NULL');
        DB::statement('UPDATE patients SET relationship = emergency_relation WHERE emergency_relation IS NOT NULL');
        
        // Drop new columns
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn(['emergency_name', 'emergency_relation']);
        });
    }
};