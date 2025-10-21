<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\LabOrder;
use App\Models\LabResult;
use App\Models\AppointmentLabTest;
use App\Models\AppointmentLabOrder;

class FixLabOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lab:fix-orders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix existing lab orders that are missing LabResult records';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Fixing Existing Lab Orders');
        $this->info('========================');
        $this->newLine();

        // Get all lab orders
        $labOrders = LabOrder::all();
        $this->info("Total lab orders found: {$labOrders->count()}");
        $this->newLine();
        
        $fixedCount = 0;
        
        foreach ($labOrders as $order) {
            $this->info("Checking Lab Order ID: {$order->id}");
            
            // Check if this order has LabResult records
            $existingResults = LabResult::where('lab_order_id', $order->id)->count();
            $this->info("  - Existing LabResult records: {$existingResults}");
            
            if ($existingResults == 0) {
                $this->info("  - No LabResult records found. Checking for appointment lab tests...");
                
                // Check if this order is linked to an appointment
                $appointmentLabOrder = AppointmentLabOrder::where('lab_order_id', $order->id)->first();
                
                if ($appointmentLabOrder) {
                    $this->info("  - Found appointment link. Getting appointment lab tests...");
                    
                    // Get the appointment lab tests
                    $appointmentLabTests = AppointmentLabTest::where('appointment_id', $appointmentLabOrder->appointment_id)->get();
                    $this->info("  - Found {$appointmentLabTests->count()} appointment lab tests");
                    
                    // Create LabResult records for each appointment lab test
                    foreach ($appointmentLabTests as $appointmentLabTest) {
                        $labResult = LabResult::create([
                            'lab_order_id' => $order->id,
                            'lab_test_id' => $appointmentLabTest->lab_test_id,
                            'results' => []
                        ]);
                        
                        $this->info("    - Created LabResult ID: {$labResult->id} for LabTest ID: {$appointmentLabTest->lab_test_id}");
                    }
                    
                    $fixedCount++;
                } else {
                    $this->info("  - No appointment link found. This might be a standalone lab order.");
                }
            } else {
                $this->info("  - LabResult records already exist. Skipping.");
            }
            
            $this->newLine();
        }
        
        $this->info("Fix completed. Fixed {$fixedCount} lab orders.");
        
        return Command::SUCCESS;
    }
}