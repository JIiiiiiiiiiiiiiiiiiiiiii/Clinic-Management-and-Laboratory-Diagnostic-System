<?php

namespace Database\Seeders;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class PatientSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        // Create 20 sample patients
        for ($i = 0; $i < 20; $i++) {
            $gender = $faker->randomElement(['male', 'female']);
            $birthdate = $faker->dateTimeBetween('-80 years', '-18 years');
            $age = now()->diffInYears($birthdate);

            // Get the next patient number - use transaction to prevent race conditions
            $nextPatientNo = \DB::transaction(function () {
                // Get all existing patient numbers and find the highest numeric value
                $existingNumbers = Patient::pluck('patient_no')->map(function ($num) {
                    return is_numeric($num) ? (int) $num : (int) ltrim((string) $num, '0');
                });

                $maxNumeric = $existingNumbers->max() ?: 0;
                return (string) ($maxNumeric + 1);
            });

            Patient::create([
                'first_name' => $faker->firstName($gender === 'male' ? 'male' : 'female'),
                'last_name' => $faker->lastName(),
                'middle_name' => $faker->optional(0.7)->firstName(),
                'birthdate' => $birthdate->format('Y-m-d'),
                'age' => $age,
                'sex' => $gender,
                'patient_no' => $nextPatientNo,
                'occupation' => $faker->randomElement(['Teacher', 'Engineer', 'Nurse', 'Doctor', 'Accountant', 'Manager', 'Sales Representative', 'Technician', 'Administrator', 'Consultant']),
                'religion' => $faker->randomElement(['Catholic', 'Protestant', 'Muslim', 'Buddhist', 'Hindu', 'Other']),
                'civil_status' => $faker->randomElement(['single', 'married', 'widowed', 'divorced', 'separated']),
                'nationality' => 'Filipino',
                'present_address' => $faker->streetAddress() . ', ' . $faker->city() . ', ' . $faker->state() . ' ' . $faker->postcode(),
                'telephone_no' => $faker->optional(0.3)->numerify('###-###-####'),
                'mobile_no' => $faker->numerify('09##-###-####'),
                'informant_name' => $faker->name(),
                'relationship' => $faker->randomElement(['Self', 'Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other']),
                'company_name' => $faker->optional(0.4)->company(),
                'hmo_name' => $faker->optional(0.3)->randomElement(['PhilHealth', 'Maxicare', 'Intellicare', 'Medicard', 'Other']),
                'hmo_company_id_no' => $faker->optional(0.3)->numerify('HMO-####-####'),
                'validation_approval_code' => $faker->optional(0.2)->bothify('VAC-###-###'),
                'validity' => $faker->optional(0.2)->date('Y-m-d', '+1 year'),
                'drug_allergies' => $faker->randomElement(['Penicillin', 'Sulfa', 'Aspirin', 'Ibuprofen', 'NONE']),
                'food_allergies' => $faker->randomElement(['Peanuts', 'Shellfish', 'Dairy', 'Gluten', 'NONE']),
                'past_medical_history' => $faker->optional(0.4)->randomElement(['Hypertension', 'Diabetes', 'Asthma', 'Heart Disease', 'Arthritis', 'None']),
                'family_history' => $faker->optional(0.3)->randomElement(['Heart Disease', 'Diabetes', 'Cancer', 'Hypertension', 'None']),
                'social_personal_history' => $faker->optional(0.2)->randomElement(['Non-smoker', 'Former smoker', 'Social drinker', 'Regular exercise', 'Sedentary lifestyle']),
                'obstetrics_gynecology_history' => $gender === 'female' ? $faker->optional(0.3)->randomElement(['Gravida 2, Para 2', 'Regular menses', 'Menopause', 'Pregnant']) : null,
            ]);
        }

        $this->command->info('20 sample patients created successfully!');
    }
}
