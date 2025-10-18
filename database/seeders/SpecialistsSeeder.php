<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Specialist;

class SpecialistsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $specialists = [
            // Doctors
            [
                'specialist_code' => 'DOC001',
                'name' => 'Dr. Maria Santos',
                'role' => 'Doctor',
                'specialization' => 'General Medicine',
                'contact' => '+63 912 345 6789',
                'email' => 'maria.santos@clinic.com',
                'status' => 'Active',
            ],
            [
                'specialist_code' => 'DOC002',
                'name' => 'Dr. Juan Dela Cruz',
                'role' => 'Doctor',
                'specialization' => 'Internal Medicine',
                'contact' => '+63 912 345 6790',
                'email' => 'juan.delacruz@clinic.com',
                'status' => 'Active',
            ],
            [
                'specialist_code' => 'DOC003',
                'name' => 'Dr. Ana Rodriguez',
                'role' => 'Doctor',
                'specialization' => 'Pediatrics',
                'contact' => '+63 912 345 6791',
                'email' => 'ana.rodriguez@clinic.com',
                'status' => 'Active',
            ],

            // Nurses
            [
                'specialist_code' => 'NUR001',
                'name' => 'Nurse Sarah Johnson',
                'role' => 'Nurse',
                'specialization' => 'General Nursing',
                'contact' => '+63 912 345 6792',
                'email' => 'sarah.johnson@clinic.com',
                'status' => 'Active',
            ],
            [
                'specialist_code' => 'NUR002',
                'name' => 'Nurse Michael Brown',
                'role' => 'Nurse',
                'specialization' => 'Emergency Nursing',
                'contact' => '+63 912 345 6793',
                'email' => 'michael.brown@clinic.com',
                'status' => 'Active',
            ],

            // MedTechs
            [
                'specialist_code' => 'MT001',
                'name' => 'MedTech Lisa Garcia',
                'role' => 'MedTech',
                'specialization' => 'Laboratory Technology',
                'contact' => '+63 912 345 6794',
                'email' => 'lisa.garcia@clinic.com',
                'status' => 'Active',
            ],
            [
                'specialist_code' => 'MT002',
                'name' => 'MedTech Robert Wilson',
                'role' => 'MedTech',
                'specialization' => 'Radiology Technology',
                'contact' => '+63 912 345 6795',
                'email' => 'robert.wilson@clinic.com',
                'status' => 'Active',
            ],
        ];

        foreach ($specialists as $specialist) {
            Specialist::create($specialist);
        }
    }
}
