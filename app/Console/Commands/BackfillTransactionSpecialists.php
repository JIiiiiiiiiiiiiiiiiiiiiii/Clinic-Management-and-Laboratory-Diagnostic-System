<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BillingTransaction;
use App\Models\Appointment;
use App\Models\Visit;
use Illuminate\Support\Facades\DB;

class BackfillTransactionSpecialists extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'billing:backfill-specialists';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backfill specialist_id for all billing transactions from their linked appointments or visits';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to backfill specialist_id for billing transactions...');
        
        $transactions = BillingTransaction::whereNull('specialist_id')
            ->orWhere('specialist_id', 0)
            ->get();
        
        $this->info("Found {$transactions->count()} transactions without specialist_id");
        
        $updated = 0;
        $skipped = 0;
        
        foreach ($transactions as $transaction) {
            $specialistId = null;
            
            // Try to get from appointment
            if ($transaction->appointment_id) {
                $appointment = Appointment::find($transaction->appointment_id);
                if ($appointment && $appointment->specialist_id) {
                    $specialistId = $appointment->specialist_id;
                }
            }
            
            // If still null, try from visit
            if (!$specialistId && $transaction->visit_id) {
                $visit = Visit::find($transaction->visit_id);
                if ($visit) {
                    $specialistId = $visit->doctor_id ?? $visit->nurse_id ?? $visit->medtech_id ?? $visit->attending_staff_id ?? null;
                }
            }
            
            // If still null, try from appointmentLinks (many-to-many relationship)
            if (!$specialistId) {
                $transaction->load('appointmentLinks.appointment');
                foreach ($transaction->appointmentLinks as $link) {
                    if ($link->appointment && $link->appointment->specialist_id) {
                        $specialistId = $link->appointment->specialist_id;
                        break; // Use the first appointment's specialist
                    }
                }
            }
            
            if ($specialistId) {
                $transaction->update(['specialist_id' => $specialistId]);
                $updated++;
                $this->line("Updated transaction {$transaction->id} with specialist_id: {$specialistId}");
            } else {
                $skipped++;
                $this->warn("Could not find specialist for transaction {$transaction->id}");
            }
        }
        
        $this->info("Backfill complete! Updated: {$updated}, Skipped: {$skipped}");
        
        return 0;
    }
}
