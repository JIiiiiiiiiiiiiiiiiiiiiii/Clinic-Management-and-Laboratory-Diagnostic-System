<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // Patient permissions
            'patients.create',
            'patients.read',
            'patients.update',
            'patients.delete',
            'patients.transfer', // Transfer sub-function
            
            // Appointment permissions
            'appointments.create',
            'appointments.read',
            'appointments.update',
            'appointments.delete',
            
            // Laboratory permissions
            'laboratory.create',
            'laboratory.read',
            'laboratory.update',
            'laboratory.delete',
            
            // Inventory permissions
            'inventory.create',
            'inventory.read',
            'inventory.update',
            'inventory.delete',
            
            // Billing permissions
            'billing.create',
            'billing.read',
            'billing.update',
            'billing.delete',
            
            // Reports permissions
            'reports.read',
            'reports.export',
            
            // Settings permissions
            'settings.read',
            'settings.update',
            
            // User management permissions
            'users.create',
            'users.read',
            'users.update',
            'users.delete',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'session'
            ]);
        }

        // Create roles and assign permissions
        $roles = [
            'admin' => [
                'display_name' => 'Administrator',
                'permissions' => $permissions, // Admin has all permissions
            ],
            'doctor' => [
                'display_name' => 'Doctor',
                'permissions' => [
                    // Patient Management
                    'patients.create', 'patients.read', 'patients.update', 'patients.delete',
                    'patients.transfer', // Transfer sub-function
                    // Laboratory
                    'laboratory.create', 'laboratory.read', 'laboratory.update', 'laboratory.delete',
                    // Reports
                    'reports.read', 'reports.export',
                    // Appointments - Including pending requests access
                    'appointments.create', 'appointments.read', 'appointments.update', 'appointments.delete',
                    // Inventory (full access)
                    'inventory.create', 'inventory.read', 'inventory.update', 'inventory.delete',
                ],
            ],
            'nurse' => [
                'display_name' => 'Nurse',
                'permissions' => [
                    // Patient Management
                    'patients.create', 'patients.read', 'patients.update', 'patients.delete',
                    'patients.transfer', // Transfer sub-function
                    // Appointments - Full access to all appointment modules
                    'appointments.create', 'appointments.read', 'appointments.update', 'appointments.delete',
                    // Inventory
                    'inventory.create', 'inventory.read', 'inventory.update', 'inventory.delete',
                    // Reports
                    'reports.read', 'reports.export',
                ],
            ],
            'medtech' => [
                'display_name' => 'Medical Technologist',
                'permissions' => [
                    // Laboratory
                    'laboratory.create', 'laboratory.read', 'laboratory.update', 'laboratory.delete',
                    // Inventory
                    'inventory.create', 'inventory.read', 'inventory.update', 'inventory.delete',
                    // Reports
                    'reports.read', 'reports.export',
                    // Patient Management (read-only)
                    'patients.read',
                ],
            ],
            'cashier' => [
                'display_name' => 'Cashier',
                'permissions' => [
                    'billing.create', 'billing.read', 'billing.update', 'billing.delete',
                    // Reports
                    'reports.read', 'reports.export',
                ],
            ],
            'hospital_staff' => [
                'display_name' => 'Hospital Staff',
                'permissions' => [
                    // Patient Management - Full access
                    'patients.create', 'patients.read', 'patients.update', 'patients.delete',
                    'patients.transfer', // Transfer sub-function
                    // Reports - Full access
                    'reports.read', 'reports.export',
                ],
            ],
            'hospital_admin' => [
                'display_name' => 'Hospital Administrator',
                'permissions' => [
                    // Patient Management - Full access
                    'patients.create', 'patients.read', 'patients.update', 'patients.delete',
                    'patients.transfer', // Transfer sub-function
                    // Reports - Full access
                    'reports.read', 'reports.export',
                ],
            ],
            'patient' => [
                'display_name' => 'Patient',
                'permissions' => [
                    'patients.read', // Can only read their own data
                ],
            ],
        ];

        foreach ($roles as $roleName => $roleData) {
            $role = Role::firstOrCreate([
                'name' => $roleName,
                'guard_name' => 'session'
            ]);
            $role->syncPermissions($roleData['permissions']);
        }
    }
}