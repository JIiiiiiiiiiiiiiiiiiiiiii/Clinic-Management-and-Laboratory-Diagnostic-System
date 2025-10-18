<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Database\Seeder;
use Faker\Factory;

class AppointmentSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Factory::create();

        // Get some patients and doctors
        $patients = Patient::all();
        $doctors = User::where('role', 'doctor')->get();
        $admins = User::where('role', 'admin')->get();

        if ($patients->isEmpty() || $doctors->isEmpty()) {
            $this->command->warn('No patients or doctors found. Skipping appointment seeding.');
            return;
        }

        // Create 20 sample appointments
        for ($i = 0; $i < 20; $i++) {
            $patient = $patients->random();
            $doctor = $doctors->random();
            $appointmentDate = $faker->dateTimeBetween('now', '+30 days');
            
            $appointment = Appointment::create([
                'patient_id' => 'P' . str_pad($patient->id, 3, '0', STR_PAD_LEFT),
                'patient_name' => $patient->first_name . ' ' . $patient->last_name,
                'contact_number' => $patient->phone ?? $faker->phoneNumber(),
                'appointment_type' => $faker->randomElement(['consultation', 'checkup', 'fecalysis', 'cbc', 'urinalysis']),
                'price' => $faker->randomFloat(2, 300, 1000),
                'specialist_type' => 'doctor',
                'specialist_name' => $doctor->name,
                'specialist_id' => 'D' . str_pad($doctor->id, 3, '0', STR_PAD_LEFT),
                'appointment_date' => $appointmentDate->format('Y-m-d'),
                'appointment_time' => $faker->time('H:i'),
                'duration' => $faker->randomElement(['30 min', '45 min', '60 min']),
                'status' => $faker->randomElement(['Pending', 'Confirmed', 'Completed', 'Cancelled']),
                'billing_status' => $faker->randomElement(['pending', 'paid', 'in_transaction', 'cancelled']),
                'billing_reference' => $faker->optional(0.3)->bothify('BILL-####'),
                'confirmation_sent' => $faker->boolean(70),
                'notes' => $faker->optional(0.3)->sentence(),
                'special_requirements' => $faker->optional(0.2)->sentence(),
                'source' => 'Walk-in', // Seeder creates walk-in appointments
                'booking_method' => 'Walk-in',
                'created_at' => $faker->dateTimeBetween('-30 days', 'now'),
            ]);

            // Create notifications for admins when new appointment is created
            foreach ($admins as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'type' => 'appointment_created',
                    'title' => 'New Appointment Created',
                    'message' => "New appointment for {$patient->first_name} {$patient->last_name} with {$doctor->name}",
                    'data' => json_encode([
                        'appointment_id' => $appointment->id,
                        'patient_id' => $patient->id,
                        'doctor_id' => $doctor->id,
                    ]),
                    'read' => false,
                ]);
            }

            // Create notification for patient (only if patient has a user_id)
            if ($patient->user_id) {
                Notification::create([
                    'user_id' => $patient->user_id,
                    'type' => 'appointment_created',
                    'title' => 'Appointment Scheduled',
                    'message' => "Your appointment with {$doctor->name} has been scheduled for {$appointmentDate->format('M d, Y')} at {$appointment->appointment_time}",
                    'data' => json_encode([
                        'appointment_id' => $appointment->id,
                        'patient_id' => $patient->id,
                        'doctor_id' => $doctor->id,
                    ]),
                    'read' => false,
                ]);
            }
        }

        $this->command->info('20 sample appointments and notifications created successfully!');
    }
}
