<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LabRequest;
use App\Models\LabTest;
use App\Models\Visit;
use App\Models\BillingTransaction;
use App\Models\BillingTransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LabRequestController extends Controller
{
    /**
     * Store a new lab request
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'visit_id' => 'required|exists:visits,id',
                'lab_test_ids' => 'required|array|min:1',
                'lab_test_ids.*' => 'exists:lab_tests,id',
                'notes' => 'nullable|string',
            ]);

            // RESTRICTION: Check if appointment has billing transaction
            $visit = Visit::with(['appointment'])->find($validated['visit_id']);
            if (!$visit || !$visit->appointment) {
                return back()->with('error', 'Visit or appointment not found.');
            }

            // Check if appointment has a billing transaction (not just pending status)
            $hasBillingTransaction = \App\Models\BillingTransaction::where('appointment_id', $visit->appointment->id)->exists();
            
            if (!$hasBillingTransaction) {
                return back()->with('error', 'Cannot add lab requests to appointments without billing transactions. Please create a billing transaction first.');
            }

            DB::beginTransaction();

            $labRequests = [];
            $totalLabCost = 0;

            // Create lab requests for each selected test
            foreach ($validated['lab_test_ids'] as $testId) {
                $labTest = LabTest::find($testId);
                
                $labRequest = LabRequest::create([
                    'visit_id' => $validated['visit_id'],
                    'lab_test_id' => $testId,
                    'requested_by' => auth()->id(),
                    'status' => 'requested',
                    'notes' => $validated['notes'],
                    'price' => $labTest->price ?? 0,
                ]);

                $labRequests[] = $labRequest;
                $totalLabCost += $labTest->price ?? 0;
            }

            // Update billing transaction with lab costs
            $this->updateBillingWithLabCosts($validated['visit_id'], $totalLabCost);

            DB::commit();

            Log::info('Lab requests created successfully', [
                'visit_id' => $validated['visit_id'],
                'lab_requests_count' => count($labRequests),
                'total_cost' => $totalLabCost
            ]);

            return back()->with('success', 'Lab requests created successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create lab requests', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return back()->with('error', 'Failed to create lab requests: ' . $e->getMessage());
        }
    }

    /**
     * Update lab request status
     */
    public function updateStatus(Request $request, LabRequest $labRequest)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:requested,processing,completed,cancelled',
            ]);

            $labRequest->update(['status' => $validated['status']]);

            Log::info('Lab request status updated', [
                'lab_request_id' => $labRequest->id,
                'new_status' => $validated['status']
            ]);

            return back()->with('success', 'Lab request status updated successfully!');

        } catch (\Exception $e) {
            Log::error('Failed to update lab request status', [
                'error' => $e->getMessage(),
                'lab_request_id' => $labRequest->id
            ]);

            return back()->with('error', 'Failed to update lab request status: ' . $e->getMessage());
        }
    }

    /**
     * Update billing transaction with lab costs
     */
    private function updateBillingWithLabCosts($visitId, $totalLabCost)
    {
        try {
            $visit = Visit::with(['appointment'])->find($visitId);
            if (!$visit || !$visit->appointment) {
                Log::warning('Visit or appointment not found for billing update', ['visit_id' => $visitId]);
                return;
            }

            // Find the billing transaction for this appointment
            $billingTransaction = BillingTransaction::where('appointment_id', $visit->appointment->id)
                ->where('status', 'pending')
                ->first();

            if (!$billingTransaction) {
                Log::warning('No pending billing transaction found for appointment', [
                    'appointment_id' => $visit->appointment->id
                ]);
                return;
            }

            // Get current appointment cost
            $appointmentCost = $visit->appointment->price ?? 0;
            $newTotalAmount = $appointmentCost + $totalLabCost;

            // Update the billing transaction total
            $billingTransaction->update([
                'total_amount' => $newTotalAmount,
                'amount' => $newTotalAmount,
            ]);

            // Add lab request items to billing transaction items
            $labRequests = LabRequest::where('visit_id', $visitId)
                ->with('labTest')
                ->get();

            foreach ($labRequests as $labRequest) {
                // Check if item already exists
                $existingItem = BillingTransactionItem::where('billing_transaction_id', $billingTransaction->id)
                    ->where('item_name', $labRequest->labTest->name)
                    ->where('item_type', 'laboratory')
                    ->first();

                if (!$existingItem) {
                    BillingTransactionItem::create([
                        'billing_transaction_id' => $billingTransaction->id,
                        'item_type' => 'laboratory',
                        'item_name' => $labRequest->labTest->name,
                        'item_description' => "Lab test: {$labRequest->labTest->name}",
                        'lab_test_id' => $labRequest->labTest->id,
                        'quantity' => 1,
                        'unit_price' => $labRequest->price,
                        'total_price' => $labRequest->price,
                    ]);
                }
            }

            Log::info('Billing transaction updated with lab costs', [
                'billing_transaction_id' => $billingTransaction->id,
                'appointment_cost' => $appointmentCost,
                'lab_cost' => $totalLabCost,
                'new_total' => $newTotalAmount
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update billing with lab costs', [
                'visit_id' => $visitId,
                'error' => $e->getMessage()
            ]);
        }
    }
}
