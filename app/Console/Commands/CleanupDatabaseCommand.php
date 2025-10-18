<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CleanupDatabaseCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'database:cleanup {--force : Force cleanup without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up old data and optimize database for new menu structure';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== Database Cleanup and Integration Verification ===');
        $this->newLine();

        // 1. Check menu structure integration
        $this->checkMenuIntegration();

        // 2. Clean up old data
        if ($this->option('force') || $this->confirm('Do you want to clean up old test data?')) {
            $this->cleanupOldData();
        }

        // 3. Check data consistency
        $this->checkDataConsistency();

        // 4. Add essential indexes
        if ($this->option('force') || $this->confirm('Do you want to add essential indexes?')) {
            $this->addEssentialIndexes();
        }

        $this->newLine();
        $this->info('Database cleanup completed!');
    }

    /**
     * Check menu structure integration
     */
    private function checkMenuIntegration()
    {
        $this->info('1. Checking menu structure integration...');

        $menus = [
            'Patients' => ['patients', 'patient_visits', 'patient_transfers'],
            'Laboratory' => ['lab_orders', 'lab_results', 'lab_result_values', 'lab_tests'],
            'Inventory' => ['inventory_items', 'inventory_movements'],
            'Appointments' => ['appointments', 'pending_appointments', 'appointment_billing_links'],
            'Reports' => ['reports'],
            'Specialist Management' => ['users'],
            'Billing' => ['billing_transactions', 'billing_transaction_items', 'doctor_payments', 'expenses', 'daily_transactions']
        ];

        foreach ($menus as $menu => $tables) {
            $this->line("  {$menu}:");
            foreach ($tables as $table) {
                if (Schema::hasTable($table)) {
                    $count = DB::table($table)->count();
                    $this->line("    ✓ {$table} ({$count} records)");
                } else {
                    $this->error("    ✗ {$table} (missing)");
                }
            }
        }
    }

    /**
     * Clean up old data
     */
    private function cleanupOldData()
    {
        $this->info('2. Cleaning up old data...');

        // Clean up test patients
        $deletedPatients = DB::table('patients')
            ->where('first_name', 'like', '%test%')
            ->orWhere('last_name', 'like', '%test%')
            ->orWhere('patient_no', 'like', '%TEST%')
            ->delete();
        
        $this->line("  Deleted {$deletedPatients} test patients");

        // Clean up test appointments
        $deletedAppointments = DB::table('appointments')
            ->where('patient_name', 'like', '%test%')
            ->orWhere('specialist_name', 'like', '%test%')
            ->delete();
        
        $this->line("  Deleted {$deletedAppointments} test appointments");

        // Clean up test billing transactions
        $deletedTransactions = DB::table('billing_transactions')
            ->where('transaction_id', 'like', '%TEST%')
            ->orWhere('description', 'like', '%test%')
            ->delete();
        
        $this->line("  Deleted {$deletedTransactions} test billing transactions");

        // Clean up test lab orders
        $deletedLabOrders = DB::table('lab_orders')
            ->where('notes', 'like', '%test%')
            ->delete();
        
        $this->line("  Deleted {$deletedLabOrders} test lab orders");

        // Clean up old notifications
        $deletedNotifications = DB::table('notifications')
            ->where('created_at', '<', now()->subMonths(3))
            ->delete();
        
        $this->line("  Deleted {$deletedNotifications} old notifications");
    }

    /**
     * Check data consistency
     */
    private function checkDataConsistency()
    {
        $this->info('3. Checking data consistency...');

        // Check for orphaned records
        $orphanedAppointments = DB::table('appointments')
            ->whereNotIn('patient_id', function($query) {
                $query->select('patient_id')->from('patients');
            })
            ->count();

        $this->line("  Orphaned appointments: {$orphanedAppointments}");

        $orphanedLabOrders = DB::table('lab_orders')
            ->whereNotIn('patient_id', function($query) {
                $query->select('patient_id')->from('patients');
            })
            ->count();

        $this->line("  Orphaned lab orders: {$orphanedLabOrders}");

        $orphanedBillingTransactions = DB::table('billing_transactions')
            ->whereNotNull('patient_id')
            ->whereNotIn('patient_id', function($query) {
                $query->select('patient_id')->from('patients');
            })
            ->count();

        $this->line("  Orphaned billing transactions: {$orphanedBillingTransactions}");

        // Fix orphaned records
        if ($orphanedAppointments > 0 || $orphanedLabOrders > 0 || $orphanedBillingTransactions > 0) {
            if ($this->option('force') || $this->confirm('Do you want to fix orphaned records?')) {
                $this->fixOrphanedRecords();
            }
        }
    }

    /**
     * Fix orphaned records
     */
    private function fixOrphanedRecords()
    {
        $this->info('  Fixing orphaned records...');

        // Delete orphaned appointments
        $deletedAppointments = DB::table('appointments')
            ->whereNotIn('patient_id', function($query) {
                $query->select('patient_id')->from('patients');
            })
            ->delete();
        
        $this->line("    Deleted {$deletedAppointments} orphaned appointments");

        // Delete orphaned lab orders
        $deletedLabOrders = DB::table('lab_orders')
            ->whereNotIn('patient_id', function($query) {
                $query->select('patient_id')->from('patients');
            })
            ->delete();
        
        $this->line("    Deleted {$deletedLabOrders} orphaned lab orders");

        // Fix orphaned billing transactions
        $fixedTransactions = DB::table('billing_transactions')
            ->whereNotNull('patient_id')
            ->whereNotIn('patient_id', function($query) {
                $query->select('patient_id')->from('patients');
            })
            ->update(['patient_id' => null]);
        
        $this->line("    Fixed {$fixedTransactions} orphaned billing transactions");
    }

    /**
     * Add essential indexes
     */
    private function addEssentialIndexes()
    {
        $this->info('4. Adding essential indexes...');

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
                    Schema::table($index['table'], function ($table) use ($index) {
                        $table->index($index['columns'], $index['name']);
                    });
                    $this->line("    Added index: {$index['name']}");
                } else {
                    $this->line("    Index {$index['name']} already exists");
                }
            } catch (\Exception $e) {
                $this->error("    Could not add index {$index['name']}: " . $e->getMessage());
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
}
