<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\DailyTransaction;
use App\Models\ClinicProcedure;
// use App\Models\Expense; // Expense model removed
use App\Models\PatientTransfer;
use Illuminate\Database\Seeder;
use Faker\Factory;

class SimpleDailyTransactionSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Factory::create();

        // Get all appointments
        $appointments = Appointment::all();
        
        if ($appointments->isEmpty()) {
            $this->command->warn('No appointments found. Skipping daily transaction seeding.');
            return;
        }

        // Create daily transactions for each appointment
        foreach ($appointments as $appointment) {
            DailyTransaction::create([
                'transaction_date' => $appointment->appointment_date,
                'transaction_type' => 'appointment',
                'transaction_id' => 'APT-' . str_pad($appointment->id, 4, '0', STR_PAD_LEFT),
                'patient_name' => $appointment->patient_name,
                'specialist_name' => $appointment->specialist_name,
                'amount' => $appointment->price ?? $faker->randomFloat(2, 300, 1000),
                'payment_method' => $faker->randomElement(['cash', 'card', 'bank_transfer', 'check', 'hmo']),
                'status' => 'pending',
                'description' => $appointment->notes ?? 'Appointment transaction',
                'items_count' => 1,
                'appointments_count' => 1,
                'original_transaction_id' => $appointment->id,
                'original_table' => 'appointments',
                'created_at' => $appointment->created_at,
                'updated_at' => $appointment->updated_at,
            ]);
        }

        // Create some clinic procedures
        $procedures = [
            [
                'name' => 'General Consultation',
                'code' => 'CONS-GEN-001',
                'description' => 'Standard medical consultation',
                'category' => 'Consultation',
                'subcategory' => 'General',
                'price' => 300.00,
                'duration_minutes' => 30,
                'is_active' => true,
                'is_emergency' => false,
                'sort_order' => 1,
            ],
            [
                'name' => 'Blood Pressure Check',
                'code' => 'VITALS-BP-001',
                'description' => 'Blood pressure monitoring',
                'category' => 'Vital Signs',
                'subcategory' => 'Monitoring',
                'price' => 50.00,
                'duration_minutes' => 10,
                'is_active' => true,
                'is_emergency' => false,
                'sort_order' => 2,
            ],
            [
                'name' => 'Emergency Consultation',
                'code' => 'EMERG-CONS-001',
                'description' => 'Urgent medical consultation',
                'category' => 'Emergency',
                'subcategory' => 'Urgent',
                'price' => 500.00,
                'duration_minutes' => 45,
                'is_active' => true,
                'is_emergency' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($procedures as $procedure) {
            ClinicProcedure::updateOrCreate(
                ['name' => $procedure['name']],
                $procedure
            );
        }

        // Create some expenses (removed - Expense model deleted)

        // Create some patient transfers
        $transfers = [
            [
                'patient_id' => 1, // John Doe
                'from_hospital' => true,
                'to_clinic' => false,
                'transfer_reason' => 'Stable condition, moved to general ward',
                'status' => 'completed',
                'priority' => 'medium',
                'transferred_by' => 1, // Admin User
                'accepted_by' => 2, // Dr. John Smith
                'transfer_date' => $faker->dateTimeBetween('-7 days', 'now'),
                'completion_date' => $faker->dateTimeBetween('-6 days', 'now'),
                'notes' => 'Patient condition improved',
            ],
        ];

        foreach ($transfers as $transfer) {
            PatientTransfer::create($transfer);
        }

        $this->command->info('Daily transactions and related data created successfully!');
        $this->command->info('Created:');
        $this->command->info('- Daily Transactions: ' . DailyTransaction::count());
        $this->command->info('- Clinic Procedures: ' . ClinicProcedure::count());
        // $this->command->info('- Expenses: ' . Expense::count()); // Expense model removed
        $this->command->info('- Patient Transfers: ' . PatientTransfer::count());
    }
}
