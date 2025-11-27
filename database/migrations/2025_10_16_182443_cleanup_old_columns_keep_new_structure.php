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
        // Clean up appointments table - remove old columns, keep new structure
        Schema::table('appointments', function (Blueprint $table) {
            // Drop old columns that conflict with new structure
            if (Schema::hasColumn('appointments', 'patient_id')) {
                $table->dropColumn('patient_id');
            }
            if (Schema::hasColumn('appointments', 'specialist_id')) {
                $table->dropColumn('specialist_id');
            }
            if (Schema::hasColumn('appointments', 'patient_name')) {
                $table->dropColumn('patient_name');
            }
            if (Schema::hasColumn('appointments', 'contact_number')) {
                $table->dropColumn('contact_number');
            }
            if (Schema::hasColumn('appointments', 'specialist_name')) {
                $table->dropColumn('specialist_name');
            }
            if (Schema::hasColumn('appointments', 'appointment_source')) {
                $table->dropColumn('appointment_source');
            }
            if (Schema::hasColumn('appointments', 'booking_method')) {
                $table->dropColumn('booking_method');
            }
            if (Schema::hasColumn('appointments', 'billing_status')) {
                $table->dropColumn('billing_status');
            }
            if (Schema::hasColumn('appointments', 'billing_reference')) {
                $table->dropColumn('billing_reference');
            }
            if (Schema::hasColumn('appointments', 'confirmation_sent')) {
                $table->dropColumn('confirmation_sent');
            }
            if (Schema::hasColumn('appointments', 'special_requirements')) {
                $table->dropColumn('special_requirements');
            }
            if (Schema::hasColumn('appointments', 'notes')) {
                $table->dropColumn('notes');
            }
            if (Schema::hasColumn('appointments', 'sequence_number')) {
                $table->dropColumn('sequence_number');
            }
        });

        // Clean up visits table - remove old columns, keep new structure
        Schema::table('visits', function (Blueprint $table) {
            // Drop old columns that might conflict
            if (Schema::hasColumn('visits', 'visit_date_time')) {
                $table->dropColumn('visit_date_time');
            }
        });

        // Clean up billing_transactions table - remove old columns, keep new structure
        // Drop foreign keys outside Schema closure if they exist
        if (Schema::hasColumn('billing_transactions', 'doctor_id')) {
            try {
                DB::statement('ALTER TABLE billing_transactions DROP FOREIGN KEY IF EXISTS billing_transactions_doctor_id_foreign');
            } catch (\Throwable $e) {
                // MySQL < 8.0 doesn't support IF EXISTS, try without
                try {
                    DB::statement('ALTER TABLE billing_transactions DROP FOREIGN KEY billing_transactions_doctor_id_foreign');
                } catch (\Throwable $e2) {
                    // Foreign key doesn't exist, that's fine
                }
            }
        }
        
        // Drop foreign keys for created_by and updated_by if they exist
        foreach (['created_by', 'updated_by'] as $column) {
            if (Schema::hasColumn('billing_transactions', $column)) {
                $constraintName = "billing_transactions_{$column}_foreign";
                try {
                    DB::statement("ALTER TABLE billing_transactions DROP FOREIGN KEY IF EXISTS {$constraintName}");
                } catch (\Throwable $e) {
                    try {
                        DB::statement("ALTER TABLE billing_transactions DROP FOREIGN KEY {$constraintName}");
                    } catch (\Throwable $e2) {
                        // Foreign key doesn't exist, that's fine
                    }
                }
            }
        }
        
        Schema::table('billing_transactions', function (Blueprint $table) {
            // Drop old columns that might conflict
            if (Schema::hasColumn('billing_transactions', 'transaction_id')) {
                $table->dropColumn('transaction_id');
            }
            if (Schema::hasColumn('billing_transactions', 'doctor_id')) {
                $table->dropColumn('doctor_id');
            }
            if (Schema::hasColumn('billing_transactions', 'payment_type')) {
                $table->dropColumn('payment_type');
            }
            if (Schema::hasColumn('billing_transactions', 'total_amount')) {
                $table->dropColumn('total_amount');
            }
            if (Schema::hasColumn('billing_transactions', 'discount_amount')) {
                $table->dropColumn('discount_amount');
            }
            if (Schema::hasColumn('billing_transactions', 'discount_percentage')) {
                $table->dropColumn('discount_percentage');
            }
            if (Schema::hasColumn('billing_transactions', 'hmo_provider')) {
                $table->dropColumn('hmo_provider');
            }
            if (Schema::hasColumn('billing_transactions', 'hmo_reference')) {
                $table->dropColumn('hmo_reference');
            }
            if (Schema::hasColumn('billing_transactions', 'payment_reference')) {
                $table->dropColumn('payment_reference');
            }
            if (Schema::hasColumn('billing_transactions', 'description')) {
                $table->dropColumn('description');
            }
            if (Schema::hasColumn('billing_transactions', 'transaction_date')) {
                $table->dropColumn('transaction_date');
            }
            if (Schema::hasColumn('billing_transactions', 'transaction_date_only')) {
                $table->dropColumn('transaction_date_only');
            }
            if (Schema::hasColumn('billing_transactions', 'transaction_time_only')) {
                $table->dropColumn('transaction_time_only');
            }
            if (Schema::hasColumn('billing_transactions', 'due_date')) {
                $table->dropColumn('due_date');
            }
            if (Schema::hasColumn('billing_transactions', 'created_by')) {
                $table->dropColumn('created_by');
            }
            if (Schema::hasColumn('billing_transactions', 'updated_by')) {
                $table->dropColumn('updated_by');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is irreversible as we're cleaning up old columns
        // The old columns should not be restored
    }
};