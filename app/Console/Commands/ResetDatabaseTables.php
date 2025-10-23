<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ResetDatabaseTables extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:reset-tables';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset specified database tables (patients, appointments, visits, billing, lab orders, users with patient role, doctor payments, hmo transactions)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting database reset...');

        try {
            // Disable foreign key checks temporarily
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            
            // 1. Reset billing_transaction_items first (child of billing_transactions)
            if (Schema::hasTable('billing_transaction_items')) {
                DB::table('billing_transaction_items')->truncate();
                $this->info('✓ Cleared billing_transaction_items table');
            }
            
            // 2. Reset billing_transactions
            if (Schema::hasTable('billing_transactions')) {
                DB::table('billing_transactions')->truncate();
                $this->info('✓ Cleared billing_transactions table');
            }
            
            // 3. Reset doctor_payment_billing_links (child of doctor_payments)
            if (Schema::hasTable('doctor_payment_billing_links')) {
                DB::table('doctor_payment_billing_links')->truncate();
                $this->info('✓ Cleared doctor_payment_billing_links table');
            }
            
            // 4. Reset doctor_payments
            if (Schema::hasTable('doctor_payments')) {
                DB::table('doctor_payments')->truncate();
                $this->info('✓ Cleared doctor_payments table');
            }
            
            // 5. Reset lab-related tables
            if (Schema::hasTable('lab_result_values')) {
                DB::table('lab_result_values')->truncate();
                $this->info('✓ Cleared lab_result_values table');
            }
            
            if (Schema::hasTable('lab_results')) {
                DB::table('lab_results')->truncate();
                $this->info('✓ Cleared lab_results table');
            }
            
            if (Schema::hasTable('lab_orders')) {
                DB::table('lab_orders')->truncate();
                $this->info('✓ Cleared lab_orders table');
            }
            
            if (Schema::hasTable('appointment_lab_orders')) {
                DB::table('appointment_lab_orders')->truncate();
                $this->info('✓ Cleared appointment_lab_orders table');
            }
            
            if (Schema::hasTable('appointment_lab_tests')) {
                DB::table('appointment_lab_tests')->truncate();
                $this->info('✓ Cleared appointment_lab_tests table');
            }
            
            if (Schema::hasTable('lab_requests')) {
                DB::table('lab_requests')->truncate();
                $this->info('✓ Cleared lab_requests table');
            }
            
            // 6. Reset HMO-related tables
            if (Schema::hasTable('hmo_claims')) {
                DB::table('hmo_claims')->truncate();
                $this->info('✓ Cleared hmo_claims table');
            }
            
            if (Schema::hasTable('hmo_patient_coverage')) {
                DB::table('hmo_patient_coverage')->truncate();
                $this->info('✓ Cleared hmo_patient_coverage table');
            }
            
            if (Schema::hasTable('hmo_reports')) {
                DB::table('hmo_reports')->truncate();
                $this->info('✓ Cleared hmo_reports table');
            }
            
            // 7. Reset visits (depends on appointments)
            if (Schema::hasTable('visits')) {
                DB::table('visits')->truncate();
                $this->info('✓ Cleared visits table');
            }
            
            // 8. Reset appointments (depends on patients)
            if (Schema::hasTable('appointments')) {
                DB::table('appointments')->truncate();
                $this->info('✓ Cleared appointments table');
            }
            
            // 9. Reset users with patient role only
            if (Schema::hasTable('users')) {
                $deletedCount = DB::table('users')->where('role', 'patient')->delete();
                $this->info("✓ Cleared {$deletedCount} patient users from users table");
            }
            
            // 10. Reset patients (parent table)
            if (Schema::hasTable('patients')) {
                DB::table('patients')->truncate();
                $this->info('✓ Cleared patients table');
            }
            
            // Re-enable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            
            $this->newLine();
            $this->info('✅ Database reset completed successfully!');
            $this->newLine();
            $this->info('The following tables have been cleared:');
            $this->line('- patients');
            $this->line('- appointments');
            $this->line('- visits');
            $this->line('- billing_transactions');
            $this->line('- billing_transaction_items');
            $this->line('- lab_orders');
            $this->line('- lab_results');
            $this->line('- lab_result_values');
            $this->line('- appointment_lab_orders');
            $this->line('- appointment_lab_tests');
            $this->line('- lab_requests');
            $this->line('- users (patient role only)');
            $this->line('- doctor_payments');
            $this->line('- doctor_payment_billing_links');
            $this->line('- hmo_claims');
            $this->line('- hmo_patient_coverage');
            $this->line('- hmo_reports');
            
        } catch (\Exception $e) {
            $this->error('❌ Error during database reset: ' . $e->getMessage());
            // Re-enable foreign key checks even if there was an error
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            return 1;
        }

        return 0;
    }
}
