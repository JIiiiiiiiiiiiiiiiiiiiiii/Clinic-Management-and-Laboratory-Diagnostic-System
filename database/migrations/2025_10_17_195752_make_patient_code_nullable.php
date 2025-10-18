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
        // Make patient_code nullable if it exists and is NOT NULL
        $column = DB::select("SHOW COLUMNS FROM patients WHERE Field = 'patient_code'");
        
        if (!empty($column) && $column[0]->Null === 'NO') {
            DB::statement('ALTER TABLE patients MODIFY patient_code VARCHAR(10) NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE patients MODIFY patient_code VARCHAR(10) NOT NULL');
    }
};
