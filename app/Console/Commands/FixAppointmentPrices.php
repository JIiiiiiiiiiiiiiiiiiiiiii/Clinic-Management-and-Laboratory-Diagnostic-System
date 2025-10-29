<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Appointment;
use Illuminate\Support\Facades\DB;

class FixAppointmentPrices extends Command
{
    protected $signature = 'fix:appointment-prices';
    protected $description = 'Fix appointments that have 0 or null prices';

    public function handle()
    {
        $this->info('Starting to fix appointment prices...');

        // Find appointments with 0 or null prices
        $appointments = Appointment::where(function($query) {
            $query->where('price', 0)
                  ->orWhereNull('price');
        })->get();

        $this->info("Found {$appointments->count()} appointments with incorrect prices");

        $fixed = 0;
        foreach ($appointments as $appointment) {
            $this->line("Processing appointment ID {$appointment->id} - Type: {$appointment->appointment_type}");
            
            // Calculate correct price
            $calculatedPrice = $appointment->calculatePrice();
            
            if ($calculatedPrice > 0) {
                $appointment->update(['price' => $calculatedPrice]);
                $fixed++;
                $this->info("  ✓ Fixed appointment {$appointment->id} - Set price to ₱{$calculatedPrice}");
            } else {
                $this->warn("  - Appointment {$appointment->id} calculated price is 0, skipping");
            }
        }

        $this->info("Fixed {$fixed} appointments");
        $this->info('Done!');
    }
}