<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Visit;
use App\Models\Patient;
use App\Models\User;
use App\Models\LabTest;
use App\Services\VisitLabService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class VisitController extends Controller
{
    protected $visitLabService;

    public function __construct(VisitLabService $visitLabService)
    {
        $this->visitLabService = $visitLabService;
    }

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

            // Get paginated results - use a single query that includes all visits
            // Union doesn't work well with pagination, so we'll use a single query
            $perPage = $request->get('per_page', 15);
            
            // Combine both queries using whereIn for visit_type or use a single query
            // Since follow-up visits are a subset, we can just query all visits
            $allVisitsQuery = Visit::with(['patient', 'appointment', 'attendingStaff']);
            
            // Re-apply filters to the combined query
            $applyFilters($allVisitsQuery);
            
            $allVisits = $allVisitsQuery->paginate($perPage);
            
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
        // Load all relationships and ensure all fields are available
        // Use eager loading with nested relationships to ensure appointment and specialist are loaded
        $visit->load([
            'patient' => function ($query) {
                // Load all patient fields that might be needed
                $query->select('*');
            },
            'attendingStaff' => function ($query) {
                $query->select('id', 'name', 'role', 'email');
            },
            // Load appointment with all necessary fields and its specialist relationship
            'appointment' => function ($query) {
                // Select all columns that exist in appointments table
                // Don't restrict columns too much to avoid missing data
                $query->select('id', 'appointment_code', 'appointment_type', 'appointment_date', 'appointment_time', 'status', 'specialist_id', 'patient_id', 'source', 'specialist_type');
            },
        ]);
        
        // Load specialist relationship separately if appointment exists and has specialist_id
        if ($visit->appointment && $visit->appointment->specialist_id) {
            $visit->appointment->load('specialist');
        }

        // Refresh the model to ensure all attributes are loaded
        $visit->refresh();

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
        
        // Map appointment specialist name if available
        // Try multiple strategies to get specialist name
        if ($visit->appointment) {
            // Strategy 1: Use loaded relationship
            if ($visit->appointment->relationLoaded('specialist') && $visit->appointment->specialist) {
                $visit->appointment->specialist_name = $visit->appointment->specialist->name;
            } 
            // Strategy 2: Load relationship if not loaded but specialist_id exists
            elseif ($visit->appointment->specialist_id) {
                try {
                    // Try to load the relationship
                    if (!$visit->appointment->relationLoaded('specialist')) {
                        $visit->appointment->load('specialist');
                    }
                    
                    if ($visit->appointment->specialist) {
                        $visit->appointment->specialist_name = $visit->appointment->specialist->name;
                    } else {
                        // Strategy 3: Direct query if relationship fails
                        $specialist = \App\Models\Specialist::find($visit->appointment->specialist_id);
                        if ($specialist) {
                            $visit->appointment->specialist_name = $specialist->name;
                            // Set the relationship for future use
                            $visit->appointment->setRelation('specialist', $specialist);
                        } else {
                            $visit->appointment->specialist_name = null;
                        }
                    }
                } catch (\Exception $e) {
                    // Log error but don't break the page
                    \Log::warning('Failed to load specialist for appointment', [
                        'appointment_id' => $visit->appointment->id,
                        'specialist_id' => $visit->appointment->specialist_id,
                        'error' => $e->getMessage()
                    ]);
                    $visit->appointment->specialist_name = null;
                }
            } else {
                $visit->appointment->specialist_name = null;
            }
            
            // Also ensure appointment source is available (Online/Walk-in)
            if (!isset($visit->appointment->source) || empty($visit->appointment->source)) {
                $visit->appointment->source = 'Walk-in'; // Default to Walk-in if not set
            }
        }

        // Map follow-up visits if relationship exists
        try {
            if (method_exists($visit, 'followUpVisits') || $visit->relationLoaded('followUpVisits')) {
                $followUps = Visit::where('follow_up_visit_id', $visit->id)
                    ->with(['attendingStaff:id,name'])
                    ->orderBy('visit_date_time_time', 'desc')
                    ->get();
                
                if ($followUps->isNotEmpty()) {
                    $visit->follow_up_visits = $followUps->map(function ($followUp) {
                        return [
                            'id' => $followUp->id,
                            'visit_date' => $followUp->visit_date_time_time ?? $followUp->visit_date_time ?? $followUp->created_at,
                            'purpose' => $followUp->purpose,
                            'status' => $followUp->status,
                            'staff' => $followUp->attendingStaff ? [
                                'name' => $followUp->attendingStaff->name
                            ] : null
                        ];
                    });
                }
            }
        } catch (\Exception $e) {
            // If follow-up visits relationship doesn't exist, set empty array
            $visit->follow_up_visits = [];
        }

        // Load lab orders for this visit
        $labOrders = \App\Models\LabOrder::where('patient_visit_id', $visit->id)
            ->with(['results.test', 'orderedBy'])
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'status' => $order->status,
                    'notes' => $order->notes,
                    'created_at' => $order->created_at,
                    'ordered_by' => $order->orderedBy ? [
                        'name' => $order->orderedBy->name
                    ] : null,
                    'tests' => $order->results->map(function ($result) {
                        return $result->test ? [
                            'id' => $result->test->id,
                            'name' => $result->test->name,
                            'code' => $result->test->code
                        ] : null;
                    })->filter()
                ];
            });

        // Load patient transfers related to this visit or patient
        $transfers = [];
        try {
            $patientId = $visit->patient_id ?? $visit->patient->id ?? null;
            if ($patientId) {
                $transfers = \App\Models\PatientTransfer::where('patient_id', $patientId)
                    ->orWhere('visit_id', $visit->id)
                    ->with(['requestedBy:id,name', 'approvedBy:id,name'])
                    ->latest()
                    ->get()
                    ->map(function ($transfer) {
                        return [
                            'id' => $transfer->id,
                            'transfer_type' => $transfer->transfer_type ?? 'Unknown',
                            'status' => $transfer->status ?? 'pending',
                            'requested_at' => $transfer->created_at,
                            'requested_by' => $transfer->requestedBy ? $transfer->requestedBy->name : null,
                            'approved_by' => $transfer->approvedBy ? $transfer->approvedBy->name : null,
                        ];
                    });
            }
        } catch (\Exception $e) {
            \Log::warning('Failed to load transfers for visit', [
                'visit_id' => $visit->id,
                'patient_id' => $visit->patient_id ?? $visit->patient->id ?? null,
                'error' => $e->getMessage()
            ]);
        }

        return Inertia::render('admin/visits/show', [
            'visit' => $visit,
            'patient' => $visit->patient, // Pass full patient data for display
            'labOrders' => $labOrders,
            'transfers' => $transfers
        ]);
    }

    public function edit(Visit $visit)
    {
        // Load all relationships and refresh to ensure all attributes are available
        // Use eager loading with nested relationships to ensure appointment and specialist are loaded
        $visit->load([
            'patient' => function ($query) {
                // Load all patient fields
                $query->select('*');
            },
            'attendingStaff' => function ($query) {
                $query->select('id', 'name', 'role', 'email');
            },
            // Load appointment with all necessary fields
            'appointment' => function ($query) {
                // Select all columns that exist in appointments table
                $query->select('id', 'appointment_code', 'appointment_type', 'appointment_date', 'appointment_time', 'status', 'specialist_id', 'patient_id', 'source', 'specialist_type');
            },
        ]);
        
        // Load specialist relationship separately if appointment exists and has specialist_id
        if ($visit->appointment && $visit->appointment->specialist_id) {
            $visit->appointment->load('specialist');
        }

        // Refresh the model to ensure all attributes are loaded from database
        $visit->refresh();
        
        // Explicitly reload attendingStaff relationship to ensure it's fresh from database
        if ($visit->attending_staff_id) {
            $visit->load('attendingStaff');
        }
        
        // Auto-correct attending_staff_id if visit has an appointment with a specialist
        // and the current attending_staff_id is missing or doesn't match the appointment's specialist
        if ($visit->appointment && $visit->appointment->specialist_id) {
            $specialist = $visit->appointment->specialist ?? \App\Models\Specialist::find($visit->appointment->specialist_id);
            
            if ($specialist) {
                // Check if current attending_staff_id is an admin (likely wrong assignment)
                $currentAttendingStaff = $visit->attendingStaff;
                $shouldCorrect = false;
                
                if (!$visit->attending_staff_id) {
                    // No attending staff assigned - should correct
                    $shouldCorrect = true;
                } elseif ($currentAttendingStaff && $currentAttendingStaff->role === 'admin' && $specialist->role === 'Doctor') {
                    // Current attending staff is admin but appointment has a doctor - likely wrong
                    $shouldCorrect = true;
                }
                
                if ($shouldCorrect) {
                    // Try to match specialist to user using the same logic as walk-in appointment creation
                    $normalizeName = function($name) {
                        $name = preg_replace('/\b(MD\.?|Dr\.?|Doctor|Mr\.?|Mrs\.?|Ms\.?)\b\.?/i', '', $name);
                        $name = str_replace(',', '', $name);
                        $name = preg_replace('/\s+/', ' ', trim($name));
                        return $name;
                    };
                    
                    $normalizedSpecialistName = $normalizeName($specialist->name);
                    $nameParts = array_filter(explode(' ', $normalizedSpecialistName));
                    $firstName = $nameParts[0] ?? '';
                    $lastName = end($nameParts) ?? '';
                    
                    $roleMapping = [
                        'Doctor' => 'doctor',
                        'MedTech' => 'medtech',
                    ];
                    
                    $userRole = $roleMapping[$specialist->role] ?? null;
                    $matchedUserId = null;
                    
                    if ($userRole) {
                        $usersWithRole = \App\Models\User::where('role', $userRole)->get();
                        
                        // Try exact match first
                        foreach ($usersWithRole as $user) {
                            $normalizedUserName = $normalizeName($user->name);
                            if (strcasecmp($normalizedSpecialistName, $normalizedUserName) === 0) {
                                $matchedUserId = $user->id;
                                \Log::info('Auto-correcting visit attending_staff_id from appointment specialist (exact match)', [
                                    'visit_id' => $visit->id,
                                    'specialist' => $specialist->name,
                                    'user' => $user->name,
                                    'user_id' => $user->id,
                                    'old_attending_staff_id' => $visit->attending_staff_id
                                ]);
                                break;
                            }
                        }
                        
                        // Try first+last name match
                        if (!$matchedUserId && $firstName && $lastName) {
                            foreach ($usersWithRole as $user) {
                                $normalizedUserName = $normalizeName($user->name);
                                $userNameParts = array_filter(explode(' ', $normalizedUserName));
                                $userFirstName = $userNameParts[0] ?? '';
                                $userLastName = end($userNameParts) ?? '';
                                
                                if (strcasecmp($firstName, $userFirstName) === 0 && 
                                    strcasecmp($lastName, $userLastName) === 0) {
                                    $matchedUserId = $user->id;
                                    \Log::info('Auto-correcting visit attending_staff_id from appointment specialist (first+last match)', [
                                        'visit_id' => $visit->id,
                                        'specialist' => $specialist->name,
                                        'user' => $user->name,
                                        'user_id' => $user->id,
                                        'old_attending_staff_id' => $visit->attending_staff_id
                                    ]);
                                    break;
                                }
                            }
                        }
                        
                        // Try last name only match
                        if (!$matchedUserId && $lastName) {
                            foreach ($usersWithRole as $user) {
                                $normalizedUserName = $normalizeName($user->name);
                                $userNameParts = array_filter(explode(' ', $normalizedUserName));
                                $userLastName = end($userNameParts) ?? '';
                                
                                if (strcasecmp($lastName, $userLastName) === 0) {
                                    $matchedUserId = $user->id;
                                    \Log::info('Auto-correcting visit attending_staff_id from appointment specialist (last name match)', [
                                        'visit_id' => $visit->id,
                                        'specialist' => $specialist->name,
                                        'user' => $user->name,
                                        'user_id' => $user->id,
                                        'old_attending_staff_id' => $visit->attending_staff_id
                                    ]);
                                    break;
                                }
                            }
                        }
                    }
                    
                    // Update visit if a match was found
                    if ($matchedUserId) {
                        $visit->attending_staff_id = $matchedUserId;
                        $visit->save();
                        // Reload attendingStaff after update
                        $visit->load('attendingStaff');
                    }
                }
            }
        }

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

        // Helper function to format date fields
        $formatDate = function($date) {
            if (!$date) return null;
            if (is_string($date)) {
                // Try to parse and format
                try {
                    return \Carbon\Carbon::parse($date)->format('Y-m-d');
                } catch (\Exception $e) {
                    return $date;
                }
            }
            if ($date instanceof \DateTime || $date instanceof \Carbon\Carbon) {
                return $date->format('Y-m-d');
            }
            return $date;
        };

        // Get fresh data from database to ensure all fields are current
        $visit->refresh();

        // Format visit data to ensure all fields are properly passed
        // Explicitly get all fields from the database
        $visitData = [
            'id' => $visit->id,
            'visit_code' => $visit->visit_code ?? null,
            'visit_date_time_time' => $visit->visit_date_time_time ? $visit->visit_date_time_time->format('Y-m-d\TH:i:s') : null,
            'visit_date_time' => $visit->visit_date_time ? ($visit->visit_date_time instanceof \DateTime || $visit->visit_date_time instanceof \Carbon\Carbon ? $visit->visit_date_time->format('Y-m-d\TH:i:s') : $visit->visit_date_time) : null,
            'purpose' => $visit->purpose ?? '',
            'notes' => $visit->notes ?? '',
            'status' => $visit->status ?? 'scheduled',
            'visit_type' => $visit->visit_type ?? 'initial',
            // Clinical fields - ensure they're properly formatted and loaded from database
            'arrival_date' => $formatDate($visit->arrival_date),
            'arrival_time' => $formatTime($visit->arrival_time),
            'mode_of_arrival' => $visit->mode_of_arrival ?? '',
            'blood_pressure' => $visit->blood_pressure ?? '',
            'heart_rate' => $visit->heart_rate ?? '',
            'respiratory_rate' => $visit->respiratory_rate ?? '',
            'temperature' => $visit->temperature ?? '',
            'weight_kg' => $visit->weight_kg !== null ? (float) $visit->weight_kg : null,
            'height_cm' => $visit->height_cm !== null ? (float) $visit->height_cm : null,
            'pain_assessment_scale' => $visit->pain_assessment_scale ?? '',
            'oxygen_saturation' => $visit->oxygen_saturation ?? '',
            'reason_for_consult' => $visit->reason_for_consult ?? '',
            'time_seen' => $formatTime($visit->time_seen),
            'history_of_present_illness' => $visit->history_of_present_illness ?? '',
            'pertinent_physical_findings' => $visit->pertinent_physical_findings ?? '',
            'assessment_diagnosis' => $visit->assessment_diagnosis ?? '',
            'plan_management' => $visit->plan_management ?? '',
            'transfer_required' => (bool) ($visit->transfer_required ?? false),
            'transfer_reason_notes' => $visit->transfer_reason_notes ?? '',
            'attending_staff_id' => $visit->attending_staff_id ?? null,
            'attending_staff' => $visit->attendingStaff ? [
                'id' => $visit->attendingStaff->id,
                'name' => $visit->attendingStaff->name,
                'role' => $visit->attendingStaff->role,
            ] : null,
        ];
        
        // Map appointment specialist name if available (same logic as show method)
        if ($visit->appointment) {
            $specialistName = null;
            if ($visit->appointment->relationLoaded('specialist') && $visit->appointment->specialist) {
                $specialistName = $visit->appointment->specialist->name;
            } elseif ($visit->appointment->specialist_id) {
                try {
                    if (!$visit->appointment->relationLoaded('specialist')) {
                        $visit->appointment->load('specialist');
                    }
                    if ($visit->appointment->specialist) {
                        $specialistName = $visit->appointment->specialist->name;
                    } else {
                        $specialist = \App\Models\Specialist::find($visit->appointment->specialist_id);
                        if ($specialist) {
                            $specialistName = $specialist->name;
                        }
                    }
                } catch (\Exception $e) {
                    \Log::warning('Failed to load specialist for appointment in edit', [
                        'appointment_id' => $visit->appointment->id,
                        'specialist_id' => $visit->appointment->specialist_id,
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            // Add appointment data to visitData
            $visitData['appointment'] = [
                'id' => $visit->appointment->id,
                'appointment_code' => $visit->appointment->appointment_code,
                'appointment_type' => $visit->appointment->appointment_type,
                'appointment_date' => $visit->appointment->appointment_date,
                'appointment_time' => $visit->appointment->appointment_time,
                'status' => $visit->appointment->status,
                'source' => $visit->appointment->source ?? 'Walk-in',
                'specialist_id' => $visit->appointment->specialist_id,
                'specialist_name' => $specialistName,
            ];
        }

        // Get existing lab orders for this visit
        $labOrders = \App\Models\LabOrder::where('patient_visit_id', $visit->id)
            ->with(['results.test', 'orderedBy'])
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'status' => $order->status,
                    'notes' => $order->notes,
                    'created_at' => $order->created_at,
                    'ordered_by' => $order->orderedBy ? [
                        'name' => $order->orderedBy->name
                    ] : null,
                    'tests' => $order->results->map(function ($result) {
                        return $result->test ? [
                            'id' => $result->test->id,
                            'name' => $result->test->name,
                            'code' => $result->test->code
                        ] : null;
                    })->filter()
                ];
            });

        // Get all test IDs already requested in this visit (to prevent duplicates)
        $existingTestIds = \App\Models\LabOrder::where('patient_visit_id', $visit->id)
            ->with('results')
            ->get()
            ->flatMap(function ($order) {
                return $order->results->pluck('lab_test_id');
            })
            ->unique()
            ->values()
            ->toArray();

        // Get available lab tests for selection (exclude already requested tests)
        $availableLabTests = \App\Models\LabTest::where('is_active', true)
            ->whereNotIn('id', $existingTestIds)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'price'])
            ->map(function ($test) {
                return [
                    'id' => $test->id,
                    'name' => $test->name,
                    'code' => $test->code,
                    'price' => (float) $test->price, // Ensure price is a float
                ];
            });

        // Load patient transfers related to this visit or patient
        $transfers = [];
        try {
            $patientId = $visit->patient_id ?? $visit->patient->id ?? null;
            if ($patientId) {
                $transfers = \App\Models\PatientTransfer::where('patient_id', $patientId)
                    ->orWhere('visit_id', $visit->id)
                    ->with(['requestedBy:id,name', 'approvedBy:id,name'])
                    ->latest()
                    ->get()
                    ->map(function ($transfer) {
                        return [
                            'id' => $transfer->id,
                            'transfer_type' => $transfer->transfer_type ?? 'Unknown',
                            'status' => $transfer->status ?? 'pending',
                            'requested_at' => $transfer->created_at,
                            'requested_by' => $transfer->requestedBy ? $transfer->requestedBy->name : null,
                            'approved_by' => $transfer->approvedBy ? $transfer->approvedBy->name : null,
                        ];
                    });
            }
        } catch (\Exception $e) {
            \Log::warning('Failed to load transfers for visit edit', [
                'visit_id' => $visit->id,
                'patient_id' => $visit->patient_id ?? $visit->patient->id ?? null,
                'error' => $e->getMessage()
            ]);
        }

        return Inertia::render('admin/visits/edit-consultation', [
            'visit' => $visitData,
            'patient' => $visit->patient, // Pass full patient data for read-only display
            'staff' => $staff,
            'labOrders' => $labOrders,
            'transfers' => $transfers,
            'availableLabTests' => $availableLabTests,
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
            
            // Lab Test Requests (optional)
            'lab_test_ids' => 'nullable|array',
            'lab_test_ids.*' => 'integer|exists:lab_tests,id',
            'lab_test_notes' => 'nullable|string|max:1000',
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

            // Handle lab test requests if provided
            if ($request->has('lab_test_ids') && is_array($request->lab_test_ids) && count($request->lab_test_ids) > 0) {
                try {
                    $this->visitLabService->addLabTestsToVisit(
                        $visit,
                        $request->lab_test_ids,
                        auth()->id(),
                        $request->lab_test_notes
                    );
                } catch (\Exception $e) {
                    // Log the error but don't fail the entire update
                    \Log::error('Failed to add lab tests during visit update', [
                        'visit_id' => $visit->id,
                        'error' => $e->getMessage()
                    ]);
                    // Return with a warning instead of failing completely
                    return redirect()->route('admin.visits.show', $visit)
                        ->with('success', 'Visit consultation updated successfully!')
                        ->with('warning', 'Visit updated, but some lab tests could not be added: ' . $e->getMessage());
                }
            }

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

    /**
     * Show add lab tests page for visit
     */
    public function showAddLabTests(Visit $visit)
    {
        // Get available lab tests
        $availableLabTests = LabTest::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'price']);

        // Get existing lab orders for this visit
        $existingLabOrders = $this->visitLabService->getVisitLabOrders($visit);

        // Load visit relationships
        $visit->load(['patient', 'attendingStaff', 'appointment']);

        return Inertia::render('admin/visits/add-lab-tests', [
            'visit' => $visit,
            'patient' => $visit->patient,
            'availableLabTests' => $availableLabTests,
            'existingLabOrders' => $existingLabOrders,
        ]);
    }

    /**
     * Add lab tests to visit
     */
    public function addLabTests(Request $request, Visit $visit)
    {
        \Log::info('VisitController::addLabTests called', [
            'visit_id' => $visit->id,
            'request_data' => $request->all(),
            'user_id' => auth()->id()
        ]);

        $validated = $request->validate([
            'lab_test_ids' => 'required|array|min:1',
            'lab_test_ids.*' => 'exists:lab_tests,id',
            'notes' => 'nullable|string|max:1000'
        ]);

        try {
            $result = $this->visitLabService->addLabTestsToVisit(
                $visit,
                $validated['lab_test_ids'],
                auth()->id(),
                $validated['notes'] ?? null
            );

            return redirect()
                ->route('admin.visits.edit', $visit->id)
                ->with('success', "Successfully added {$result['lab_tests_added']} lab test(s) to visit. Lab order created.");

        } catch (\Exception $e) {
            \Log::error('Failed to add lab tests to visit', [
                'visit_id' => $visit->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to add lab tests: ' . $e->getMessage());
        }
    }
}
