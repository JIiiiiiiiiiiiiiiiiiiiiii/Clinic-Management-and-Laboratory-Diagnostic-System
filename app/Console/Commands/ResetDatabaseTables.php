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
    protected $description = 'Reset core Clinic data: patients, visits, appointments, billing, transfers, laboratory, HMO, doctor payments, inventory, and report aggregates.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting database reset...');

        try {
            // Disable foreign key checks temporarily
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            
            // 0. Appointment/Billing linking tables and pending queues
            if (Schema::hasTable('appointment_billing_links')) {
                DB::table('appointment_billing_links')->truncate();
                $this->info('✓ Cleared appointment_billing_links table');
            }
            if (Schema::hasTable('pending_appointments')) {
                DB::table('pending_appointments')->truncate();
                $this->info('✓ Cleared pending_appointments table');
            }

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
            
            if (Schema::hasTable('appointment_lab_orders')) {
                DB::table('appointment_lab_orders')->truncate();
                $this->info('✓ Cleared appointment_lab_orders table');
            }
            
            if (Schema::hasTable('appointment_lab_tests')) {
                DB::table('appointment_lab_tests')->truncate();
                $this->info('✓ Cleared appointment_lab_tests table');
            }
            
            if (Schema::hasTable('lab_orders')) {
                DB::table('lab_orders')->truncate();
                $this->info('✓ Cleared lab_orders table');
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
            
            // 7. Inventory and supplies
            if (Schema::hasTable('inventory_used_rejected_items')) {
                DB::table('inventory_used_rejected_items')->truncate();
                $this->info('✓ Cleared inventory_used_rejected_items table');
            }
            if (Schema::hasTable('inventory_movements')) {
                DB::table('inventory_movements')->truncate();
                $this->info('✓ Cleared inventory_movements table');
            }
            if (Schema::hasTable('inventory_items')) {
                DB::table('inventory_items')->truncate();
                $this->info('✓ Cleared inventory_items table');
            }
            if (Schema::hasTable('supply_transactions')) {
                DB::table('supply_transactions')->truncate();
                $this->info('✓ Cleared supply_transactions table');
            }
            if (Schema::hasTable('supply_stock_levels')) {
                DB::table('supply_stock_levels')->truncate();
                $this->info('✓ Cleared supply_stock_levels table');
            }
            if (Schema::hasTable('supplies')) {
                DB::table('supplies')->truncate();
                $this->info('✓ Cleared supplies table');
            }
            if (Schema::hasTable('supply_suppliers')) {
                DB::table('supply_suppliers')->truncate();
                $this->info('✓ Cleared supply_suppliers table');
            }
            
            // 8. Transfers
            if (Schema::hasTable('patient_transfer_history')) {
                DB::table('patient_transfer_history')->truncate();
                $this->info('✓ Cleared patient_transfer_history table');
            }
            if (Schema::hasTable('patient_transfers')) {
                DB::table('patient_transfers')->truncate();
                $this->info('✓ Cleared patient_transfers table');
            }

            // 9. Financial aggregates and summaries
            if (Schema::hasTable('daily_transactions')) {
                DB::table('daily_transactions')->truncate();
                $this->info('✓ Cleared daily_transactions table');
            }
            if (Schema::hasTable('manual_transactions')) {
                DB::table('manual_transactions')->truncate();
                $this->info('✓ Cleared manual_transactions table');
            }
            if (Schema::hasTable('financial_overview')) {
                DB::table('financial_overview')->truncate();
                $this->info('✓ Cleared financial_overview table');
            }
            if (Schema::hasTable('doctor_summary_reports')) {
                DB::table('doctor_summary_reports')->truncate();
                $this->info('✓ Cleared doctor_summary_reports table');
            }
            
            // 10. Generic and module-specific report tables
            if (Schema::hasTable('reports')) {
                DB::table('reports')->truncate();
                $this->info('✓ Cleared reports table');
            }
            if (Schema::hasTable('laboratory_reports')) {
                DB::table('laboratory_reports')->truncate();
                $this->info('✓ Cleared laboratory_reports table');
            }
            if (Schema::hasTable('inventory_reports')) {
                DB::table('inventory_reports')->truncate();
                $this->info('✓ Cleared inventory_reports table');
            }

            // 11. Core clinical journey
            // Reset visits (depends on appointments)
            if (Schema::hasTable('visits')) {
                DB::table('visits')->truncate();
                $this->info('✓ Cleared visits table');
            }
            
            // Reset appointments (depends on patients)
            if (Schema::hasTable('appointments')) {
                DB::table('appointments')->truncate();
                $this->info('✓ Cleared appointments table');
            }
            
            // 12. Reset users with patient role only
            if (Schema::hasTable('users')) {
                $deletedCount = DB::table('users')->where('role', 'patient')->delete();
                $this->info("✓ Cleared {$deletedCount} patient users from users table");
            }
            
            // 13. Reset patients (parent table)
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
            $this->line('- users (patient role only) [deleted]');
            $this->line('- appointments');
            $this->line('- pending_appointments');
            $this->line('- visits');
            $this->line('- billing_transactions');
            $this->line('- billing_transaction_items');
            $this->line('- appointment_billing_links');
            $this->line('- lab_orders');
            $this->line('- lab_results');
            $this->line('- lab_result_values');
            $this->line('- appointment_lab_orders');
            $this->line('- appointment_lab_tests');
            $this->line('- lab_requests');
            $this->line('- doctor_payments');
            $this->line('- doctor_payment_billing_links');
            $this->line('- hmo_claims');
            $this->line('- hmo_patient_coverage');
            $this->line('- hmo_reports');
            $this->line('- patient_transfers');
            $this->line('- patient_transfer_history');
            $this->line('- daily_transactions');
            $this->line('- manual_transactions');
            $this->line('- financial_overview');
            $this->line('- doctor_summary_reports');
            $this->line('- reports');
            $this->line('- laboratory_reports');
            $this->line('- inventory_reports');
            $this->line('- inventory_used_rejected_items');
            $this->line('- inventory_movements');
            $this->line('- inventory_items');
            $this->line('- supply_transactions');
            $this->line('- supply_stock_levels');
            $this->line('- supplies');
            $this->line('- supply_suppliers');
            
        } catch (\Exception $e) {
            $this->error('❌ Error during database reset: ' . $e->getMessage());
            // Re-enable foreign key checks even if there was an error
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            return 1;
        }

        return 0;
    }
}
