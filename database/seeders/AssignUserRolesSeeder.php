<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;

class AssignUserRolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all roles with correct guard
        $adminRole = Role::where('name', 'admin')->where('guard_name', 'session')->first();
        $doctorRole = Role::where('name', 'doctor')->where('guard_name', 'session')->first();
        $nurseRole = Role::where('name', 'nurse')->where('guard_name', 'session')->first();
        $medtechRole = Role::where('name', 'medtech')->where('guard_name', 'session')->first();
        $cashierRole = Role::where('name', 'cashier')->where('guard_name', 'session')->first();
        $hospitalRole = Role::where('name', 'hospital_staff')->where('guard_name', 'session')->first();
        $hospitalAdminRole = Role::where('name', 'hospital_admin')->where('guard_name', 'session')->first();
        $patientRole = Role::where('name', 'patient')->where('guard_name', 'session')->first();

        // Assign roles based on existing user roles
        $users = User::all();

        foreach ($users as $user) {
            $currentRole = $user->getMappedRole();

            switch ($currentRole) {
                case 'admin':
                    if ($adminRole) {
                        $user->assignRole($adminRole);
                    }
                    break;
                case 'doctor':
                    if ($doctorRole) {
                        $user->assignRole($doctorRole);
                    }
                    break;
                case 'nurse':
                    if ($nurseRole) {
                        $user->assignRole($nurseRole);
                    }
                    break;
                case 'medtech':
                case 'laboratory_technologist':
                    if ($medtechRole) {
                        $user->assignRole($medtechRole);
                    }
                    break;
                case 'cashier':
                    if ($cashierRole) {
                        $user->assignRole($cashierRole);
                    }
                    break;
                case 'hospital_admin':
                    if ($hospitalAdminRole) {
                        $user->assignRole($hospitalAdminRole);
                    }
                    break;
                case 'hospital_staff':
                    if ($hospitalRole) {
                        $user->assignRole($hospitalRole);
                    }
                    break;
                case 'patient':
                default:
                    if ($patientRole) {
                        $user->assignRole($patientRole);
                    }
                    break;
            }
        }

        $this->command->info('User roles assigned successfully!');
    }
}