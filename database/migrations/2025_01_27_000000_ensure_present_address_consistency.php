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
        // Ensure present_address field exists and is properly configured
        Schema::table('patients', function (Blueprint $table) {
            if (!Schema::hasColumn('patients', 'present_address')) {
                $table->text('present_address')->nullable()->after('civil_status');
            }
        });
        
        // Copy existing address data to present_address for any records that still have NULL present_address
        DB::statement('UPDATE patients SET present_address = address WHERE present_address IS NULL AND address IS NOT NULL');
        
        // For any records that still have NULL present_address, set it to a default value
        DB::statement('UPDATE patients SET present_address = "Address not provided" WHERE present_address IS NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Don't drop the column as it's needed for the application
        // Just leave it as is
    }
};
