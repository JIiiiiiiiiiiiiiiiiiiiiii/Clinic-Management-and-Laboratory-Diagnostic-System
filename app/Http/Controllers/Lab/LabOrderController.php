<?php

namespace App\Http\Controllers\Lab;

use App\Http\Controllers\Controller;
use App\Models\LabOrder;
use App\Models\LabResult;
use App\Models\LabTest;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabOrderController extends Controller
{
    public function allOrders()
    {
        $orders = LabOrder::with(['patient', 'labTests'])
            ->latest()
            ->get();

        return Inertia::render('admin/laboratory/orders/index', [
            'orders' => $orders,
        ]);
    }

    public function index(Patient $patient)
    {
        $orders = LabOrder::with(['labTests'])->where('patient_id', $patient->id)->latest()->get();
        $labTests = LabTest::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code', 'is_active']);

        return Inertia::render('admin/laboratory/patients/orders', [
            'patient' => $patient,
            'orders' => $orders,
            'labTests' => $labTests,
        ]);
    }

    public function store(Request $request, Patient $patient)
    {
        try {
            $validated = $request->validate([
                'lab_test_ids' => ['required', 'array', 'min:1'],
                'lab_test_ids.*' => ['exists:lab_tests,id'],
                'notes' => ['nullable', 'string'],
            ]);

            $order = LabOrder::create([
                'patient_id' => $patient->id,
                'ordered_by' => $request->user()?->id,
                'status' => 'ordered',
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['lab_test_ids'] as $testId) {
                LabResult::create([
                    'lab_order_id' => $order->id,
                    'lab_test_id' => $testId,
                    'results' => [],
                ]);
            }

            return back()->with('success', 'Lab order created successfully!');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to create lab order: ' . $e->getMessage())->withInput();
        }
    }

    public function updateStatus(Request $request, LabOrder $order)
    {
        try {
            $validated = $request->validate([
                'status' => ['required', 'in:ordered,processing,completed,cancelled'],
            ]);
            $order->update($validated);
            return back()->with('success', 'Order status updated');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to update order status: ' . $e->getMessage());
        }
    }
}


