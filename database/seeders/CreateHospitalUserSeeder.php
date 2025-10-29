<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateHospitalUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or update the hospital user
        $user = User::updateOrCreate(
            ['email' => 'hospital@stjames.com'],
            [
                'name' => 'Hospital Admin',
                'password' => Hash::make('password'),
                'role' => 'hospital_admin',
                'is_active' => true,
            ]
        );

        $this->command->info('Hospital user created/updated successfully!');
        $this->command->info('Email: hospital@stjames.com');
        $this->command->info('Password: password');
        $this->command->info('Role: hospital_staff');
    }
}
