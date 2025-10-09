<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class HospitalUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create hospital admin user with hospital_admin role
        $hospitalUser = [
            'name' => 'Hospital Admin',
            'email' => 'hospital@stjames.com',
            'password' => Hash::make('password'),
            'role' => 'hospital_admin', // Hospital-specific role
            'is_active' => true,
            'employee_id' => 'HOSP001',
        ];

        User::updateOrCreate(
            ['email' => $hospitalUser['email']],
            $hospitalUser
        );

        $this->command->info('Hospital admin user created successfully!');
        $this->command->info('Hospital login: hospital@stjames.com / password');
    }
}
