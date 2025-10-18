<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Appointment;
use App\Models\PendingAppointment;

class FixAppointmentPrices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'appointments:fix-prices';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix appointment prices by recalculating them based on appointment type';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Fixing appointment prices...');
        
        // Fix regular appointments
        $appointments = Appointment::all();
        $fixedCount = 0;
        
        foreach ($appointments as $appointment) {
            $oldPrice = $appointment->price;
            $newPrice = $appointment->calculatePrice();
            
            if ($oldPrice != $newPrice) {
                $appointment->update(['price' => $newPrice]);
                $this->line("Appointment ID {$appointment->id}: {$appointment->appointment_type} - ₱{$oldPrice} → ₱{$newPrice}");
                $fixedCount++;
            }
        }
        
        // Fix pending appointments
        $pendingAppointments = PendingAppointment::all();
        
        foreach ($pendingAppointments as $pendingAppointment) {
            $oldPrice = $pendingAppointment->price;
            $newPrice = $pendingAppointment->calculatePrice();
            
            if ($oldPrice != $newPrice) {
                $pendingAppointment->update(['price' => $newPrice]);
                $this->line("Pending Appointment ID {$pendingAppointment->id}: {$pendingAppointment->appointment_type} - ₱{$oldPrice} → ₱{$newPrice}");
                $fixedCount++;
            }
        }
        
        $this->info("Fixed {$fixedCount} appointment prices.");
        
        return 0;
    }
}