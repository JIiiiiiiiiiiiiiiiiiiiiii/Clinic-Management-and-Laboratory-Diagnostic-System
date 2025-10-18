<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Make all auto-generated code fields nullable so they don't require values on insert
     */
    public function up(): void
    {
        // Check and modify each code field if it's NOT NULL
        
        // patients.patient_code
        $column = DB::select("SHOW COLUMNS FROM patients WHERE Field = 'patient_code'");
        if (!empty($column) && $column[0]->Null === 'NO') {
            DB::statement('ALTER TABLE patients MODIFY patient_code VARCHAR(10) NULL');
        }
        
        // patients.sequence_number
        $column = DB::select("SHOW COLUMNS FROM patients WHERE Field = 'sequence_number'");
        if (!empty($column) && $column[0]->Null === 'NO') {
            DB::statement('ALTER TABLE patients MODIFY sequence_number INT NULL');
        }
        
        // appointments.appointment_code (if exists)
        $appointmentCodeExists = DB::select("SHOW COLUMNS FROM appointments WHERE Field = 'appointment_code'");
        if (!empty($appointmentCodeExists)) {
            if ($appointmentCodeExists[0]->Null === 'NO') {
                DB::statement('ALTER TABLE appointments MODIFY appointment_code VARCHAR(10) NULL');
            }
        }
        
        // appointments.sequence_number (if exists)
        $appointmentSeqExists = DB::select("SHOW COLUMNS FROM appointments WHERE Field = 'sequence_number'");
        if (!empty($appointmentSeqExists)) {
            if ($appointmentSeqExists[0]->Null === 'NO') {
                DB::statement('ALTER TABLE appointments MODIFY sequence_number INT NULL');
            }
        }
        
        // visits.visit_code (if exists)
        $visitCodeExists = DB::select("SHOW COLUMNS FROM visits WHERE Field = 'visit_code'");
        if (!empty($visitCodeExists)) {
            if ($visitCodeExists[0]->Null === 'NO') {
                DB::statement('ALTER TABLE visits MODIFY visit_code VARCHAR(10) NULL');
            }
        }
        
        // billing_transactions.transaction_code (if exists)
        $transactionCodeExists = DB::select("SHOW COLUMNS FROM billing_transactions WHERE Field = 'transaction_code'");
        if (!empty($transactionCodeExists)) {
            if ($transactionCodeExists[0]->Null === 'NO') {
                DB::statement('ALTER TABLE billing_transactions MODIFY transaction_code VARCHAR(15) NULL');
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Don't make them NOT NULL again as that could break existing data
    }
};
