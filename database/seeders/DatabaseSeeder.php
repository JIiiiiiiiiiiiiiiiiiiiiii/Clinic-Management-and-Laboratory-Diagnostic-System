<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Patient;
use App\Models\AppointmentSlot;
use App\Models\LaboratoryTest;
use App\Models\Inventory;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'username' => 'admin',
            'password' => Hash::make('password'),
            'full_name' => 'System Administrator',
            'email' => 'admin@clinic.com',
            'role' => 'Admin',
            'gender' => 'Other',
            'contact_number' => '1234567890',
            'address' => '123 Admin Street',
        ]);

        // Create staff user
        $staff = User::create([
            'username' => 'staff',
            'password' => Hash::make('password'),
            'full_name' => 'Clinic Staff',
            'email' => 'staff@clinic.com',
            'role' => 'Staff',
            'gender' => 'Female',
            'contact_number' => '1234567891',
            'address' => '123 Staff Street',
        ]);

        // Create doctor user
        $doctor = User::create([
            'username' => 'doctor',
            'password' => Hash::make('password'),
            'full_name' => 'Dr. John Smith',
            'email' => 'doctor@clinic.com',
            'role' => 'Doctor',
            'gender' => 'Male',
            'contact_number' => '1234567892',
            'address' => '123 Doctor Street',
        ]);

        // Create laboratory technician user
        $labTech = User::create([
            'username' => 'labtech',
            'password' => Hash::make('password'),
            'full_name' => 'Lab Technician',
            'email' => 'labtech@clinic.com',
            'role' => 'LaboratoryTech',
            'gender' => 'Female',
            'contact_number' => '1234567893',
            'address' => '123 Lab Street',
        ]);

        // Create patient user
        $patientUser = User::create([
            'username' => 'patient',
            'password' => Hash::make('password'),
            'full_name' => 'John Doe',
            'email' => 'patient@clinic.com',
            'role' => 'Patient',
            'gender' => 'Male',
            'contact_number' => '1234567894',
            'address' => '123 Patient Street',
            'birth_date' => '1990-01-01',
        ]);

        // Create patient record
        $patient = Patient::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'gender' => 'Male',
            'birth_date' => '1990-01-01',
            'contact_info' => '1234567894',
            'address' => '123 Patient Street',
            'user_id' => $patientUser->user_id,
        ]);

        // Create appointment slots for the next 7 days
        for ($i = 0; $i < 7; $i++) {
            $date = now()->addDays($i);

            // Morning slots (9 AM - 12 PM)
            for ($hour = 9; $hour < 12; $hour++) {
                AppointmentSlot::create([
                    'start_time' => $date->copy()->setTime($hour, 0, 0),
                    'end_time' => $date->copy()->setTime($hour, 30, 0),
                    'is_available' => true,
                ]);

                AppointmentSlot::create([
                    'start_time' => $date->copy()->setTime($hour, 30, 0),
                    'end_time' => $date->copy()->setTime($hour + 1, 0, 0),
                    'is_available' => true,
                ]);
            }

            // Afternoon slots (2 PM - 5 PM)
            for ($hour = 14; $hour < 17; $hour++) {
                AppointmentSlot::create([
                    'start_time' => $date->copy()->setTime($hour, 0, 0),
                    'end_time' => $date->copy()->setTime($hour, 30, 0),
                    'is_available' => true,
                ]);

                AppointmentSlot::create([
                    'start_time' => $date->copy()->setTime($hour, 30, 0),
                    'end_time' => $date->copy()->setTime($hour + 1, 0, 0),
                    'is_available' => true,
                ]);
            }
        }

        // Create laboratory tests
        $labTests = [
            [
                'test_name' => 'Complete Blood Count (CBC)',
                'description' => 'Complete blood count including hemoglobin, hematocrit, white blood cells, red blood cells, and platelets',
                'price' => 500.00,
            ],
            [
                'test_name' => 'Urinalysis',
                'description' => 'Urine analysis including physical, chemical, and microscopic examination',
                'price' => 300.00,
            ],
            [
                'test_name' => 'Fecalysis',
                'description' => 'Stool examination for parasites and other abnormalities',
                'price' => 250.00,
            ],
            [
                'test_name' => 'Blood Sugar (FBS)',
                'description' => 'Fasting blood sugar test for diabetes screening',
                'price' => 200.00,
            ],
            [
                'test_name' => 'Cholesterol Panel',
                'description' => 'Complete cholesterol profile including HDL, LDL, and triglycerides',
                'price' => 400.00,
            ],
        ];

        foreach ($labTests as $test) {
            LaboratoryTest::create($test);
        }

        // Create inventory items
        $inventoryItems = [
            [
                'item_name' => 'Paracetamol 500mg',
                'description' => 'Pain reliever and fever reducer',
                'category' => 'Medication',
                'quantity' => 1000,
                'unit' => 'tablets',
                'expiration_date' => now()->addYears(2),
                'storage_instructions' => 'Store in a cool, dry place',
            ],
            [
                'item_name' => 'Syringes 5ml',
                'description' => 'Disposable syringes for injections',
                'category' => 'Medical Supplies',
                'quantity' => 500,
                'unit' => 'pieces',
                'expiration_date' => now()->addYears(3),
                'storage_instructions' => 'Store in sterile packaging',
            ],
            [
                'item_name' => 'Gauze Bandages',
                'description' => 'Sterile gauze bandages for wound care',
                'category' => 'Medical Supplies',
                'quantity' => 200,
                'unit' => 'rolls',
                'expiration_date' => now()->addYears(5),
                'storage_instructions' => 'Keep dry and clean',
            ],
            [
                'item_name' => 'Blood Collection Tubes',
                'description' => 'Vacutainer tubes for blood collection',
                'category' => 'Laboratory Supply',
                'quantity' => 300,
                'unit' => 'pieces',
                'expiration_date' => now()->addYears(2),
                'storage_instructions' => 'Store at room temperature',
            ],
        ];

        foreach ($inventoryItems as $item) {
            Inventory::create($item);
        }

        $this->command->info('Clinic Management System seeded successfully!');
        $this->command->info('Default users created:');
        $this->command->info('- Admin: admin/password');
        $this->command->info('- Staff: staff/password');
        $this->command->info('- Doctor: doctor/password');
        $this->command->info('- Lab Tech: labtech/password');
        $this->command->info('- Patient: patient/password');
    }
}
