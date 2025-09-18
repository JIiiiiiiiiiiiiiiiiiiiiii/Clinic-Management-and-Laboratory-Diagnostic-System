<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Patients
            'patients.view','patients.create','patients.update','patients.delete',
            // Lab
            'lab.view','lab.order.create','lab.result.enter','lab.result.verify',
            // Inventory
            'inventory.view','inventory.manage',
            // Billing
            'billing.view','billing.manage',
            // Admin
            'admin.view',
        ];

        foreach ($permissions as $p) {
            Permission::findOrCreate($p, 'web');
        }

        // Map common permissions to roles
        $rolePerms = [
            'admin' => $permissions,
            'doctor' => ['patients.view','patients.update','lab.view','lab.order.create','lab.result.verify','admin.view'],
            'nurse' => ['patients.view','patients.update','lab.view'],
            'medtech' => ['lab.view','lab.result.enter'],
            'cashier' => ['billing.view','billing.manage'],
            'patient' => [],
        ];

        foreach ($rolePerms as $roleName => $perms) {
            $role = Role::findOrCreate($roleName);
            $role->syncPermissions($perms);
        }
    }
}


