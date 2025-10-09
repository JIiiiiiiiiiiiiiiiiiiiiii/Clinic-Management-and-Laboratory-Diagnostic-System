<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DoctorPayment;
use App\Models\User;
use Faker\Factory as Faker;

class DoctorPaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Clear existing data
        DoctorPayment::query()->delete();

        // Get doctors
        $doctors = User::where('role', 'doctor')->get();

        if ($doctors->isEmpty()) {
            $this->command->info('No doctors found. Please run UserSeeder first.');
            return;
        }

        // Create doctor payments for each doctor
        foreach ($doctors as $doctor) {
            // Create 3-5 payments per doctor
            $paymentCount = $faker->numberBetween(3, 5);
            
            for ($i = 0; $i < $paymentCount; $i++) {
                $startDate = $faker->dateTimeBetween('-6 months', '-1 month');
                $endDate = $faker->dateTimeBetween($startDate, 'now');
                $paymentDate = $faker->dateTimeBetween($endDate, 'now');
                
                $basicSalary = $faker->randomFloat(2, 15000, 50000);
                $deductions = $faker->randomFloat(2, 0, 5000);
                $holidayPay = $faker->randomFloat(2, 0, 3000);
                $incentives = $faker->randomFloat(2, 0, 2000);
                $netPayment = $basicSalary + $holidayPay + $incentives - $deductions;
                
                DoctorPayment::create([
                    'doctor_id' => $doctor->id,
                    'basic_salary' => $basicSalary,
                    'deductions' => $deductions,
                    'holiday_pay' => $holidayPay,
                    'incentives' => $incentives,
                    'net_payment' => $netPayment,
                    'payment_date' => $paymentDate,
                    'status' => $faker->randomElement(['pending', 'paid', 'paid', 'paid']), // More likely to be paid
                    'notes' => $faker->optional(0.7)->sentence(),
                    'created_by' => 1, // Admin user
                ]);
            }
        }

        $this->command->info('Doctor payments created successfully!');
        $this->command->info('Created: ' . DoctorPayment::count() . ' doctor payments');
    }
}
