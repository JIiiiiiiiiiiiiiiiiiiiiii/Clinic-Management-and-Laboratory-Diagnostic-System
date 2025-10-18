<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Create a view for pending_appointments_view that filters appointments with Pending status
     */
    public function up(): void
    {
        // Drop the view if it exists
        DB::statement('DROP VIEW IF EXISTS pending_appointments_view');
        DB::statement('DROP VIEW IF EXISTS pending_appointments');
        
        // Create a view that shows pending appointments with all necessary fields
        // This view uses the ACTUAL table structure (not the old migration structure)
        DB::statement("
            CREATE VIEW pending_appointments_view AS
            SELECT 
                a.id AS appointment_id,
                a.patient_name,
                a.patient_id,
                a.contact_number,
                a.appointment_type,
                a.price,
                a.specialist_type,
                a.specialist_name,
                a.specialist_id,
                a.appointment_date,
                a.appointment_time,
                a.duration,
                a.status,
                a.billing_status,
                a.billing_reference,
                a.confirmation_sent,
                a.notes,
                a.special_requirements,
                a.source,
                a.created_at,
                a.updated_at,
                p.patient_no,
                p.first_name,
                p.last_name,
                p.mobile_no,
                CONCAT(p.first_name, ' ', p.last_name) AS full_patient_name
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            WHERE a.status = 'Pending'
            AND a.deleted_at IS NULL
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS pending_appointments_view');
    }
};

