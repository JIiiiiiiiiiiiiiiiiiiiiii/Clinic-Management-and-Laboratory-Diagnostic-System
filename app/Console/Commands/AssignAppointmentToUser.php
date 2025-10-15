<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Appointment;
use App\Models\PendingAppointment;

class AssignAppointmentToUser extends Command
{
    protected $signature = 'appointment:assign {from} {to}';
    protected $description = 'Assign appointment from one patient to another';

    public function handle()
    {
        $from = $this->argument('from');
        $to = $this->argument('to');
        
        // Update confirmed appointments
        $appointments = Appointment::where('patient_id', $from)->get();
        foreach ($appointments as $appointment) {
            $appointment->patient_id = $to;
            $appointment->save();
            $this->info("Updated appointment {$appointment->id}: {$from} -> {$to}");
        }
        
        // Update pending appointments
        $pending = PendingAppointment::where('patient_id', $from)->get();
        foreach ($pending as $appointment) {
            $appointment->patient_id = $to;
            $appointment->save();
            $this->info("Updated pending appointment {$appointment->id}: {$from} -> {$to}");
        }
        
        $this->info("Done! Moved appointments from {$from} to {$to}");
    }
}





