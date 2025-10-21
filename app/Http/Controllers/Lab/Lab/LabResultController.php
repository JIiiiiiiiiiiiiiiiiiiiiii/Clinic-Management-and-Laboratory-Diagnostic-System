<?php

namespace App\Http\Controllers\Lab;

use App\Http\Controllers\Controller;
use App\Models\LabOrder;
use App\Models\LabResult;
use App\Models\LabTest;
use App\Models\LabResultValue;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class LabResultController extends Controller
{
    public function show(Request $request, LabOrder $order)
    {
        $order->load(['patient', 'labTests', 'results.test', 'results.values']);

        return Inertia::render('admin/laboratory/results/show', [
            'patient' => $order->patient,
            'order' => $order,
            'results' => $order->results,
        ]);
    }

    public function entry(Request $request, LabOrder $order)
    {
        $order->load(['patient', 'results.test', 'results.values']);

        // Get tests through the results relationship
        $tests = $order->results->map(function ($result) {
            return $result->test;
        })->filter();
        $existingResults = [];

        // Load existing results if any (prefer structured values, fallback to JSON)
        $results = LabResult::where('lab_order_id', $order->id)->with('values')->get();
        foreach ($results as $result) {
            if ($result->values && $result->values->count() > 0) {
                $built = [];
                foreach ($result->values as $val) {
                    $parts = explode('.', $val->parameter_key);
                    if (count($parts) >= 2) {
                        $section = $parts[0];
                        $field = $parts[1];
                        if (!isset($built[$section])) $built[$section] = [];
                        $built[$section][$field] = $val->value;
                    }
                }
                $existingResults[$result->lab_test_id] = $built;
            } else {
                $existingResults[$result->lab_test_id] = $result->results;
            }
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
        // Accept nested array via FormData (results[<id>][section][field]) or a JSON string
        $incoming = $request->input('results');
        if ($incoming === null) {
            // Build from request all keys that match results[...]
            $built = [];
            foreach ($request->all() as $key => $val) {
                if (str_starts_with($key, 'results[')) {
                    // Parse results[<id>][section][field]
                    if (preg_match('/^results\[(\d+)\]\[(.+?)\]\[(.+?)\]$/', $key, $m)) {
                        $testId = (int) $m[1];
                        $section = $m[2];
                        $field = $m[3];
                        $built[$testId][$section][$field] = $val;
                    }
                }
            }
            $incoming = $built;
        } elseif (is_string($incoming)) {
            $decoded = json_decode($incoming, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $incoming = $decoded;
            } else {
                return back()->with('error', 'Invalid results payload.')->withInput();
            }
        } elseif (!is_array($incoming)) {
            return back()->with('error', 'Invalid results payload.')->withInput();
        }
        $validated = ['results' => $incoming];

        try {
            Log::info('Incoming lab results payload', [
                'order_id' => $order->id,
                'payload_keys' => array_keys($validated['results'] ?? []),
            ]);
            \DB::transaction(function () use ($validated, $order, $request) {
                foreach ($validated['results'] as $testId => $testResults) {
                    $normalized = is_array($testResults)
                        ? $testResults
                        : (is_string($testResults) ? json_decode($testResults, true) ?? [] : []);
                    Log::info('Normalized test results', [
                        'order_id' => $order->id,
                        'lab_test_id' => (int) $testId,
                        'has_sections' => array_keys($normalized ?? []),
                    ]);

                    $existing = LabResult::where('lab_order_id', $order->id)
                        ->where('lab_test_id', (int) $testId)
                        ->first();

                    $labResult = LabResult::updateOrCreate(
                        [
                            'lab_order_id' => $order->id,
                            'lab_test_id' => (int) $testId,
                        ],
                        [
                            'results' => $normalized,
                        ]
                    );

                    // Persist flattened values with labels/ranges/units for reporting
                    $flat = [];
                    $walker = function (array $arr, string $prefix = '') use (&$flat, &$walker) {
                        foreach ($arr as $key => $value) {
                            $path = $prefix === '' ? (string) $key : $prefix . '.' . $key;
                            if (is_array($value)) {
                                $walker($value, $path);
                            } else {
                                $flat[$path] = (string) $value;
                            }
                        }
                    };
                    $walker($normalized);
                    Log::info('Flattened result count', [
                        'order_id' => $order->id,
                        'lab_test_id' => (int) $testId,
                        'count' => count($flat),
                    ]);

                    LabResultValue::where('lab_result_id', $labResult->id)->delete();
                    $schema = $labResult->test?->fields_schema ?? null;
                    foreach ($flat as $path => $value) {
                        $label = null;
                        $unit = null;
                        $refText = null;
                        $min = null;
                        $max = null;
                        if ($schema && isset($schema['sections'])) {
                            $parts = explode('.', $path);
                            if (count($parts) >= 2 && isset($schema['sections'][$parts[0]]['fields'][$parts[1]])) {
                                $field = $schema['sections'][$parts[0]]['fields'][$parts[1]];
                                $label = $field['label'] ?? null;
                                $unit = $field['unit'] ?? null;
                                // Normalize reference ranges: accept reference_range string, or range array/min/max numbers
                                if (isset($field['reference_range']) && is_string($field['reference_range'])) {
                                    $refText = $field['reference_range'];
                                } elseif (isset($field['range'])) {
                                    if (is_array($field['range'])) {
                                        $min = isset($field['range'][0]) ? (string) $field['range'][0] : null;
                                        $max = isset($field['range'][1]) ? (string) $field['range'][1] : null;
                                    } elseif (is_string($field['range'])) {
                                        $refText = $field['range'];
                                    }
                                }
                                if (isset($field['min']) && $min === null) {
                                    $min = (string) $field['min'];
                                }
                                if (isset($field['max']) && $max === null) {
                                    $max = (string) $field['max'];
                                }
                            }
                        }
                        LabResultValue::create([
                            'lab_result_id' => $labResult->id,
                            'parameter_key' => $path,
                            'parameter_label' => $label,
                            'value' => is_scalar($value) ? (string) $value : json_encode($value),
                            'unit' => $unit,
                            'reference_text' => $refText,
                            'reference_min' => $min,
                            'reference_max' => $max,
                        ]);
                    }

                    Log::info('LabResult saved', [
                        'user_id' => $request->user()?->id,
                        'order_id' => $order->id,
                        'lab_test_id' => (int) $testId,
                        'before' => $existing?->results,
                        'after' => $normalized,
                    ]);
                }
            });

            $order->load(['patient', 'labTests', 'results.test', 'results.values']);
            return redirect()->route('admin.laboratory.results.show', $order)
                ->with('success', 'Lab results saved successfully');
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
            $before = $result->results;
            $result->update(['results' => $validated['results']]);
            Log::info('LabResult updated', [
                'user_id' => $request->user()?->id,
                'result_id' => $result->id,
                'order_id' => $result->lab_order_id,
                'lab_test_id' => $result->lab_test_id,
                'before' => $before,
                'after' => $validated['results'],
            ]);
            return redirect()->route('admin.laboratory.results.show', $result->lab_order_id)
                ->with('success', 'Result updated successfully');
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

            return redirect()->route('admin.laboratory.results.show', $order)
                ->with('success', 'Order verified and completed successfully');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to verify order: ' . $e->getMessage());
        }
    }
}


