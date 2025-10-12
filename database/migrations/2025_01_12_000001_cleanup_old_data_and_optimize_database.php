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
        // Clean up old/unused data and optimize database structure
        
        // 1. Clean up old test data and unused records
        $this->cleanupOldData();
        
        // 2. Remove unused tables (if any)
        $this->removeUnusedTables();
        
        // 3. Optimize existing tables
        $this->optimizeTables();
        
        // 4. Ensure proper foreign key relationships
        $this->fixForeignKeys();
        
        // 5. Clean up orphaned records
        $this->cleanupOrphanedRecords();
    }

    /**
     * Clean up old test data and unused records
     */
    private function cleanupOldData()
    {
        // Clean up old test data from patients table
        try {
            DB::statement("
                DELETE FROM patients 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR)
                AND (first_name LIKE '%test%' OR last_name LIKE '%test%' OR patient_no LIKE '%TEST%')
            ");
        } catch (\Exception $e) {
            echo "Could not clean patients: " . $e->getMessage() . "\n";
        }

        // Clean up old test appointments
        try {
            DB::statement("
                DELETE FROM appointments 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH)
                AND (patient_name LIKE '%test%' OR specialist_name LIKE '%test%')
            ");
        } catch (\Exception $e) {
            echo "Could not clean appointments: " . $e->getMessage() . "\n";
        }

        // Clean up old test lab orders
        try {
            DB::statement("
                DELETE FROM lab_orders 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH)
                AND patient_id IN (
                    SELECT id FROM patients 
                    WHERE first_name LIKE '%test%' OR last_name LIKE '%test%'
                )
            ");
        } catch (\Exception $e) {
            echo "Could not clean lab orders: " . $e->getMessage() . "\n";
        }

        // Clean up old test billing transactions
        try {
            DB::statement("
                DELETE FROM billing_transactions 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH)
                AND (description LIKE '%test%' OR transaction_id LIKE '%TEST%')
            ");
        } catch (\Exception $e) {
            echo "Could not clean billing transactions: " . $e->getMessage() . "\n";
        }

        // Clean up old notifications
        try {
            DB::statement("
                DELETE FROM notifications 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH)
            ");
        } catch (\Exception $e) {
            echo "Could not clean notifications: " . $e->getMessage() . "\n";
        }

        // Clean up old daily transactions
        try {
            DB::statement("
                DELETE FROM daily_transactions 
                WHERE transaction_date < DATE_SUB(NOW(), INTERVAL 1 YEAR)
            ");
        } catch (\Exception $e) {
            echo "Could not clean daily transactions: " . $e->getMessage() . "\n";
        }
    }

    /**
     * Remove unused tables
     */
    private function removeUnusedTables()
    {
        // List of potentially unused tables to check and remove
        $unusedTables = [
            'inventory_products', // Replaced by inventory_items
            'inventory_suppliers', // No longer used
            'inventory_stock_levels', // Replaced by inventory_movements
            'doctors_payment', // Old table name
            'doctor_summary_reports', // If not used
        ];

        foreach ($unusedTables as $table) {
            if (Schema::hasTable($table)) {
                // Check if table has any data
                $count = DB::table($table)->count();
                if ($count == 0) {
                    Schema::dropIfExists($table);
                    echo "Dropped unused table: {$table}\n";
                } else {
                    echo "Table {$table} has {$count} records, keeping it\n";
                }
            }
        }
    }

    /**
     * Optimize existing tables
     */
    private function optimizeTables()
    {
        // Add missing indexes for better performance
        $this->addMissingIndexes();
        
        // Update table statistics
        DB::statement("ANALYZE TABLE patients");
        DB::statement("ANALYZE TABLE appointments");
        DB::statement("ANALYZE TABLE lab_orders");
        DB::statement("ANALYZE TABLE billing_transactions");
        DB::statement("ANALYZE TABLE inventory_items");
        DB::statement("ANALYZE TABLE inventory_movements");
        DB::statement("ANALYZE TABLE users");
    }

    /**
     * Add missing indexes for better performance
     */
    private function addMissingIndexes()
    {
        // Add indexes for better query performance
        $indexes = [
            // Patients table
            ['table' => 'patients', 'columns' => ['created_at'], 'name' => 'patients_created_at_index'],
            ['table' => 'patients', 'columns' => ['sex', 'age'], 'name' => 'patients_sex_age_index'],
            ['table' => 'patients', 'columns' => ['patient_no'], 'name' => 'patients_patient_no_index'],
            
            // Appointments table
            ['table' => 'appointments', 'columns' => ['appointment_date', 'status'], 'name' => 'appointments_date_status_index'],
            ['table' => 'appointments', 'columns' => ['specialist_id', 'appointment_date'], 'name' => 'appointments_specialist_date_index'],
            ['table' => 'appointments', 'columns' => ['patient_id'], 'name' => 'appointments_patient_id_index'],
            
            // Lab orders table
            ['table' => 'lab_orders', 'columns' => ['created_at', 'status'], 'name' => 'lab_orders_created_status_index'],
            ['table' => 'lab_orders', 'columns' => ['patient_id', 'status'], 'name' => 'lab_orders_patient_status_index'],
            
            // Billing transactions table
            ['table' => 'billing_transactions', 'columns' => ['transaction_date', 'status'], 'name' => 'billing_transactions_date_status_index'],
            ['table' => 'billing_transactions', 'columns' => ['patient_id', 'status'], 'name' => 'billing_transactions_patient_status_index'],
            ['table' => 'billing_transactions', 'columns' => ['doctor_id', 'transaction_date'], 'name' => 'billing_transactions_doctor_date_index'],
            
            // Inventory items table
            ['table' => 'inventory_items', 'columns' => ['category'], 'name' => 'inventory_items_category_index'],
            ['table' => 'inventory_items', 'columns' => ['current_stock'], 'name' => 'inventory_items_stock_index'],
            
            // Inventory movements table
            ['table' => 'inventory_movements', 'columns' => ['created_at'], 'name' => 'inventory_movements_created_index'],
            ['table' => 'inventory_movements', 'columns' => ['inventory_item_id', 'created_at'], 'name' => 'inventory_movements_item_date_index'],
            
            // Users table
            ['table' => 'users', 'columns' => ['role'], 'name' => 'users_role_index'],
            ['table' => 'users', 'columns' => ['created_at'], 'name' => 'users_created_index'],
        ];

        foreach ($indexes as $index) {
            try {
                if (!$this->indexExists($index['table'], $index['name'])) {
                    Schema::table($index['table'], function (Blueprint $table) use ($index) {
                        $table->index($index['columns'], $index['name']);
                    });
                }
            } catch (\Exception $e) {
                // Index might already exist or table might not exist
                echo "Could not add index {$index['name']}: " . $e->getMessage() . "\n";
            }
        }
    }

    /**
     * Fix foreign key relationships
     */
    private function fixForeignKeys()
    {
        // Ensure all foreign key constraints are properly set
        $this->fixPatientUserRelationship();
        $this->fixBillingTransactionRelationships();
        $this->fixAppointmentRelationships();
        $this->fixLabOrderRelationships();
    }

    /**
     * Fix patient-user relationship
     */
    private function fixPatientUserRelationship()
    {
        // Update patients with invalid user_id
        DB::statement("
            UPDATE patients 
            SET user_id = NULL 
            WHERE user_id NOT IN (SELECT id FROM users WHERE deleted_at IS NULL)
        ");
    }

    /**
     * Fix billing transaction relationships
     */
    private function fixBillingTransactionRelationships()
    {
        // Update billing transactions with invalid patient_id
        DB::statement("
            UPDATE billing_transactions 
            SET patient_id = NULL 
            WHERE patient_id NOT IN (SELECT id FROM patients WHERE deleted_at IS NULL)
        ");

        // Update billing transactions with invalid doctor_id
        DB::statement("
            UPDATE billing_transactions 
            SET doctor_id = NULL 
            WHERE doctor_id NOT IN (SELECT id FROM users WHERE deleted_at IS NULL)
        ");
    }

    /**
     * Fix appointment relationships
     */
    private function fixAppointmentRelationships()
    {
        // Update appointments with invalid patient_id
        DB::statement("
            UPDATE appointments 
            SET patient_id = NULL 
            WHERE patient_id NOT IN (SELECT id FROM patients WHERE deleted_at IS NULL)
        ");
    }

    /**
     * Fix lab order relationships
     */
    private function fixLabOrderRelationships()
    {
        // Update lab orders with invalid patient_id
        DB::statement("
            UPDATE lab_orders 
            SET patient_id = NULL 
            WHERE patient_id NOT IN (SELECT id FROM patients WHERE deleted_at IS NULL)
        ");

        // Update lab orders with invalid ordered_by
        DB::statement("
            UPDATE lab_orders 
            SET ordered_by = NULL 
            WHERE ordered_by NOT IN (SELECT id FROM users WHERE deleted_at IS NULL)
        ");
    }

    /**
     * Clean up orphaned records
     */
    private function cleanupOrphanedRecords()
    {
        // Clean up orphaned appointment billing links
        DB::statement("
            DELETE FROM appointment_billing_links 
            WHERE appointment_id NOT IN (SELECT id FROM appointments WHERE deleted_at IS NULL)
        ");

        DB::statement("
            DELETE FROM appointment_billing_links 
            WHERE billing_transaction_id NOT IN (SELECT id FROM billing_transactions WHERE deleted_at IS NULL)
        ");

        // Clean up orphaned doctor payment billing links
        DB::statement("
            DELETE FROM doctor_payment_billing_links 
            WHERE doctor_payment_id NOT IN (SELECT id FROM doctor_payments WHERE deleted_at IS NULL)
        ");

        DB::statement("
            DELETE FROM doctor_payment_billing_links 
            WHERE billing_transaction_id NOT IN (SELECT id FROM billing_transactions WHERE deleted_at IS NULL)
        ");

        // Clean up orphaned lab results
        DB::statement("
            DELETE FROM lab_results 
            WHERE lab_order_id NOT IN (SELECT id FROM lab_orders WHERE deleted_at IS NULL)
        ");

        // Clean up orphaned lab result values
        DB::statement("
            DELETE FROM lab_result_values 
            WHERE lab_result_id NOT IN (SELECT id FROM lab_results WHERE deleted_at IS NULL)
        ");

        // Clean up orphaned inventory movements
        DB::statement("
            DELETE FROM inventory_movements 
            WHERE inventory_item_id NOT IN (SELECT id FROM inventory_items WHERE deleted_at IS NULL)
        ");

        // Clean up orphaned patient visits
        DB::statement("
            DELETE FROM patient_visits 
            WHERE patient_id NOT IN (SELECT id FROM patients WHERE deleted_at IS NULL)
        ");

        // Clean up orphaned patient transfers
        DB::statement("
            DELETE FROM patient_transfers 
            WHERE patient_id NOT IN (SELECT id FROM patients WHERE deleted_at IS NULL)
        ");
    }

    /**
     * Check if an index exists on a table
     */
    private function indexExists($table, $indexName)
    {
        try {
            $indexes = DB::select("SHOW INDEX FROM {$table}");
            foreach ($indexes as $index) {
                if ($index->Key_name === $indexName) {
                    return true;
                }
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is not reversible as it involves data cleanup
        echo "This migration cannot be reversed as it involves data cleanup.\n";
    }
};
