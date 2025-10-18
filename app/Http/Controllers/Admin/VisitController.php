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
            // Get all visits
            $initialQuery = Visit::with(['patient', 'appointment']);
            // Get follow-up visits (if any exist)
            $followUpQuery = Visit::with(['patient', 'appointment'])->where('visit_type', 'follow_up');

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

            // Get paginated results
            $initialVisits = $initialQuery->paginate(15, ['*'], 'initial_page');
            $followUpVisits = $followUpQuery->paginate(15, ['*'], 'followup_page');
            
            // Transform visits to match frontend expectations
            $initialVisits->getCollection()->transform(function ($visit) {
                // Get staff information
                $staff = null;
                if ($visit->attending_staff_id) {
                    $staff = \App\Models\User::find($visit->attending_staff_id);
                }
                
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
                    'staff' => $staff ? [
                        'id' => $staff->id,
                        'name' => $staff->name,
                        'role' => $staff->role,
                    ] : null,
                    'visit_date' => $visit->visit_date_time_time ? $visit->visit_date_time_time : ($visit->visit_date_time ? $visit->visit_date_time : null),
                    'purpose' => $visit->purpose,
                    'status' => $visit->status,
                    'visit_type' => $visit->visit_type,
                    'notes' => $visit->notes,
                    'created_at' => $visit->created_at->format('Y-m-d H:i:s'),
                ];
            });
            
            $followUpVisits->getCollection()->transform(function ($visit) {
                // Get staff information
                $staff = null;
                if ($visit->attending_staff_id) {
                    $staff = \App\Models\User::find($visit->attending_staff_id);
                }
                
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
                    'staff' => $staff ? [
                        'id' => $staff->id,
                        'name' => $staff->name,
                        'role' => $staff->role,
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
                'initial_visits' => $initialVisits->items(),
                'follow_up_visits' => $followUpVisits->items(),
                'initial_visits_pagination' => [
                    'current_page' => $initialVisits->currentPage(),
                    'last_page' => $initialVisits->lastPage(),
                    'per_page' => $initialVisits->perPage(),
                    'total' => $initialVisits->total()
                ],
                'follow_up_visits_pagination' => [
                    'current_page' => $followUpVisits->currentPage(),
                    'last_page' => $followUpVisits->lastPage(),
                    'per_page' => $followUpVisits->perPage(),
                    'total' => $followUpVisits->total()
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
        $visit->load(['patient', 'doctor', 'nurse', 'medtech', 'appointment']);

        // Transform visit data for frontend compatibility
        $visit->id = $visit->visit_id;
        
        // Map doctor/medtech to staff
        if ($visit->doctor) {
            $visit->staff = $visit->doctor;
        } elseif ($visit->medtech) {
            $visit->staff = $visit->medtech;
        } elseif ($visit->nurse) {
            $visit->staff = $visit->nurse;
        }
        
        // Add visit_type based on purpose (since visit_type column doesn't exist)
        $visit->visit_type = 'initial'; // Default to initial
        
        // Ensure visit_date is properly set for frontend
        $visit->visit_date = $visit->visit_date_time_time ?? $visit->visit_date_time ?? $visit->created_at;

        return Inertia::render('admin/visits/show', [
            'visit' => $visit
        ]);
    }

    public function edit(Visit $visit)
    {
        $visit->load(['patient', 'doctor', 'nurse', 'medtech', 'appointment']);

        // Transform visit data for frontend compatibility
        $visit->id = $visit->visit_id;
        
        // Map doctor/medtech to staff
        if ($visit->doctor) {
            $visit->staff = $visit->doctor;
        } elseif ($visit->medtech) {
            $visit->staff = $visit->medtech;
        } elseif ($visit->nurse) {
            $visit->staff = $visit->nurse;
        }
        
        // Add visit_type based on purpose (since visit_type column doesn't exist)
        $visit->visit_type = 'initial'; // Default to initial

        $specialists = \App\Models\Specialist::whereIn('role', ['Doctor', 'MedTech'])
            ->orderBy('name')
            ->get(['specialist_id as id', 'name', 'role']);

        return Inertia::render('admin/visits/edit', [
            'visit' => $visit,
            'specialists' => $specialists,
            'status_options' => [
                'Ongoing' => 'Ongoing',
                'Completed' => 'Completed',
                'Cancelled' => 'Cancelled',
            ]
        ]);
    }

    public function update(Request $request, Visit $visit)
    {
        $validator = Validator::make($request->all(), [
            'visit_date' => 'required|date',
            'purpose' => 'required|string|max:255',
            'doctor_id' => 'nullable|exists:specialists,specialist_id',
            'medtech_id' => 'nullable|exists:specialists,specialist_id',
            'nurse_id' => 'nullable|exists:specialists,specialist_id',
            'status' => 'required|in:Ongoing,Completed,Cancelled',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $visit->update($request->only([
                'visit_date',
                'purpose',
                'doctor_id',
                'medtech_id',
                'nurse_id',
                'status',
                'notes'
            ]));

            return redirect()->route('admin.visits.show', $visit)
                ->with('success', 'Visit updated successfully!');
        } catch (\Exception $e) {
            return back()
                ->with('error', 'Failed to update visit: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function createFollowUp(Visit $visit)
    {
        $visit->load(['patient', 'doctor', 'nurse', 'medtech']);

        // Transform visit data for frontend compatibility
        $visit->id = $visit->visit_id;
        
        // Map doctor/medtech to staff
        if ($visit->doctor) {
            $visit->staff = $visit->doctor;
        } elseif ($visit->medtech) {
            $visit->staff = $visit->medtech;
        } elseif ($visit->nurse) {
            $visit->staff = $visit->nurse;
        }

        $specialists = \App\Models\Specialist::whereIn('role', ['Doctor', 'MedTech'])
            ->orderBy('name')
            ->get(['specialist_id as id', 'name', 'role']);

        return Inertia::render('admin/visits/create-follow-up', [
            'original_visit' => $visit,
            'specialists' => $specialists
        ]);
    }

    public function storeFollowUp(Request $request, Visit $visit)
    {
        $validator = Validator::make($request->all(), [
            'visit_date' => 'required|date|after:now',
            'purpose' => 'required|string|max:255',
            'doctor_id' => 'required|exists:specialists,specialist_id',
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
                'visit_date' => $request->visit_date,
                'purpose' => $request->purpose,
                'doctor_id' => $request->doctor_id,
                'notes' => $request->notes,
                'status' => 'Ongoing',
            ]);

            return redirect()->route('admin.visits.show', $followUpVisit->visit_id)
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
