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
            if (!Schema::hasColumn('patients', 'is_senior_citizen')) {
                $afterColumn = Schema::hasColumn('patients', 'birthdate') ? 'birthdate' : null;
                if ($afterColumn) {
                    $table->boolean('is_senior_citizen')->default(false)->after($afterColumn);
                } else {
                    $table->boolean('is_senior_citizen')->default(false);
                }
            }
            
            if (!Schema::hasColumn('patients', 'senior_citizen_id')) {
                $afterColumn = Schema::hasColumn('patients', 'is_senior_citizen') ? 'is_senior_citizen' : (Schema::hasColumn('patients', 'birthdate') ? 'birthdate' : null);
                if ($afterColumn) {
                    $table->string('senior_citizen_id')->nullable()->after($afterColumn);
                } else {
                    $table->string('senior_citizen_id')->nullable();
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('patients', 'is_senior_citizen')) {
                $columnsToDrop[] = 'is_senior_citizen';
            }
            if (Schema::hasColumn('patients', 'senior_citizen_id')) {
                $columnsToDrop[] = 'senior_citizen_id';
            }
            
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
