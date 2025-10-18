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
        Schema::table('patients', function (Blueprint $table) {
            // Add present_address field if it doesn't exist
            if (!Schema::hasColumn('patients', 'present_address')) {
                $table->text('present_address')->nullable()->after('civil_status');
            }
        });
        
        // Copy existing address data to present_address
        DB::statement('UPDATE patients SET present_address = address WHERE present_address IS NULL AND address IS NOT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn('present_address');
        });
    }
};
