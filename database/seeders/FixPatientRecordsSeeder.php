<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Patient;
use App\Models\User;

class FixPatientRecordsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all users who don't have patient records
        $usersWithoutPatients = User::whereNotIn('id', Patient::pluck('user_id'))->get();
        
        foreach ($usersWithoutPatients as $user) {
            // Create a patient record for this user
            $patient = new Patient();
            $patient->user_id = $user->id;
            $patient->patient_no = 'P' . str_pad(Patient::max('id') + 1, 3, '0', STR_PAD_LEFT);
            $patient->first_name = $user->name;
            $patient->last_name = 'User';
            $patient->mobile_no = '1234567890';
            $patient->birthdate = '1990-01-01';
            $patient->age = 34;
            $patient->sex = 'male';
            $patient->civil_status = 'single';
            $patient->present_address = 'Test Address';
            $patient->informant_name = 'Self';
            $patient->relationship = 'Self';
            $patient->save();
            
            echo "Created patient record for user {$user->id}: {$patient->patient_no}\n";
        }
    }
}





