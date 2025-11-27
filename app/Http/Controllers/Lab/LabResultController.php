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
        $order->load(['patient', 'results.test', 'results.values', 'visit.attendingStaff', 'orderedBy', 'appointments.labTests.labTest']);
        
        \Log::info('Lab results show - loading data', [
            'order_id' => $order->id,
            'results_count' => $order->results->count(),
            'result_ids' => $order->results->pluck('id')->toArray(),
        ]);
        
        // Format results for frontend
        $formattedResults = $order->results->map(function ($result) {
            \Log::info('Formatting result', [
                'result_id' => $result->id,
                'lab_test_id' => $result->lab_test_id,
                'has_results' => !empty($result->results),
                'results_data' => $result->results,
                'values_count' => $result->values->count(),
            ]);
            
            return [
                'id' => $result->id,
                'lab_order_id' => $result->lab_order_id,
                'lab_test_id' => $result->lab_test_id,
                'test' => $result->test ? [
                    'id' => $result->test->id,
                    'name' => $result->test->name,
                    'code' => $result->test->code,
                    'description' => $result->test->description ?? null,
                    'fields_schema' => $result->test->fields_schema ?? null,
                ] : null,
                'results' => $result->results ?? [],
                'values' => $result->values->map(function ($value) {
                    return [
                        'id' => $value->id,
                        'parameter_key' => $value->parameter_key,
                        'parameter_label' => $value->parameter_label,
                        'value' => $value->value,
                        'unit' => $value->unit,
                        'reference_text' => $value->reference_text,
                        'reference_min' => $value->reference_min,
                        'reference_max' => $value->reference_max,
                    ];
                }),
                'verified_by' => $result->verified_by,
                'verified_at' => $result->verified_at ? $result->verified_at->format('Y-m-d H:i:s') : null,
                'created_at' => $result->created_at ? $result->created_at->format('Y-m-d H:i:s') : null,
                'updated_at' => $result->updated_at ? $result->updated_at->format('Y-m-d H:i:s') : null,
            ];
        });

        return Inertia::render('admin/laboratory/results/show', [
            'patient' => $order->patient,
            'order' => $order,
            'results' => $formattedResults,
        ]);
    }

    public function entry(Request $request, LabOrder $order)
    {
        $order->load(['patient', 'results.test', 'results.values', 'visit.attendingStaff', 'orderedBy', 'appointments.labTests.labTest']);

        // Get tests from results if they exist, otherwise get from appointment's lab tests
        $tests = collect();

        // First, try to get tests from existing results
        if ($order->results->isNotEmpty()) {
        $tests = $order->results->map(function ($result) {
            return $result->test;
        })->filter();
        }
        
        // If no tests from results, get from appointment's lab tests
        if ($tests->isEmpty() && $order->appointments->isNotEmpty()) {
            foreach ($order->appointments as $appointment) {
                $appointment->load('labTests.labTest');
                foreach ($appointment->labTests as $appointmentLabTest) {
                    if ($appointmentLabTest->labTest) {
                        $tests->push($appointmentLabTest->labTest);
                    }
                }
            }
            $tests = $tests->unique('id')->values();
        }
        
        // If still no tests, get from lab_results that were pre-created (even if empty)
        if ($tests->isEmpty()) {
            $results = LabResult::where('lab_order_id', $order->id)->with('test')->get();
            $tests = $results->map(function ($result) {
                return $result->test;
            })->filter()->unique('id')->values();
        }
        
        \Log::info('Lab result entry - tests loaded', [
            'order_id' => $order->id,
            'tests_count' => $tests->count(),
            'test_ids' => $tests->pluck('id')->toArray(),
        ]);
        
        $existingResults = [];

        // Load existing results if any (prefer structured values, fallback to JSON)
        $results = LabResult::where('lab_order_id', $order->id)->with('values')->get();
        \Log::info('Lab result entry - existing results loaded', [
            'order_id' => $order->id,
            'results_count' => $results->count(),
            'result_ids' => $results->pluck('id')->toArray(),
        ]);
        
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
                'request_all' => $request->all(),
            ]);
            
            $savedResults = [];
            \DB::transaction(function () use ($validated, $order, $request, &$savedResults) {
                foreach ($validated['results'] as $testId => $testResults) {
                    $normalized = is_array($testResults)
                        ? $testResults
                        : (is_string($testResults) ? json_decode($testResults, true) ?? [] : []);
                    
                    Log::info('Normalized test results', [
                        'order_id' => $order->id,
                        'lab_test_id' => (int) $testId,
                        'has_sections' => array_keys($normalized ?? []),
                        'normalized_data' => $normalized,
                    ]);

                    $existing = LabResult::where('lab_order_id', $order->id)
                        ->where('lab_test_id', (int) $testId)
                        ->first();

                    Log::info('Existing result check', [
                        'order_id' => $order->id,
                        'lab_test_id' => (int) $testId,
                        'existing_id' => $existing?->id,
                        'existing_results' => $existing?->results,
                    ]);

                    // Ensure normalized is a valid array (allow empty arrays, but not null or non-array)
                    if (!is_array($normalized)) {
                        Log::warning('Skipping invalid normalized data (not an array)', [
                            'order_id' => $order->id,
                            'lab_test_id' => (int) $testId,
                            'normalized' => $normalized,
                            'normalized_type' => gettype($normalized),
                        ]);
                        continue;
                    }

                    // Use updateOrCreate but ensure we're actually saving the data
                    $labResult = LabResult::where('lab_order_id', $order->id)
                        ->where('lab_test_id', (int) $testId)
                        ->first();
                    
                    if ($labResult) {
                        // Update existing
                        $labResult->results = $normalized;
                        $labResult->save();
                        Log::info('LabResult updated', [
                            'order_id' => $order->id,
                            'lab_test_id' => (int) $testId,
                            'result_id' => $labResult->id,
                        ]);
                    } else {
                        // Create new
                        $labResult = LabResult::create([
                            'lab_order_id' => $order->id,
                            'lab_test_id' => (int) $testId,
                            'results' => $normalized,
                        ]);
                        Log::info('LabResult created', [
                            'order_id' => $order->id,
                            'lab_test_id' => (int) $testId,
                            'result_id' => $labResult->id,
                        ]);
                    }
                    
                    // Refresh to ensure we have the latest data from database
                    $labResult->refresh();
                    
                    // Verify the data was actually saved
                    $verifyResult = LabResult::find($labResult->id);
                    Log::info('LabResult saved/updated - verification', [
                        'order_id' => $order->id,
                        'lab_test_id' => (int) $testId,
                        'result_id' => $labResult->id,
                        'saved_results' => $verifyResult->results,
                        'results_type' => gettype($verifyResult->results),
                        'results_is_array' => is_array($verifyResult->results),
                        'results_count' => is_array($verifyResult->results) ? count($verifyResult->results) : 0,
                    ]);
                    
                    $savedResults[] = $labResult->id;

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
                                // Normalize reference ranges: accept reference_range string (for dropdowns), or range array/min/max numbers
                                // For dropdown fields, use reference_range if available
                                if (isset($field['reference_range']) && is_string($field['reference_range']) && !empty($field['reference_range'])) {
                                    $refText = $field['reference_range'];
                                } elseif (isset($field['range'])) {
                                    if (is_array($field['range'])) {
                                        $min = isset($field['range'][0]) ? (string) $field['range'][0] : null;
                                        $max = isset($field['range'][1]) ? (string) $field['range'][1] : null;
                                    } elseif (is_string($field['range'])) {
                                        $refText = $field['range'];
                                    }
                                }
                                // For number fields, check patient-type-specific ranges
                                if (isset($field['ranges']) && is_array($field['ranges'])) {
                                    // Determine patient type and get appropriate range
                                    $patient = $order->patient;
                                    $age = $patient ? \Carbon\Carbon::parse($patient->birthdate)->age : null;
                                    $gender = $patient->sex ?? $patient->gender ?? null;
                                    
                                    $patientType = null;
                                    if ($age !== null) {
                                        if ($age < 18) {
                                            $patientType = 'child';
                                        } elseif ($age >= 60) {
                                            $patientType = 'senior';
                                        } elseif ($gender && (strtolower($gender) === 'male' || strtolower($gender) === 'm')) {
                                            $patientType = 'male';
                                        } else {
                                            $patientType = 'female';
                                        }
                                    }
                                    
                                    if ($patientType && isset($field['ranges'][$patientType])) {
                                        $range = $field['ranges'][$patientType];
                                        $min = isset($range['min']) && $range['min'] !== '' ? (string) $range['min'] : null;
                                        $max = isset($range['max']) && $range['max'] !== '' ? (string) $range['max'] : null;
                                    }
                                }
                                // Fallback to generic min/max if patient-type-specific ranges not found
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

                    Log::info('LabResultValue records created', [
                        'order_id' => $order->id,
                        'lab_test_id' => (int) $testId,
                        'result_id' => $labResult->id,
                        'values_count' => count($flat),
                    ]);
                }
            });
            
            // Verify the data was actually saved
            $verificationResults = LabResult::where('lab_order_id', $order->id)
                ->with('test', 'values')
                ->get();
            
            Log::info('Verification after save', [
                'order_id' => $order->id,
                'saved_result_ids' => $savedResults,
                'verification_count' => $verificationResults->count(),
                'verification_data' => $verificationResults->map(function ($r) {
                    return [
                        'id' => $r->id,
                        'lab_test_id' => $r->lab_test_id,
                        'has_results' => !empty($r->results),
                        'results_count' => is_array($r->results) ? count($r->results) : 0,
                        'values_count' => $r->values->count(),
                    ];
                })->toArray(),
            ]);

            $order->load(['patient', 'labTests', 'results.test', 'results.values']);
            return redirect()->route('admin.laboratory.results.show', $order)
                ->with('success', 'Lab results saved successfully');
        } catch (\Throwable $e) {
            Log::error('Failed to save lab results', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
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


