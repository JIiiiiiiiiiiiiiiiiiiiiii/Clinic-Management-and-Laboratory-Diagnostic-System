<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SpecialistsSeeder::class,
            RoleSeeder::class,
            PermissionSeeder::class,
            UserRoleSeeder::class,
            HospitalUserSeeder::class,
            LabTestSeeder::class,
            InventorySeeder::class,
        ]);
    }
}
