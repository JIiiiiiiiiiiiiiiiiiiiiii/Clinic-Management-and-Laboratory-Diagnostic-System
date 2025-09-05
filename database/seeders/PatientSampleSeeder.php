<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Patient;

class PatientSampleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $lastNames = ['Dela Cruz', 'Reyes', 'Santiago', 'Garcia', 'Torres', 'Lopez', 'Martinez', 'Ramos', 'Gonzalez', 'Fernandez', 'Castro', 'Mendoza', 'Silva', 'Morales', 'Gutierrez', 'Santos', 'Rodriguez', 'Perez', 'Alvarez', 'Dominguez'];
        $firstNames = ['Juan', 'Ana', 'Carlos', 'Maria', 'Jose', 'Luisa', 'Miguel', 'Carmen', 'Pedro', 'Isabel', 'Rafael', 'Teresa', 'Jorge', 'Patricia', 'Victor', 'Cristina', 'Manuel', 'Elena', 'Francisco', 'Sofia'];
        $middleNames = ['Santos', 'Lopez', 'Torres', 'Garcia', 'Reyes', 'Martinez', 'Ramos', 'Gonzalez', 'Fernandez', 'Castro', 'Mendoza', 'Silva', 'Morales', 'Gutierrez', 'Santos', 'Rodriguez', 'Perez', 'Alvarez', 'Dominguez', 'Cruz'];
        $occupations = ['Engineer', 'Teacher', 'Driver', 'Nurse', 'Doctor', 'Cashier', 'Technician', 'Manager', 'Clerk', 'Salesperson'];
        $religions = ['Catholic', 'Protestant', 'Muslim', 'Buddhist', 'Hindu', 'None'];
        $physicians = ['Dr. Santos', 'Dr. Garcia', 'Dr. Martinez', 'Dr. Rodriguez', 'Dr. Lopez'];
        $civilStatuses = ['single', 'married', 'widowed', 'divorced', 'separated'];
        $relationships = ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Guardian'];

        for ($i = 1; $i <= 20; $i++) {
            $lastName = $lastNames[array_rand($lastNames)];
            $firstName = $firstNames[array_rand($firstNames)];
            $middleName = $middleNames[array_rand($middleNames)];
            $birthYear = rand(1950, 2005);
            $birthMonth = rand(1, 12);
            $birthDay = rand(1, 28);
            $birthdate = sprintf('%04d-%02d-%02d', $birthYear, $birthMonth, $birthDay);
            $age = date('Y') - $birthYear;
            $sex = ($i % 2 == 0) ? 'female' : 'male';
            $patientNo = 'P' . str_pad(10000 + $i, 5, '0', STR_PAD_LEFT);
            $occupation = $occupations[array_rand($occupations)];
            $religion = $religions[array_rand($religions)];
            $attendingPhysician = $physicians[array_rand($physicians)];
            $civilStatus = $civilStatuses[array_rand($civilStatuses)];
            $nationality = 'Filipino';
            $address = $i . ' Sample St, City';
            $telephone = '02-' . rand(1000000, 9999999);
            $mobile = '+639' . rand(100000000, 999999999);
            $informant = $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)];
            $relationship = $relationships[array_rand($relationships)];
            $arrivalDate = '2025-09-' . str_pad($i, 2, '0', STR_PAD_LEFT);
            $arrivalTime = sprintf('%02d:%02d', rand(7, 17), rand(0, 59));

            Patient::updateOrCreate(
                ['patient_no' => $patientNo],
                [
                    'arrival_date' => $arrivalDate,
                    'arrival_time' => $arrivalTime,
                    'last_name' => $lastName,
                    'first_name' => $firstName,
                    'middle_name' => $middleName,
                    'birthdate' => $birthdate,
                    'age' => $age,
                    'sex' => $sex,
                    'patient_no' => $patientNo,
                    'occupation' => $occupation,
                    'religion' => $religion,
                    'attending_physician' => $attendingPhysician,
                    'civil_status' => $civilStatus,
                    'nationality' => $nationality,
                    'present_address' => $address,
                    'telephone_no' => $telephone,
                    'mobile_no' => $mobile,
                    'informant_name' => $informant,
                    'relationship' => $relationship,
                    'time_seen' => $arrivalTime,
                ]
            );
        }
    }
}
