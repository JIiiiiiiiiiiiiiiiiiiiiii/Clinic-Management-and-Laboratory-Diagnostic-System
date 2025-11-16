<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\BillingTransaction;
use App\Models\AppointmentBillingLink;
use App\Models\Patient;
use App\Models\PendingAppointment;
use App\Models\Visit;
use App\Models\User;
use App\Models\Staff;
use App\Services\AppointmentCreationService;
use App\Services\PatientService;
use App\Services\AppointmentAutomationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Appointment::query();

        // Exclude dummy appointments created for manual billing transactions
        // Qualify with table name to avoid ambiguity after joins
        $query->where('appointments.appointment_type', '!=', 'manual_transaction');

        // Apply filters BEFORE joins to avoid issues
        if ($request->filled('status') && $request->status !== 'all') {
            // Qualify with table name to avoid ambiguity after joins
            $query->where('appointments.status', $request->status);
        }

        if ($request->filled('date') && $request->date !== 'all') {
            if ($request->date === 'today') {
                $query->whereDate('appointments.appointment_date', Carbon::today());
            } elseif ($request->date === 'tomorrow') {
                $query->whereDate('appointments.appointment_date', Carbon::tomorrow());
            } elseif ($request->date === 'this_week') {
                $query->whereBetween('appointments.appointment_date', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ]);
            }
        }

        if ($request->filled('specialist') && $request->specialist !== 'all') {
            // Qualify with table name to avoid ambiguity after joins
            $query->where('appointments.specialist_id', $request->specialist);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'appointment_date');
        $sortDir = $request->get('sort_dir', 'asc');
        
        // Validate sort column to prevent SQL injection
        $allowedSortColumns = ['id', 'appointment_date', 'appointment_time', 'status', 'price', 'final_total_amount', 'total_lab_amount', 'created_at', 'patient_name', 'specialist_name', 'patient_id'];
        if (!in_array($sortBy, $allowedSortColumns)) {
            $sortBy = 'appointment_date';
        }
        
        // Validate sort direction
        $sortDir = in_array(strtolower($sortDir), ['asc', 'desc']) ? strtolower($sortDir) : 'asc';

        // Use LEFT JOIN to get patient and specialist data directly from database
        // First try appointments table, then fall back to visits table for patient data
        // This ensures we get data even when foreign keys are null or relationships fail
        $query->leftJoin('visits', 'appointments.id', '=', 'visits.appointment_id')
              ->leftJoin('patients as appointment_patients', 'appointments.patient_id', '=', 'appointment_patients.id')
              ->leftJoin('patients as visit_patients', 'visits.patient_id', '=', 'visit_patients.id')
              ->leftJoin('specialists', 'appointments.specialist_id', '=', 'specialists.specialist_id')
              ->leftJoin('specialists as visit_doctor_specialists', 'visits.doctor_id', '=', 'visit_doctor_specialists.specialist_id')
              ->leftJoin('specialists as visit_nurse_specialists', 'visits.nurse_id', '=', 'visit_nurse_specialists.specialist_id')
              ->leftJoin('specialists as visit_medtech_specialists', 'visits.medtech_id', '=', 'visit_medtech_specialists.specialist_id')
              ->leftJoin('specialists as visit_attending_specialists', 'visits.attending_staff_id', '=', 'visit_attending_specialists.specialist_id')
              ->select(
                  'appointments.*',
                  DB::raw('COALESCE(appointment_patients.first_name, visit_patients.first_name) as patient_first_name'),
                  DB::raw('COALESCE(appointment_patients.last_name, visit_patients.last_name) as patient_last_name'),
                  DB::raw('COALESCE(appointment_patients.middle_name, visit_patients.middle_name) as patient_middle_name'),
                  DB::raw('COALESCE(appointment_patients.patient_no, visit_patients.patient_no) as patient_no'),
                  DB::raw('COALESCE(appointment_patients.patient_code, visit_patients.patient_code) as patient_code'),
                  DB::raw('COALESCE(appointment_patients.mobile_no, visit_patients.mobile_no) as patient_mobile_no'),
                  DB::raw('COALESCE(appointment_patients.telephone_no, visit_patients.telephone_no) as patient_telephone_no'),
                  DB::raw('COALESCE(
                      specialists.name, 
                      visit_doctor_specialists.name, 
                      visit_nurse_specialists.name, 
                      visit_medtech_specialists.name, 
                      visit_attending_specialists.name
                  ) as specialist_name_from_table'),
                  DB::raw('COALESCE(
                      specialists.role, 
                      visit_doctor_specialists.role, 
                      visit_nurse_specialists.role, 
                      visit_medtech_specialists.role, 
                      visit_attending_specialists.role
                  ) as specialist_role')
              );

        // Apply search filter AFTER joins so we can search on joined columns
        if ($request->filled('search')) {
            $search = $request->search;
            \Log::info('Search term received:', ['search' => $search]);
            $query->where(function ($q) use ($search) {
                // Search appointment ID
                $q->where('appointments.id', 'like', "%{$search}%")
                  // Search patient name (concatenated from joined columns)
                  ->orWhere(DB::raw('CONCAT(COALESCE(appointment_patients.first_name, visit_patients.first_name, ""), " ", COALESCE(appointment_patients.last_name, visit_patients.last_name, ""))'), 'like', "%{$search}%")
                  // Search patient first name
                  ->orWhere(DB::raw('COALESCE(appointment_patients.first_name, visit_patients.first_name)'), 'like', "%{$search}%")
                  // Search patient last name
                  ->orWhere(DB::raw('COALESCE(appointment_patients.last_name, visit_patients.last_name)'), 'like', "%{$search}%")
                  // Search patient number
                  ->orWhere(DB::raw('COALESCE(appointment_patients.patient_no, visit_patients.patient_no)'), 'like', "%{$search}%")
                  // Search patient code
                  ->orWhere(DB::raw('COALESCE(appointment_patients.patient_code, visit_patients.patient_code)'), 'like', "%{$search}%")
                  // Search specialist name (from all possible sources)
                  ->orWhere(DB::raw('COALESCE(
                      specialists.name, 
                      visit_doctor_specialists.name, 
                      visit_nurse_specialists.name, 
                      visit_medtech_specialists.name, 
                      visit_attending_specialists.name
                  )'), 'like', "%{$search}%")
                  // Search appointment type
                  ->orWhere('appointments.appointment_type', 'like', "%{$search}%");
            });
        }
        
        // Apply sorting
        if ($sortBy === 'patient_id') {
            $query->orderBy(DB::raw('COALESCE(appointment_patients.sequence_number, visit_patients.sequence_number)'), $sortDir);
        } else {
            $query->orderBy('appointments.' . $sortBy, $sortDir);
        }
        
        $appointments = $query->get();
        
        // Debug: Log first appointment details to diagnose data issues BEFORE eager loading
        if ($appointments->count() > 0) {
            $firstApp = $appointments->first();
            \Log::info('First appointment debug (before eager load)', [
                'appointment_id' => $firstApp->id,
                'patient_id' => $firstApp->patient_id,
                'specialist_id' => $firstApp->specialist_id,
                'patient_first_name' => $firstApp->patient_first_name ?? 'NULL',
                'patient_last_name' => $firstApp->patient_last_name ?? 'NULL',
                'patient_no' => $firstApp->patient_no ?? 'NULL',
                'specialist_name_from_table' => $firstApp->specialist_name_from_table ?? 'NULL',
                'attributes' => $firstApp->getAttributes(),
            ]);
        }
        
        // Eager load additional relationships that don't need joins
        // Do this AFTER we've captured the joined data, but the joined columns should still be accessible
        // Also load specialist relationship to use as fallback if joined data is missing
        $appointments->load(['billingTransactions', 'visit', 'visits', 'specialist']);
        
        // Transform appointments to include proper field names for frontend
        $transformedAppointments = $appointments->map(function($appointment) {
            // Access joined columns from attributes (they should be preserved)
            $attributes = $appointment->getAttributes();
            
            // Get patient name from joined data
            $patientName = 'Unknown Patient';
            $patientFirstName = $attributes['patient_first_name'] ?? $appointment->patient_first_name ?? null;
            $patientMiddleName = $attributes['patient_middle_name'] ?? $appointment->patient_middle_name ?? null;
            $patientLastName = $attributes['patient_last_name'] ?? $appointment->patient_last_name ?? null;
            
            if ($patientFirstName || $patientLastName) {
                $firstName = $patientFirstName ?? '';
                $middleName = $patientMiddleName ?? '';
                $lastName = $patientLastName ?? '';
                $patientName = trim(implode(' ', array_filter([$firstName, $middleName, $lastName])));
            }
            
            if (empty(trim($patientName))) {
                $patientName = 'Unknown Patient';
            }
            
            // Get patient ID display (patient_no like P0001) from joined data
            $patientIdDisplay = $attributes['patient_no'] ?? $appointment->patient_no ?? $attributes['patient_code'] ?? $appointment->patient_code ?? 'N/A';
            
            // Get contact number from joined data
            $contactNumber = $attributes['patient_mobile_no'] ?? $appointment->patient_mobile_no ?? $attributes['patient_telephone_no'] ?? $appointment->patient_telephone_no ?? 'N/A';
            
            // Get specialist name from joined data - check both attributes and direct property access
            $specialistName = $attributes['specialist_name_from_table'] ?? $appointment->specialist_name_from_table ?? null;
            
            // If still null, try to get from relationships as fallback
            if (empty($specialistName) || $specialistName === 'NULL') {
                // Try appointment specialist relationship - always get fresh data
                if ($appointment->specialist_id) {
                    // Always reload to get the latest specialist data
                    $freshSpecialist = \App\Models\Specialist::find($appointment->specialist_id);
                    if ($freshSpecialist) {
                        $specialistName = $freshSpecialist->name;
                        $appointment->setRelation('specialist', $freshSpecialist);
                    } else {
                        // Fallback to relationship if direct find fails
                        if (!$appointment->relationLoaded('specialist')) {
                            $appointment->load('specialist');
                        }
                        if ($appointment->specialist) {
                            $specialistName = $appointment->specialist->name;
                        }
                    }
                }
                
                // Try visit relationships (check all possible specialist fields)
                if (empty($specialistName) && $appointment->relationLoaded('visit') && $appointment->visit) {
                    $visit = $appointment->visit;
                    // Check doctor_id
                    if (empty($specialistName) && $visit->doctor_id) {
                        $visitDoctor = \App\Models\Specialist::find($visit->doctor_id);
                        if ($visitDoctor) {
                            $specialistName = $visitDoctor->name;
                        }
                    }
                    // Check nurse_id
                    if (empty($specialistName) && $visit->nurse_id) {
                        $visitNurse = \App\Models\Specialist::find($visit->nurse_id);
                        if ($visitNurse) {
                            $specialistName = $visitNurse->name;
                        }
                    }
                    // Check medtech_id
                    if (empty($specialistName) && $visit->medtech_id) {
                        $visitMedtech = \App\Models\Specialist::find($visit->medtech_id);
                        if ($visitMedtech) {
                            $specialistName = $visitMedtech->name;
                        }
                    }
                }
                
                // If visit is not loaded, try to load it and check
                if (empty($specialistName) && !$appointment->relationLoaded('visit')) {
                    $visit = \App\Models\Visit::where('appointment_id', $appointment->id)->first();
                    if ($visit) {
                        if ($visit->doctor_id) {
                            $visitDoctor = \App\Models\Specialist::find($visit->doctor_id);
                            if ($visitDoctor) {
                                $specialistName = $visitDoctor->name;
                            }
                        }
                        if (empty($specialistName) && $visit->nurse_id) {
                            $visitNurse = \App\Models\Specialist::find($visit->nurse_id);
                            if ($visitNurse) {
                                $specialistName = $visitNurse->name;
                            }
                        }
                        if (empty($specialistName) && $visit->medtech_id) {
                            $visitMedtech = \App\Models\Specialist::find($visit->medtech_id);
                            if ($visitMedtech) {
                                $specialistName = $visitMedtech->name;
                            }
                        }
                    }
                }
            }
            
            // Final fallback - use default specialist name when specialist is deleted or missing
            if (empty($specialistName) || $specialistName === 'NULL') {
                $specialistName = 'Paul Henry N. Parrotina, MD.';
            }
            
            // Get specialist data for the appointment
            $specialistData = null;
            if ($appointment->specialist_id) {
                // Load specialist if not already loaded
                if (!$appointment->relationLoaded('specialist')) {
                    $appointment->load('specialist');
                }
                if ($appointment->specialist) {
                    $specialistData = [
                        'specialist_id' => $appointment->specialist->specialist_id,
                        'id' => $appointment->specialist->specialist_id, // For backward compatibility
                        'name' => $appointment->specialist->name,
                        'role' => $appointment->specialist->role ?? 'Doctor',
                        'employee_id' => $appointment->specialist->specialist_code ?? null,
                    ];
                }
            }
            
            // Get patient data for the appointment
            $patientData = null;
            if ($appointment->patient_id) {
                // Load patient if not already loaded
                if (!$appointment->relationLoaded('patient')) {
                    $appointment->load('patient');
                }
                if ($appointment->patient) {
                    $patientData = [
                        'id' => $appointment->patient->patient_id ?? $appointment->patient->id,
                        'patient_id' => $appointment->patient->patient_id ?? $appointment->patient->id,
                        'first_name' => $appointment->patient->first_name ?? '',
                        'last_name' => $appointment->patient->last_name ?? '',
                        'patient_no' => $appointment->patient->patient_no ?? '',
                    ];
                }
            }
            
            return [
                'id' => $appointment->id,
                'appointment_code' => 'A' . str_pad($appointment->id, 4, '0', STR_PAD_LEFT),
                'patient_id' => $appointment->patient_id ?? ($patientData['id'] ?? null),
                'patient_name' => $patientName,
                'patient_id_display' => $patientIdDisplay,
                'contact_number' => $contactNumber,
                'specialist_id' => $appointment->specialist_id ?? ($specialistData['specialist_id'] ?? null),
                'specialist_name' => $specialistName,
                'doctor' => $specialistName,
                'appointment_type' => $appointment->appointment_type ?? 'N/A',
                'specialist_type' => $appointment->specialist_type ?? 'N/A',
                'appointment_date' => $appointment->appointment_date,
                'appointment_time' => $appointment->appointment_time,
                'duration' => $appointment->duration ?? 'N/A',
                'price' => $appointment->price ?? 0,
                'total_lab_amount' => $appointment->total_lab_amount ?? 0,
                'final_total_amount' => $appointment->final_total_amount ?? $appointment->price ?? 0,
                'billing_status' => $appointment->billing_status ?? 'pending',
                'additional_info' => $appointment->additional_info,
                'notes' => $appointment->admin_notes ?? $appointment->additional_info ?? '',
                'special_requirements' => $appointment->additional_info ?? '',
                'source' => $appointment->source ?? 'N/A',
                'status' => $appointment->status ?? 'N/A',
                'admin_notes' => $appointment->admin_notes,
                'specialist' => $specialistData,
                'patient' => $patientData,
                'billing_transactions' => $appointment->billingTransactions ? $appointment->billingTransactions->map(function($transaction) {
                    return [
                        'id' => $transaction->id,
                        'transaction_id' => $transaction->transaction_id,
                        'total_amount' => $transaction->total_amount,
                        'status' => $transaction->status,
                        'created_at' => $transaction->created_at,
                    ];
                }) : [],
                'visit' => $appointment->visit ? [
                    'id' => $appointment->visit->id,
                    'visit_code' => $appointment->visit->visit_code,
                    'status' => $appointment->visit->status,
                    'visit_date_time_time' => $appointment->visit->visit_date_time_time,
                ] : null,
                'has_visit' => $appointment->visit ? true : false,
                'created_at' => $appointment->created_at,
                'updated_at' => $appointment->updated_at,
            ];
        });

        // Use single source - no duplication
        $allAppointments = $transformedAppointments;

        // Debug: Log appointments count and details
        \Log::info('Appointments found: ' . $appointments->count());
        \Log::info('Search applied:', ['search' => $request->search, 'count' => $appointments->count()]);
        
        // Debug: Log first transformed appointment to verify data
        if ($transformedAppointments->count() > 0) {
            $firstTransformed = $transformedAppointments->first();
            \Log::info('First transformed appointment data', [
                'id' => $firstTransformed['id'],
                'patient_name' => $firstTransformed['patient_name'],
                'patient_id_display' => $firstTransformed['patient_id_display'],
                'specialist_name' => $firstTransformed['specialist_name'],
                'contact_number' => $firstTransformed['contact_number'],
            ]);
        }

        // Get next available patient ID with smart reset logic
        $nextPatientId = $this->getNextAvailablePatientId();

        // Get doctors and medtechs for the component
        $doctors = \App\Models\Specialist::where('role', 'Doctor')
            ->select('specialist_id as id', 'name', 'specialization', 'specialist_code as employee_id')
            ->get();

        $medtechs = \App\Models\Specialist::where('role', 'MedTech')
            ->select('specialist_id as id', 'name', 'specialization', 'specialist_code as employee_id')
            ->get();

        // Convert collection to array for Inertia
        $appointmentsArray = $allAppointments->values()->toArray();

        // Helper function to clean and format appointment type names
        $formatAppointmentTypeName = function($name) {
            // Remove common prefixes/suffixes and clean up
            $name = trim($name);
            // Replace underscores and hyphens with spaces
            $name = str_replace(['_', '-'], ' ', $name);
            // Capitalize first letter of each word
            $name = ucwords(strtolower($name));
            
            // Clean up common variations and standardize names
            $replacements = [
                // Test names
                'Cbc' => 'CBC',
                'CBC (Complete Blood Count)' => 'CBC (Complete Blood Count)',
                'Complete Blood Count' => 'CBC (Complete Blood Count)',
                'Urinalysis Test' => 'Urinalysis',
                'Urinarysis' => 'Urinalysis',
                'Urinarysis Test' => 'Urinalysis',
                'Fecalysis Test' => 'Fecalysis',
                'X Ray' => 'X-Ray',
                'Xray' => 'X-Ray',
                'X-Ray' => 'X-Ray',
                
                // Consultation types
                'General Consultation' => 'General Consultation',
                'Consultation' => 'General Consultation',
                'Follow Up' => 'Follow-up',
                'Follow-Up' => 'Follow-up',
                'Check Up' => 'Check-up',
                'Check-Up' => 'Check-up',
                'Routine Checkup' => 'Routine Check-up',
                'Routine Check Up' => 'Routine Check-up',
            ];
            
            // Apply replacements
            foreach ($replacements as $old => $new) {
                if (stripos($name, $old) !== false) {
                    $name = $new;
                    break;
                }
            }
            
            return $name;
        };

        // Get active lab tests (test templates) - this is the primary scalable source
        $appointmentTypesFromLabTests = [];
        if (Schema::hasTable('lab_tests')) {
            $appointmentTypesFromLabTests = DB::table('lab_tests')
                ->where('is_active', true)
                ->select('name', 'code')
                ->orderBy('name')
                ->get()
                ->map(function($test) use ($formatAppointmentTypeName) {
                    return [
                        'value' => $test->name, // Use the actual name from database
                        'label' => $formatAppointmentTypeName($test->name) // Clean formatted name for display
                    ];
                })
                ->toArray();
        }

        // Get active clinic procedures
        $appointmentTypesFromProcedures = [];
        if (Schema::hasTable('clinic_procedures')) {
            $appointmentTypesFromProcedures = DB::table('clinic_procedures')
                ->where('is_active', true)
                ->select('name', 'code')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->map(function($procedure) use ($formatAppointmentTypeName) {
                    return [
                        'value' => $procedure->name,
                        'label' => $formatAppointmentTypeName($procedure->name)
                    ];
                })
                ->toArray();
        }

        // Helper function to normalize appointment type names for comparison
        $normalizeTypeName = function($name) {
            $name = strtolower(trim($name));
            // Remove common suffixes
            $name = preg_replace('/\s+(test|examination|exam)$/i', '', $name);
            // Normalize variations
            $name = str_replace(['_', '-'], ' ', $name);
            $name = preg_replace('/\s+/', ' ', $name); // Multiple spaces to single space
            return trim($name);
        };

        // Get distinct appointment types from existing appointments (for backward compatibility)
        // Only include if they don't already exist in lab_tests or clinic_procedures
        $existingTypeNamesNormalized = collect(array_merge($appointmentTypesFromLabTests, $appointmentTypesFromProcedures))
            ->pluck('value')
            ->map($normalizeTypeName)
            ->toArray();

        $appointmentTypesFromAppointments = DB::table('appointments')
            ->whereNotNull('appointment_type')
            ->where('appointment_type', '!=', '')
            ->where('appointment_type', '!=', 'manual_transaction')
            ->distinct()
            ->pluck('appointment_type')
            ->map(function($type) use ($formatAppointmentTypeName, $normalizeTypeName, $existingTypeNamesNormalized) {
                // Only include if not already in lab_tests or clinic_procedures (normalized comparison)
                $normalized = $normalizeTypeName($type);
                if (!in_array($normalized, $existingTypeNamesNormalized)) {
                    return [
                        'value' => $type,
                        'label' => $formatAppointmentTypeName($type)
                    ];
                }
                return null;
            })
            ->filter() // Remove null values
            ->values()
            ->toArray();

        // Merge all sources: lab_tests (primary), clinic_procedures, then existing appointments
        // Deduplicate by normalized value to catch variations like "Fecalysis" vs "Fecalysis Test"
        $allAppointmentTypes = collect(array_merge($appointmentTypesFromLabTests, $appointmentTypesFromProcedures, $appointmentTypesFromAppointments))
            ->unique(function($item) use ($normalizeTypeName) {
                // Use normalized name for deduplication
                return $normalizeTypeName($item['value']);
            })
            ->values()
            ->sortBy('label') // Sort alphabetically by display name
            ->values()
            ->toArray();

        return Inertia::render('admin/appointments/index', [
            'appointments' => [
                'data' => $appointmentsArray,
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => count($appointmentsArray),
                'total' => count($appointmentsArray)
            ],
            'filters' => $request->only(['search', 'status', 'date', 'specialist']),
            'nextPatientId' => $nextPatientId,
            'doctors' => $doctors,
            'medtechs' => $medtechs,
            'appointmentTypes' => $allAppointmentTypes
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/appointments/create');
    }

    /**
     * Store a newly created appointment from modal
     */
    public function store(Request $request)
    {
        \Log::info('Appointment store from modal called', $request->all());
        
        $validator = Validator::make($request->all(), [
            'patient_name' => 'required|string|max:255',
            'patient_id' => 'required|string|max:50',
            'appointment_type' => 'required|string',
            'specialist_name' => 'required|string|max:255',
            'specialist_id' => 'required|string|max:50',
            'appointment_date' => 'required|date',
            'appointment_time' => 'required|string',
            'price' => 'nullable|numeric|min:0',
            'billing_status' => 'nullable|string|in:pending,approved,cancelled,completed',
            'source' => 'nullable|string|in:online,walk_in,phone',
            'notes' => 'nullable|string',
            'special_requirements' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            \Log::error('Appointment store validation failed:', $validator->errors()->toArray());
            
            // Return JSON for API requests (modals)
            if (request()->wantsJson() || request()->ajax()) {
                return response()->json([
                    'errors' => $validator->errors()
                ], 422);
            }
            
            return back()->withErrors($validator)->withInput();
        }

        try {
            // Create appointment data
            $appointmentData = $request->all();
            
            // Format the time properly for time field
            $time = $request->appointment_time;
            if (strpos($time, ':') === false) {
                // If time doesn't have colon, assume it's in HHMM format
                $time = substr($time, 0, 2) . ':' . substr($time, 2, 2);
            }
            
            // Ensure time is in HH:MM:SS format for database storage
            if (strlen($time) === 5) {
                $time .= ':00'; // Add seconds if not present
            }
            $appointmentData['appointment_time'] = $time;
            
            // Set default values
            $appointmentData['status'] = 'Pending';
            $appointmentData['specialist_type'] = 'Doctor';
            $appointmentData['duration'] = '30 minutes';
            
            // Create the appointment
            $appointment = Appointment::create($appointmentData);
            
            \Log::info('Appointment created successfully:', ['id' => $appointment->id]);

            // Return JSON for API requests (modals)
            if (request()->wantsJson() || request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Appointment created successfully!',
                    'appointment' => $appointment->fresh(['patient', 'specialist'])
                ]);
            }

            return redirect()->route('admin.appointments.index')
                            ->with('success', 'Appointment created successfully!');
        } catch (\Exception $e) {
            \Log::error('Failed to create appointment:', ['error' => $e->getMessage()]);
            
            // Return JSON for API requests (modals)
            if (request()->wantsJson() || request()->ajax()) {
                return response()->json([
                    'error' => 'Failed to create appointment. Please try again.',
                    'message' => $e->getMessage()
                ], 500);
            }
            
            return back()->withErrors(['error' => 'Failed to create appointment. Please try again.']);
        }
    }

    /**
     * Store a newly created resource in storage (original method for complex appointments).
     */
    public function storeComplex(Request $request, AppointmentAutomationService $automationService)
    {
        \Log::info('Admin\AppointmentController@store called', [
            'user_id' => auth()->id(),
            'user_role' => auth()->user()->role ?? 'unknown',
            'request_data' => $request->all()
        ]);
        
        $validator = Validator::make($request->all(), [
            // Patient fields
            'patient_id' => 'nullable|integer|exists:patients,id',
            'last_name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'birthdate' => 'required|date',
            'age' => 'required|integer|min:0',
            'sex' => 'required|in:Male,Female',
            'nationality' => 'nullable|string|max:50',
            'civil_status' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'telephone_no' => 'nullable|string|max:20',
            'mobile_no' => 'required|string|max:20',
            'emergency_name' => 'nullable|string|max:100',
            'emergency_relation' => 'nullable|string|max:50',
            'insurance_company' => 'nullable|string|max:100',
            'hmo_name' => 'nullable|string|max:100',
            'hmo_id_no' => 'nullable|string|max:100',
            'approval_code' => 'nullable|string|max:100',
            'validity' => 'nullable|date',
            'drug_allergies' => 'nullable|string',
            'past_medical_history' => 'nullable|string',
            'family_history' => 'nullable|string',
            'social_history' => 'nullable|string',
            'obgyn_history' => 'nullable|string',
            
            // Appointment fields
            'appointment_type' => 'required|string',
            'specialist_type' => 'required|in:Doctor,MedTech',
            'specialist_id' => 'required|integer|exists:users,id',
            'appointment_date' => 'required|date',
            'appointment_time' => 'required|string',
            'duration' => 'nullable|string|max:50',
            'price' => 'nullable|numeric|min:0',
            'additional_info' => 'nullable|string',
            'admin_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            \Log::error('Validation failed:', $validator->errors()->toArray());
            \Log::error('Request data:', $request->all());
            return back()->withErrors($validator)->withInput();
        }

        try {
            DB::beginTransaction();

            // Create or find patient
            $patientData = [
                'last_name' => $request->last_name,
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'birthdate' => $request->birthdate,
                'age' => $request->age,
                'sex' => $request->sex,
                'nationality' => $request->nationality,
                'civil_status' => $request->civil_status,
                'address' => $request->address,
                'telephone_no' => $request->telephone_no,
                'mobile_no' => $request->mobile_no,
                'emergency_name' => $request->emergency_name,
                'emergency_relation' => $request->emergency_relation,
                'insurance_company' => $request->insurance_company,
                'hmo_name' => $request->hmo_name,
                'hmo_id_no' => $request->hmo_id_no,
                'approval_code' => $request->approval_code,
                'validity' => $request->validity,
                'drug_allergies' => $request->drug_allergies,
                'past_medical_history' => $request->past_medical_history,
                'family_history' => $request->family_history,
                'social_history' => $request->social_history,
                'obgyn_history' => $request->obgyn_history,
            ];

            $patient = $automationService->createOrFindPatient($patientData);

            // Create appointment data
            $appointmentData = [
                'patient_id' => $patient->patient_id,
                'specialist_id' => $request->specialist_id,
                'appointment_type' => $request->appointment_type,
                'specialist_type' => $request->specialist_type,
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $request->appointment_time,
                'duration' => $request->duration ?? '30 min',
                'price' => $request->price,
                'additional_info' => $request->additional_info,
                'admin_notes' => $request->admin_notes,
                'source' => 'Walk-in',
                'status' => 'Confirmed',
            ];

            // Create appointment directly
            $appointment = Appointment::create($appointmentData);

            DB::commit();

            \Log::info('Appointment created successfully', [
                'appointment_id' => $appointment->id,
                'patient_id' => $patient->patient_id,
                'visit_created' => $appointment->visit ? 'yes' : 'no',
                'billing_created' => $appointment->billingTransactions()->exists() ? 'yes' : 'no'
            ]);

            return redirect()->route('admin.appointments.index')
                            ->with('success', 'Walk-in appointment created successfully! Patient, appointment, visit, and billing records have been created.');
        } catch (\Exception $e) {
            DB::rollback();
            \Log::error('Failed to create appointment:', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to create appointment: ' . $e->getMessage()]);
        }
    }


    /**
     * Delete patient and all related records (cascade delete)
     */
    public function destroyPatient($patient_id, AppointmentCreationService $appointmentService)
    {
        try {
            $appointmentService->deletePatientWithCascade($patient_id);
            
            return response()->json([
                'message' => 'Patient and all related records deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete patient: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete appointment only (patient remains)
     */
    public function destroy($id, AppointmentCreationService $appointmentService)
    {
        try {
            $appointmentService->deleteAppointmentOnly($id);
            
            return response()->json([
                'message' => 'Appointment deleted successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete appointment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the next available patient ID with smart reset logic
     * If P001 is deleted, start from P001 again instead of continuing from highest number
     */
    private function getNextAvailablePatientId()
    {
        // Get all existing patient IDs from patients table
        $existingPatientIds = \App\Models\Patient::where('patient_no', 'like', 'P%')
            ->get()
            ->pluck('patient_no')
            ->map(function($code) {
                return (int) substr($code, 1);
            })->toArray();
        
        // If no IDs exist, start with P001
        if (empty($existingPatientIds)) {
            return 'P001';
        }
        
        // Find the first missing ID starting from 1
        for ($i = 1; $i <= 999; $i++) {
            if (!in_array($i, $existingPatientIds)) {
                return 'P' . str_pad($i, 3, '0', STR_PAD_LEFT);
            }
        }
        
        // If all IDs 1-999 are taken, find the next available
        $maxId = max($existingPatientIds);
        return 'P' . str_pad($maxId + 1, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Display the specified resource.
     */
    public function show(Appointment $appointment)
    {
        \Log::info('AppointmentController@show called', [
            'appointment_id' => $appointment->id,
            'appointment_data' => $appointment->toArray(),
            'request_url' => request()->url(),
            'request_method' => request()->method(),
            'request_headers' => request()->headers->all()
        ]);
        
        // Load relationships
        $appointment->load(['patient', 'specialist', 'labTests.labTest', 'visits', 'billingTransactions']);
        
        // Get patient information from relationship
        $patientName = 'N/A';
        $patientIdDisplay = 'N/A';
        $contactNumber = 'N/A';
        
        if ($appointment->patient) {
            // Build patient name from first, middle, and last name
            $firstName = $appointment->patient->first_name ?? '';
            $middleName = $appointment->patient->middle_name ?? '';
            $lastName = $appointment->patient->last_name ?? '';
            $patientName = trim(implode(' ', array_filter([$firstName, $middleName, $lastName])));
            
            // Get patient ID display (patient_no like P0001)
            $patientIdDisplay = $appointment->patient->patient_no ?? $appointment->patient->patient_code ?? 'N/A';
            
            // Get contact number (prefer mobile_no, fallback to telephone_no)
            $contactNumber = $appointment->patient->mobile_no ?? $appointment->patient->telephone_no ?? 'N/A';
        } elseif ($appointment->patient_id) {
            // If relationship failed but we have patient_id, try direct query
            // Try both 'id' and 'patient_id' as primary key since migrations are inconsistent
            $patient = \App\Models\Patient::where('id', $appointment->patient_id)->first();
            if (!$patient) {
                // Try with patient_id column if it exists
                $patient = \App\Models\Patient::where('patient_id', $appointment->patient_id)->first();
            }
            
            if ($patient) {
                $firstName = $patient->first_name ?? '';
                $middleName = $patient->middle_name ?? '';
                $lastName = $patient->last_name ?? '';
                $patientName = trim(implode(' ', array_filter([$firstName, $middleName, $lastName])));
                $patientIdDisplay = $patient->patient_no ?? $patient->patient_code ?? 'N/A';
                $contactNumber = $patient->mobile_no ?? $patient->telephone_no ?? 'N/A';
            }
        }
        
        // Get specialist information from relationship
        $specialistName = 'N/A';
        $specialistIdDisplay = 'N/A';
        
        if ($appointment->specialist) {
            $specialistName = $appointment->specialist->name ?? 'N/A';
            $specialistIdDisplay = $appointment->specialist->specialist_id ?? $appointment->specialist_id ?? 'N/A';
        } elseif ($appointment->specialist_id) {
            // If relationship failed but we have specialist_id, try direct query
            $specialist = \App\Models\Specialist::find($appointment->specialist_id);
            if ($specialist) {
                $specialistName = $specialist->name ?? 'N/A';
                $specialistIdDisplay = $specialist->specialist_id ?? 'N/A';
            } else {
                $specialistIdDisplay = $appointment->specialist_id;
            }
        }
        
        // Log for debugging
        \Log::info('AppointmentController@show - Patient and Specialist Data', [
            'appointment_id' => $appointment->id,
            'patient_id' => $appointment->patient_id,
            'patient_name' => $patientName,
            'patient_id_display' => $patientIdDisplay,
            'contact_number' => $contactNumber,
            'specialist_id' => $appointment->specialist_id,
            'specialist_name' => $specialistName,
            'specialist_id_display' => $specialistIdDisplay,
            'has_patient_relationship' => $appointment->patient ? 'yes' : 'no',
            'has_specialist_relationship' => $appointment->specialist ? 'yes' : 'no',
        ]);
        
        // Format the appointment data for frontend display
        $formattedAppointment = [
            'id' => $appointment->id,
            'patient_name' => $patientName,
            'patient_id' => $patientIdDisplay,
            'contact_number' => $contactNumber,
            'appointment_type' => $appointment->appointment_type,
            'price' => $appointment->price,
            'total_lab_amount' => $appointment->total_lab_amount ?? 0,
            'final_total_amount' => $appointment->final_total_amount ?? $appointment->price,
            'specialist_type' => $appointment->specialist_type,
            'specialist_name' => $specialistName,
            'specialist_id' => $specialistIdDisplay,
            'appointment_date' => $appointment->appointment_date ? $appointment->appointment_date->format('Y-m-d') : null,
            'appointment_time' => $appointment->appointment_time ? $appointment->appointment_time->format('H:i:s') : null,
            'duration' => $appointment->duration,
            'status' => $appointment->status,
            'billing_status' => $appointment->billing_status,
            'source' => $appointment->source ?? 'online',
            'notes' => $appointment->notes,
            'special_requirements' => $appointment->special_requirements,
            'created_at' => $appointment->created_at,
            'updated_at' => $appointment->updated_at,
            'patient' => $appointment->patient,
            'specialist' => $appointment->specialist,
            'visits' => $appointment->visits,
            'billingTransactions' => $appointment->billingTransactions,
            'labTests' => $appointment->labTests->map(function ($labTest) {
                return [
                    'id' => $labTest->id,
                    'lab_test_name' => $labTest->labTest->name ?? 'Unknown Test',
                    'price' => $labTest->price ?? 0,
                    'status' => $labTest->status ?? 'pending',
                ];
            }),
        ];

        // Check if this is an Inertia request
        $isInertiaRequest = request()->header('X-Inertia') !== null;
        
        // Return JSON for API requests (modals) - but not for Inertia requests
        if ((request()->wantsJson() || request()->ajax()) && !$isInertiaRequest) {
            \Log::info('Returning JSON response for appointment', [
                'appointment_id' => $appointment->id,
                'formatted_data' => $formattedAppointment
            ]);
            return response()->json([
                'appointment' => $formattedAppointment
            ]);
        }

        // For Inertia requests, always return Inertia response
        // The 'only' parameter in the frontend will handle partial data
        return Inertia::render('admin/appointments/show', [
            'appointment' => $formattedAppointment
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Appointment $appointment)
    {
        return Inertia::render('admin/appointments/edit', [
            'appointment' => $appointment
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Appointment $appointment)
    {
        // Debug: Log the incoming request data
        \Log::info('Appointment update request data:', $request->all());
        \Log::info('Current appointment data:', $appointment->toArray());
        
        // Check if this is an Inertia request
        $isInertiaRequest = request()->header('X-Inertia') !== null;
        
        // If patient_id or specialist_id are missing, try to get them from relationships
        // Do this BEFORE validation so validation can check the merged values
        // Note: The database shows patient_id and specialist_id can be NULL, so we need to handle that
        
        // Load relationships if not already loaded
        if (!$appointment->relationLoaded('patient')) {
            $appointment->load('patient');
        }
        if (!$appointment->relationLoaded('specialist')) {
            $appointment->load('specialist');
        }
        
        if (empty($request->patient_id)) {
            // Try to get from appointment's patient_id field first
            if ($appointment->patient_id) {
                $request->merge(['patient_id' => $appointment->patient_id]);
                \Log::info('Appointment update: Merged patient_id from appointment field', [
                    'appointment_id' => $appointment->id,
                    'patient_id' => $appointment->patient_id
                ]);
            } 
            // If still empty, try to get from patient relationship
            // The relationship uses patient_id -> patients.id, so we need patients.id
            elseif ($appointment->patient) {
                // Patient model uses 'id' as primary key, so get that
                $patientId = $appointment->patient->id ?? null;
                if ($patientId) {
                    $request->merge(['patient_id' => $patientId]);
                    \Log::info('Appointment update: Merged patient_id from patient relationship', [
                        'appointment_id' => $appointment->id,
                        'patient_id' => $patientId
                    ]);
                }
            } else {
                \Log::info('Appointment update: Cannot determine patient_id', [
                    'appointment_id' => $appointment->id,
                    'appointment_patient_id' => $appointment->patient_id,
                    'has_patient_relationship' => $appointment->relationLoaded('patient') && $appointment->patient !== null
                ]);
            }
        }
        
        if (empty($request->specialist_id)) {
            // Try to get from appointment's specialist_id field first
            if ($appointment->specialist_id) {
                $request->merge(['specialist_id' => $appointment->specialist_id]);
            }
            // If still empty, try to get from specialist relationship
            // The relationship uses specialist_id -> specialists.specialist_id
            elseif ($appointment->specialist) {
                // Specialist model uses 'specialist_id' as primary key
                $specialistId = $appointment->specialist->specialist_id ?? null;
                if ($specialistId) {
                    $request->merge(['specialist_id' => $specialistId]);
                }
            }
        }
        
        // Check if we can determine patient_id and specialist_id from relationships
        // This is calculated AFTER the merge above, so it reflects the merged state
        $canDeterminePatientId = !empty($request->patient_id) || 
                                  $appointment->patient_id !== null || 
                                  ($appointment->patient && $appointment->patient->id);
        
        $canDetermineSpecialistId = !empty($request->specialist_id) || 
                                     $appointment->specialist_id !== null || 
                                     ($appointment->specialist && $appointment->specialist->specialist_id);
        
        $validator = Validator::make($request->all(), [
            // NOTE: patient_name, contact_number, and specialist_name are NOT database columns
            // They were dropped in migration 2025_10_17_000000_comprehensive_database_restructure
            // They are derived from relationships and should NOT be validated or updated
            // patient_id: 
            // - If appointment has NULL patient_id in DB, allow NULL (no requirement)
            // - If appointment has patient_id, require it to be provided (can't remove it)
            // - If we can determine it from relationships, that's fine too
            'patient_id' => [
                'nullable',
                function ($attribute, $value, $fail) use ($request, $appointment) {
                    // Check the merged request value
                    $mergedValue = $request->input('patient_id');
                    
                    \Log::info('Appointment update: Validating patient_id', [
                        'appointment_id' => $appointment->id,
                        'request_patient_id' => $value,
                        'merged_patient_id' => $mergedValue,
                        'appointment_patient_id' => $appointment->patient_id,
                        'has_patient_relationship' => $appointment->relationLoaded('patient') && $appointment->patient !== null,
                        'patient_id_from_relationship' => $appointment->patient ? $appointment->patient->id : null
                    ]);
                    
                    // If appointment already has NULL patient_id in DB, allow NULL
                    if ($appointment->patient_id === null) {
                        // Allow NULL - no validation needed
                        \Log::info('Appointment update: Allowing NULL patient_id (appointment has NULL in DB)');
                        return;
                    }
                    
                    // If appointment has a patient_id, we need to ensure it's provided
                    // But if we can get it from relationships, that's fine
                    if (empty($mergedValue)) {
                        // Check if we can get it from relationships
                        $canGetFromRelationship = ($appointment->patient && $appointment->patient->id);
                        
                        if (!$canGetFromRelationship) {
                            // Appointment has patient_id but we can't determine it - require it
                            \Log::warning('Appointment update: patient_id validation failed', [
                                'appointment_id' => $appointment->id,
                                'appointment_patient_id' => $appointment->patient_id
                            ]);
                            $fail('The patient id field is required.');
                        } else {
                            \Log::info('Appointment update: patient_id can be determined from relationship');
                        }
                    } else {
                        \Log::info('Appointment update: patient_id provided in request', ['patient_id' => $mergedValue]);
                    }
                }
            ],
            'appointment_type' => 'required|string',
            'specialist_type' => 'nullable|string|in:doctor,medtech,Doctor,MedTech',
            // Accept both string and integer since database uses bigint but frontend may send string
            // Note: specialist_id can be null in database, so make it nullable for updates
            'specialist_id' => ['nullable', function ($attribute, $value, $fail) {
                // Only validate if a value is provided
                if ($value !== null && $value !== '' && empty($value)) {
                    $fail('The specialist id field must be a valid value if provided.');
                }
            }],
            'appointment_date' => 'required|date',
            'appointment_time' => 'required|string',
            'duration' => 'nullable|string|max:20',
            'status' => 'nullable|string|in:Pending,Confirmed,Completed,Cancelled,pending,confirmed,completed,cancelled',
            'billing_status' => 'nullable|string|in:pending,approved,cancelled,completed,in_transaction,paid',
            'source' => 'nullable|string|in:online,walk_in,phone,Online,Walk-in',
            'price' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'special_requirements' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            \Log::error('Appointment update validation failed:', [
                'errors' => $validator->errors()->toArray(),
                'request_data' => $request->all(),
                'appointment_id' => $appointment->id
            ]);
            
            // For Inertia requests, always return Inertia response
            if ($isInertiaRequest) {
                // Return with validation errors - Inertia will handle this
                return back()->withErrors($validator->errors()->toArray())->withInput();
            }
            
            // Return JSON only for non-Inertia API requests
            if (request()->wantsJson() || request()->ajax()) {
                return response()->json([
                    'errors' => $validator->errors(),
                    'message' => 'Validation failed'
                ], 422);
            }
            
            return back()->withErrors($validator)->withInput();
        }

        try {
            // Prepare update data - only include fields that exist in the database
            // Based on the actual database schema, these are the valid columns:
            $updateData = [];
            
            // Core appointment fields (only update fields that ACTUALLY exist in the database)
            // NOTE: patient_name, contact_number, specialist_name, notes, and special_requirements 
            // were DROPPED from the database in migration 2025_10_17_000000_comprehensive_database_restructure
            // They are derived from relationships or replaced by other fields
            // Based on actual database schema from migrations:
            // - notes -> use admin_notes or additional_info
            // - special_requirements -> use additional_info
            // - patient_name, contact_number, specialist_name -> derived from relationships, do NOT update
            $fillableFields = [
                'appointment_code', 'sequence_number', 'patient_id',
                'appointment_type', 'price', 'total_lab_amount',
                'final_total_amount', 'specialist_type',
                'specialist_id', 'appointment_date', 'appointment_time', 'duration',
                'status', 'appointment_source', 'billing_status',
                'billing_reference', 'source', 'patient_id_fk', 
                'unique_appointment_key', 'additional_info', 'admin_notes'
                // NOTE: Removed 'patient_name', 'contact_number', 'specialist_name', 
                // 'notes', 'special_requirements', 'booking_method', 'confirmation_sent'
                // as they were dropped in migration 2025_10_17_000000_comprehensive_database_restructure
            ];
            
            // Only include fields that are in the fillable array and in the request
            // Convert empty strings to null for nullable fields
            foreach ($fillableFields as $field) {
                if ($request->has($field)) {
                    $value = $request->input($field);
                    // Skip null, undefined, and empty string values (except for patient_id and specialist_id which are handled separately)
                    // Also skip if value is the string 'undefined'
                    if ($value !== null && $value !== '' && $value !== 'undefined') {
                        $updateData[$field] = $value;
                    }
                }
            }
            
            // Handle notes field - map to admin_notes (frontend sends 'admin_notes', database uses 'admin_notes')
            // Frontend is now sending 'admin_notes' directly, but we also check 'notes' for backward compatibility
            if ($request->has('admin_notes') && $request->input('admin_notes') !== null && $request->input('admin_notes') !== '' && $request->input('admin_notes') !== 'undefined') {
                $updateData['admin_notes'] = $request->input('admin_notes');
            }
            // Also check for 'notes' field from frontend (backward compatibility)
            elseif ($request->has('notes') && $request->input('notes') !== null && $request->input('notes') !== '' && $request->input('notes') !== 'undefined') {
                $updateData['admin_notes'] = $request->input('notes');
            }
            
            // Handle special_requirements field - map to additional_info
            // Frontend is now sending 'additional_info' directly, but we also check 'special_requirements' for backward compatibility
            if ($request->has('additional_info') && $request->input('additional_info') !== null && $request->input('additional_info') !== '' && $request->input('additional_info') !== 'undefined') {
                $updateData['additional_info'] = $request->input('additional_info');
            }
            // Also check for 'special_requirements' field from frontend (backward compatibility)
            elseif ($request->has('special_requirements') && $request->input('special_requirements') !== null && $request->input('special_requirements') !== '' && $request->input('special_requirements') !== 'undefined') {
                $updateData['additional_info'] = $request->input('special_requirements');
            }
            
            \Log::info('Update data after fillable fields loop:', [
                'updateData' => $updateData,
                'request_keys' => array_keys($request->all())
            ]);
            
            // Ensure patient_id and specialist_id are integers (database uses bigint)
            // Only update these if they're provided in the request or can be determined
            // The database allows NULL for both, so we don't need to force them
            
            // Handle patient_id - check if it exists in request (even if null)
            // Use array_key_exists to check if the key exists, regardless of value
            $requestData = $request->all();
            if (array_key_exists('patient_id', $requestData)) {
                $requestPatientId = $request->input('patient_id');
                // If request has a valid patient_id value, use it
                if ($requestPatientId !== null && $requestPatientId !== '' && $requestPatientId !== 0) {
                    $updateData['patient_id'] = (int) $requestPatientId;
                } else {
                    // If null/empty in request, try to preserve existing value
                    if ($appointment->patient_id) {
                        $updateData['patient_id'] = (int) $appointment->patient_id;
                    } elseif ($appointment->patient) {
                        $patientId = $appointment->patient->id ?? null;
                        if ($patientId) {
                            $updateData['patient_id'] = (int) $patientId;
                        }
                    }
                    // If still can't determine, don't include (database allows NULL)
                }
            } else {
                // Request doesn't have patient_id key, try to preserve existing value
                if ($appointment->patient_id) {
                    $updateData['patient_id'] = (int) $appointment->patient_id;
                } elseif ($appointment->patient) {
                    $patientId = $appointment->patient->id ?? null;
                    if ($patientId) {
                        $updateData['patient_id'] = (int) $patientId;
                    }
                }
            }
            
            // Handle specialist_id (can be NULL in database)
            if (array_key_exists('specialist_id', $requestData)) {
                $requestSpecialistId = $request->input('specialist_id');
                // If request has a valid specialist_id value, use it
                if ($requestSpecialistId !== null && $requestSpecialistId !== '' && $requestSpecialistId !== 0) {
                    $updateData['specialist_id'] = (int) $requestSpecialistId;
                } else {
                    // If null/empty in request, try to preserve existing value
                    if ($appointment->specialist_id) {
                        $updateData['specialist_id'] = (int) $appointment->specialist_id;
                    } elseif ($appointment->specialist) {
                        $specialistId = $appointment->specialist->specialist_id ?? $appointment->specialist->id ?? null;
                        if ($specialistId) {
                            $updateData['specialist_id'] = (int) $specialistId;
                        }
                    }
                    // If still can't determine, don't include (database allows NULL)
                }
            } else {
                // Request doesn't have specialist_id key, try to preserve existing value
                if ($appointment->specialist_id) {
                    $updateData['specialist_id'] = (int) $appointment->specialist_id;
                } elseif ($appointment->specialist) {
                    $specialistId = $appointment->specialist->specialist_id ?? $appointment->specialist->id ?? null;
                    if ($specialistId) {
                        $updateData['specialist_id'] = (int) $specialistId;
                    }
                }
            }
            
            // Normalize enum values to match database
            if (isset($updateData['status'])) {
                $updateData['status'] = ucfirst(strtolower($updateData['status']));
            }
            if (isset($updateData['source'])) {
                // Normalize source: 'online' -> 'Online', 'walk_in' -> 'Walk-in'
                $source = strtolower($updateData['source']);
                if ($source === 'online' || $source === 'walk_in' || $source === 'walk-in') {
                    $updateData['source'] = $source === 'online' ? 'Online' : 'Walk-in';
                }
            }
            
            // Format the time properly for time field
            if (isset($updateData['appointment_time'])) {
                $time = $updateData['appointment_time'];
            if (strpos($time, ':') === false) {
                // If time doesn't have colon, assume it's in HHMM format
                $time = substr($time, 0, 2) . ':' . substr($time, 2, 2);
            }
            
            // Ensure time is in HH:MM:SS format for database storage
            if (strlen($time) === 5) {
                $time .= ':00'; // Add seconds if not present
            }
            $updateData['appointment_time'] = $time;
            }
            
            // Recalculate price if appointment type changed
            if (isset($updateData['appointment_type']) && $updateData['appointment_type'] !== $appointment->appointment_type) {
                $tempAppointment = new Appointment($updateData);
                $updateData['price'] = $tempAppointment->calculatePrice();
            }
            
            // Store old status for comparison
            $oldStatus = $appointment->status;
            
            // Log what we're updating
            \Log::info('Appointment update data prepared:', [
                'updateData' => $updateData,
                'appointment_id' => $appointment->id,
                'current_patient_id' => $appointment->patient_id,
                'current_specialist_id' => $appointment->specialist_id,
            ]);
            
            // Ensure we have at least one field to update
            if (empty($updateData)) {
                \Log::warning('No fields to update for appointment', [
                    'appointment_id' => $appointment->id,
                    'request_data' => $request->all(),
                    'fillable_fields' => $fillableFields
                ]);
                
                // For Inertia requests, return error response
                if ($isInertiaRequest) {
                    return back()->withErrors(['error' => 'No valid fields to update.']);
                }
                
                throw new \Exception('No valid fields to update.');
            }
            
            // Update the appointment - only update fields that are in $updateData
            try {
                $result = $appointment->update($updateData);
                \Log::info('Appointment update successful', [
                    'appointment_id' => $appointment->id,
                    'updated_fields' => array_keys($updateData),
                    'update_result' => $result
                ]);
            } catch (\Illuminate\Database\QueryException $queryException) {
                \Log::error('Database query exception during update', [
                    'appointment_id' => $appointment->id,
                    'updateData' => $updateData,
                    'error' => $queryException->getMessage(),
                    'sql' => $queryException->getSql(),
                    'bindings' => $queryException->getBindings(),
                    'trace' => $queryException->getTraceAsString()
                ]);
                
                // For Inertia requests, return error response
                if ($isInertiaRequest) {
                    return back()->withErrors(['error' => 'Database error: ' . $queryException->getMessage()]);
                }
                
                throw $queryException;
            } catch (\Exception $updateException) {
                \Log::error('Database update failed', [
                    'appointment_id' => $appointment->id,
                    'updateData' => $updateData,
                    'error' => $updateException->getMessage(),
                    'trace' => $updateException->getTraceAsString()
                ]);
                
                // For Inertia requests, return error response
                if ($isInertiaRequest) {
                    return back()->withErrors(['error' => 'Update failed: ' . $updateException->getMessage()]);
                }
                
                throw $updateException;
            }
            
            // Refresh appointment to get updated status
            $appointment->refresh();
            
            // If status changed to Confirmed, create visit if it doesn't exist
            if ($oldStatus !== $appointment->status && $appointment->status === 'Confirmed') {
                // Check if visit already exists (refresh relationship)
                $appointment->load('visit');
                if (!$appointment->visit) {
                    try {
                        $automationService = new AppointmentAutomationService();
                        $visit = $automationService->createVisit($appointment);
                        \Log::info('Visit created for confirmed appointment', [
                            'appointment_id' => $appointment->id,
                            'visit_id' => $visit->id
                        ]);
                    } catch (\Exception $e) {
                        \Log::error('Failed to create visit for confirmed appointment', [
                            'appointment_id' => $appointment->id,
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            }
            
            // If status changed, broadcast to patient
            if ($oldStatus !== $appointment->status) {
                $notificationService = new \App\Services\NotificationService();
                $notificationService->notifyAppointmentStatusChange($appointment);
                
                // Broadcast real-time notification to patient
                $realtimeController = new \App\Http\Controllers\Admin\RealtimeAppointmentController($notificationService);
                $realtimeController->broadcastAppointmentStatusChange($appointment);
            }
            
            \Log::info('Appointment updated successfully:', ['id' => $appointment->id]);

            // For Inertia requests, always return Inertia response
            // Reload the appointment with relationships to ensure fresh data
            $appointment->refresh();
            $appointment->load(['patient', 'specialist', 'visit']);
            
            if ($isInertiaRequest) {
                // Return back to the same page with success message
                // Inertia will handle the redirect and the frontend will reload
                return back()->with('success', 'Appointment updated successfully!');
            }
            
            // Return JSON only for non-Inertia API requests
            if (request()->wantsJson() || request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Appointment updated successfully!',
                    'appointment' => $appointment->fresh(['patient', 'specialist', 'labTests.labTest'])
                ]);
            }

            return redirect()->route('admin.appointments.index')
                            ->with('success', 'Appointment updated successfully!');
        } catch (\Exception $e) {
            \Log::error('Failed to update appointment:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'appointment_id' => $appointment->id ?? null,
                'request_data' => $request->all()
            ]);
            
            // For Inertia requests, always return Inertia response
            if ($isInertiaRequest) {
                // Return with error - Inertia will pass this to onError callback
                return back()->withErrors([
                    'error' => 'Failed to update appointment. Please try again.',
                    'message' => $e->getMessage()
                ]);
            }
            
            // Return JSON only for non-Inertia API requests
            if (request()->wantsJson() || request()->ajax()) {
                return response()->json([
                    'error' => 'Failed to update appointment. Please try again.',
                    'message' => $e->getMessage()
                ], 500);
            }
            
            return back()->withErrors(['error' => 'Failed to update appointment. Please try again.']);
        }
    }


    /**
     * Update appointment status
     */
    public function updateStatus(Request $request, Appointment $appointment)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:Pending,Confirmed,Completed,Cancelled'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $oldStatus = $appointment->status;

        $appointment->update([
            'status' => $request->status,
        ]);

        // Refresh appointment to get updated status
        $appointment->refresh();

        // If status changed to Confirmed, create visit if it doesn't exist
        if ($oldStatus !== $appointment->status && $appointment->status === 'Confirmed') {
            // Check if visit already exists (refresh relationship)
            $appointment->load('visit');
            if (!$appointment->visit) {
                try {
                    $automationService = new AppointmentAutomationService();
                    $visit = $automationService->createVisit($appointment);
                    \Log::info('Visit created for confirmed appointment via updateStatus', [
                        'appointment_id' => $appointment->id,
                        'visit_id' => $visit->id
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Failed to create visit for confirmed appointment via updateStatus', [
                        'appointment_id' => $appointment->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }

        return back()->with('success', 'Appointment status updated successfully!');
    }

    /**
     * Approve online appointment
     */
    public function approveAppointment(Request $request, Appointment $appointment, AppointmentAutomationService $automationService)
    {
        try {
            DB::beginTransaction();

            $appointment = $automationService->approveAppointment($appointment);

            DB::commit();

            return back()->with('success', 'Online appointment approved successfully! Visit and billing records have been created.');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to approve appointment: ' . $e->getMessage()]);
        }
    }

    /**
     * Get appointments for a specific date
     */
    public function getByDate(Request $request)
    {
        $date = $request->date ?? Carbon::today()->format('Y-m-d');
        
        $appointments = Appointment::whereDate('appointment_date', $date)
                                 ->orderBy('appointment_time', 'asc')
                                 ->get();

        return response()->json($appointments);
    }

    /**
     * Get appointment statistics
     */
    public function getStats()
    {
        $stats = [
            'total' => Appointment::count(),
            'pending' => Appointment::pending()->count(),
            'confirmed' => Appointment::confirmed()->count(),
            'completed' => Appointment::completed()->count(),
            'cancelled' => Appointment::cancelled()->count(),
            'today' => Appointment::byDate(Carbon::today())->count(),
            'this_week' => Appointment::whereBetween('appointment_date', [
                Carbon::now()->startOfWeek(),
                Carbon::now()->endOfWeek()
            ])->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Store a walk-in appointment (admin creates appointment for walk-in patient)
     */
    public function storeWalkIn(Request $request)
    {
        try {
            DB::beginTransaction();

            // Validate the request
            $validator = Validator::make($request->all(), [
                // Patient fields
                'last_name' => 'required|string|max:255',
                'first_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'birthdate' => 'required|date',
                'age' => 'required|integer|min:0',
                'sex' => 'required|in:male,female',
                'civil_status' => 'required|string',
                'nationality' => 'nullable|string|max:255',
                'present_address' => 'required|string',
                'telephone_no' => 'nullable|string|max:20',
                'mobile_no' => 'required|string|max:20',
                'emergency_name' => 'nullable|string|max:255',
                'emergency_relation' => 'nullable|string|max:255',
                'informant_name' => 'nullable|string|max:255',
                'relationship' => 'nullable|string|max:255',
                'company_name' => 'nullable|string|max:255',
                'hmo_name' => 'nullable|string|max:255',
                'hmo_company_id_no' => 'nullable|string|max:255',
                'validation_approval_code' => 'nullable|string|max:255',
                'validity' => 'nullable|string|max:255',
                'drug_allergies' => 'nullable|string',
                'food_allergies' => 'nullable|string',
                'past_medical_history' => 'nullable|string',
                'family_history' => 'nullable|string',
                'social_personal_history' => 'nullable|string',
                'obstetrics_gynecology_history' => 'nullable|string',
                
                // Appointment fields
                'appointment_type' => 'required|string',
                'specialist_type' => 'required|in:doctor,medtech',
                'specialist_id' => 'required|integer',
                'appointment_date' => 'required|date',
                'appointment_time' => 'required|string',
                'notes' => 'nullable|string',
                'special_requirements' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return back()->withErrors($validator)->withInput();
            }

            // Get specialist info
            $specialist = \App\Models\Staff::findOrFail($request->specialist_id);
            
            // Convert time format from "3:30 PM" to "15:30:00"
            $timeFormatted = Carbon::createFromFormat('g:i A', $request->appointment_time)->format('H:i:s');
            
            // Prepare patient data
            $patientData = [
                'last_name' => $request->last_name,
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'birthdate' => $request->birthdate,
                'age' => $request->age,
                'sex' => $request->sex,
                'civil_status' => $request->civil_status,
                'nationality' => $request->nationality,
                'present_address' => $request->present_address,
                'telephone_no' => $request->telephone_no,
                'mobile_no' => $request->mobile_no,
                'emergency_name' => $request->emergency_name ?? $request->informant_name,
                'emergency_relation' => $request->emergency_relation ?? $request->relationship,
                'company_name' => $request->company_name,
                'hmo_name' => $request->hmo_name,
                'hmo_company_id_no' => $request->hmo_company_id_no,
                'validation_approval_code' => $request->validation_approval_code,
                'validity' => $request->validity,
                'drug_allergies' => $request->drug_allergies,
                'food_allergies' => $request->food_allergies,
                'past_medical_history' => $request->past_medical_history,
                'family_history' => $request->family_history,
                'social_personal_history' => $request->social_personal_history,
                'obstetrics_gynecology_history' => $request->obstetrics_gynecology_history,
            ];

            // Create patient directly
            $patient = \App\Models\Patient::create($patientData);

            // Create appointment data
            $appointmentData = [
                'patient_id' => $patient->patient_id,
                'specialist_id' => $request->specialist_id,
                'appointment_type' => $request->appointment_type,
                'specialist_type' => $request->specialist_type,
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $timeFormatted,
                'duration' => '30 min',
                'price' => null, // Will be calculated using Appointment model's calculatePrice method
                'additional_info' => $request->notes,
                'admin_notes' => $request->special_requirements,
                'source' => 'Walk-in',
                'status' => 'Confirmed',
            ];

            // Create appointment
            $appointment = \App\Models\Appointment::create($appointmentData);

            // Calculate and set price using the model's calculatePrice method
            $calculatedPrice = $appointment->calculatePrice();
            $appointment->update(['price' => $calculatedPrice]);

            // Generate visit code before creation
            $nextId = \App\Models\Visit::max('id') + 1;
            $visitCode = 'V' . str_pad($nextId, 4, '0', STR_PAD_LEFT);

            // Create visit automatically for walk-in appointments
            // Format the visit date properly - combine appointment date and time
            $appointmentDate = $appointment->appointment_date;
            $appointmentTime = $appointment->appointment_time;
            
            // Handle different date/time formats
            if (is_string($appointmentDate)) {
                $appointmentDate = date('Y-m-d', strtotime($appointmentDate));
            } else {
                $appointmentDate = $appointmentDate->format('Y-m-d');
            }
            
            if (is_string($appointmentTime)) {
                $appointmentTime = date('H:i:s', strtotime($appointmentTime));
            } else {
                $appointmentTime = $appointmentTime->format('H:i:s');
            }
            
            $visitDateTime = $appointmentDate . ' ' . $appointmentTime;
            
            $visit = \App\Models\Visit::create([
                'appointment_id' => $appointment->id,
                'patient_id' => $appointment->patient_id,
                'visit_date_time_time' => $visitDateTime,
                'visit_date_time' => $visitDateTime,
                'purpose' => $appointment->appointment_type,
                'attending_staff_id' => $appointment->specialist_id,
                'status' => 'Ongoing',
                'visit_code' => $visitCode,
            ]);

            // Billing transaction will be created by AppointmentAutomationService
            // to prevent duplicates and ensure proper specialist mapping

            DB::commit();

            \Log::info('Walk-in appointment created successfully', [
                'appointment_id' => $appointment->id,
                'patient_id' => $patient->patient_id,
                'visit_id' => $visit->visit_id
            ]);

            return redirect()->route('admin.appointments.index')
                ->with('success', 'Walk-in appointment created successfully for ' . $patient->first_name . ' ' . $patient->last_name . '. Visit has been created. Billing transaction can be created from the billing section.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->with('error', 'Failed to create walk-in appointment: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Calculate price based on appointment type
     */
    private function calculatePrice($appointmentType)
    {
        $prices = [
            'consultation' => 350.00,
            'general_consultation' => 350.00,
            'checkup' => 300.00,
            'fecalysis' => 90.00,
            'fecalysis_test' => 90.00,
            'cbc' => 245.00,
            'urinalysis' => 140.00,
            'urinarysis_test' => 140.00,
            'Follow-up' => 400.00,
        ];

        return $prices[$appointmentType] ?? 300.00;
    }

    /**
     * Update appointment billing status
     */
    public function updateBillingStatus(Request $request, Appointment $appointment)
    {
        $request->validate([
            'billing_status' => 'required|string|in:pending,paid,cancelled,in_transaction'
        ]);

        try {
            \Log::info('Updating appointment billing status', [
                'appointment_id' => $appointment->id,
                'current_billing_status' => $appointment->billing_status,
                'new_billing_status' => $request->billing_status
            ]);

            $appointment->update([
                'billing_status' => $request->billing_status
            ]);

            \Log::info('Appointment billing status updated successfully', [
                'appointment_id' => $appointment->id,
                'new_billing_status' => $appointment->fresh()->billing_status
            ]);

            // Return a simple redirect response instead of JSON
            return redirect()->back();
        } catch (\Exception $e) {
            \Log::error('Failed to update appointment billing status', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage()
            ]);

            return redirect()->back()->with('error', 'Failed to update appointment billing status: ' . $e->getMessage());
        }
    }

}