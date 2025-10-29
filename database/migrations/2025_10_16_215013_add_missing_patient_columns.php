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
            // Add missing columns that are needed for patient creation
            if (!Schema::hasColumn('patients', 'civil_status')) {
                $table->string('civil_status', 50)->nullable()->after('sex');
            }
            
            if (!Schema::hasColumn('patients', 'nationality')) {
                $table->string('nationality', 50)->nullable()->after('civil_status');
            }
            
            if (!Schema::hasColumn('patients', 'telephone_no')) {
                $table->string('telephone_no', 20)->nullable()->after('mobile_no');
            }
            
            if (!Schema::hasColumn('patients', 'present_address')) {
                $table->text('present_address')->nullable()->after('telephone_no');
            }
            
            if (!Schema::hasColumn('patients', 'hmo_name')) {
                $table->string('hmo_name', 100)->nullable()->after('company_name');
            }
            
            if (!Schema::hasColumn('patients', 'validity')) {
                $table->date('validity')->nullable()->after('hmo_name');
            }
            
            if (!Schema::hasColumn('patients', 'drug_allergies')) {
                $table->text('drug_allergies')->nullable()->after('validity');
            }
            
            if (!Schema::hasColumn('patients', 'past_medical_history')) {
                $table->text('past_medical_history')->nullable()->after('drug_allergies');
            }
            
            if (!Schema::hasColumn('patients', 'family_history')) {
                $table->text('family_history')->nullable()->after('past_medical_history');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn([
                'civil_status',
                'nationality', 
                'telephone_no',
                'present_address',
                'hmo_name',
                'validity',
                'drug_allergies',
                'past_medical_history',
                'family_history'
            ]);
        });
    }
};