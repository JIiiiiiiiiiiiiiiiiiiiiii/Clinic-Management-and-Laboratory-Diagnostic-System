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
        // Fix foreign key constraints in reports table
        Schema::table('reports', function (Blueprint $table) {
            // Drop existing foreign keys if they exist
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
        });

        // Recreate foreign keys with proper constraints
        Schema::table('reports', function (Blueprint $table) {
            $table->foreign('created_by')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade')
                  ->onUpdate('cascade');
                  
            $table->foreign('updated_by')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null')
                  ->onUpdate('cascade');
        });

        // Add missing indexes for better query performance (check if they exist first)
        try {
            Schema::table('billing_transactions', function (Blueprint $table) {
                if (!$this->indexExists('billing_transactions', 'billing_transactions_transaction_date_status_index')) {
                    $table->index(['transaction_date', 'status']);
                }
                if (!$this->indexExists('billing_transactions', 'billing_transactions_patient_id_status_index')) {
                    $table->index(['patient_id', 'status']);
                }
                if (!$this->indexExists('billing_transactions', 'billing_transactions_doctor_id_transaction_date_index')) {
                    $table->index(['doctor_id', 'transaction_date']);
                }
            });
        } catch (\Exception $e) {
            // Indexes might already exist, continue
        }

        try {
            Schema::table('appointments', function (Blueprint $table) {
                if (!$this->indexExists('appointments', 'appointments_appointment_date_status_index')) {
                    $table->index(['appointment_date', 'status']);
                }
                if (!$this->indexExists('appointments', 'appointments_specialist_id_appointment_date_index')) {
                    $table->index(['specialist_id', 'appointment_date']);
                }
            });
        } catch (\Exception $e) {
            // Indexes might already exist, continue
        }

        try {
            Schema::table('lab_orders', function (Blueprint $table) {
                if (!$this->indexExists('lab_orders', 'lab_orders_created_at_status_index')) {
                    $table->index(['created_at', 'status']);
                }
                if (!$this->indexExists('lab_orders', 'lab_orders_patient_id_status_index')) {
                    $table->index(['patient_id', 'status']);
                }
            });
        } catch (\Exception $e) {
            // Indexes might already exist, continue
        }

        try {
            Schema::table('patients', function (Blueprint $table) {
                if (!$this->indexExists('patients', 'patients_created_at_index')) {
                    $table->index(['created_at']);
                }
                if (!$this->indexExists('patients', 'patients_sex_age_index')) {
                    $table->index(['sex', 'age']);
                }
            });
        } catch (\Exception $e) {
            // Indexes might already exist, continue
        }

        // Fix data inconsistencies in billing_transactions
        DB::statement("
            UPDATE billing_transactions 
            SET patient_id = NULL 
            WHERE patient_id NOT IN (SELECT id FROM patients WHERE deleted_at IS NULL)
        ");

        // Ensure all foreign key constraints are properly set
        DB::statement("SET FOREIGN_KEY_CHECKS = 0");
        
        // Fix any orphaned records (only if tables exist)
        if (Schema::hasTable('appointment_billing_links')) {
            DB::statement("
                DELETE FROM appointment_billing_links 
                WHERE appointment_id NOT IN (SELECT id FROM appointments WHERE deleted_at IS NULL)
            ");
            
            DB::statement("
                DELETE FROM appointment_billing_links 
                WHERE billing_transaction_id NOT IN (SELECT id FROM billing_transactions WHERE deleted_at IS NULL)
            ");
        }
        
        DB::statement("SET FOREIGN_KEY_CHECKS = 1");
    }

    /**
     * Check if an index exists on a table
     */
    private function indexExists($table, $indexName)
    {
        $indexes = DB::select("SHOW INDEX FROM {$table}");
        foreach ($indexes as $index) {
            if ($index->Key_name === $indexName) {
                return true;
            }
        }
        return false;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the indexes
        Schema::table('billing_transactions', function (Blueprint $table) {
            $table->dropIndex(['transaction_date', 'status']);
            $table->dropIndex(['patient_id', 'status']);
            $table->dropIndex(['doctor_id', 'transaction_date']);
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex(['appointment_date', 'status']);
            $table->dropIndex(['specialist_id', 'appointment_date']);
        });

        Schema::table('lab_orders', function (Blueprint $table) {
            $table->dropIndex(['created_at', 'status']);
            $table->dropIndex(['patient_id', 'status']);
        });

        Schema::table('patients', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
            $table->dropIndex(['sex', 'age']);
        });
    }
};
