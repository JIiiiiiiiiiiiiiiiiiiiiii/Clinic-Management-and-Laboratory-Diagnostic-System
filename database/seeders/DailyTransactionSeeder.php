<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\DailyTransaction;
use App\Models\BillingTransaction;
use App\Models\BillingTransactionItem;
use App\Models\DoctorPayment;
// use App\Models\Expense; // Expense model removed
use App\Models\ClinicProcedure;
use App\Models\PatientTransfer;
use Illuminate\Database\Seeder;
use Faker\Factory;

class DailyTransactionSeeder extends Seeder
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
            // Create daily transaction for the appointment
            DailyTransaction::create([
                'transaction_date' => $appointment->appointment_date,
                'transaction_type' => 'appointment',
                'transaction_id' => 'APT-' . str_pad($appointment->id, 4, '0', STR_PAD_LEFT),
                'patient_name' => $appointment->patient_name,
                'specialist_name' => $appointment->specialist_name,
                'amount' => $appointment->price ?? $faker->randomFloat(2, 300, 1000),
                'payment_method' => $faker->randomElement(['cash', 'card', 'bank_transfer', 'check', 'hmo']),
                'status' => in_array($appointment->billing_status, ['pending', 'paid', 'cancelled', 'approved', 'refunded']) 
                    ? $appointment->billing_status 
                    : 'pending',
                'description' => $appointment->notes ?? 'Appointment transaction',
                'items_count' => 1,
                'appointments_count' => 1,
                'original_transaction_id' => $appointment->id,
                'original_table' => 'appointments',
                'created_at' => $appointment->created_at,
                'updated_at' => $appointment->updated_at,
            ]);

            // Create billing transaction if appointment has billing
            if ($appointment->price && $appointment->price > 0) {
                // Get the actual patient ID from the patients table
                $patient = \App\Models\Patient::where('patient_no', $appointment->patient_id)->first();
                $patientId = $patient ? $patient->id : 1; // Default to patient 1 if not found
                
                // Get the actual doctor ID from the users table
                $doctor = \App\Models\User::where('employee_id', $appointment->specialist_id)->first();
                $doctorId = $doctor ? $doctor->id : 2; // Default to doctor 2 if not found
                
                $billingTransaction = BillingTransaction::create([
                    'transaction_id' => 'BILL-' . str_pad($appointment->id, 4, '0', STR_PAD_LEFT) . '-' . time(),
                    'patient_id' => $patientId,
                    'doctor_id' => $doctorId,
                    'payment_type' => $faker->randomElement(['cash', 'health_card', 'discount']),
                    'total_amount' => $appointment->price,
                    'discount_amount' => $faker->optional(0.2)->randomFloat(2, 0, $appointment->price * 0.1) ?? 0,
                    'discount_percentage' => $faker->optional(0.2)->randomFloat(2, 0, 10) ?? 0,
                    'hmo_provider' => $faker->optional(0.3)->randomElement(['PhilHealth', 'Maxicare', 'Intellicare']),
                    'hmo_reference' => $faker->optional(0.3)->bothify('HMO-####'),
                    'payment_method' => $faker->randomElement(['cash', 'card', 'bank_transfer', 'check', 'hmo']),
                    'payment_reference' => $faker->optional(0.3)->bothify('PAY-####'),
                    'status' => in_array($appointment->billing_status, ['pending', 'paid', 'cancelled', 'approved', 'refunded']) 
                        ? $appointment->billing_status 
                        : 'pending',
                    'description' => 'Appointment billing for ' . $appointment->appointment_type,
                    'notes' => $appointment->notes ?? 'Appointment billing',
                    'transaction_date' => $appointment->appointment_date->format('Y-m-d') . ' ' . $appointment->appointment_time->format('H:i:s'),
                    'due_date' => $faker->dateTimeBetween($appointment->appointment_date, '+30 days'),
                    'created_by' => 1, // Admin User
                    'created_at' => $appointment->created_at,
                    'updated_at' => $appointment->updated_at,
                ]);

                // Create billing transaction item
                BillingTransactionItem::create([
                    'billing_transaction_id' => $billingTransaction->id,
                    'item_type' => 'consultation',
                    'item_name' => $appointment->appointment_type,
                    'item_description' => 'Appointment service',
                    'quantity' => 1,
                    'unit_price' => $appointment->price,
                    'total_price' => $appointment->price,
                ]);
            }
        }

        // Create doctor payments for completed appointments
        $completedAppointments = Appointment::where('status', 'Completed')->get();
        foreach ($completedAppointments as $appointment) {
            if ($appointment->price && $appointment->price > 0) {
                // Get the actual doctor ID from the users table
                $doctor = \App\Models\User::where('employee_id', $appointment->specialist_id)->first();
                if ($doctor) {
                    DoctorPayment::create([
                        'doctor_id' => $doctor->id,
                        'payment_period_from' => $appointment->appointment_date,
                        'payment_period_to' => $appointment->appointment_date,
                        'amount_paid' => $appointment->price * 0.7, // 70% commission
                        'payment_method' => 'bank_transfer',
                        'payment_reference' => 'COMM-' . str_pad($appointment->id, 4, '0', STR_PAD_LEFT),
                        'remarks' => 'Commission for ' . $appointment->appointment_type,
                        'status' => 'paid',
                        'payment_date' => $appointment->appointment_date,
                        'created_by' => 1,
                    ]);
                }
            }
        }

        // Create some clinic procedures
        $procedures = [
            [
                'name' => 'General Consultation',
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
                'patient_id' => 1, // Use numeric patient ID
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
            [
                'patient_id' => 2, // Use numeric patient ID
                'from_hospital' => false,
                'to_clinic' => true,
                'transfer_reason' => 'Referred to specialist for further evaluation',
                'status' => 'pending',
                'priority' => 'high',
                'transferred_by' => 2, // Dr. John Smith
                'accepted_by' => 1, // Admin User
                'transfer_date' => $faker->dateTimeBetween('-3 days', 'now'),
                'completion_date' => null,
                'notes' => 'Requires specialist consultation',
            ],
        ];

        foreach ($transfers as $transfer) {
            PatientTransfer::create($transfer);
        }

        $this->command->info('Daily transactions and related data created successfully!');
        $this->command->info('Created:');
        $this->command->info('- Daily Transactions: ' . DailyTransaction::count());
        $this->command->info('- Billing Transactions: ' . BillingTransaction::count());
        $this->command->info('- Billing Transaction Items: ' . BillingTransactionItem::count());
        $this->command->info('- Doctor Payments: ' . DoctorPayment::count());
        $this->command->info('- Clinic Procedures: ' . ClinicProcedure::count());
        // $this->command->info('- Expenses: ' . Expense::count()); // Expense model removed
        $this->command->info('- Patient Transfers: ' . PatientTransfer::count());
    }
}
