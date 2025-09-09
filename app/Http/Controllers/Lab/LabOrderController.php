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

        // Normalize relation name for frontend (lab_tests)
        $normalized = $orders->map(function ($o) {
            $o->setRelation('lab_tests', $o->labTests);
            $o->unsetRelation('labTests');
            return $o;
        });

        return Inertia::render('admin/laboratory/orders/index', [
            'orders' => $normalized,
        ]);
    }

    public function create()
    {
        $patients = Patient::orderBy('last_name')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name']);
        return Inertia::render('admin/laboratory/orders/create', [
            'patients' => $patients,
        ]);
    }

    public function reportsIndex()
    {
        $orders = LabOrder::with(['patient:id,first_name,last_name', 'labTests:id,name,code'])
            ->latest()
            ->get(['id', 'patient_id', 'created_at']);
        $tests = LabTest::orderBy('name')->get(['id', 'name', 'code']);

        $normalized = $orders->map(function ($o) {
            $o->setRelation('lab_tests', $o->labTests);
            $o->unsetRelation('labTests');
            return $o;
        });

        return Inertia::render('admin/laboratory/reports/index', [
            'orders' => $normalized,
            'tests' => $tests,
        ]);
    }

    public function index(Request $request, Patient $patient)
    {
        $orders = LabOrder::with(['labTests'])->where('patient_id', $patient->id)->latest()->get();
        $labTests = LabTest::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code', 'is_active']);

        $normalizedPatientOrders = $orders->map(function ($o) {
            $o->setRelation('lab_tests', $o->labTests);
            $o->unsetRelation('labTests');
            return $o;
        });

        return Inertia::render('admin/laboratory/patients/orders', [
            'patient' => $patient,
            'orders' => $normalizedPatientOrders,
            'labTests' => $labTests,
            'patient_visit_id' => $request->integer('patient_visit_id') ?: null,
        ]);
    }

    public function store(Request $request, Patient $patient)
    {
        try {
            $validated = $request->validate([
                'lab_test_ids' => ['required', 'array', 'min:1'],
                'lab_test_ids.*' => ['exists:lab_tests,id'],
                'notes' => ['nullable', 'string'],
                'patient_visit_id' => ['nullable', 'exists:patient_visits,id'],
            ]);

            $order = LabOrder::create([
                'patient_id' => $patient->id,
                'patient_visit_id' => $validated['patient_visit_id'] ?? null,
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


