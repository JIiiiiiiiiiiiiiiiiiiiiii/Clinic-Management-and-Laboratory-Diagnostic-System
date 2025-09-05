<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Patient;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

<<<<<<< HEAD
        // Use PatientSeeder for patient data
    $this->call(PatientSeeder::class);
    $this->call(PatientSampleSeeder::class);
=======
        // Create some sample patients
        Patient::factory(20)->create();

        // Seed default laboratory tests
        $this->call(LabTestSeeder::class);
>>>>>>> 1151d07325a75e0ff040c61f6a6d7657275fd9ba
    }
}
