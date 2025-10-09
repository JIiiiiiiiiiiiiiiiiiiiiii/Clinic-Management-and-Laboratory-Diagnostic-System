<?php

namespace Database\Seeders;

use App\Models\Patient;
use App\Models\PatientVisit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Faker\Factory;

class PatientVisitSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Factory::create();

        // Get some patients and doctors
        $patients = Patient::limit(10)->get();
        $doctors = User::where('role', 'doctor')->get();

        if ($patients->isEmpty() || $doctors->isEmpty()) {
            $this->command->warn('No patients or doctors found. Skipping visit seeding.');
            return;
        }

        // Create 30 sample visits
        for ($i = 0; $i < 30; $i++) {
            $patient = $patients->random();
            $doctor = $doctors->random();
            $arrivalDate = $faker->dateTimeBetween('-6 months', 'now');
            $arrivalTime = $faker->time('H:i:s');

            PatientVisit::create([
                'patient_id' => $patient->id,
                'arrival_date' => $arrivalDate->format('Y-m-d'),
                'arrival_time' => $arrivalTime,
                'attending_physician' => $doctor->name,
                'reason_for_consult' => $faker->randomElement([
                    'Routine checkup',
                    'Fever and cough',
                    'Abdominal pain',
                    'Headache',
                    'Chest pain',
                    'Back pain',
                    'Joint pain',
                    'Skin rash',
                    'Nausea and vomiting',
                    'Difficulty breathing'
                ]),
                'history_of_present_illness' => $faker->paragraph(2),
                'pertinent_physical_findings' => $faker->paragraph(1),
                'plan_management' => $faker->paragraph(1),
                'assessment_diagnosis' => $faker->randomElement([
                    'Upper respiratory tract infection',
                    'Hypertension',
                    'Diabetes mellitus',
                    'Gastritis',
                    'Migraine',
                    'Muscle strain',
                    'Allergic reaction',
                    'Anxiety',
                    'Common cold',
                    'Indigestion'
                ]),
                'blood_pressure' => $faker->randomElement(['120/80', '130/85', '140/90', '110/70', '125/82', '135/88']),
                'heart_rate' => (string) $faker->numberBetween(60, 100),
                'respiratory_rate' => (string) $faker->numberBetween(12, 20),
                'temperature' => (string) $faker->randomFloat(1, 36.0, 38.5),
                'weight_kg' => $faker->randomFloat(2, 45.0, 100.0),
                'height_cm' => $faker->randomFloat(1, 150.0, 190.0),
                'oxygen_saturation' => (string) $faker->numberBetween(95, 100),
                'pain_assessment_scale' => $faker->randomElement(['0', '1-3', '4-6', '7-10']),
                'time_seen' => $faker->time('H:i:s'),
                'status' => $faker->randomElement(['active', 'completed', 'discharged']),
                'notes' => $faker->optional(0.4)->sentence(),
                'mode_of_arrival' => $faker->randomElement(['Walk-in', 'Ambulance', 'Private vehicle', 'Public transport']),
                'lmp' => $faker->optional(0.3)->date('Y-m-d', '-3 months'),
            ]);
        }

        $this->command->info('30 sample patient visits created successfully!');
    }
}
