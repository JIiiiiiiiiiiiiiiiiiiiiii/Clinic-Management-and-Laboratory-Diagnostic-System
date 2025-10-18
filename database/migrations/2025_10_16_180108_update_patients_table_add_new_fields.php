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
        // Check columns outside the closure to avoid conflicts
        $hasEmergencyName = Schema::hasColumn('patients', 'emergency_name');
        $hasInformantName = Schema::hasColumn('patients', 'informant_name');
        $hasEmergencyRelation = Schema::hasColumn('patients', 'emergency_relation');
        $hasRelationship = Schema::hasColumn('patients', 'relationship');
        $hasInsuranceCompany = Schema::hasColumn('patients', 'insurance_company');
        $hasCompanyName = Schema::hasColumn('patients', 'company_name');
        
        Schema::table('patients', function (Blueprint $table) use (
            $hasEmergencyName, $hasInformantName, $hasEmergencyRelation, 
            $hasRelationship, $hasInsuranceCompany, $hasCompanyName
        ) {
            // Add new fields that don't exist
            if (!Schema::hasColumn('patients', 'patient_code')) {
                $table->string('patient_code', 10)->unique()->nullable()->after('id');
            }
            
            if (!$hasEmergencyName) {
                $table->string('emergency_name', 100)->nullable()->after('mobile_no');
            }
            
            if (!$hasEmergencyRelation) {
                $table->string('emergency_relation', 50)->nullable()->after(
                    $hasEmergencyName ? 'emergency_name' : 'mobile_no'
                );
            }
            
            if (!$hasInsuranceCompany) {
                $table->string('insurance_company', 100)->nullable();
            }
            
            if (!Schema::hasColumn('patients', 'hmo_id_no')) {
                $table->string('hmo_id_no', 100)->nullable();
            }
            
            if (!Schema::hasColumn('patients', 'approval_code')) {
                $table->string('approval_code', 100)->nullable();
            }
            
            if (!Schema::hasColumn('patients', 'validity')) {
                $table->string('validity', 255)->nullable();
            }
            
            if (!Schema::hasColumn('patients', 'social_history')) {
                $table->text('social_history')->nullable();
            }
            
            if (!Schema::hasColumn('patients', 'obgyn_history')) {
                $table->text('obgyn_history')->nullable();
            }
            
            if (!Schema::hasColumn('patients', 'status')) {
                $table->enum('status', ['Active', 'Inactive'])->default('Active');
            }
        });
        
        // Handle column renames/drops separately to avoid conflicts
        if ($hasInformantName && $hasEmergencyName) {
            // Both exist, drop the old one
            Schema::table('patients', function (Blueprint $table) {
                $table->dropColumn('informant_name');
            });
        }
        
        if ($hasRelationship && $hasEmergencyRelation) {
            Schema::table('patients', function (Blueprint $table) {
                $table->dropColumn('relationship');
            });
        }
        
        if ($hasCompanyName && $hasInsuranceCompany) {
            Schema::table('patients', function (Blueprint $table) {
                $table->dropColumn('company_name');
            });
        }
        
        if (Schema::hasColumn('patients', 'hmo_company_id_no') && Schema::hasColumn('patients', 'hmo_id_no')) {
            Schema::table('patients', function (Blueprint $table) {
                $table->dropColumn('hmo_company_id_no');
            });
        }
        
        if (Schema::hasColumn('patients', 'validation_approval_code') && Schema::hasColumn('patients', 'approval_code')) {
            Schema::table('patients', function (Blueprint $table) {
                $table->dropColumn('validation_approval_code');
            });
        }
        
        if (Schema::hasColumn('patients', 'social_personal_history') && Schema::hasColumn('patients', 'social_history')) {
            Schema::table('patients', function (Blueprint $table) {
                $table->dropColumn('social_personal_history');
            });
        }
        
        if (Schema::hasColumn('patients', 'obstetrics_gynecology_history') && Schema::hasColumn('patients', 'obgyn_history')) {
            Schema::table('patients', function (Blueprint $table) {
                $table->dropColumn('obstetrics_gynecology_history');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            // Remove added fields
            $table->dropColumn([
                'patient_code',
                'nationality',
                'civil_status',
                'address',
                'telephone_no',
                'emergency_name',
                'emergency_relation',
                'insurance_company',
                'hmo_name',
                'hmo_id_no',
                'approval_code',
                'validity',
                'drug_allergies',
                'past_medical_history',
                'family_history',
                'social_history',
                'obgyn_history',
                'status'
            ]);
            
            // Rename columns back
            $table->renameColumn('address', 'present_address');
            $table->renameColumn('emergency_name', 'informant_name');
            $table->renameColumn('emergency_relation', 'relationship');
            $table->renameColumn('insurance_company', 'company_name');
            $table->renameColumn('hmo_id_no', 'hmo_company_id_no');
            $table->renameColumn('approval_code', 'validation_approval_code');
            $table->renameColumn('social_history', 'social_personal_history');
            $table->renameColumn('obgyn_history', 'obstetrics_gynecology_history');
        });
    }
};
