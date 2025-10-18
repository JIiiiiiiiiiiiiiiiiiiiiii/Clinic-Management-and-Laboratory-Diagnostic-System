<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\Visit;
use App\Models\BillingTransaction;
use App\Models\Staff;
use App\Models\PendingAppointment;
use App\Models\Notification;

class ClearDatabaseData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:clear-data {--confirm : Skip confirmation prompt}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear all data from main tables (patients, appointments, visits, billing_transactions, staff, pending_appointments, notifications)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (!$this->option('confirm')) {
            if (!$this->confirm('This will delete ALL data from patients, appointments, visits, billing_transactions, staff, pending_appointments, and notifications tables. Are you sure?')) {
                $this->info('Operation cancelled.');
                return;
            }
        }

        $this->info('Clearing database data...');

        try {
            // Disable foreign key checks temporarily
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');

            // Clear data in order to respect foreign key constraints
            $this->info('Clearing notifications...');
            Notification::truncate();

            $this->info('Clearing billing transactions...');
            BillingTransaction::truncate();

            $this->info('Clearing visits...');
            Visit::truncate();

            $this->info('Clearing appointments...');
            Appointment::truncate();

            $this->info('Clearing pending appointments...');
            PendingAppointment::truncate();

            $this->info('Clearing patients...');
            Patient::truncate();

            $this->info('Clearing staff...');
            Staff::truncate();

            // Clear related tables that might have foreign keys
            $this->info('Clearing appointment billing links...');
            DB::table('appointment_billing_links')->truncate();

            $this->info('Clearing doctor payment billing links...');
            DB::table('doctor_payment_billing_links')->truncate();

            $this->info('Clearing doctor payments...');
            DB::table('doctor_payments')->truncate();

            // Re-enable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');

            // Reset auto-increment counters
            $this->info('Resetting auto-increment counters...');
            DB::statement('ALTER TABLE patients AUTO_INCREMENT = 1');
            DB::statement('ALTER TABLE appointments AUTO_INCREMENT = 1');
            DB::statement('ALTER TABLE visits AUTO_INCREMENT = 1');
            DB::statement('ALTER TABLE billing_transactions AUTO_INCREMENT = 1');
            DB::statement('ALTER TABLE staff AUTO_INCREMENT = 1');
            DB::statement('ALTER TABLE pending_appointments AUTO_INCREMENT = 1');
            DB::statement('ALTER TABLE notifications AUTO_INCREMENT = 1');

            $this->info('✅ Database data cleared successfully!');
            $this->info('');
            $this->info('Cleared tables:');
            $this->info('- patients');
            $this->info('- appointments');
            $this->info('- visits');
            $this->info('- billing_transactions');
            $this->info('- staff');
            $this->info('- pending_appointments');
            $this->info('- notifications');
            $this->info('');
            $this->info('You can now test the new functionality from scratch!');

        } catch (\Exception $e) {
            DB::rollback();
            $this->error('Error clearing database: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}