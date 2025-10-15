<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Appointment;
use App\Models\PendingAppointment;
use App\Models\Patient;

class FixAppointmentPatientIds extends Command
{
    protected $signature = 'appointments:fix-patient-ids';
    protected $description = 'Fix appointment patient_id values to use patient_no instead of database ID';

    public function handle()
    {
        $this->info('Fixing appointment patient_id values...');
        
        // Fix confirmed appointments
        $appointments = Appointment::whereIn('patient_id', ['1', '2', '3', '4', '5', '6'])->get();
        foreach ($appointments as $appointment) {
            $patient = Patient::find($appointment->patient_id);
            if ($patient) {
                $oldId = $appointment->patient_id;
                $appointment->patient_id = $patient->patient_no;
                $appointment->save();
                $this->info("Fixed appointment {$appointment->id}: {$oldId} -> {$patient->patient_no}");
            }
        }
        
        // Fix pending appointments
        $pending = PendingAppointment::whereIn('patient_id', ['1', '2', '3', '4', '5', '6'])->get();
        foreach ($pending as $appointment) {
            $patient = Patient::find($appointment->patient_id);
            if ($patient) {
                $oldId = $appointment->patient_id;
                $appointment->patient_id = $patient->patient_no;
                $appointment->save();
                $this->info("Fixed pending appointment {$appointment->id}: {$oldId} -> {$patient->patient_no}");
            }
        }
        
        $this->info('Done!');
    }
}





