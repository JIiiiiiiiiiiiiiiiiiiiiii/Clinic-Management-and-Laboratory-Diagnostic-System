<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\LabTest;
use App\Models\BillingTransaction;
use App\Models\AppointmentLabTest;
use App\Models\BillingTransactionItem;
use App\Models\LabOrder;
use App\Models\LabResult;
use App\Models\AppointmentLabOrder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AppointmentLabService
{
    /**
     * Add lab tests to an appointment
     */
    public function addLabTestsToAppointment(Appointment $appointment, array $labTestIds, int $addedBy, string $notes = null): array
    {
        \Log::info('AppointmentLabService::addLabTestsToAppointment called', [
            'appointment_id' => $appointment->id,
            'lab_test_ids' => $labTestIds,
            'added_by' => $addedBy,
            'notes' => $notes
        ]);

        // Allow lab tests to be added to appointments without requiring existing billing transactions
        // The billing transaction will be created later with the complete total including lab tests

        return DB::transaction(function () use ($appointment, $labTestIds, $addedBy, $notes) {
            try {
                // Get lab tests
                $labTests = LabTest::whereIn('id', $labTestIds)->get();
                
                if ($labTests->isEmpty()) {
                    throw new \Exception('No valid lab tests found');
                }

                $totalLabAmount = $labTests->sum('price');
                $newTotal = $appointment->price + $totalLabAmount;

                // Update appointment totals
                $appointment->update([
                    'total_lab_amount' => $totalLabAmount,
                    'final_total_amount' => $newTotal
                ]);

                // Create appointment lab test records
                foreach ($labTests as $labTest) {
                    AppointmentLabTest::create([
                        'appointment_id' => $appointment->id,
                        'lab_test_id' => $labTest->id,
                        'unit_price' => $labTest->price,
                        'total_price' => $labTest->price,
                        'added_by' => $addedBy,
                        'status' => 'pending',
                        'notes' => $notes
                    ]);
                }

                // Get AppointmentLabTest records (not just LabTest models)
                $appointmentLabTests = $appointment->labTests()->with('labTest')->get();
                
                // Update billing transaction with lab tests (if it exists)
                $billingTransaction = $this->updateBillingTransactionIfExists($appointment, $appointmentLabTests);

                // Create lab order
                $labOrder = $this->createLabOrder($appointment, $labTests, $addedBy, $notes);

                // Link appointment to lab order
                AppointmentLabOrder::create([
                    'appointment_id' => $appointment->id,
                    'lab_order_id' => $labOrder->id
                ]);

                Log::info('Lab tests added to appointment', [
                    'appointment_id' => $appointment->id,
                    'lab_tests_count' => $labTests->count(),
                    'total_lab_amount' => $totalLabAmount,
                    'new_total' => $newTotal,
                    'added_by' => $addedBy
                ]);

                return [
                    'success' => true,
                    'total_lab_amount' => $totalLabAmount,
                    'final_total' => $newTotal,
                    'lab_tests_added' => $labTests->count(),
                    'lab_order_id' => $labOrder->id
                ];

            } catch (\Exception $e) {
                Log::error('Failed to add lab tests to appointment', [
                    'appointment_id' => $appointment->id,
                    'error' => $e->getMessage()
                ]);
                
                throw $e;
            }
        });
    }

    /**
     * Update billing transaction with lab tests (if it exists)
     */
    private function updateBillingTransactionIfExists(Appointment $appointment, $appointmentLabTests): ?BillingTransaction
    {
        // Get existing billing transaction through appointment billing links
        $billingTransaction = $appointment->billingTransactions()->first();

        if (!$billingTransaction) {
            // No existing billing transaction - this is fine, it will be created later
            Log::info('No existing billing transaction found for appointment. Lab tests added, transaction will be created later.', [
                'appointment_id' => $appointment->id,
                'lab_tests_count' => $appointmentLabTests->count()
            ]);
            return null;
        }

        Log::info('Updating existing billing transaction with lab tests', [
            'billing_transaction_id' => $billingTransaction->id,
            'appointment_id' => $appointment->id,
            'appointment_lab_tests_count' => $appointmentLabTests->count(),
            'final_total_amount' => $appointment->final_total_amount
        ]);

        // Update transaction total
        $billingTransaction->update([
            'total_amount' => $appointment->final_total_amount,
            'amount' => $appointment->final_total_amount,
            'is_itemized' => true
        ]);

        // Clear existing lab test items (keep appointment items)
        $deletedCount = $billingTransaction->items()->where('item_type', 'laboratory')->delete();
        Log::info("Deleted {$deletedCount} existing lab test items");

        // Ensure consultation item exists with proper label
        $consultationItem = $billingTransaction->items()->where('item_type', 'consultation')->first();
        if (!$consultationItem) {
            $appointmentTypeLabel = $appointment->appointment_type === 'general_consultation' ? 'Consultation' : ucfirst($appointment->appointment_type);
            BillingTransactionItem::create([
                'billing_transaction_id' => $billingTransaction->id,
                'item_type' => 'consultation',
                'item_name' => $appointmentTypeLabel . ' Appointment',
                'item_description' => "Appointment for {$appointment->patient_name} on " . ($appointment->appointment_date ? $appointment->appointment_date->format('M d, Y') : 'N/A') . " at " . ($appointment->appointment_time ? $appointment->appointment_time->format('g:i A') : 'N/A'),
                'quantity' => 1,
                'unit_price' => $appointment->price,
                'total_price' => $appointment->price
            ]);
            Log::info('Created consultation item for billing transaction');
        } else {
            // Update existing consultation item if needed
            $appointmentTypeLabel = $appointment->appointment_type === 'general_consultation' ? 'Consultation' : ucfirst($appointment->appointment_type);
            if (!str_contains($consultationItem->item_name, $appointmentTypeLabel)) {
                $consultationItem->update([
                    'item_name' => $appointmentTypeLabel . ' Appointment',
                ]);
            }
        }

        // Add lab test items to transaction using AppointmentLabTest records
        $itemsCreated = 0;
        foreach ($appointmentLabTests as $appointmentLabTest) {
            // Ensure labTest relationship is loaded
            if (!$appointmentLabTest->relationLoaded('labTest')) {
                $appointmentLabTest->load('labTest');
            }
            
            if ($appointmentLabTest->labTest) {
                BillingTransactionItem::create([
                    'billing_transaction_id' => $billingTransaction->id,
                    'item_type' => 'laboratory',
                    'lab_test_id' => $appointmentLabTest->lab_test_id,
                    'item_name' => $appointmentLabTest->labTest->name,
                    'item_description' => "Lab test: {$appointmentLabTest->labTest->name}",
                    'quantity' => 1,
                    'unit_price' => $appointmentLabTest->unit_price ?? $appointmentLabTest->labTest->price,
                    'total_price' => $appointmentLabTest->total_price ?? $appointmentLabTest->labTest->price
                ]);
                $itemsCreated++;
                Log::info("Created billing item for lab test: {$appointmentLabTest->labTest->name}", [
                    'unit_price' => $appointmentLabTest->unit_price ?? $appointmentLabTest->labTest->price,
                    'total_price' => $appointmentLabTest->total_price ?? $appointmentLabTest->labTest->price
                ]);
            } else {
                Log::warning("AppointmentLabTest {$appointmentLabTest->id} has no labTest relationship");
            }
        }

        Log::info("Successfully updated billing transaction with {$itemsCreated} lab test items", [
            'billing_transaction_id' => $billingTransaction->id,
            'total_items' => $billingTransaction->items()->count()
        ]);

        return $billingTransaction;
    }


    /**
     * Create lab order for the tests
     */
    private function createLabOrder(Appointment $appointment, $labTests, int $orderedBy, string $notes = null): LabOrder
    {
        $labOrder = LabOrder::create([
            'patient_id' => $appointment->patient_id,
            'patient_visit_id' => $appointment->visit?->id,
            'ordered_by' => $orderedBy,
            'status' => 'ordered',
            'notes' => $notes
        ]);

        // Create lab results for each test
        foreach ($labTests as $labTest) {
            $labResult = LabResult::create([
                'lab_order_id' => $labOrder->id,
                'lab_test_id' => $labTest->id,
                'results' => []
            ]);
            
        }

        return $labOrder;
    }

    /**
     * Get appointment lab tests with details
     */
    public function getAppointmentLabTests(Appointment $appointment)
    {
        return $appointment->labTests()->with(['labTest', 'addedBy'])->get();
    }

    /**
     * Remove lab test from appointment
     */
    public function removeLabTestFromAppointment(Appointment $appointment, int $labTestId): array
    {
        return DB::transaction(function () use ($appointment, $labTestId) {
            $appointmentLabTest = $appointment->labTests()->where('lab_test_id', $labTestId)->first();
            
            if (!$appointmentLabTest) {
                throw new \Exception('Lab test not found in appointment');
            }

            $removedAmount = $appointmentLabTest->total_price;
            
            // Remove the lab test
            $appointmentLabTest->delete();

            // Update appointment totals
            $newLabTotal = $appointment->labTests()->sum('total_price');
            $newFinalTotal = $appointment->price + $newLabTotal;

            $appointment->update([
                'total_lab_amount' => $newLabTotal,
                'final_total_amount' => $newFinalTotal
            ]);

            // Update billing transaction
            $billingTransaction = $appointment->billingTransactions()->first();
            if ($billingTransaction) {
                $billingTransaction->update([
                    'total_amount' => $newFinalTotal,
                    'amount' => $newFinalTotal
                ]);

                // Remove lab test item from billing
                $billingTransaction->items()
                    ->where('item_type', 'lab_test')
                    ->where('item_id', $labTestId)
                    ->delete();
            }

            return [
                'success' => true,
                'removed_amount' => $removedAmount,
                'new_lab_total' => $newLabTotal,
                'new_final_total' => $newFinalTotal
            ];
        });
    }
}
