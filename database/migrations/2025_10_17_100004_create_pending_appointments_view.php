<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Create a view for pending_appointments that filters appointments with Pending status
     */
    public function up(): void
    {
        // Drop the view if it exists
        DB::statement('DROP VIEW IF EXISTS pending_appointments');
        
        // Create a view that shows pending appointments with all necessary fields
        DB::statement("
            CREATE VIEW pending_appointments AS
            SELECT 
                a.appointment_id AS id,
                a.appointment_id,
                a.appointment_code,
                a.patient_id,
                a.specialist_id,
                a.nurse_id,
                a.appointment_type,
                a.specialist_type,
                a.appointment_date,
                a.appointment_time,
                a.duration,
                a.price,
                a.additional_info,
                a.source,
                a.status,
                a.status AS status_approval,
                a.admin_notes,
                a.created_by,
                a.created_at,
                a.updated_at,
                p.patient_code,
                CONCAT(p.last_name, ', ', p.first_name, ' ', COALESCE(p.middle_name, '')) AS patient_name,
                p.mobile_no AS patient_mobile,
                p.email AS patient_email,
                s.name AS specialist_name,
                s.specialist_code
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.patient_id
            LEFT JOIN specialists s ON a.specialist_id = s.specialist_id
            WHERE a.status = 'Pending'
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS pending_appointments');
    }
};


