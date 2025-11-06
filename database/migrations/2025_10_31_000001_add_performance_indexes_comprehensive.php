<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Comprehensive performance indexes for all frequently queried tables
     */
    public function up(): void
    {
        // ============================================
        // APPOINTMENTS TABLE INDEXES
        // ============================================
        if (Schema::hasTable('appointments')) {
            Schema::table('appointments', function (Blueprint $table) {
                // Single column indexes
                if (!$this->indexExists('appointments', 'appointments_patient_id_index')) {
                    $table->index('patient_id', 'appointments_patient_id_index');
                }
                if (!$this->indexExists('appointments', 'appointments_specialist_id_index')) {
                    $table->index('specialist_id', 'appointments_specialist_id_index');
                }
                if (!$this->indexExists('appointments', 'appointments_status_index')) {
                    $table->index('status', 'appointments_status_index');
                }
                if (!$this->indexExists('appointments', 'appointments_appointment_date_index')) {
                    $table->index('appointment_date', 'appointments_appointment_date_index');
                }
                if (!$this->indexExists('appointments', 'appointments_appointment_type_index')) {
                    $table->index('appointment_type', 'appointments_appointment_type_index');
                }
                if (!$this->indexExists('appointments', 'appointments_source_index')) {
                    $table->index('source', 'appointments_source_index');
                }
                if (!$this->indexExists('appointments', 'appointments_billing_status_index')) {
                    $table->index('billing_status', 'appointments_billing_status_index');
                }

                // Composite indexes for common query patterns
                if (!$this->indexExists('appointments', 'appointments_patient_id_status_index')) {
                    $table->index(['patient_id', 'status'], 'appointments_patient_id_status_index');
                }
                if (!$this->indexExists('appointments', 'appointments_appointment_date_status_index')) {
                    $table->index(['appointment_date', 'status'], 'appointments_appointment_date_status_index');
                }
                if (!$this->indexExists('appointments', 'appointments_specialist_id_date_index')) {
                    $table->index(['specialist_id', 'appointment_date'], 'appointments_specialist_id_date_index');
                }
                if (!$this->indexExists('appointments', 'appointments_date_status_type_index')) {
                    $table->index(['appointment_date', 'status', 'appointment_type'], 'appointments_date_status_type_index');
                }
            });
        }

        // ============================================
        // BILLING TRANSACTIONS TABLE INDEXES
        // ============================================
        if (Schema::hasTable('billing_transactions')) {
            Schema::table('billing_transactions', function (Blueprint $table) {
                // Single column indexes
                if (!$this->indexExists('billing_transactions', 'billing_transactions_patient_id_index')) {
                    $table->index('patient_id', 'billing_transactions_patient_id_index');
                }
                if (!$this->indexExists('billing_transactions', 'billing_transactions_doctor_id_index')) {
                    $table->index('doctor_id', 'billing_transactions_doctor_id_index');
                }
                if (!$this->indexExists('billing_transactions', 'billing_transactions_status_index')) {
                    $table->index('status', 'billing_transactions_status_index');
                }
                if (!$this->indexExists('billing_transactions', 'billing_transactions_payment_method_index')) {
                    $table->index('payment_method', 'billing_transactions_payment_method_index');
                }
                if (!$this->indexExists('billing_transactions', 'billing_transactions_transaction_date_index')) {
                    $table->index('transaction_date', 'billing_transactions_transaction_date_index');
                }
                if (!$this->indexExists('billing_transactions', 'billing_transactions_appointment_id_index')) {
                    $table->index('appointment_id', 'billing_transactions_appointment_id_index');
                }

                // Composite indexes for filtering and reporting
                if (!$this->indexExists('billing_transactions', 'billing_transactions_date_status_index')) {
                    $table->index(['transaction_date', 'status'], 'billing_transactions_date_status_index');
                }
                if (!$this->indexExists('billing_transactions', 'billing_transactions_doctor_date_index')) {
                    $table->index(['doctor_id', 'transaction_date'], 'billing_transactions_doctor_date_index');
                }
                if (!$this->indexExists('billing_transactions', 'billing_transactions_status_method_index')) {
                    $table->index(['status', 'payment_method'], 'billing_transactions_status_method_index');
                }
            });
        }

        // ============================================
        // PENDING APPOINTMENTS TABLE INDEXES
        // ============================================
        if (Schema::hasTable('pending_appointments')) {
            Schema::table('pending_appointments', function (Blueprint $table) {
                if (!$this->indexExists('pending_appointments', 'pending_appointments_patient_id_index')) {
                    $table->index('patient_id', 'pending_appointments_patient_id_index');
                }
                if (!$this->indexExists('pending_appointments', 'pending_appointments_specialist_id_index')) {
                    $table->index('specialist_id', 'pending_appointments_specialist_id_index');
                }
                if (!$this->indexExists('pending_appointments', 'pending_appointments_status_approval_index')) {
                    $table->index('status_approval', 'pending_appointments_status_approval_index');
                }
                if (!$this->indexExists('pending_appointments', 'pending_appointments_appointment_date_index')) {
                    $table->index('appointment_date', 'pending_appointments_appointment_date_index');
                }
                if (!$this->indexExists('pending_appointments', 'pending_appointments_patient_status_index')) {
                    $table->index(['patient_id', 'status_approval'], 'pending_appointments_patient_status_index');
                }
            });
        }

        // ============================================
        // PATIENTS TABLE INDEXES
        // ============================================
        if (Schema::hasTable('patients')) {
            Schema::table('patients', function (Blueprint $table) {
                if (!$this->indexExists('patients', 'patients_user_id_index')) {
                    $table->index('user_id', 'patients_user_id_index');
                }
                if (!$this->indexExists('patients', 'patients_patient_no_index')) {
                    $table->index('patient_no', 'patients_patient_no_index');
                }
                if (!$this->indexExists('patients', 'patients_status_index')) {
                    $table->index('status', 'patients_status_index');
                }
                // Composite index for patient lookup
                if (!$this->indexExists('patients', 'patients_first_last_name_index')) {
                    $table->index(['first_name', 'last_name'], 'patients_first_last_name_index');
                }
            });
        }

        // ============================================
        // USERS TABLE INDEXES (if not already exists)
        // ============================================
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (!$this->indexExists('users', 'users_role_index')) {
                    $table->index('role', 'users_role_index');
                }
                if (!$this->indexExists('users', 'users_is_active_index')) {
                    $table->index('is_active', 'users_is_active_index');
                }
                // Composite for common role + active queries
                if (!$this->indexExists('users', 'users_role_active_index')) {
                    $table->index(['role', 'is_active'], 'users_role_active_index');
                }
            });
        }

        // ============================================
        // APPOINTMENT BILLING LINKS INDEXES
        // ============================================
        if (Schema::hasTable('appointment_billing_links')) {
            Schema::table('appointment_billing_links', function (Blueprint $table) {
                if (!$this->indexExists('appointment_billing_links', 'appointment_billing_links_appointment_id_index')) {
                    $table->index('appointment_id', 'appointment_billing_links_appointment_id_index');
                }
                if (!$this->indexExists('appointment_billing_links', 'appointment_billing_links_billing_transaction_id_index')) {
                    $table->index('billing_transaction_id', 'appointment_billing_links_billing_transaction_id_index');
                }
            });
        }

        // ============================================
        // DAILY TRANSACTIONS INDEXES
        // ============================================
        if (Schema::hasTable('daily_transactions')) {
            Schema::table('daily_transactions', function (Blueprint $table) {
                if (!$this->indexExists('daily_transactions', 'daily_transactions_date_index')) {
                    $table->index('date', 'daily_transactions_date_index');
                }
                if (!$this->indexExists('daily_transactions', 'daily_transactions_status_index')) {
                    $table->index('status', 'daily_transactions_status_index');
                }
                if (!$this->indexExists('daily_transactions', 'daily_transactions_date_status_index')) {
                    $table->index(['date', 'status'], 'daily_transactions_date_status_index');
                }
            });
        }

        // ============================================
        // LAB TESTS INDEXES
        // ============================================
        if (Schema::hasTable('lab_tests')) {
            Schema::table('lab_tests', function (Blueprint $table) {
                if (!$this->indexExists('lab_tests', 'lab_tests_status_index')) {
                    $table->index('status', 'lab_tests_status_index');
                }
                if (!$this->indexExists('lab_tests', 'lab_tests_category_index')) {
                    $table->index('category', 'lab_tests_category_index');
                }
            });
        }

        // ============================================
        // NOTIFICATIONS INDEXES
        // ============================================
        if (Schema::hasTable('notifications')) {
            Schema::table('notifications', function (Blueprint $table) {
                if (!$this->indexExists('notifications', 'notifications_user_id_index')) {
                    $table->index('user_id', 'notifications_user_id_index');
                }
                if (!$this->indexExists('notifications', 'notifications_read_index')) {
                    $table->index('read', 'notifications_read_index');
                }
                if (!$this->indexExists('notifications', 'notifications_type_index')) {
                    $table->index('type', 'notifications_type_index');
                }
                // Composite for common notification queries
                if (!$this->indexExists('notifications', 'notifications_user_read_index')) {
                    $table->index(['user_id', 'read'], 'notifications_user_read_index');
                }
            });
        }

        // ============================================
        // PATIENT TRANSFERS INDEXES
        // ============================================
        if (Schema::hasTable('patient_transfers')) {
            Schema::table('patient_transfers', function (Blueprint $table) {
                if (!$this->indexExists('patient_transfers', 'patient_transfers_patient_id_index')) {
                    $table->index('patient_id', 'patient_transfers_patient_id_index');
                }
                if (!$this->indexExists('patient_transfers', 'patient_transfers_status_index')) {
                    $table->index('status', 'patient_transfers_status_index');
                }
                if (!$this->indexExists('patient_transfers', 'patient_transfers_approval_status_index')) {
                    $table->index('approval_status', 'patient_transfers_approval_status_index');
                }
                if (!$this->indexExists('patient_transfers', 'patient_transfers_requested_by_index')) {
                    $table->index('requested_by', 'patient_transfers_requested_by_index');
                }
            });
        }

        echo "✅ Performance indexes added successfully!\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: Dropping indexes can be done, but we'll keep them for safety
        // If you need to rollback, uncomment the sections below

        /*
        if (Schema::hasTable('appointments')) {
            Schema::table('appointments', function (Blueprint $table) {
                $table->dropIndex('appointments_patient_id_index');
                $table->dropIndex('appointments_specialist_id_index');
                $table->dropIndex('appointments_status_index');
                $table->dropIndex('appointments_appointment_date_index');
                // ... drop other indexes
            });
        }
        */
    }

    /**
     * Check if an index exists
     */
    private function indexExists($table, $indexName): bool
    {
        try {
            $indexes = DB::select("SHOW INDEX FROM `{$table}` WHERE Key_name = ?", [$indexName]);
            return count($indexes) > 0;
        } catch (\Exception $e) {
            // Table might not exist or other error
            return false;
        }
    }
};

