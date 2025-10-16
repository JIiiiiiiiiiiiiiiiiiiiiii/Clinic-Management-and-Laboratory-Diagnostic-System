<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Patient;
use App\Models\Appointment;
use App\Models\LabOrder;
use App\Models\BillingTransaction;
use App\Models\InventoryItem;
use App\Models\Report;

class DatabaseIntegrationSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $this->command->info('Starting database integration verification...');

        // 1. Verify menu structure integration
        $this->verifyMenuIntegration();

        // 2. Test data creation for each menu item
        $this->testDataCreation();

        // 3. Verify database relationships
        $this->verifyDatabaseRelationships();

        // 4. Clean up test data
        $this->cleanupTestData();

        $this->command->info('Database integration verification completed!');
    }

    /**
     * Verify menu structure integration
     */
    private function verifyMenuIntegration()
    {
        $this->command->info('Verifying menu structure integration...');

        $menus = [
            'Patients' => [
                'tables' => ['patients', 'patient_visits', 'patient_transfers'],
                'models' => ['Patient', 'PatientTransfer']
            ],
            'Laboratory' => [
                'tables' => ['lab_orders', 'lab_results', 'lab_result_values', 'lab_tests'],
                'models' => ['LabOrder', 'LabResult', 'LabResultValue', 'LabTest']
            ],
            'Inventory' => [
                'tables' => ['inventory_items', 'inventory_movements'],
                'models' => ['InventoryItem', 'InventoryMovement']
            ],
            'Appointments' => [
                'tables' => ['appointments', 'pending_appointments', 'appointment_billing_links'],
                'models' => ['Appointment', 'PendingAppointment', 'AppointmentBillingLink']
            ],
            'Reports' => [
                'tables' => ['reports'],
                'models' => ['Report']
            ],
            'Specialist Management' => [
                'tables' => ['users'],
                'models' => ['User']
            ],
            'Billing' => [
                'tables' => ['billing_transactions', 'billing_transaction_items', 'doctor_payments', 'expenses', 'daily_transactions'],
                'models' => ['BillingTransaction', 'BillingTransactionItem', 'DoctorPayment', 'Expense', 'DailyTransaction']
            ]
        ];

        foreach ($menus as $menu => $config) {
            $this->command->info("Checking {$menu} integration...");
            
            // Check if tables exist
            foreach ($config['tables'] as $table) {
                if (DB::getSchemaBuilder()->hasTable($table)) {
                    $this->command->info("  ✓ Table {$table} exists");
                } else {
                    $this->command->error("  ✗ Table {$table} missing");
                }
            }

            // Check if models exist
            foreach ($config['models'] as $model) {
                $modelClass = "App\\Models\\{$model}";
                if (class_exists($modelClass)) {
                    $this->command->info("  ✓ Model {$model} exists");
                } else {
                    $this->command->error("  ✗ Model {$model} missing");
                }
            }
        }
    }

    /**
     * Test data creation for each menu item
     */
    private function testDataCreation()
    {
        $this->command->info('Testing data creation for each menu item...');

        // Test Patients menu
        $this->testPatientsMenu();

        // Test Laboratory menu
        $this->testLaboratoryMenu();

        // Test Inventory menu
        $this->testInventoryMenu();

        // Test Appointments menu
        $this->testAppointmentsMenu();

        // Test Reports menu
        $this->testReportsMenu();

        // Test Specialist Management menu
        $this->testSpecialistManagementMenu();

        // Test Billing menu
        $this->testBillingMenu();
    }

    /**
     * Test Patients menu data creation
     */
    private function testPatientsMenu()
    {
        $this->command->info('Testing Patients menu data creation...');

        try {
            // Create test user
            $user = User::create([
                'name' => 'Test Patient User',
                'email' => 'testpatient@example.com',
                'password' => bcrypt('password'),
                'role' => 'patient'
            ]);

            // Create test patient
            $patient = Patient::create([
                'user_id' => $user->id,
                'first_name' => 'Test',
                'last_name' => 'Patient',
                'patient_no' => 'TEST-' . time(),
                'birthdate' => '1990-01-01',
                'age' => 34,
                'sex' => 'Male',
                'mobile_no' => '09123456789',
                'present_address' => 'Test Address'
            ]);

            $this->command->info('  ✓ Patient created successfully');

            // Test patient relationships
            $this->testPatientRelationships($patient);

        } catch (\Exception $e) {
            $this->command->error('  ✗ Patient creation failed: ' . $e->getMessage());
        }
    }

    /**
     * Test patient relationships
     */
    private function testPatientRelationships($patient)
    {
        try {
            // Test appointments relationship
            $appointment = Appointment::create([
                'patient_name' => $patient->first_name . ' ' . $patient->last_name,
                'patient_id' => $patient->id,
                'appointment_type' => 'consultation',
                'appointment_date' => now()->addDays(1),
                'appointment_time' => '09:00:00',
                'status' => 'Pending',
                'specialist_type' => 'doctor',
                'specialist_name' => 'Dr. Test',
                'specialist_id' => '1'
            ]);

            $this->command->info('  ✓ Patient appointment relationship works');

            // Test lab orders relationship
            $labOrder = LabOrder::create([
                'patient_id' => $patient->id,
                'status' => 'pending',
                'notes' => 'Test lab order'
            ]);

            $this->command->info('  ✓ Patient lab order relationship works');

        } catch (\Exception $e) {
            $this->command->error('  ✗ Patient relationships failed: ' . $e->getMessage());
        }
    }

    /**
     * Test Laboratory menu data creation
     */
    private function testLaboratoryMenu()
    {
        $this->command->info('Testing Laboratory menu data creation...');

        try {
            // Test lab order creation
            $labOrder = LabOrder::create([
                'patient_id' => Patient::first()->id,
                'status' => 'Pending',
                'notes' => 'Test lab order for integration'
            ]);

            $this->command->info('  ✓ Lab order created successfully');

        } catch (\Exception $e) {
            $this->command->error('  ✗ Laboratory menu test failed: ' . $e->getMessage());
        }
    }

    /**
     * Test Inventory menu data creation
     */
    private function testInventoryMenu()
    {
        $this->command->info('Testing Inventory menu data creation...');

        try {
            // Test inventory item creation
            $inventoryItem = InventoryItem::create([
                'item_name' => 'Test Inventory Item',
                'item_code' => 'TEST-' . time(),
                'category' => 'Test Category',
                'stock' => 100,
                'low_stock_alert' => 10,
                'assigned_to' => 'doctor',
                'status' => 'active'
            ]);

            $this->command->info('  ✓ Inventory item created successfully');

        } catch (\Exception $e) {
            $this->command->error('  ✗ Inventory menu test failed: ' . $e->getMessage());
        }
    }

    /**
     * Test Appointments menu data creation
     */
    private function testAppointmentsMenu()
    {
        $this->command->info('Testing Appointments menu data creation...');

        try {
            // Test appointment creation
            $appointment = Appointment::create([
                'patient_name' => 'Test Appointment Patient',
                'patient_id' => Patient::first()->id,
                'appointment_type' => 'consultation',
                'appointment_date' => now()->addDays(1),
                'appointment_time' => '10:00:00',
                'status' => 'Pending',
                'specialist_type' => 'doctor',
                'specialist_name' => 'Dr. Test Specialist',
                'specialist_id' => '1'
            ]);

            $this->command->info('  ✓ Appointment created successfully');

        } catch (\Exception $e) {
            $this->command->error('  ✗ Appointments menu test failed: ' . $e->getMessage());
        }
    }

    /**
     * Test Reports menu data creation
     */
    private function testReportsMenu()
    {
        $this->command->info('Testing Reports menu data creation...');

        try {
            // Test report creation
            $report = Report::create([
                'report_type' => 'patients',
                'report_name' => 'Test Patient Report',
                'description' => 'Test report for integration verification',
                'period' => 'monthly',
                'start_date' => now()->startOfMonth(),
                'end_date' => now()->endOfMonth(),
                'status' => 'active',
                'created_by' => User::first()->id
            ]);

            $this->command->info('  ✓ Report created successfully');

        } catch (\Exception $e) {
            $this->command->error('  ✗ Reports menu test failed: ' . $e->getMessage());
        }
    }

    /**
     * Test Specialist Management menu data creation
     */
    private function testSpecialistManagementMenu()
    {
        $this->command->info('Testing Specialist Management menu data creation...');

        try {
            // Test specialist user creation
            $specialist = User::create([
                'name' => 'Dr. Test Specialist',
                'email' => 'testspecialist@example.com',
                'password' => bcrypt('password'),
                'role' => 'doctor'
            ]);

            $this->command->info('  ✓ Specialist user created successfully');

        } catch (\Exception $e) {
            $this->command->error('  ✗ Specialist Management menu test failed: ' . $e->getMessage());
        }
    }

    /**
     * Test Billing menu data creation
     */
    private function testBillingMenu()
    {
        $this->command->info('Testing Billing menu data creation...');

        try {
            // Test billing transaction creation
            $billingTransaction = BillingTransaction::create([
                'transaction_id' => 'TEST-' . time(),
                'patient_id' => Patient::first()->id,
                'total_amount' => 500.00,
                'payment_method' => 'Cash',
                'status' => 'paid',
                'transaction_date' => now(),
                'description' => 'Test billing transaction',
                'created_by' => User::first()->id
            ]);

            $this->command->info('  ✓ Billing transaction created successfully');

        } catch (\Exception $e) {
            $this->command->error('  ✗ Billing menu test failed: ' . $e->getMessage());
        }
    }

    /**
     * Verify database relationships
     */
    private function verifyDatabaseRelationships()
    {
        $this->command->info('Verifying database relationships...');

        // Test patient relationships
        $patient = Patient::with(['appointments', 'labOrders', 'visits'])->first();
        if ($patient) {
            $this->command->info('  ✓ Patient relationships working');
        }

        // Test appointment relationships
        $appointment = Appointment::with(['patient'])->first();
        if ($appointment) {
            $this->command->info('  ✓ Appointment relationships working');
        }

        // Test billing transaction relationships
        $billingTransaction = BillingTransaction::with(['patient', 'doctor'])->first();
        if ($billingTransaction) {
            $this->command->info('  ✓ Billing transaction relationships working');
        }
    }

    /**
     * Clean up test data
     */
    private function cleanupTestData()
    {
        $this->command->info('Cleaning up test data...');

        try {
            // Delete test users
            User::where('email', 'like', '%test%')->delete();
            
            // Delete test patients
            Patient::where('first_name', 'like', '%Test%')->delete();
            
            // Delete test appointments
            Appointment::where('patient_name', 'like', '%Test%')->delete();
            
            // Delete test lab orders
            LabOrder::where('notes', 'like', '%Test%')->delete();
            
            // Delete test billing transactions
            BillingTransaction::where('transaction_id', 'like', '%TEST%')->delete();
            
            // Delete test inventory items
            InventoryItem::where('item_name', 'like', '%Test%')->delete();
            
            // Delete test reports
            Report::where('report_name', 'like', '%Test%')->delete();

            $this->command->info('  ✓ Test data cleaned up successfully');

        } catch (\Exception $e) {
            $this->command->error('  ✗ Test data cleanup failed: ' . $e->getMessage());
        }
    }
}
