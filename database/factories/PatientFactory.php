<?php

namespace Database\Factories;

use App\Models\Patient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Patient>
 */
class PatientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $genders = ['male', 'female'];
        $civilStatuses = ['single', 'married', 'widowed', 'divorced', 'separated'];
        $modesOfArrival = ['Ambulance', 'Walk-in', 'Private vehicle', 'Police escort', 'Air ambulance'];
        $commonReasons = [
            'Chest pain', 'Difficulty breathing', 'Fever', 'Abdominal pain', 'Headache',
            'Trauma/Injury', 'Unconsciousness', 'Seizure', 'Bleeding', 'Poisoning'
        ];
        $physicians = [
            'Dr. Santos', 'Dr. Garcia', 'Dr. Martinez', 'Dr. Rodriguez', 'Dr. Lopez',
            'Dr. Hernandez', 'Dr. Gonzalez', 'Dr. Perez', 'Dr. Torres', 'Dr. Ramirez'
        ];
        $hmos = ['Medicard', 'Maxicare', 'Philcare', 'Intellicare', 'Cocolife', 'Aetna'];

        $birthdate = fake()->dateTimeBetween('-80 years', '-18 years');
        $age = now()->diffInYears($birthdate);

        return [
            // Arrival Information
            'arrival_date' => fake()->dateTimeBetween('-30 days', 'now'),
            'arrival_time' => fake()->time('H:i'),

            // Patient Identification
            'last_name' => fake()->lastName(),
            'first_name' => fake()->firstName(),
            'middle_name' => fake()->optional(0.7)->firstName(),
            'birthdate' => $birthdate,
            'age' => $age,
            'sex' => fake()->randomElement($genders),
            'patient_no' => 'P' . fake()->unique()->numberBetween(10000, 99999),

            // Demographics
            'occupation' => fake()->optional(0.8)->jobTitle(),
            'religion' => fake()->optional(0.7)->randomElement(['Catholic', 'Protestant', 'Muslim', 'Buddhist', 'Hindu', 'None']),
            'attending_physician' => fake()->randomElement($physicians),
            'civil_status' => fake()->randomElement($civilStatuses),
            'nationality' => fake()->optional(0.9)->randomElement(['Filipino', 'American', 'Chinese', 'Japanese', 'Korean', 'Indian']),

            // Contact Information
            'present_address' => fake()->address(),
            'telephone_no' => fake()->optional(0.6)->phoneNumber(),
            'mobile_no' => '+63' . fake()->numberBetween(900000000, 999999999),

            // Emergency Contact
            'informant_name' => fake()->name(),
            'relationship' => fake()->randomElement(['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Guardian']),

            // Financial/Insurance
            'company_name' => fake()->optional(0.5)->company(),
            'hmo_name' => fake()->optional(0.6)->randomElement($hmos),
            'hmo_company_id_no' => fake()->optional(0.6)->regexify('[A-Z]{2}[0-9]{6}'),
            'validation_approval_code' => fake()->optional(0.5)->regexify('[A-Z0-9]{8}'),
            'validity' => fake()->optional(0.5)->dateTimeBetween('now', '+1 year')->format('Y-m-d'),

            // Emergency Staff Nurse Section
            'mode_of_arrival' => fake()->randomElement($modesOfArrival),
            'drug_allergies' => fake()->optional(0.8)->randomElement(['NONE', 'Penicillin', 'Sulfa drugs', 'Aspirin', 'Codeine', 'Ibuprofen']),
            'food_allergies' => fake()->optional(0.8)->randomElement(['NONE', 'Peanuts', 'Shellfish', 'Milk', 'Eggs', 'Wheat']),

            // Vital Signs
            'blood_pressure' => fake()->optional(0.7)->randomElement(['120/80', '110/70', '130/85', '140/90', '125/82', '135/88']),
            'heart_rate' => fake()->optional(0.7)->numberBetween(60, 100) . ' bpm',
            'respiratory_rate' => fake()->optional(0.7)->numberBetween(12, 20) . ' breaths/min',
            'temperature' => fake()->optional(0.7)->randomFloat(1, 36.5, 38.5) . '°C',
            'weight_kg' => fake()->optional(0.7)->randomFloat(1, 45.0, 120.0),
            'height_cm' => fake()->optional(0.7)->randomFloat(1, 150.0, 190.0),
            'pain_assessment_scale' => fake()->optional(0.7)->numberBetween(0, 10),
            'oxygen_saturation' => fake()->optional(0.7)->numberBetween(95, 100) . '%',

            // Medical Assessment
            'reason_for_consult' => fake()->randomElement($commonReasons),
            'time_seen' => fake()->time('H:i'),
            'history_of_present_illness' => fake()->optional(0.6)->paragraph(),
            'pertinent_physical_findings' => fake()->optional(0.5)->paragraph(),
            'plan_management' => fake()->optional(0.5)->paragraph(),
            'past_medical_history' => fake()->optional(0.6)->paragraph(),
            'family_history' => fake()->optional(0.5)->paragraph(),
            'social_personal_history' => fake()->optional(0.5)->paragraph(),
            'obstetrics_gynecology_history' => fake()->optional(0.4)->paragraph(),
            'lmp' => fake()->optional(0.3)->dateTimeBetween('-3 months', '-1 week')->format('Y-m-d'),
            'assessment_diagnosis' => fake()->optional(0.5)->paragraph(),
        ];
    }
}
