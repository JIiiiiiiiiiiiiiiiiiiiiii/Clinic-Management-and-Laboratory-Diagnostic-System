<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\LabOrder;
use App\Models\LabResult;
use App\Models\Visit;
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
        
        \Log::info('Loading records for patient', [
            'user_id' => $user->id,
            'patient_id' => $patient ? $patient->id : null,
            'patient_no' => $patient ? $patient->patient_no : null,
        ]);
        
        $records = [
            'visits' => [],
            'lab_orders' => [],
            'lab_results' => [],
        ];
        
        if ($patient) {
            // Get visits for this patient - Visit.patient_id references Patient.id
            $records['visits'] = Visit::where('patient_id', $patient->id)
                ->with([
                    'appointment', 
                    'appointment.specialist', 
                    'appointment.patient',
                    'doctor',
                    'nurse',
                    'medtech'
                ])
                ->orderBy('visit_date_time_time', 'desc')
                ->get()
                ->map(function ($visit) {
                    // Get specialist name from visit or appointment - enhanced lookup
                    $specialistName = 'Unknown Specialist';
                    
                    // Try appointment specialist relationship first
                    if ($visit->appointment && $visit->appointment->specialist) {
                        $specialistName = $visit->appointment->specialist->name;
                    } 
                    // Try appointment specialist_id direct lookup
                    elseif ($visit->appointment && $visit->appointment->specialist_id) {
                        $specialist = \App\Models\Specialist::where('specialist_id', $visit->appointment->specialist_id)->first();
                        if ($specialist) $specialistName = $specialist->name;
                    }
                    
                    // Try visit doctor relationship (eager loaded)
                    if ($specialistName === 'Unknown Specialist' && $visit->doctor) {
                        $specialistName = $visit->doctor->name;
                    }
                    // Try visit doctor_id (if column exists)
                    elseif ($specialistName === 'Unknown Specialist' && isset($visit->doctor_id) && $visit->doctor_id) {
                        $doctor = \App\Models\Specialist::where('specialist_id', $visit->doctor_id)->first();
                        if ($doctor) {
                            $specialistName = $doctor->name;
                        }
                    }
                    
                    // Try visit nurse relationship (eager loaded)
                    if ($specialistName === 'Unknown Specialist' && $visit->nurse) {
                        $specialistName = $visit->nurse->name;
                    }
                    // Try visit nurse_id (if column exists)
                    elseif ($specialistName === 'Unknown Specialist' && isset($visit->nurse_id) && $visit->nurse_id) {
                        $nurse = \App\Models\Specialist::where('specialist_id', $visit->nurse_id)->first();
                        if ($nurse) {
                            $specialistName = $nurse->name;
                        }
                    }
                    
                    // Try visit medtech relationship (eager loaded)
                    if ($specialistName === 'Unknown Specialist' && $visit->medtech) {
                        $specialistName = $visit->medtech->name;
                    }
                    // Try visit medtech_id (if column exists)
                    elseif ($specialistName === 'Unknown Specialist' && isset($visit->medtech_id) && $visit->medtech_id) {
                        $medtech = \App\Models\Specialist::where('specialist_id', $visit->medtech_id)->first();
                        if ($medtech) {
                            $specialistName = $medtech->name;
                        }
                    }
                    
                    // Try visit attending_staff_id
                    if ($specialistName === 'Unknown Specialist' && $visit->attending_staff_id) {
                        $staff = \App\Models\Specialist::where('specialist_id', $visit->attending_staff_id)->first();
                        if ($staff) $specialistName = $staff->name;
                    }
                    
                    \Log::info('Visit specialist lookup', [
                        'visit_id' => $visit->id,
                        'visit_code' => $visit->visit_code,
                        'appointment_id' => $visit->appointment_id,
                        'appointment_specialist_id' => $visit->appointment ? $visit->appointment->specialist_id : null,
                        'has_doctor_id' => isset($visit->doctor_id),
                        'doctor_id' => isset($visit->doctor_id) ? $visit->doctor_id : null,
                        'has_nurse_id' => isset($visit->nurse_id),
                        'nurse_id' => isset($visit->nurse_id) ? $visit->nurse_id : null,
                        'has_medtech_id' => isset($visit->medtech_id),
                        'medtech_id' => isset($visit->medtech_id) ? $visit->medtech_id : null,
                        'attending_staff_id' => $visit->attending_staff_id,
                        'specialist_name_found' => $specialistName,
                    ]);
                    
                    return [
                        'id' => $visit->id,
                        'visit_code' => $visit->visit_code ?? 'N/A',
                        'visit_date' => $visit->visit_date_time_time ? $visit->visit_date_time_time->format('M d, Y') : 'N/A',
                        'visit_time' => $visit->visit_date_time_time ? $visit->visit_date_time_time->format('g:i A') : 'N/A',
                        'visit_date_time' => $visit->visit_date_time_time ? $visit->visit_date_time_time->format('Y-m-d H:i:s') : null,
                        'purpose' => $visit->purpose ?? 'N/A',
                        'status' => $visit->status ?? 'pending',
                        'visit_type' => $visit->visit_type ?? 'N/A',
                        'specialist_name' => $specialistName,
                        'appointment_id' => $visit->appointment_id,
                        'appointment_type' => $visit->appointment ? $visit->appointment->appointment_type : null,
                        'reason_for_consult' => $visit->reason_for_consult ?? null,
                        'assessment_diagnosis' => $visit->assessment_diagnosis ?? null,
                        'plan_management' => $visit->plan_management ?? null,
                        'notes' => $visit->notes ?? null,
                        'vital_signs' => [
                            'blood_pressure' => $visit->blood_pressure ?? null,
                            'heart_rate' => $visit->heart_rate ?? null,
                            'respiratory_rate' => $visit->respiratory_rate ?? null,
                            'temperature' => $visit->temperature ?? null,
                            'weight_kg' => $visit->weight_kg ?? null,
                            'height_cm' => $visit->height_cm ?? null,
                            'oxygen_saturation' => $visit->oxygen_saturation ?? null,
                        ],
                        'created_at' => $visit->created_at ? $visit->created_at->format('M d, Y H:i') : 'N/A',
                    ];
                });
            
            \Log::info('Visits loaded for patient', [
                'patient_id' => $patient->id,
                'patient_no' => $patient->patient_no,
                'user_id' => $user->id,
                'user_email' => $user->email,
                'visits_count' => $records['visits']->count(),
                'visit_ids' => $records['visits']->pluck('id')->toArray(),
                'sample_visit' => $records['visits']->first() ? [
                    'id' => $records['visits']->first()['id'],
                    'visit_code' => $records['visits']->first()['visit_code'],
                    'visit_date' => $records['visits']->first()['visit_date'],
                    'specialist_name' => $records['visits']->first()['specialist_name'],
                ] : null,
            ]);
            
            // Get lab orders with their results and tests
            // LabOrder.patient_id references Patient.id (integer)
            $records['lab_orders'] = LabOrder::where('patient_id', $patient->id)
                ->with(['results.test', 'orderedBy', 'patient']) // Load results with their test relationship
                ->orderBy('created_at', 'desc')
                ->get();
            
            \Log::info('Lab orders loaded for patient', [
                'patient_id' => $patient->id,
                'lab_orders_count' => $records['lab_orders']->count(),
            ]);
            
            $records['lab_orders'] = $records['lab_orders']->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'created_at' => $order->created_at ? $order->created_at->format('M d, Y') : 'N/A',
                        'tests' => $order->results->map(function ($result) {
                            return $result->test?->name ?? 'Unknown Test';
                        })->filter()->unique()->values()->all(),
                        'status' => $order->status ?? 'pending',
                        'notes' => $order->notes ?? '',
                        'ordered_by' => $order->orderedBy ? $order->orderedBy->name : 'N/A',
                    ];
                });
            
            // Get lab results with their test and order relationships, including detailed values
            // LabResult belongs to LabOrder, which belongs to Patient
            $records['lab_results'] = LabResult::whereHas('order', function ($query) use ($patient) {
                $query->where('patient_id', $patient->id); // LabOrder.patient_id references Patient.id
            })
            ->with(['test', 'order', 'order.patient', 'values']) // Load test, order, and detailed values relationships
            ->orderBy('created_at', 'desc')
            ->get();
            
            \Log::info('Lab results loaded for patient', [
                'patient_id' => $patient->id,
                'lab_results_count' => $records['lab_results']->count(),
            ]);
            
            $records['lab_results'] = $records['lab_results']->map(function ($result) {
                // Handle results as array (from JSON column)
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
                
                return [
                    'id' => $result->id,
                    'test_name' => $result->test?->name ?? 'Unknown Test',
                    'result_value' => $resultsData['value'] ?? ($resultsData['result'] ?? 'N/A'),
                    'normal_range' => $resultsData['normal_range'] ?? ($resultsData['range'] ?? 'N/A'),
                    'unit' => $resultsData['unit'] ?? 'N/A',
                    'status' => $result->verified_at ? 'verified' : 'pending',
                    'verified_at' => $result->verified_at ? $result->verified_at->format('M d, Y') : null,
                    'created_at' => $result->created_at ? $result->created_at->format('M d, Y') : 'N/A',
                    'order_id' => $result->lab_order_id,
                    'detailed_values' => $detailedValues, // Include detailed values from lab_result_values table
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
