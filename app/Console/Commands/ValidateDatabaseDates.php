<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Helpers\DateHelper;

class ValidateDatabaseDates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'dates:validate {--fix : Fix invalid dates by setting them to null}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Validate all dates in the database and optionally fix invalid ones';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting database date validation...');
        
        $fix = $this->option('fix');
        
        // Validate appointments table
        $this->validateAppointments($fix);
        
        // Validate billing_transactions table
        $this->validateBillingTransactions($fix);
        
        // Validate patients table
        $this->validatePatients($fix);
        
        $this->info('Database date validation completed!');
    }

    /**
     * Validate appointments table
     */
    private function validateAppointments(bool $fix): void
    {
        $this->info('Validating appointments table...');
        
        $appointments = DB::table('appointments')
            ->select('id', 'appointment_date', 'appointment_time', 'created_at', 'updated_at')
            ->get();

        $invalidCount = 0;
        
        foreach ($appointments as $appointment) {
            $hasInvalidDate = false;
            $updates = [];
            
            // Check appointment_date
            if (!DateHelper::isValidDate($appointment->appointment_date)) {
                $this->warn("Invalid appointment_date for appointment ID: {$appointment->id}");
                $hasInvalidDate = true;
                if ($fix) {
                    $updates['appointment_date'] = null;
                }
            }
            
            // Check appointment_time
            if (!DateHelper::isValidTime($appointment->appointment_time)) {
                $this->warn("Invalid appointment_time for appointment ID: {$appointment->id}");
                $hasInvalidDate = true;
                if ($fix) {
                    $updates['appointment_time'] = null;
                }
            }
            
            if ($hasInvalidDate) {
                $invalidCount++;
                if ($fix && !empty($updates)) {
                    DB::table('appointments')
                        ->where('id', $appointment->id)
                        ->update($updates);
                    $this->info("Fixed invalid dates for appointment ID: {$appointment->id}");
                }
            }
        }
        
        $this->info("Found {$invalidCount} appointments with invalid dates");
    }

    /**
     * Validate billing_transactions table
     */
    private function validateBillingTransactions(bool $fix): void
    {
        $this->info('Validating billing_transactions table...');
        
        $transactions = DB::table('billing_transactions')
            ->select('id', 'transaction_date', 'due_date', 'created_at', 'updated_at')
            ->get();

        $invalidCount = 0;
        
        foreach ($transactions as $transaction) {
            $hasInvalidDate = false;
            $updates = [];
            
            // Check transaction_date
            if (!DateHelper::isValidDate($transaction->transaction_date)) {
                $this->warn("Invalid transaction_date for transaction ID: {$transaction->id}");
                $hasInvalidDate = true;
                if ($fix) {
                    $updates['transaction_date'] = now()->format('Y-m-d');
                }
            }
            
            // Check due_date
            if ($transaction->due_date && !DateHelper::isValidDate($transaction->due_date)) {
                $this->warn("Invalid due_date for transaction ID: {$transaction->id}");
                $hasInvalidDate = true;
                if ($fix) {
                    $updates['due_date'] = null;
                }
            }
            
            if ($hasInvalidDate) {
                $invalidCount++;
                if ($fix && !empty($updates)) {
                    DB::table('billing_transactions')
                        ->where('id', $transaction->id)
                        ->update($updates);
                    $this->info("Fixed invalid dates for transaction ID: {$transaction->id}");
                }
            }
        }
        
        $this->info("Found {$invalidCount} transactions with invalid dates");
    }

    /**
     * Validate patients table
     */
    private function validatePatients(bool $fix): void
    {
        $this->info('Validating patients table...');
        
        $patients = DB::table('patients')
            ->select('id', 'created_at', 'updated_at')
            ->get();

        $invalidCount = 0;
        
        foreach ($patients as $patient) {
            $hasInvalidDate = false;
            $updates = [];
            
            // Check created_at
            if (!DateHelper::isValidDate($patient->created_at)) {
                $this->warn("Invalid created_at for patient ID: {$patient->id}");
                $hasInvalidDate = true;
                if ($fix) {
                    $updates['created_at'] = now();
                }
            }
            
            if ($hasInvalidDate) {
                $invalidCount++;
                if ($fix && !empty($updates)) {
                    DB::table('patients')
                        ->where('id', $patient->id)
                        ->update($updates);
                    $this->info("Fixed invalid dates for patient ID: {$patient->id}");
                }
            }
        }
        
        $this->info("Found {$invalidCount} patients with invalid dates");
    }
}

