<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\LabOrder;
use App\Models\LabResult;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientTestResultController extends Controller
{
    /**
     * Display the patient's test results.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        // Try to find patient by user_id, or by email if user_id doesn't match
        $patient = Patient::where('user_id', $user->id)->first();
        
        // If patient not found by user_id, try to find by email
        if (!$patient && $user->email) {
            \Log::info('Patient not found by user_id, trying to find by email', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
            $patient = Patient::where('email', $user->email)->first();
        }
        
        $testResults = [
            'pending' => [],
            'completed' => [],
            'statistics' => [
                'total_tests' => 0,
                'pending_tests' => 0,
                'completed_tests' => 0,
            ],
        ];
        
        if ($patient) {
            // Get all lab orders for this patient - ensure we're using the correct patient ID
            // LabOrder.patient_id references Patient.id
            $labOrders = LabOrder::where('patient_id', $patient->id)
                ->with(['results.test', 'results.values', 'orderedBy', 'patient', 'visit']) // Load all relationships including values
                ->orderBy('created_at', 'desc')
                ->get();
            
            \Log::info('Patient test results query', [
                'patient_id' => $patient->id,
                'patient_no' => $patient->patient_no,
                'user_id' => $user->id,
                'user_email' => $user->email,
                'lab_orders_count' => $labOrders->count(),
                'lab_order_ids' => $labOrders->pluck('id')->toArray(),
                'sample_order' => $labOrders->first() ? [
                    'id' => $labOrders->first()->id,
                    'patient_id' => $labOrders->first()->patient_id,
                    'results_count' => $labOrders->first()->results->count(),
                    'results_with_values' => $labOrders->first()->results->map(function($r) {
                        return [
                            'id' => $r->id,
                            'test_id' => $r->lab_test_id,
                            'test_name' => $r->test?->name,
                            'values_count' => $r->values->count(),
                            'has_results_json' => !empty($r->results),
                        ];
                    })->toArray(),
                ] : null,
            ]);
            
            // Get pending results (orders without verified results)
            $testResults['pending'] = $labOrders
                ->filter(function ($order) {
                    return $order->results->whereNotNull('verified_at')->count() === 0;
                })
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'created_at' => $order->created_at ? $order->created_at->format('M d, Y H:i') : 'N/A',
                        'created_at_date' => $order->created_at ? $order->created_at->format('M d, Y') : 'N/A',
                        'tests' => $order->results->map(function ($result) {
                            return $result->test?->name ?? 'Unknown Test';
                        })->filter()->unique()->values()->all(),
                        'status' => $order->status ?? 'pending',
                        'notes' => $order->notes ?? '',
                        'ordered_by' => $order->orderedBy ? $order->orderedBy->name : 'N/A',
                        'ordered_by_id' => $order->ordered_by ?? null,
                        'patient_id' => $order->patient_id,
                        'visit_id' => $order->patient_visit_id,
                        'results_count' => $order->results->count(),
                    ];
                });
            
            // Get completed results (orders with verified results)
            $testResults['completed'] = $labOrders
                ->filter(function ($order) {
                    return $order->results->whereNotNull('verified_at')->count() > 0;
                })
                ->map(function ($order) {
                    // Handle results as array (from JSON column)
                    return [
                        'id' => $order->id,
                        'created_at' => $order->created_at ? $order->created_at->format('M d, Y H:i') : 'N/A',
                        'created_at_date' => $order->created_at ? $order->created_at->format('M d, Y') : 'N/A',
                        'tests' => $order->results->map(function ($result) {
                            return $result->test?->name ?? 'Unknown Test';
                        })->filter()->unique()->values()->all(),
                        'status' => $order->status ?? 'completed',
                        'notes' => $order->notes ?? '',
                        'ordered_by' => $order->orderedBy ? $order->orderedBy->name : 'N/A',
                        'ordered_by_id' => $order->ordered_by ?? null,
                        'patient_id' => $order->patient_id,
                        'visit_id' => $order->patient_visit_id,
                        'results_count' => $order->results->count(),
                        'results' => $order->results->map(function ($result) {
                            $resultsData = is_array($result->results) ? $result->results : [];
                            
                            // Get detailed values from lab_result_values if available
                            $detailedValues = [];
                            if ($result->values && $result->values->count() > 0) {
                                foreach ($result->values as $value) {
                                    $detailedValues[] = [
                                        'parameter_key' => $value->parameter_key,
                                        'parameter_label' => $value->parameter_label,
                                        'value' => $value->value,
                                        'unit' => $value->unit,
                                        'reference_text' => $value->reference_text,
                                        'reference_min' => $value->reference_min,
                                        'reference_max' => $value->reference_max,
                                    ];
                                }
                            }
                            
                            // Extract main result value - prefer from values table, fallback to JSON
                            $mainResultValue = 'N/A';
                            $mainNormalRange = 'N/A';
                            $mainUnit = 'N/A';
                            
                            if (!empty($detailedValues)) {
                                // Use first value as main result, or find a specific one
                                $firstValue = $detailedValues[0];
                                $mainResultValue = $firstValue['value'] ?? 'N/A';
                                $mainUnit = $firstValue['unit'] ?? 'N/A';
                                
                                if ($firstValue['reference_text']) {
                                    $mainNormalRange = $firstValue['reference_text'];
                                } elseif ($firstValue['reference_min'] && $firstValue['reference_max']) {
                                    $mainNormalRange = $firstValue['reference_min'] . ' - ' . $firstValue['reference_max'];
                                }
                            } else {
                                // Fallback to JSON data
                                $mainResultValue = $resultsData['value'] ?? ($resultsData['result'] ?? 'N/A');
                                $mainNormalRange = $resultsData['normal_range'] ?? ($resultsData['range'] ?? 'N/A');
                                $mainUnit = $resultsData['unit'] ?? 'N/A';
                            }
                            
                            return [
                                'id' => $result->id,
                                'test_id' => $result->lab_test_id,
                                'test_name' => $result->test?->name ?? 'Unknown Test',
                                'result_value' => $mainResultValue,
                                'normal_range' => $mainNormalRange,
                                'unit' => $mainUnit,
                                'status' => $result->verified_at ? 'verified' : 'pending',
                                'verified_at' => $result->verified_at ? $result->verified_at->format('M d, Y H:i') : null,
                                'verified_by' => $result->verified_by ? \App\Models\User::find($result->verified_by)?->name : null,
                                'order_id' => $result->lab_order_id,
                                'detailed_values' => $detailedValues, // Include all detailed values from lab_result_values table (CRUD data)
                            ];
                        }),
                        'verified_at' => $order->results->whereNotNull('verified_at')->first()?->verified_at->format('M d, Y'),
                    ];
                });
            
            // Calculate statistics
            $testResults['statistics']['total_tests'] = $labOrders->count();
            $testResults['statistics']['pending_tests'] = $testResults['pending']->count();
            $testResults['statistics']['completed_tests'] = $testResults['completed']->count();
            
            \Log::info('Test results statistics', [
                'patient_id' => $patient->id,
                'total_tests' => $testResults['statistics']['total_tests'],
                'pending_tests' => $testResults['statistics']['pending_tests'],
                'completed_tests' => $testResults['statistics']['completed_tests'],
                'completed_with_details' => $testResults['completed']->take(3)->map(function($order) {
                    $firstResult = isset($order['results']) && is_array($order['results']) && count($order['results']) > 0 
                        ? $order['results'][0] 
                        : null;
                    return [
                        'id' => $order['id'],
                        'tests_count' => count($order['tests'] ?? []),
                        'results_count' => count($order['results'] ?? []),
                        'has_detailed_values' => !empty($firstResult['detailed_values'] ?? []),
                    ];
                })->toArray(),
            ]);
        }
        
        // Get notifications for the user
        $notifications = \App\Models\Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'read' => $notification->read,
                    'created_at' => $notification->created_at->format('M d, Y H:i'),
                    'data' => $notification->data,
                ];
            });

        $unreadCount = \App\Models\Notification::where('user_id', $user->id)
            ->where('read', false)
            ->count();

        return Inertia::render('patient/test-results', [
            'user' => $user,
            'patient' => $patient,
            'testResults' => $testResults,
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }
}
