<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Patient;

class CreateTestPatient extends Command
{
    protected $signature = 'create:test-patient';
    protected $description = 'Create a test patient user';

    public function handle()
    {
        $user = User::create([
            'name' => 'Test Patient',
            'email' => 'test@patient.com',
            'password' => bcrypt('password'),
            'role' => 'patient',
        ]);

        $patient = Patient::create([
            'user_id' => $user->id,
            'first_name' => 'Test',
            'last_name' => 'Patient',
            'patient_no' => 'P' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
            'email' => 'test@patient.com',
            'phone' => '123-456-7890',
            'birthdate' => '1990-01-01',
        ]);

        $this->info('Test patient created successfully!');
        $this->info('Email: test@patient.com');
        $this->info('Password: password');
        $this->info('Patient ID: ' . $patient->patient_no);
    }
}