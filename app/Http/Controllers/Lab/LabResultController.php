<?php

namespace App\Http\Controllers\Lab;

use App\Http\Controllers\Controller;
use App\Models\LabOrder;
use App\Models\LabResult;
use App\Models\LabTest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabResultController extends Controller
{
    public function show(Request $request, LabOrder $order)
    {
        $order->load(['patient', 'labTests', 'results.test']);

        return Inertia::render('admin/laboratory/results/show', [
            'patient' => $order->patient,
            'order' => $order,
            'results' => $order->results,
        ]);
    }

    public function entry(Request $request, LabOrder $order)
    {
        $order->load(['patient', 'labTests']);

        $tests = $order->labTests;
        $existingResults = [];

        // Load existing results if any
        $results = LabResult::where('lab_order_id', $order->id)->get();
        foreach ($results as $result) {
            $existingResults[$result->lab_test_id] = $result->results;
        }

        return Inertia::render('admin/laboratory/results/entry', [
            'patient' => $order->patient,
            'order' => $order,
            'tests' => $tests,
            'existingResults' => $existingResults,
        ]);
    }

    public function store(Request $request, LabOrder $order)
    {
        $validated = $request->validate([
            'results' => ['required', 'array'],
        ]);

        try {
            foreach ($validated['results'] as $testId => $testResults) {
                LabResult::updateOrCreate(
                    [
                        'lab_order_id' => $order->id,
                        'lab_test_id' => $testId,
                    ],
                    [
                        'results' => $testResults,
                    ]
                );
            }

            return back()->with('success', 'Results saved successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to save results: ' . $e->getMessage())->withInput();
        }
    }

    public function update(Request $request, LabResult $result)
    {
        $validated = $request->validate([
            'results' => ['required', 'array'],
        ]);

        try {
            $result->update(['results' => $validated['results']]);
            return back()->with('success', 'Result updated successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to update result: ' . $e->getMessage())->withInput();
        }
    }

    public function verify(Request $request, LabOrder $order)
    {
        try {
            // Update order status
            $order->update(['status' => 'completed']);

            // Mark all results as verified
            LabResult::where('lab_order_id', $order->id)->update([
                'verified_by' => $request->user()?->id,
                'verified_at' => now(),
            ]);

            return back()->with('success', 'Order verified and completed successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to verify order: ' . $e->getMessage());
        }
    }
}


