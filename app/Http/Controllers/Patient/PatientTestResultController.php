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
                        'tests' => $order->results->map(function ($result) {
                            return $result->test?->name;
                        })->filter(),
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
                        'tests' => $order->results->map(function ($result) {
                            return $result->test?->name;
                        })->filter(),
                        'status' => $order->status,
                        'results' => $order->results->map(function ($result) {
                            return [
                                'id' => $result->id,
                                'test_name' => $result->test?->name ?? 'Unknown Test',
                                'result_value' => $result->results['value'] ?? 'N/A',
                                'normal_range' => $result->results['normal_range'] ?? 'N/A',
                                'unit' => $result->results['unit'] ?? 'N/A',
                                'status' => $result->verified_at ? 'verified' : 'pending',
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
