<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Visit;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class VisitController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Get all visits with proper eager loading
            $initialQuery = Visit::with(['patient', 'appointment', 'attendingStaff']);
            // Get follow-up visits (if any exist)
            $followUpQuery = Visit::with(['patient', 'appointment', 'attendingStaff'])->where('visit_type', 'follow_up');

            // Apply common filters to both queries
            $applyFilters = function ($query) use ($request) {
                // Apply search filter
                if ($request->filled('search')) {
                    $search = $request->search;
                    $query->whereHas('patient', function ($q) use ($search) {
                        $q->where('first_name', 'like', "%{$search}%")
                          ->orWhere('last_name', 'like', "%{$search}%")
                          ->orWhere('patient_no', 'like', "%{$search}%");
                    });
                }

                // Apply status filter
                if ($request->filled('status')) {
                    $query->where('status', $request->status);
                }

                // Apply visit type filter
                if ($request->filled('visit_type')) {
                    $query->where('visit_type', $request->visit_type);
                }

                // Apply date range filter
                if ($request->filled('date_from')) {
                    $query->whereDate('visit_date_time_time', '>=', $request->date_from);
                }

                if ($request->filled('date_to')) {
                    $query->whereDate('visit_date_time_time', '<=', $request->date_to);
                }

                // Apply staff filter (using attending_staff_id)
                if ($request->filled('doctor_id')) {
                    $query->where('attending_staff_id', $request->doctor_id);
                }
                if ($request->filled('staff_id')) {
                    $query->where('attending_staff_id', $request->staff_id);
                }

                // Apply sorting
                $sortBy = $request->get('sort_by', 'visit_date_time_time');
                $sortDir = $request->get('sort_dir', 'desc');
                $query->orderBy($sortBy, $sortDir);
            };

            // Apply filters to both queries
            $applyFilters($initialQuery);
            $applyFilters($followUpQuery);

            // Get paginated results - combine queries for proper pagination
            $combinedQuery = $initialQuery->union($followUpQuery);
            $perPage = $request->get('per_page', 15);
            $allVisits = $combinedQuery->paginate($perPage);
            
            // Transform visits to match frontend expectations
            $allVisits->getCollection()->transform(function ($visit) {
                return [
                    'id' => $visit->id,
                    'appointment_id' => $visit->appointment_id,
                    'patient_id' => $visit->patient_id,
                    'patient' => $visit->patient ? [
                        'id' => $visit->patient->id,
                        'patient_no' => $visit->patient->patient_no,
                        'first_name' => $visit->patient->first_name,
                        'last_name' => $visit->patient->last_name,
                    ] : null,
                    'staff_id' => $visit->attending_staff_id,
                    'staff' => $visit->attendingStaff ? [
                        'id' => $visit->attendingStaff->id,
                        'name' => $visit->attendingStaff->name,
                        'role' => $visit->attendingStaff->role,
                    ] : null,
                    'visit_date' => $visit->visit_date_time_time ? $visit->visit_date_time_time : ($visit->visit_date_time ? $visit->visit_date_time : null),
                    'purpose' => $visit->purpose,
                    'status' => $visit->status,
                    'visit_type' => $visit->visit_type,
                    'follow_up_visit_id' => $visit->follow_up_visit_id,
                    'notes' => $visit->notes,
                    'created_at' => $visit->created_at->format('Y-m-d H:i:s'),
                ];
            });

            // Get staff for filter dropdown
            $specialists = \App\Models\User::whereIn('role', ['doctor', 'admin', 'nurse'])
                ->orderBy('name')
                ->get(['id', 'name', 'role']);

            return Inertia::render('admin/visits/index', [
                'visits' => $allVisits->items(),
                'pagination' => [
                    'current_page' => $allVisits->currentPage(),
                    'last_page' => $allVisits->lastPage(),
                    'per_page' => $allVisits->perPage(),
                    'total' => $allVisits->total(),
                    'from' => $allVisits->firstItem(),
                    'to' => $allVisits->lastItem(),
                ],
                // Keep these for backward compatibility
                'initial_visits' => $allVisits->items(),
                'follow_up_visits' => [],
                'initial_visits_pagination' => [
                    'current_page' => $allVisits->currentPage(),
                    'last_page' => $allVisits->lastPage(),
                    'per_page' => $allVisits->perPage(),
                    'total' => $allVisits->total()
                ],
                'follow_up_visits_pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 15,
                    'total' => 0
                ],
                'filters' => [
                    'search' => $request->get('search', ''),
                    'status' => $request->get('status', ''),
                    'visit_type' => $request->get('visit_type', ''),
                    'date_from' => $request->get('date_from', ''),
                    'date_to' => $request->get('date_to', ''),
                    'staff_id' => $request->get('staff_id', ''),
                    'sort_by' => $request->get('sort_by', 'visit_date_time_time'),
                    'sort_dir' => $request->get('sort_dir', 'desc'),
                ],
                'specialists' => $specialists,
                'staff' => $specialists, // For frontend compatibility
                'status_options' => [
                    'scheduled' => 'Scheduled',
                    'in_progress' => 'In Progress',
                    'completed' => 'Completed',
                    'cancelled' => 'Cancelled',
                ],
                'visit_type_options' => [
                    'initial' => 'Initial Visit',
                    'follow_up' => 'Follow-up Visit',
                    'lab_result_review' => 'Lab Result Review',
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to load visits index', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return Inertia::render('admin/visits/index', [
                'initial_visits' => [],
                'follow_up_visits' => [],
                'initial_visits_pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 15,
                    'total' => 0
                ],
                'follow_up_visits_pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 15,
                    'total' => 0
                ],
                'filters' => [],
                'specialists' => [],
                'status_options' => [],
                'visit_type_options' => [],
                'error' => 'Failed to load visit data. Please try again.'
            ]);
        }
    }

    public function show(Visit $visit)
    {
        $visit->load(['patient', 'attendingStaff', 'appointment']);

        // Transform visit data for frontend compatibility
        $visit->id = $visit->id ?? $visit->visit_id;
        
        // Map attending staff
        if ($visit->attendingStaff) {
            $visit->staff = $visit->attendingStaff;
        }
        
        // Add visit_type if not set
        if (!$visit->visit_type) {
            $visit->visit_type = 'initial'; // Default to initial
        }
        
        // Ensure visit_date is properly set for frontend
        $visit->visit_date = $visit->visit_date_time_time ?? $visit->visit_date_time ?? $visit->created_at;

        return Inertia::render('admin/visits/show', [
            'visit' => $visit,
            'patient' => $visit->patient // Pass full patient data for display
        ]);
    }

    public function edit(Visit $visit)
    {
        $visit->load(['patient', 'attendingStaff', 'appointment']);

        // Get staff for dropdown (doctors only for attending physician)
        $staff = \App\Models\User::whereIn('role', ['doctor', 'admin'])
            ->orderBy('name')
            ->get(['id', 'name', 'role']);

        // Helper function to format time fields (handle both string and datetime)
        $formatTime = function($time) {
            if (!$time) return null;
            if (is_string($time)) {
                // If it's already a string, extract HH:mm format
                if (preg_match('/(\d{2}):(\d{2})/', $time, $matches)) {
                    return $matches[1] . ':' . $matches[2];
                }
                return $time;
            }
            if ($time instanceof \DateTime || $time instanceof \Carbon\Carbon) {
                return $time->format('H:i');
            }
            return $time;
        };

        // Format visit data to ensure all fields are properly passed
        $visitData = [
            'id' => $visit->id,
            'visit_date_time_time' => $visit->visit_date_time_time ? $visit->visit_date_time_time->format('Y-m-d\TH:i:s') : null,
            'purpose' => $visit->purpose,
            'notes' => $visit->notes,
            'status' => $visit->status,
            'visit_type' => $visit->visit_type,
            // Clinical fields - ensure they're properly formatted
            'arrival_date' => $visit->arrival_date ? ($visit->arrival_date instanceof \DateTime || $visit->arrival_date instanceof \Carbon\Carbon ? $visit->arrival_date->format('Y-m-d') : $visit->arrival_date) : null,
            'arrival_time' => $formatTime($visit->arrival_time),
            'mode_of_arrival' => $visit->mode_of_arrival,
            'blood_pressure' => $visit->blood_pressure,
            'heart_rate' => $visit->heart_rate,
            'respiratory_rate' => $visit->respiratory_rate,
            'temperature' => $visit->temperature,
            'weight_kg' => $visit->weight_kg,
            'height_cm' => $visit->height_cm,
            'pain_assessment_scale' => $visit->pain_assessment_scale,
            'oxygen_saturation' => $visit->oxygen_saturation,
            'reason_for_consult' => $visit->reason_for_consult,
            'time_seen' => $formatTime($visit->time_seen),
            'history_of_present_illness' => $visit->history_of_present_illness,
            'pertinent_physical_findings' => $visit->pertinent_physical_findings,
            'assessment_diagnosis' => $visit->assessment_diagnosis,
            'plan_management' => $visit->plan_management,
            'transfer_required' => $visit->transfer_required ?? false,
            'transfer_reason_notes' => $visit->transfer_reason_notes,
            'attending_staff' => $visit->attendingStaff ? [
                'id' => $visit->attendingStaff->id,
                'name' => $visit->attendingStaff->name,
                'role' => $visit->attendingStaff->role,
            ] : null,
        ];

        return Inertia::render('admin/visits/edit-consultation', [
            'visit' => $visitData,
            'patient' => $visit->patient, // Pass full patient data for read-only display
            'staff' => $staff,
            'status_options' => [
                'scheduled' => 'Scheduled',
                'in_progress' => 'In Progress',
                'completed' => 'Completed',
                'cancelled' => 'Cancelled',
            ]
        ]);
    }

    public function update(Request $request, Visit $visit)
    {
        $validator = Validator::make($request->all(), [
            // Arrival Information
            'arrival_date' => 'nullable|date',
            'arrival_time' => 'nullable|date_format:H:i',
            'mode_of_arrival' => 'nullable|string|max:100',
            
            // Attending Physician
            'attending_staff_id' => 'required|exists:users,id',
            
            // Vital Signs
            'blood_pressure' => 'nullable|string|max:20',
            'heart_rate' => 'nullable|string|max:20',
            'respiratory_rate' => 'nullable|string|max:20',
            'temperature' => 'nullable|string|max:20',
            'weight_kg' => 'nullable|numeric|min:0|max:500',
            'height_cm' => 'nullable|numeric|min:0|max:300',
            'pain_assessment_scale' => 'nullable|string|max:20',
            'oxygen_saturation' => 'nullable|string|max:20',
            
            // Clinical Information
            'reason_for_consult' => 'nullable|string',
            'time_seen' => 'nullable|date_format:H:i',
            'history_of_present_illness' => 'nullable|string',
            'pertinent_physical_findings' => 'nullable|string',
            'assessment_diagnosis' => 'nullable|string',
            'plan_management' => 'nullable|string',
            
            // Transfer Information
            'transfer_required' => 'nullable|boolean',
            'transfer_reason_notes' => 'nullable|string|required_if:transfer_required,1',
            
            // Basic Visit Info
            'visit_date_time_time' => 'nullable|date',
            'purpose' => 'nullable|string|max:255',
            'status' => 'required|in:scheduled,in_progress,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $updateData = [
                'attending_staff_id' => $request->attending_staff_id,
                'status' => $request->status,
            ];
            
            // Arrival Information
            if ($request->filled('arrival_date')) {
                $updateData['arrival_date'] = $request->arrival_date;
            }
            if ($request->filled('arrival_time')) {
                $updateData['arrival_time'] = $request->arrival_time;
            }
            if ($request->filled('mode_of_arrival')) {
                $updateData['mode_of_arrival'] = $request->mode_of_arrival;
            }
            
            // Vital Signs
            if ($request->filled('blood_pressure')) {
                $updateData['blood_pressure'] = $request->blood_pressure;
            }
            if ($request->filled('heart_rate')) {
                $updateData['heart_rate'] = $request->heart_rate;
            }
            if ($request->filled('respiratory_rate')) {
                $updateData['respiratory_rate'] = $request->respiratory_rate;
            }
            if ($request->filled('temperature')) {
                $updateData['temperature'] = $request->temperature;
            }
            if ($request->filled('weight_kg')) {
                $updateData['weight_kg'] = $request->weight_kg;
            }
            if ($request->filled('height_cm')) {
                $updateData['height_cm'] = $request->height_cm;
            }
            if ($request->filled('pain_assessment_scale')) {
                $updateData['pain_assessment_scale'] = $request->pain_assessment_scale;
            }
            if ($request->filled('oxygen_saturation')) {
                $updateData['oxygen_saturation'] = $request->oxygen_saturation;
            }
            
            // Clinical Information
            if ($request->filled('reason_for_consult')) {
                $updateData['reason_for_consult'] = $request->reason_for_consult;
            }
            if ($request->filled('time_seen')) {
                $updateData['time_seen'] = $request->time_seen;
            }
            if ($request->filled('history_of_present_illness')) {
                $updateData['history_of_present_illness'] = $request->history_of_present_illness;
            }
            if ($request->filled('pertinent_physical_findings')) {
                $updateData['pertinent_physical_findings'] = $request->pertinent_physical_findings;
            }
            if ($request->filled('assessment_diagnosis')) {
                $updateData['assessment_diagnosis'] = $request->assessment_diagnosis;
            }
            if ($request->filled('plan_management')) {
                $updateData['plan_management'] = $request->plan_management;
            }
            
            // Transfer Information
            $updateData['transfer_required'] = $request->boolean('transfer_required', false);
            if ($request->filled('transfer_reason_notes')) {
                $updateData['transfer_reason_notes'] = $request->transfer_reason_notes;
            } else {
                $updateData['transfer_reason_notes'] = null;
            }
            
            // Basic Visit Info
            if ($request->filled('visit_date_time_time')) {
                $updateData['visit_date_time_time'] = $request->visit_date_time_time;
            }
            if ($request->filled('purpose')) {
                $updateData['purpose'] = $request->purpose;
            }
            if ($request->filled('notes')) {
                $updateData['notes'] = $request->notes;
            }
            
            $visit->update($updateData);

            return redirect()->route('admin.visits.show', $visit)
                ->with('success', 'Visit consultation updated successfully!');
        } catch (\Exception $e) {
            return back()
                ->with('error', 'Failed to update visit: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function createFollowUp(Visit $visit)
    {
        $visit->load(['patient', 'attendingStaff']);

        // Get staff for dropdown
        $staff = \App\Models\User::whereIn('role', ['doctor', 'admin', 'nurse'])
            ->orderBy('name')
            ->get(['id', 'name', 'role']);

        return Inertia::render('admin/visits/create-follow-up', [
            'original_visit' => $visit,
            'staff' => $staff
        ]);
    }

    public function storeFollowUp(Request $request, Visit $visit)
    {
        $validator = Validator::make($request->all(), [
            'visit_date' => 'required|date|after:now',
            'purpose' => 'required|string|max:255',
            'doctor_id' => 'required|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            // Create a new visit record for follow-up
            $followUpVisit = Visit::create([
                'appointment_id' => $visit->appointment_id,
                'patient_id' => $visit->patient_id,
                'attending_staff_id' => $request->doctor_id,
                'follow_up_visit_id' => $visit->id,
                'visit_date_time_time' => $request->visit_date,
                'purpose' => $request->purpose,
                'notes' => $request->notes,
                'status' => 'scheduled',
                'visit_type' => 'follow_up',
            ]);

            return redirect()->route('admin.visits.show', $followUpVisit->id)
                ->with('success', 'Follow-up visit created successfully!');
        } catch (\Exception $e) {
            return back()
                ->with('error', 'Failed to create follow-up visit: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(Visit $visit)
    {
        try {
            $visit->delete();

            return redirect()->route('admin.visits.index')
                ->with('success', 'Visit deleted successfully!');
        } catch (\Exception $e) {
            return back()
                ->with('error', 'Failed to delete visit: ' . $e->getMessage());
        }
    }

    public function markCompleted(Visit $visit)
    {
        try {
            $visit->markAsCompleted();

            return back()->with('success', 'Visit marked as completed!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update visit status: ' . $e->getMessage());
        }
    }

    public function markCancelled(Visit $visit)
    {
        try {
            $visit->markAsCancelled();

            return back()->with('success', 'Visit marked as cancelled!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update visit status: ' . $e->getMessage());
        }
    }
}
