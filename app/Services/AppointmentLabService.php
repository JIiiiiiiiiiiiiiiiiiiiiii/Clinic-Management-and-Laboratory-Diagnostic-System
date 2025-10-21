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

                // Update or create billing transaction
                $billingTransaction = $this->updateBillingTransaction($appointment, $labTests);

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
     * Update billing transaction with lab tests
     */
    private function updateBillingTransaction(Appointment $appointment, $labTests): BillingTransaction
    {
        // Get existing billing transaction
        $billingTransaction = $appointment->billingTransactions()->first();

        if (!$billingTransaction) {
            // Create new billing transaction if none exists
            $billingTransaction = $this->createBillingTransaction($appointment);
        }

        // Update transaction total
        $billingTransaction->update([
            'total_amount' => $appointment->final_total_amount,
            'amount' => $appointment->final_total_amount,
            'is_itemized' => true
        ]);

        // Clear existing lab test items (keep appointment items)
        $billingTransaction->items()->where('item_type', 'laboratory')->delete();

        // Ensure consultation item exists
        $consultationItem = $billingTransaction->items()->where('item_type', 'consultation')->first();
        if (!$consultationItem) {
            BillingTransactionItem::create([
                'billing_transaction_id' => $billingTransaction->id,
                'item_type' => 'consultation',
                'item_name' => ucfirst($appointment->appointment_type),
                'item_description' => "Appointment: {$appointment->appointment_type}",
                'quantity' => 1,
                'unit_price' => $appointment->price,
                'total_price' => $appointment->price
            ]);
        }

        // Add lab test items to transaction
        foreach ($labTests as $labTest) {
            BillingTransactionItem::create([
                'billing_transaction_id' => $billingTransaction->id,
                'item_type' => 'laboratory',
                'lab_test_id' => $labTest->id,
                'item_name' => $labTest->name,
                'item_description' => "Lab test: {$labTest->name}",
                'quantity' => 1,
                'unit_price' => $labTest->price,
                'total_price' => $labTest->price
            ]);
        }

        return $billingTransaction;
    }

    /**
     * Create billing transaction for appointment
     */
    private function createBillingTransaction(Appointment $appointment): BillingTransaction
    {
        $nextId = BillingTransaction::max('id') + 1;
        $transactionId = 'TXN-' . str_pad($nextId, 6, '0', STR_PAD_LEFT);

        $billingTransaction = BillingTransaction::create([
            'transaction_id' => $transactionId,
            'patient_id' => $appointment->patient_id,
            'doctor_id' => $appointment->specialist_id,
            'total_amount' => $appointment->final_total_amount,
            'amount' => $appointment->final_total_amount,
            'status' => 'pending',
            'description' => "Payment for {$appointment->appointment_type} appointment",
            'transaction_date' => now(),
            'transaction_date_only' => now()->toDateString(),
            'transaction_time_only' => now()->toTimeString(),
            'created_by' => auth()->id() ?? 1,
            'is_itemized' => true
        ]);

        // Create appointment billing link
        \App\Models\AppointmentBillingLink::create([
            'appointment_id' => $appointment->id,
            'billing_transaction_id' => $billingTransaction->id,
            'appointment_type' => $appointment->appointment_type,
            'appointment_price' => $appointment->price,
            'status' => 'pending'
        ]);

        // Add appointment item to transaction
        BillingTransactionItem::create([
            'billing_transaction_id' => $billingTransaction->id,
            'item_type' => 'consultation',
            'item_name' => ucfirst($appointment->appointment_type),
            'item_description' => "Appointment: {$appointment->appointment_type}",
            'quantity' => 1,
            'unit_price' => $appointment->price,
            'total_price' => $appointment->price
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
            LabResult::create([
                'lab_order_id' => $labOrder->id,
                'lab_test_id' => $labTest->id,
                'results' => [],
                'status' => 'pending'
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
