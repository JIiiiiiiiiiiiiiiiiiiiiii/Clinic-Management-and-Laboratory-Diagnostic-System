<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Check if an index exists on a table
     */
    private function indexExists(string $table, string $index): bool
    {
        $indexes = \DB::select("SHOW INDEX FROM {$table}");
        foreach ($indexes as $idx) {
            if ($idx->Key_name === $index) {
                return true;
            }
        }
        return false;
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Optimize patients table
        Schema::table('patients', function (Blueprint $table) {
            if (!$this->indexExists('patients', 'patients_created_at_sex_index')) {
                $table->index(['created_at', 'sex']);
            }
            if (!$this->indexExists('patients', 'patients_first_name_last_name_index')) {
                $table->index(['first_name', 'last_name']);
            }
            // Note: patient_id column may not exist, check first
            if (Schema::hasColumn('patients', 'patient_id') && !$this->indexExists('patients', 'patients_patient_id_index')) {
                $table->index('patient_id');
            }
        });

        // Optimize appointments table
        Schema::table('appointments', function (Blueprint $table) {
            // Check if indexes don't exist before adding them
            if (!$this->indexExists('appointments', 'appointments_appointment_date_appointment_time_index')) {
                $table->index(['appointment_date', 'appointment_time']);
            }
            if (!$this->indexExists('appointments', 'appointments_status_appointment_date_index')) {
                $table->index(['status', 'appointment_date']);
            }
            if (!$this->indexExists('appointments', 'appointments_specialist_id_appointment_date_index')) {
                $table->index(['specialist_id', 'appointment_date']);
            }
            if (!$this->indexExists('appointments', 'appointments_patient_id_status_index')) {
                $table->index(['patient_id', 'status']);
            }
            if (!$this->indexExists('appointments', 'appointments_billing_status_appointment_date_index')) {
                $table->index(['billing_status', 'appointment_date']);
            }
        });

        // Optimize billing_transactions table
        Schema::table('billing_transactions', function (Blueprint $table) {
            if (!$this->indexExists('billing_transactions', 'billing_transactions_transaction_date_status_index')) {
                $table->index(['transaction_date', 'status']);
            }
            if (!$this->indexExists('billing_transactions', 'billing_transactions_patient_id_transaction_date_index')) {
                $table->index(['patient_id', 'transaction_date']);
            }
            if (!$this->indexExists('billing_transactions', 'billing_transactions_doctor_id_transaction_date_index')) {
                $table->index(['doctor_id', 'transaction_date']);
            }
            if (!$this->indexExists('billing_transactions', 'billing_transactions_payment_method_transaction_date_index')) {
                $table->index(['payment_method', 'transaction_date']);
            }
            if (!$this->indexExists('billing_transactions', 'billing_transactions_hmo_provider_transaction_date_index')) {
                $table->index(['hmo_provider', 'transaction_date']);
            }
            if (!$this->indexExists('billing_transactions', 'billing_transactions_status_transaction_date_index')) {
                $table->index(['status', 'transaction_date']);
            }
        });

        // Optimize lab_orders table
        Schema::table('lab_orders', function (Blueprint $table) {
            if (!$this->indexExists('lab_orders', 'lab_orders_patient_id_created_at_index')) {
                $table->index(['patient_id', 'created_at']);
            }
            if (!$this->indexExists('lab_orders', 'lab_orders_status_created_at_index')) {
                $table->index(['status', 'created_at']);
            }
            if (!$this->indexExists('lab_orders', 'lab_orders_created_at_status_index')) {
                $table->index(['created_at', 'status']);
            }
        });

        // Optimize lab_results table
        Schema::table('lab_results', function (Blueprint $table) {
            if (!$this->indexExists('lab_results', 'lab_results_lab_order_id_created_at_index')) {
                $table->index(['lab_order_id', 'created_at']);
            }
            if (!$this->indexExists('lab_results', 'lab_results_lab_test_id_created_at_index')) {
                $table->index(['lab_test_id', 'created_at']);
            }
            if (!$this->indexExists('lab_results', 'lab_results_verified_by_created_at_index')) {
                $table->index(['verified_by', 'created_at']);
            }
        });

        // Optimize supply_transactions table
        Schema::table('supply_transactions', function (Blueprint $table) {
            if (!$this->indexExists('supply_transactions', 'supply_transactions_product_id_transaction_date_index')) {
                $table->index(['product_id', 'transaction_date']);
            }
            if (!$this->indexExists('supply_transactions', 'supply_transactions_type_transaction_date_index')) {
                $table->index(['type', 'transaction_date']);
            }
            if (!$this->indexExists('supply_transactions', 'supply_transactions_subtype_transaction_date_index')) {
                $table->index(['subtype', 'transaction_date']);
            }
            if (!$this->indexExists('supply_transactions', 'supply_transactions_user_id_transaction_date_index')) {
                $table->index(['user_id', 'transaction_date']);
            }
            if (!$this->indexExists('supply_transactions', 'supply_transactions_lot_number_expiry_date_index')) {
                $table->index(['lot_number', 'expiry_date']);
            }
        });

        // Optimize supply_stock_levels table
        Schema::table('supply_stock_levels', function (Blueprint $table) {
            if (!$this->indexExists('supply_stock_levels', 'supply_stock_levels_product_id_current_stock_index')) {
                $table->index(['product_id', 'current_stock']);
            }
            if (!$this->indexExists('supply_stock_levels', 'supply_stock_levels_expiry_date_current_stock_index')) {
                $table->index(['expiry_date', 'current_stock']);
            }
            if (!$this->indexExists('supply_stock_levels', 'supply_stock_levels_is_expired_is_near_expiry_index')) {
                $table->index(['is_expired', 'is_near_expiry']);
            }
        });

        // Optimize notifications table
        Schema::table('notifications', function (Blueprint $table) {
            if (!$this->indexExists('notifications', 'notifications_user_id_read_created_at_index')) {
                $table->index(['user_id', 'read', 'created_at']);
            }
            if (!$this->indexExists('notifications', 'notifications_type_created_at_index')) {
                $table->index(['type', 'created_at']);
            }
            if (!$this->indexExists('notifications', 'notifications_related_type_related_id_index')) {
                $table->index(['related_type', 'related_id']);
            }
        });

        // Optimize patient_transfers table
        Schema::table('patient_transfers', function (Blueprint $table) {
            if (!$this->indexExists('patient_transfers', 'patient_transfers_patient_id_status_index')) {
                $table->index(['patient_id', 'status']);
            }
            if (!$this->indexExists('patient_transfers', 'patient_transfers_status_priority_index')) {
                $table->index(['status', 'priority']);
            }
            if (!$this->indexExists('patient_transfers', 'patient_transfers_transferred_by_created_at_index')) {
                $table->index(['transferred_by', 'created_at']);
            }
            if (!$this->indexExists('patient_transfers', 'patient_transfers_created_at_status_index')) {
                $table->index(['created_at', 'status']);
            }
        });

        // Optimize clinic_procedures table
        Schema::table('clinic_procedures', function (Blueprint $table) {
            if (!$this->indexExists('clinic_procedures', 'clinic_procedures_category_is_active_index')) {
                $table->index(['category', 'is_active']);
            }
            if (!$this->indexExists('clinic_procedures', 'clinic_procedures_subcategory_is_active_index')) {
                $table->index(['subcategory', 'is_active']);
            }
            if (!$this->indexExists('clinic_procedures', 'clinic_procedures_is_active_sort_order_index')) {
                $table->index(['is_active', 'sort_order']);
            }
            if (!$this->indexExists('clinic_procedures', 'clinic_procedures_is_emergency_is_active_index')) {
                $table->index(['is_emergency', 'is_active']);
            }
        });

        // Optimize users table
        Schema::table('users', function (Blueprint $table) {
            if (!$this->indexExists('users', 'users_role_is_active_index')) {
                $table->index(['role', 'is_active']);
            }
            if (!$this->indexExists('users', 'users_is_active_role_index')) {
                $table->index(['is_active', 'role']);
            }
            if (!$this->indexExists('users', 'users_employee_id_index')) {
                $table->index(['employee_id']);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove indexes from patients table
        Schema::table('patients', function (Blueprint $table) {
            $table->dropIndex(['created_at', 'sex']);
            $table->dropIndex(['first_name', 'last_name']);
            $table->dropIndex(['patient_id']);
        });

        // Remove indexes from appointments table
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex(['appointment_date', 'appointment_time']);
            $table->dropIndex(['status', 'appointment_date']);
            $table->dropIndex(['specialist_id', 'appointment_date']);
            $table->dropIndex(['patient_id', 'status']);
            $table->dropIndex(['billing_status', 'appointment_date']);
        });

        // Remove indexes from billing_transactions table
        Schema::table('billing_transactions', function (Blueprint $table) {
            $table->dropIndex(['transaction_date', 'status']);
            $table->dropIndex(['patient_id', 'transaction_date']);
            $table->dropIndex(['doctor_id', 'transaction_date']);
            $table->dropIndex(['payment_method', 'transaction_date']);
            $table->dropIndex(['hmo_provider', 'transaction_date']);
            $table->dropIndex(['status', 'transaction_date']);
        });

        // Remove indexes from lab_orders table
        Schema::table('lab_orders', function (Blueprint $table) {
            $table->dropIndex(['patient_id', 'created_at']);
            $table->dropIndex(['status', 'created_at']);
            $table->dropIndex(['created_at', 'status']);
        });

        // Remove indexes from lab_results table
        Schema::table('lab_results', function (Blueprint $table) {
            $table->dropIndex(['lab_order_id', 'created_at']);
            $table->dropIndex(['lab_test_id', 'created_at']);
            $table->dropIndex(['verified_by', 'created_at']);
        });

        // Remove indexes from supply_transactions table
        Schema::table('supply_transactions', function (Blueprint $table) {
            $table->dropIndex(['product_id', 'transaction_date']);
            $table->dropIndex(['type', 'transaction_date']);
            $table->dropIndex(['subtype', 'transaction_date']);
            $table->dropIndex(['user_id', 'transaction_date']);
            $table->dropIndex(['lot_number', 'expiry_date']);
        });

        // Remove indexes from supply_stock_levels table
        Schema::table('supply_stock_levels', function (Blueprint $table) {
            $table->dropIndex(['product_id', 'current_stock']);
            $table->dropIndex(['expiry_date', 'current_stock']);
            $table->dropIndex(['is_expired', 'is_near_expiry']);
        });

        // Remove indexes from notifications table
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['user_id', 'read', 'created_at']);
            $table->dropIndex(['type', 'created_at']);
            $table->dropIndex(['related_type', 'related_id']);
        });

        // Remove indexes from patient_transfers table
        Schema::table('patient_transfers', function (Blueprint $table) {
            $table->dropIndex(['patient_id', 'status']);
            $table->dropIndex(['status', 'priority']);
            $table->dropIndex(['transferred_by', 'created_at']);
            $table->dropIndex(['created_at', 'status']);
        });

        // Remove indexes from clinic_procedures table
        Schema::table('clinic_procedures', function (Blueprint $table) {
            $table->dropIndex(['category', 'is_active']);
            $table->dropIndex(['subcategory', 'is_active']);
            $table->dropIndex(['is_active', 'sort_order']);
            $table->dropIndex(['is_emergency', 'is_active']);
        });

        // Remove indexes from users table
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role', 'is_active']);
            $table->dropIndex(['is_active', 'role']);
            $table->dropIndex(['employee_id']);
        });
    }
};
