<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Create a view for pending_appointments that filters appointments with Pending status
     */
    public function up(): void
    {
        // Check if appointments table exists
        if (!Schema::hasTable('appointments')) {
            return; // Skip if table doesn't exist
        }
        
        // Drop the view if it exists
        try {
            DB::statement('DROP VIEW IF EXISTS pending_appointments');
        } catch (\Exception $e) {
            // Ignore if view doesn't exist
        }
        
        // Try to create the view with different column name variations
        try {
            // First try with appointment_id
            if (Schema::hasColumn('appointments', 'appointment_id')) {
                $this->createViewWithAppointmentId();
            } else {
                // Fallback to id
                $this->createViewWithId();
            }
        } catch (\Exception $e) {
            // If creation fails, log and continue
            \Log::warning('Failed to create pending_appointments view: ' . $e->getMessage());
        }
    }
    
    private function createViewWithAppointmentId(): void
    {
        $patientJoin = Schema::hasTable('patients') && Schema::hasColumn('patients', 'patient_id') 
            ? "LEFT JOIN patients p ON a.patient_id = p.patient_id" 
            : "";
            
        $specialistJoin = Schema::hasTable('specialists') && Schema::hasColumn('appointments', 'specialist_id') && Schema::hasColumn('specialists', 'specialist_id')
            ? "LEFT JOIN specialists s ON a.specialist_id = s.specialist_id"
            : "";
        
        $sql = "
            CREATE VIEW pending_appointments AS
            SELECT 
                a.appointment_id AS id,
                a.appointment_id,
                " . (Schema::hasColumn('appointments', 'appointment_code') ? "a.appointment_code," : "NULL AS appointment_code,") . "
                a.patient_id,
                " . (Schema::hasColumn('appointments', 'specialist_id') ? "a.specialist_id," : "NULL AS specialist_id,") . "
                " . (Schema::hasColumn('appointments', 'nurse_id') ? "a.nurse_id," : "NULL AS nurse_id,") . "
                " . (Schema::hasColumn('appointments', 'appointment_type') ? "a.appointment_type," : "NULL AS appointment_type,") . "
                " . (Schema::hasColumn('appointments', 'appointment_date') ? "a.appointment_date," : "NULL AS appointment_date,") . "
                " . (Schema::hasColumn('appointments', 'appointment_time') ? "a.appointment_time," : "NULL AS appointment_time,") . "
                " . (Schema::hasColumn('appointments', 'source') ? "a.source," : "'Walk-in' AS source,") . "
                " . (Schema::hasColumn('appointments', 'status') ? "a.status," : "'Pending' AS status,") . "
                " . (Schema::hasColumn('appointments', 'status') ? "a.status AS status_approval," : "'Pending' AS status_approval,") . "
                a.created_at,
                a.updated_at,
                " . (Schema::hasTable('patients') && Schema::hasColumn('patients', 'patient_code') ? "p.patient_code," : "NULL AS patient_code,") . "
                " . (Schema::hasTable('patients') ? "CONCAT(COALESCE(p.last_name, ''), ', ', COALESCE(p.first_name, ''), ' ', COALESCE(p.middle_name, '')) AS patient_name," : "NULL AS patient_name,") . "
                " . (Schema::hasTable('specialists') && Schema::hasColumn('specialists', 'name') ? "s.name AS specialist_name," : "NULL AS specialist_name,") . "
                " . (Schema::hasTable('specialists') && Schema::hasColumn('specialists', 'specialist_code') ? "s.specialist_code" : "NULL AS specialist_code") . "
            FROM appointments a
            {$patientJoin}
            {$specialistJoin}
            WHERE " . (Schema::hasColumn('appointments', 'status') ? "a.status = 'Pending'" : "1=1")
        );
    }
    
    private function createViewWithId(): void
    {
        $patientJoin = Schema::hasTable('patients') && (Schema::hasColumn('patients', 'patient_id') || Schema::hasColumn('patients', 'id'))
            ? "LEFT JOIN patients p ON a.patient_id = p." . (Schema::hasColumn('patients', 'patient_id') ? 'patient_id' : 'id')
            : "";
            
        $specialistJoin = Schema::hasTable('specialists') && Schema::hasColumn('appointments', 'specialist_id')
            ? "LEFT JOIN specialists s ON a.specialist_id = s." . (Schema::hasColumn('specialists', 'specialist_id') ? 'specialist_id' : 'id')
            : "";
        
        $sql = "
            CREATE VIEW pending_appointments AS
            SELECT 
                a.id AS appointment_id,
                a.id,
                " . (Schema::hasColumn('appointments', 'appointment_code') ? "a.appointment_code," : "NULL AS appointment_code,") . "
                a.patient_id,
                " . (Schema::hasColumn('appointments', 'specialist_id') ? "a.specialist_id," : "NULL AS specialist_id,") . "
                " . (Schema::hasColumn('appointments', 'appointment_type') ? "a.appointment_type," : "NULL AS appointment_type,") . "
                " . (Schema::hasColumn('appointments', 'appointment_date') ? "a.appointment_date," : "NULL AS appointment_date,") . "
                " . (Schema::hasColumn('appointments', 'status') ? "a.status," : "'Pending' AS status,") . "
                a.created_at,
                a.updated_at,
                " . (Schema::hasTable('patients') ? "CONCAT(COALESCE(p.last_name, ''), ', ', COALESCE(p.first_name, '')) AS patient_name," : "NULL AS patient_name,") . "
                " . (Schema::hasTable('specialists') && Schema::hasColumn('specialists', 'name') ? "s.name AS specialist_name" : "NULL AS specialist_name") . "
            FROM appointments a
            {$patientJoin}
            {$specialistJoin}
            WHERE " . (Schema::hasColumn('appointments', 'status') ? "a.status = 'Pending'" : "1=1") . "
        ";
        
        DB::statement($sql);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            DB::statement('DROP VIEW IF EXISTS pending_appointments');
        } catch (\Exception $e) {
            // Ignore if view doesn't exist
        }
    }
};
