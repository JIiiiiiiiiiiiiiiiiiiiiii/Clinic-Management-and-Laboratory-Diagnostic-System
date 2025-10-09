<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DoctorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test doctors if they don't exist
        $doctors = [
            [
                'name' => 'Dr. John Smith',
                'email' => 'john.smith@clinic.com',
                'role' => 'doctor',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Dr. Jane Doe',
                'email' => 'jane.doe@clinic.com',
                'role' => 'doctor',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Dr. Michael Johnson',
                'email' => 'michael.johnson@clinic.com',
                'role' => 'doctor',
                'password' => Hash::make('password'),
            ],
        ];

        foreach ($doctors as $doctorData) {
            User::firstOrCreate(
                ['email' => $doctorData['email']],
                $doctorData
            );
        }
    }
}
