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
        // Fix required fields in patients table
        Schema::table('patients', function (Blueprint $table) {
            // Make informant_name nullable
            if (Schema::hasColumn('patients', 'informant_name')) {
                $table->string('informant_name', 255)->nullable()->change();
            }
            
            // Make relationship nullable
            if (Schema::hasColumn('patients', 'relationship')) {
                $table->string('relationship', 255)->nullable()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is not easily reversible
    }
};

