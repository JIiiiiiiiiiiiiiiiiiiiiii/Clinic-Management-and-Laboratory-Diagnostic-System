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
            // Add other seeders here as needed
        ]);
    }
}

        // Seed RBAC roles
        $this->call(RoleSeeder::class);
        // Seed default permissions and role mappings
        $this->call(PermissionSeeder::class);

        // Seed users with different roles first
        $this->call(UserRoleSeeder::class);
        
        // Seed hospital user
        $this->call(HospitalUserSeeder::class);

        // Seed laboratory tests
        $this->call(LabTestSeeder::class);

        // Seed inventory/supplies
        $this->call(InventorySeeder::class);

        // Seed patients (PatientSeeder not found, skipping)

    }
}
