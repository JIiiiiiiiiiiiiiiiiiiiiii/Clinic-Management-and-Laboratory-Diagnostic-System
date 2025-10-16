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
            // Get initial visits (non-follow-up visits)
            $initialQuery = Visit::with(['patient', 'attendingStaff', 'appointment'])
                ->whereNull('follow_up_visit_id');

            // Get follow-up visits
            $followUpQuery = Visit::with(['patient', 'attendingStaff', 'appointment', 'followUpVisit'])
                ->whereNotNull('follow_up_visit_id');

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
                    $query->whereDate('visit_date_time', '>=', $request->date_from);
                }

                if ($request->filled('date_to')) {
                    $query->whereDate('visit_date_time', '<=', $request->date_to);
                }

                // Apply staff filter
                if ($request->filled('staff_id')) {
                    $query->where('attending_staff_id', $request->staff_id);
                }

                // Apply sorting
                $sortBy = $request->get('sort_by', 'visit_date_time');
                $sortDir = $request->get('sort_dir', 'desc');
                $query->orderBy($sortBy, $sortDir);
            };

            // Apply filters to both queries
            $applyFilters($initialQuery);
            $applyFilters($followUpQuery);

            // Get paginated results
            $initialVisits = $initialQuery->paginate(15, ['*'], 'initial_page');
            $followUpVisits = $followUpQuery->paginate(15, ['*'], 'followup_page');

            // Get staff for filter dropdown
            $staff = User::whereIn('role', ['doctor', 'medtech'])
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
                    'sort_by' => $request->get('sort_by', 'visit_date_time'),
                    'sort_dir' => $request->get('sort_dir', 'desc'),
                ],
                'staff' => $staff,
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
                'staff' => [],
                'status_options' => [],
                'visit_type_options' => [],
                'error' => 'Failed to load visit data. Please try again.'
            ]);
        }
    }

    public function show(Visit $visit)
    {
        $visit->load(['patient', 'attendingStaff', 'appointment', 'followUpVisits.attendingStaff']);

        return Inertia::render('admin/visits/show', [
            'visit' => $visit
        ]);
    }

    public function edit(Visit $visit)
    {
        $visit->load(['patient', 'attendingStaff', 'appointment']);

        $staff = User::whereIn('role', ['doctor', 'medtech'])
            ->orderBy('name')
            ->get(['id', 'name', 'role']);

        return Inertia::render('admin/visits/edit', [
            'visit' => $visit,
            'staff' => $staff
        ]);
    }

    public function update(Request $request, Visit $visit)
    {
        $validator = Validator::make($request->all(), [
            'visit_date_time' => 'required|date',
            'purpose' => 'required|string|max:255',
            'attending_staff_id' => 'required|exists:users,id',
            'status' => 'required|in:scheduled,in_progress,completed,cancelled',
            'visit_type' => 'required|in:initial,follow_up,lab_result_review',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $visit->update($request->only([
                'visit_date_time',
                'purpose',
                'attending_staff_id',
                'status',
                'visit_type',
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
        $visit->load(['patient', 'attendingStaff']);

        $staff = User::whereIn('role', ['doctor', 'medtech'])
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
            'visit_date_time' => 'required|date|after:now',
            'purpose' => 'required|string|max:255',
            'attending_staff_id' => 'required|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $followUpVisit = $visit->createFollowUpVisit([
                'visit_date_time' => $request->visit_date_time,
                'purpose' => $request->purpose,
                'attending_staff_id' => $request->attending_staff_id,
                'notes' => $request->notes,
                'status' => 'scheduled',
            ]);

            return redirect()->route('admin.visits.show', $followUpVisit)
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
