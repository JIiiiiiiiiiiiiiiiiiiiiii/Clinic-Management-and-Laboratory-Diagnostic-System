<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Patient;
use App\Models\User;

class CreatePatientForUser extends Command
{
    protected $signature = 'patient:create {user_id}';
    protected $description = 'Create a patient record for a user';

    public function handle()
    {
        $userId = $this->argument('user_id');
        $user = User::find($userId);
        
        if (!$user) {
            $this->error("User with ID {$userId} not found.");
            return;
        }
        
        if (Patient::where('user_id', $userId)->exists()) {
            $this->info("User {$userId} already has a patient record.");
            return;
        }
        
        $patient = new Patient();
        $patient->user_id = $userId;
        $patient->patient_no = 'P' . str_pad(Patient::max('id') + 1, 4, '0', STR_PAD_LEFT);
        $patient->first_name = $user->name;
        $patient->last_name = 'User';
        $patient->mobile_no = '1234567890';
        $patient->birthdate = '1990-01-01';
        $patient->age = 34;
        $patient->sex = 'male';
        $patient->civil_status = 'single';
        $patient->present_address = 'Test Address';
        $patient->emergency_name = 'Self';
        $patient->emergency_relation = 'Self';
        $patient->save();
        
        $this->info("Created patient record for user {$userId}: {$patient->patient_no}");
    }
}






