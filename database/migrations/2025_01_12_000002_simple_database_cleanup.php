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
        $this->command->info('Starting simple database cleanup...');

        // 1. Clean up old test data
        $this->cleanupTestData();

        // 2. Fix data inconsistencies
        $this->fixDataInconsistencies();

        // 3. Add essential indexes
        $this->addEssentialIndexes();

        $this->command->info('Database cleanup completed!');
    }

    /**
     * Clean up test data
     */
    private function cleanupTestData()
    {
        $this->command->info('Cleaning up test data...');

        try {
            // Clean up test patients
            $deletedPatients = DB::table('patients')
                ->where('first_name', 'like', '%test%')
                ->orWhere('last_name', 'like', '%test%')
                ->orWhere('patient_no', 'like', '%TEST%')
                ->delete();
            
            $this->command->info("Deleted {$deletedPatients} test patients");

        } catch (\Exception $e) {
            $this->command->error('Could not clean test patients: ' . $e->getMessage());
        }

        try {
            // Clean up test appointments
            $deletedAppointments = DB::table('appointments')
                ->where('patient_name', 'like', '%test%')
                ->orWhere('specialist_name', 'like', '%test%')
                ->delete();
            
            $this->command->info("Deleted {$deletedAppointments} test appointments");

        } catch (\Exception $e) {
            $this->command->error('Could not clean test appointments: ' . $e->getMessage());
        }

        try {
            // Clean up test billing transactions
            $deletedTransactions = DB::table('billing_transactions')
                ->where('transaction_id', 'like', '%TEST%')
                ->orWhere('description', 'like', '%test%')
                ->delete();
            
            $this->command->info("Deleted {$deletedTransactions} test billing transactions");

        } catch (\Exception $e) {
            $this->command->error('Could not clean test billing transactions: ' . $e->getMessage());
        }

        try {
            // Clean up test lab orders
            $deletedLabOrders = DB::table('lab_orders')
                ->where('notes', 'like', '%test%')
                ->delete();
            
            $this->command->info("Deleted {$deletedLabOrders} test lab orders");

        } catch (\Exception $e) {
            $this->command->error('Could not clean test lab orders: ' . $e->getMessage());
        }
    }

    /**
     * Fix data inconsistencies
     */
    private function fixDataInconsistencies()
    {
        $this->command->info('Fixing data inconsistencies...');

        try {
            // Fix orphaned appointments by deleting them instead of setting to null
            $orphanedAppointments = DB::table('appointments')
                ->whereNotIn('patient_id', function($query) {
                    $query->select('id')->from('patients');
                })
                ->delete();
            
            $this->command->info("Deleted {$orphanedAppointments} orphaned appointments");

        } catch (\Exception $e) {
            $this->command->error('Could not fix orphaned appointments: ' . $e->getMessage());
        }

        try {
            // Fix orphaned lab orders
            $orphanedLabOrders = DB::table('lab_orders')
                ->whereNotIn('patient_id', function($query) {
                    $query->select('id')->from('patients');
                })
                ->delete();
            
            $this->command->info("Deleted {$orphanedLabOrders} orphaned lab orders");

        } catch (\Exception $e) {
            $this->command->error('Could not fix orphaned lab orders: ' . $e->getMessage());
        }

        try {
            // Fix orphaned billing transactions
            $orphanedTransactions = DB::table('billing_transactions')
                ->whereNotNull('patient_id')
                ->whereNotIn('patient_id', function($query) {
                    $query->select('id')->from('patients');
                })
                ->update(['patient_id' => null]);
            
            $this->command->info("Fixed {$orphanedTransactions} orphaned billing transactions");

        } catch (\Exception $e) {
            $this->command->error('Could not fix orphaned billing transactions: ' . $e->getMessage());
        }
    }

    /**
     * Add essential indexes
     */
    private function addEssentialIndexes()
    {
        $this->command->info('Adding essential indexes...');

        $indexes = [
            // Patients table
            ['table' => 'patients', 'columns' => ['created_at'], 'name' => 'patients_created_at_index'],
            ['table' => 'patients', 'columns' => ['patient_no'], 'name' => 'patients_patient_no_index'],
            
            // Appointments table
            ['table' => 'appointments', 'columns' => ['appointment_date', 'status'], 'name' => 'appointments_date_status_index'],
            ['table' => 'appointments', 'columns' => ['patient_id'], 'name' => 'appointments_patient_id_index'],
            
            // Lab orders table
            ['table' => 'lab_orders', 'columns' => ['created_at', 'status'], 'name' => 'lab_orders_created_status_index'],
            ['table' => 'lab_orders', 'columns' => ['patient_id'], 'name' => 'lab_orders_patient_id_index'],
            
            // Billing transactions table
            ['table' => 'billing_transactions', 'columns' => ['transaction_date', 'status'], 'name' => 'billing_transactions_date_status_index'],
            ['table' => 'billing_transactions', 'columns' => ['patient_id'], 'name' => 'billing_transactions_patient_id_index'],
            
            // Users table
            ['table' => 'users', 'columns' => ['role'], 'name' => 'users_role_index'],
        ];

        foreach ($indexes as $index) {
            try {
                if (!$this->indexExists($index['table'], $index['name'])) {
                    Schema::table($index['table'], function (Blueprint $table) use ($index) {
                        $table->index($index['columns'], $index['name']);
                    });
                    $this->command->info("Added index: {$index['name']}");
                } else {
                    $this->command->info("Index {$index['name']} already exists");
                }
            } catch (\Exception $e) {
                $this->command->error("Could not add index {$index['name']}: " . $e->getMessage());
            }
        }
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
        $this->command->info('This migration cannot be reversed as it involves data cleanup.');
    }
};
