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
        echo 'Starting simple database cleanup...' . PHP_EOL;

        // 1. Clean up old test data
        $this->cleanupTestData();

        // 2. Fix data inconsistencies
        $this->fixDataInconsistencies();

        // 3. Add essential indexes
        $this->addEssentialIndexes();

        echo 'Database cleanup completed!' . PHP_EOL;
    }

    /**
     * Clean up test data
     */
    private function cleanupTestData()
    {
        echo 'Cleaning up test data...' . PHP_EOL;

        try {
            // Clean up test patients
            $deletedPatients = DB::table('patients')
                ->where('first_name', 'like', '%test%')
                ->orWhere('last_name', 'like', '%test%')
                ->orWhere('patient_no', 'like', '%TEST%')
                ->delete();
            
            echo "Deleted {$deletedPatients} test patients" . PHP_EOL;

        } catch (\Exception $e) {
            echo 'Could not clean test patients: ' . $e->getMessage() . PHP_EOL;
        }

        try {
            // Clean up test appointments
            $deletedAppointments = DB::table('appointments')
                ->where('patient_name', 'like', '%test%')
                ->orWhere('specialist_name', 'like', '%test%')
                ->delete();
            
            echo "Deleted {$deletedAppointments} test appointments" . PHP_EOL;

        } catch (\Exception $e) {
            echo 'Could not clean test appointments: ' . $e->getMessage() . PHP_EOL;
        }

        try {
            // Clean up test billing transactions
            $deletedTransactions = DB::table('billing_transactions')
                ->where('transaction_id', 'like', '%TEST%')
                ->orWhere('description', 'like', '%test%')
                ->delete();
            
            echo "Deleted {$deletedTransactions} test billing transactions" . PHP_EOL;

        } catch (\Exception $e) {
            echo 'Could not clean test billing transactions: ' . $e->getMessage() . PHP_EOL;
        }

        try {
            // Clean up test lab orders
            $deletedLabOrders = DB::table('lab_orders')
                ->where('notes', 'like', '%test%')
                ->delete();
            
            echo "Deleted {$deletedLabOrders} test lab orders" . PHP_EOL;

        } catch (\Exception $e) {
            echo 'Could not clean test lab orders: ' . $e->getMessage() . PHP_EOL;
        }
    }

    /**
     * Fix data inconsistencies
     */
    private function fixDataInconsistencies()
    {
        echo 'Fixing data inconsistencies...' . PHP_EOL;

        try {
            // Fix orphaned appointments by deleting them instead of setting to null
            $orphanedAppointments = DB::table('appointments')
                ->whereNotIn('patient_id', function($query) {
                    $query->select('patient_id')->from('patients');
                })
                ->delete();
            
            echo "Deleted {$orphanedAppointments} orphaned appointments" . PHP_EOL;

        } catch (\Exception $e) {
            echo 'Could not fix orphaned appointments: ' . $e->getMessage() . PHP_EOL;
        }

        try {
            // Fix orphaned lab orders
            $orphanedLabOrders = DB::table('lab_orders')
                ->whereNotIn('patient_id', function($query) {
                    $query->select('patient_id')->from('patients');
                })
                ->delete();
            
            echo "Deleted {$orphanedLabOrders} orphaned lab orders" . PHP_EOL;

        } catch (\Exception $e) {
            echo 'Could not fix orphaned lab orders: ' . $e->getMessage() . PHP_EOL;
        }

        try {
            // Fix orphaned billing transactions
            $orphanedTransactions = DB::table('billing_transactions')
                ->whereNotNull('patient_id')
                ->whereNotIn('patient_id', function($query) {
                    $query->select('patient_id')->from('patients');
                })
                ->update(['patient_id' => null]);
            
            echo "Fixed {$orphanedTransactions} orphaned billing transactions" . PHP_EOL;

        } catch (\Exception $e) {
            echo 'Could not fix orphaned billing transactions: ' . $e->getMessage() . PHP_EOL;
        }
    }

    /**
     * Add essential indexes
     */
    private function addEssentialIndexes()
    {
        echo 'Adding essential indexes...' . PHP_EOL;

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
                    echo "Added index: {$index['name']}" . PHP_EOL;
                } else {
                    echo "Index {$index['name']} already exists" . PHP_EOL;
                }
            } catch (\Exception $e) {
                echo "Could not add index {$index['name']}: " . $e->getMessage() . PHP_EOL;
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
        echo 'This migration cannot be reversed as it involves data cleanup.' . PHP_EOL;
    }
};
