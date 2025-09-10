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
        // Seed users with different roles first
        $this->call(UserRoleSeeder::class);

        // Seed laboratory tests
        $this->call(LabTestSeeder::class);

        // Seed inventory/supplies
        $this->call(InventorySeeder::class);

        // Seed patients
        $this->call(PatientSeeder::class);

        // Seed patient visits
        $this->call(PatientVisitSeeder::class);

        // Seed lab orders
        $this->call(LabOrderSeeder::class);
    }
}
