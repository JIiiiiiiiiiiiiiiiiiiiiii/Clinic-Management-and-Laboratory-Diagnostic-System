<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Appointment;
use Illuminate\Support\Facades\DB;

class FixAppointmentFinalAmounts extends Command
{
    protected $signature = 'fix:appointment-final-amounts';
    protected $description = 'Fix appointments that have 0 final_total_amount';

    public function handle()
    {
        $this->info('Starting to fix appointment final amounts...');

        // Find appointments with 0 or null final_total_amount
        $appointments = Appointment::where(function($query) {
            $query->where('final_total_amount', 0)
                  ->orWhereNull('final_total_amount');
        })->get();

        $this->info("Found {$appointments->count()} appointments with incorrect final_total_amount");

        $fixed = 0;
        foreach ($appointments as $appointment) {
            $this->line("Processing appointment ID {$appointment->id} - Type: {$appointment->appointment_type}");
            
            // Calculate correct final amount
            $basePrice = $appointment->price ?? $appointment->calculatePrice();
            $labAmount = $appointment->total_lab_amount ?? 0;
            $finalAmount = $basePrice + $labAmount;
            
            if ($finalAmount > 0) {
                $appointment->update(['final_total_amount' => $finalAmount]);
                $fixed++;
                $this->info("  ✓ Fixed appointment {$appointment->id} - Set final_total_amount to ₱{$finalAmount}");
            } else {
                $this->warn("  - Appointment {$appointment->id} calculated final amount is 0, skipping");
            }
        }

        $this->info("Fixed {$fixed} appointments");
        $this->info('Done!');
    }
}
