<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\LabOrder;
use App\Models\LabResult;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientRecordController extends Controller
{
    /**
     * Display the patient's medical records.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $patient = Patient::where('user_id', $user->id)->first();
        
        $records = [
            'visits' => [],
            'lab_orders' => [],
            'lab_results' => [],
        ];
        
        if ($patient) {
            // Visits functionality removed - visit history is now managed in Patient Management
            $records['visits'] = [];
            
            // Get lab orders
            $records['lab_orders'] = LabOrder::where('patient_id', $patient->id)
                ->with(['labTests'])
                ->orderBy('created_at', 'desc')
                ->get()
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
            
            // Get lab results
            $records['lab_results'] = LabResult::whereHas('order', function ($query) use ($patient) {
                $query->where('patient_id', $patient->id);
            })
            ->with(['order.labTests'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($result) {
                return [
                    'id' => $result->id,
                    'test_name' => $result->test?->name ?? 'Unknown Test',
                    'result_value' => $result->results['value'] ?? 'N/A',
                    'normal_range' => $result->results['normal_range'] ?? 'N/A',
                    'unit' => $result->results['unit'] ?? 'N/A',
                    'status' => $result->verified_at ? 'verified' : 'pending',
                    'verified_at' => $result->verified_at ? $result->verified_at->format('M d, Y') : null,
                    'created_at' => $result->created_at->format('M d, Y'),
                ];
            });
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

        return Inertia::render('patient/records', [
            'user' => $user,
            'patient' => $patient,
            'records' => $records,
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }
}
