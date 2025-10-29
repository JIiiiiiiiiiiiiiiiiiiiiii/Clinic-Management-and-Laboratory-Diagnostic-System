<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\LabTest;
use App\Models\LabResult;
use App\Models\LabOrder;

class CheckLabTests extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lab:check-tests';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check LabTest records and their fields_schema data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking LabTest Records');
        $this->info('========================');
        $this->newLine();

        // Check all lab tests
        $labTests = LabTest::all();
        $this->info("Total LabTest records: {$labTests->count()}");
        $this->newLine();

        foreach ($labTests as $test) {
            $this->info("Test ID: {$test->id}");
            $this->info("  - Name: {$test->name}");
            $this->info("  - Code: {$test->code}");
            $this->info("  - Active: " . ($test->is_active ? 'Yes' : 'No'));
            $this->info("  - Fields Schema: " . (is_null($test->fields_schema) ? 'NULL' : 'EXISTS'));
            
            if ($test->fields_schema) {
                $this->info("  - Schema sections: " . count($test->fields_schema['sections'] ?? []));
            }
            $this->newLine();
        }

        // Check a specific lab order
        $this->info('Checking Lab Order #13');
        $this->info('=====================');
        $this->newLine();

        $order = LabOrder::with(['results.test'])->find(13);
        if ($order) {
            $this->info("Order ID: {$order->id}");
            $this->info("Results count: {$order->results->count()}");
            
            foreach ($order->results as $result) {
                $this->info("  - Result ID: {$result->id}");
                $this->info("  - Lab Test ID: {$result->lab_test_id}");
                if ($result->test) {
                    $this->info("  - Test Name: {$result->test->name}");
                    $this->info("  - Test Schema: " . (is_null($result->test->fields_schema) ? 'NULL' : 'EXISTS'));
                } else {
                    $this->info("  - Test: NULL");
                }
                $this->newLine();
            }
        } else {
            $this->info("Lab Order #13 not found");
        }

        return Command::SUCCESS;
    }
}