<?php

namespace Database\Seeders;

use App\Models\LabOrder;
use App\Models\LabTest;
use App\Models\Patient;
use App\Models\PatientVisit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class LabOrderSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        // Get some patients, visits, and users
        $patients = Patient::limit(15)->get();
        $visits = PatientVisit::limit(20)->get();
        $users = User::whereIn('role', ['doctor', 'laboratory_technologist', 'medtech'])->get();
        $labTests = LabTest::all();

        if ($patients->isEmpty() || $users->isEmpty() || $labTests->isEmpty()) {
            $this->command->warn('No patients, users, or lab tests found. Skipping lab order seeding.');
            return;
        }

        // Create 25 sample lab orders
        for ($i = 0; $i < 25; $i++) {
            $patient = $patients->random();
            $visit = $faker->optional(0.7)->randomElement($visits->toArray());
            $orderedBy = $users->random();
            $test = $labTests->random();

            $labOrder = LabOrder::create([
                'patient_id' => $patient->id,
                'patient_visit_id' => $visit ? $visit['id'] : null,
                'ordered_by' => $orderedBy->id,
                'notes' => $faker->optional(0.6)->paragraph(1),
            ]);

            // Attach the lab test to the order
            $labOrder->labTests()->attach($test->id, [
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('25 sample lab orders created successfully!');
    }
}
