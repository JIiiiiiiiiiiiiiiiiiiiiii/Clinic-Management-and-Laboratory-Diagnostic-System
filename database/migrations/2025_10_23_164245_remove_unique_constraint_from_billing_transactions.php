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
        Schema::table('billing_transactions', function (Blueprint $table) {
            // Remove the problematic unique constraint that prevents multiple manual transactions
            $table->dropUnique('unique_transaction_per_patient_doctor_amount_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('billing_transactions', function (Blueprint $table) {
            // Re-add the constraint if needed
            $table->unique(['patient_id', 'doctor_id', 'total_amount', 'status'], 'unique_transaction_per_patient_doctor_amount_status');
        });
    }
};
