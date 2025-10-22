<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test users with different roles
        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@clinic.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'is_active' => true,
                'employee_id' => 'EMP001',
            ],
            [
                'name' => 'Dr. John Smith',
                'email' => 'doctor@clinic.com',
                'password' => Hash::make('password'),
                'role' => 'doctor',
                'is_active' => true,
                'employee_id' => 'EMP002',
            ],
            [
                'name' => 'Lab Tech Sarah',
                'email' => 'labtech@clinic.com',
                'password' => Hash::make('password'),
                'role' => 'laboratory_technologist',
                'is_active' => true,
                'employee_id' => 'EMP003',
            ],
            [
                'name' => 'MedTech Mike',
                'email' => 'medtech@clinic.com',
                'password' => Hash::make('password'),
                'role' => 'medtech',
                'is_active' => true,
                'employee_id' => 'EMP004',
            ],
            [
                'name' => 'Cashier Lisa',
                'email' => 'cashier@clinic.com',
                'password' => Hash::make('password'),
                'role' => 'cashier',
                'is_active' => true,
                'employee_id' => 'EMP005',
            ],
            [
                'name' => 'Nurse Jennifer',
                'email' => 'nurse@clinic.com',
                'password' => Hash::make('password'),
                'role' => 'nurse',
                'is_active' => true,
                'employee_id' => 'EMP006',
            ],
            [
                'name' => 'Patient John Doe',
                'email' => 'patient@clinic.com',
                'password' => Hash::make('password'),
                'role' => 'patient',
                'is_active' => true,
                'employee_id' => null,
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }

        $this->command->info('Test users with different roles created successfully!');
        $this->command->info('You can now login with any of these accounts using "password" as the password.');
    }
}
