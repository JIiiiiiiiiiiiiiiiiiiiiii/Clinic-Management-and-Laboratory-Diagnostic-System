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
        $patient = Patient::where('user_id', $user->id)->first();
        
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
            // Get all lab orders for this patient
            $labOrders = LabOrder::where('patient_id', $patient->id)
                ->with(['labTests', 'results'])
                ->orderBy('created_at', 'desc')
                ->get();
            
            // Get pending results (orders without verified results)
            $testResults['pending'] = $labOrders
                ->filter(function ($order) {
                    return $order->results->whereNotNull('verified_at')->count() === 0;
                })
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'created_at' => $order->created_at->format('M d, Y'),
                        'tests' => $order->labTests->pluck('name'),
                        'status' => $order->status,
                        'notes' => $order->notes,
                    ];
                });
            
            // Get completed results (orders with verified results)
            $testResults['completed'] = $labOrders
                ->filter(function ($order) {
                    return $order->results->whereNotNull('verified_at')->count() > 0;
                })
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'created_at' => $order->created_at->format('M d, Y'),
                        'tests' => $order->labTests->pluck('name'),
                        'status' => $order->status,
                        'results' => $order->results->map(function ($result) {
                            return [
                                'id' => $result->id,
                                'test_name' => $result->test_name,
                                'result_value' => $result->result_value,
                                'normal_range' => $result->normal_range,
                                'unit' => $result->unit,
                                'status' => $result->status,
                                'verified_at' => $result->verified_at ? $result->verified_at->format('M d, Y') : null,
                            ];
                        }),
                        'verified_at' => $order->results->whereNotNull('verified_at')->first()?->verified_at->format('M d, Y'),
                    ];
                });
            
            // Calculate statistics
            $testResults['statistics']['total_tests'] = $labOrders->count();
            $testResults['statistics']['pending_tests'] = $testResults['pending']->count();
            $testResults['statistics']['completed_tests'] = $testResults['completed']->count();
        }
        
        return Inertia::render('patient/test-results', [
            'user' => $user,
            'patient' => $patient,
            'testResults' => $testResults,
        ]);
    }
}
