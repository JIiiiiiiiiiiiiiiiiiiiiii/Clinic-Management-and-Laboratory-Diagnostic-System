<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\PatientVisit;
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
            // Get medical visits
            $records['visits'] = PatientVisit::where('patient_id', $patient->id)
                ->orderBy('visit_date', 'desc')
                ->get()
                ->map(function ($visit) {
                    return [
                        'id' => $visit->id,
                        'visit_date' => $visit->visit_date->format('M d, Y'),
                        'chief_complaint' => $visit->chief_complaint,
                        'diagnosis' => $visit->diagnosis,
                        'treatment' => $visit->treatment,
                        'vital_signs' => [
                            'blood_pressure' => $visit->blood_pressure,
                            'temperature' => $visit->temperature,
                            'pulse_rate' => $visit->pulse_rate,
                            'respiratory_rate' => $visit->respiratory_rate,
                        ],
                        'notes' => $visit->notes,
                    ];
                });
            
            // Get lab orders
            $records['lab_orders'] = LabOrder::where('patient_id', $patient->id)
                ->with(['labTests'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'created_at' => $order->created_at->format('M d, Y'),
                        'tests' => $order->labTests->pluck('name'),
                        'status' => $order->status,
                        'notes' => $order->notes,
                    ];
                });
            
            // Get lab results
            $records['lab_results'] = LabResult::whereHas('labOrder', function ($query) use ($patient) {
                $query->where('patient_id', $patient->id);
            })
            ->with(['labOrder.labTests'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($result) {
                return [
                    'id' => $result->id,
                    'test_name' => $result->test_name,
                    'result_value' => $result->result_value,
                    'normal_range' => $result->normal_range,
                    'unit' => $result->unit,
                    'status' => $result->status,
                    'verified_at' => $result->verified_at ? $result->verified_at->format('M d, Y') : null,
                    'created_at' => $result->created_at->format('M d, Y'),
                ];
            });
        }
        
        return Inertia::render('patient/records', [
            'user' => $user,
            'patient' => $patient,
            'records' => $records,
        ]);
    }
}
