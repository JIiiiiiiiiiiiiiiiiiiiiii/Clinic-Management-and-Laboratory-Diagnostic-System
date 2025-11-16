<?php

namespace App\Http\Controllers;

use App\Models\PatientTransfer;
use App\Models\PatientTransferHistory;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class PatientTransferRegistrationController extends Controller
{
    /**
     * Display a listing of pending patient registrations
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();
        
        // Build the base query - show ALL transfers that have happened
        // Eager load relationships
        $query = PatientTransfer::with(['patient', 'requestedBy', 'approvedBy', 'transferredBy', 'acceptedBy']);

        // Show ALL transfers regardless of registration_type or role
        // This ensures all transfers are displayed in the table
        // No filtering by registration_type - show everything

        // Apply status filter
        if ($request->filled('status') && $request->status !== 'all') {
            // Filter by specific status
            $query->where(function ($q) use ($request) {
                $q->where('approval_status', $request->status)
                  ->orWhere(function ($subQ) use ($request) {
                      // For transfers without approval_status, use status field
                      $subQ->whereNull('approval_status')
                           ->where('status', $request->status);
                  });
            });
        }
        // If status === 'all' or no status is provided, don't apply any status filter (show all transfers)

        // Debug: Log the query SQL before pagination
        \Log::info('Patient Transfer Query', [
            'sql' => $query->toSql(), 
            'bindings' => $query->getBindings(),
            'status_param' => $request->status,
            'status_filled' => $request->filled('status'),
        ]);
        
        $transfers = $query->orderBy('created_at', 'desc')->paginate(15);

        // Debug: Log the count and IDs
        \Log::info('Patient Transfers Found', [
            'count' => $transfers->count(),
            'total' => $transfers->total(),
            'ids' => $transfers->pluck('id')->toArray(),
            'patient_ids' => $transfers->pluck('patient_id')->toArray(),
            'registration_types' => $transfers->pluck('registration_type')->toArray(),
            'statuses' => $transfers->pluck('status')->toArray(),
            'approval_statuses' => $transfers->pluck('approval_status')->toArray(),
        ]);
        
        // Also check all transfers with patient_id=1 to debug
        $allTransfersForPatient1 = PatientTransfer::where('patient_id', 1)->get();
        \Log::info('All transfers for patient_id=1', [
            'count' => $allTransfersForPatient1->count(),
            'transfers' => $allTransfersForPatient1->map(function($t) {
                return [
                    'id' => $t->id,
                    'patient_id' => $t->patient_id,
                    'registration_type' => $t->registration_type,
                    'approval_status' => $t->approval_status,
                    'status' => $t->status,
                    'created_at' => $t->created_at,
                ];
            })->toArray(),
        ]);

        // Calculate statistics for ALL transfers (not filtered by role)
        $allTransfers = PatientTransfer::query();

        $statistics = [
            'total_transfers' => $allTransfers->count(),
            'pending_transfers' => $allTransfers->clone()
                ->where(function ($q) {
                    $q->where('approval_status', 'pending')
                      ->orWhere(function ($subQ) {
                          $subQ->whereNull('approval_status')
                               ->where('status', 'pending');
                      });
                })
                ->count(),
            'approved_transfers' => $allTransfers->clone()
                ->where(function ($q) {
                    $q->where('approval_status', 'approved')
                      ->orWhere(function ($subQ) {
                          $subQ->whereNull('approval_status')
                               ->where('status', 'completed');
                      });
                })
                ->count(),
            'rejected_transfers' => $allTransfers->clone()
                ->where(function ($q) {
                    $q->where('approval_status', 'rejected')
                      ->orWhere(function ($subQ) {
                          $subQ->whereNull('approval_status')
                               ->where('status', 'cancelled');
                      });
                })
                ->count(),
        ];

        // Transform the data to ensure patient_data is properly formatted
        $transfers->getCollection()->transform(function ($transfer) {
            // For existing patient transfers, use the patient relationship
            // For new patient registrations, use patient_data JSON field
            $patientData = null;
            if ($transfer->patient) {
                // Existing patient transfer - use relationship
                $patientData = [
                    'first_name' => $transfer->patient->first_name ?? 'N/A',
                    'last_name' => $transfer->patient->last_name ?? 'N/A',
                    'middle_name' => $transfer->patient->middle_name ?? '',
                    'birthdate' => $transfer->patient->birthdate ?? null,
                    'age' => $transfer->patient->age ?? null,
                    'sex' => $transfer->patient->sex ?? 'N/A',
                    'mobile_no' => $transfer->patient->mobile_no ?? 'N/A',
                    'patient_no' => $transfer->patient->patient_no ?? 'N/A',
                ];
            } else {
                // New patient registration - use JSON field
                $patientData = $transfer->patient_data ?: [
                    'first_name' => 'N/A',
                    'last_name' => 'N/A',
                    'middle_name' => '',
                    'birthdate' => null,
                    'age' => null,
                    'sex' => 'N/A',
                    'mobile_no' => 'N/A',
                ];
            }

            // Determine transfer direction from boolean fields
            // Logic: from_hospital=true, to_clinic=true = Hospital → Clinic
            //        from_hospital=false, to_clinic=false = Clinic → Hospital
            //        from_hospital=true, to_clinic=false = Hospital → Hospital
            //        from_hospital=false, to_clinic=true = Clinic → Clinic
            $transferDirection = null;
            $fromHospital = (bool) $transfer->from_hospital;
            $toClinic = (bool) $transfer->to_clinic;
            
            if ($fromHospital && $toClinic) {
                $transferDirection = 'hospital_to_clinic';
            } elseif (!$fromHospital && !$toClinic) {
                $transferDirection = 'clinic_to_hospital';
            } elseif ($fromHospital && !$toClinic) {
                $transferDirection = 'hospital_to_hospital';
            } elseif (!$fromHospital && $toClinic) {
                $transferDirection = 'clinic_to_clinic';
            }

            return [
                'id' => $transfer->id,
                'patient_data' => $patientData,
                'patient_id' => $transfer->patient_id, // Include patient_id for existing transfers
                'registration_type' => $transfer->registration_type,
                'approval_status' => $transfer->approval_status ?? $transfer->status, // Fallback to status if no approval_status
                'status' => $transfer->status, // Include status for existing transfers
                'from_hospital' => $transfer->from_hospital,
                'to_clinic' => $transfer->to_clinic,
                'transfer_direction' => $transferDirection,
                'requested_by' => $transfer->requestedBy ? [
                    'id' => $transfer->requestedBy->id,
                    'name' => $transfer->requestedBy->name,
                    'role' => $transfer->requestedBy->role,
                ] : null,
                'approved_by' => $transfer->approvedBy ? [
                    'id' => $transfer->approvedBy->id,
                    'name' => $transfer->approvedBy->name,
                    'role' => $transfer->approvedBy->role,
                ] : null,
                'created_at' => $transfer->created_at,
                'approval_date' => $transfer->approval_date,
                'approval_notes' => $transfer->approval_notes,
                'transfer_reason' => $transfer->transfer_reason, // Include for existing transfers
                'priority' => $transfer->priority, // Include for existing transfers
                'transfer_date' => $transfer->transfer_date, // Include for existing transfers
                'transferred_by' => $transfer->transferredBy ? [
                    'id' => $transfer->transferredBy->id,
                    'name' => $transfer->transferredBy->name,
                    'role' => $transfer->transferredBy->role,
                ] : null,
                'accepted_by' => $transfer->acceptedBy ? [
                    'id' => $transfer->acceptedBy->id,
                    'name' => $transfer->acceptedBy->name,
                    'role' => $transfer->acceptedBy->role,
                ] : null,
                'completion_date' => $transfer->completion_date,
                'notes' => $transfer->notes,
            ];
        });

        return Inertia::render('admin/patient-transfers/index', [
            'transfers' => $transfers,
            'userRole' => $user->role,
            'statistics' => $statistics,
            'filters' => $request->only(['status']), // Pass current filters to frontend
        ]);
    }

    /**
     * Show the form for creating a new patient registration
     */
    public function create(): Response
    {
        $user = auth()->user();
        $registrationType = in_array($user->role, ['hospital_admin', 'hospital_staff']) ? 'hospital' : 'admin';

        return Inertia::render('admin/patient-transfers/create', [
            'registrationType' => $registrationType,
            'userRole' => $user->role,
        ]);
    }

    /**
     * Store a newly created patient registration in transfer table
     */
    public function store(Request $request)
    {
        $user = auth()->user();
        
        // Determine registration type based on user role for cross-approval system
        // Hospital users create hospital registrations (for admin approval)
        // Admin users create admin registrations (for hospital approval)
        $registrationType = in_array($user->role, ['hospital_admin', 'hospital_staff']) ? 'hospital' : 'admin';

        $validator = Validator::make($request->all(), [
            'last_name' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'birthdate' => 'required|date|before:today',
            'age' => 'required|integer|min:0|max:150',
            'sex' => 'required|in:male,female',
            'occupation' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'civil_status' => 'required|in:single,married,widowed,divorced,separated',
            'nationality' => 'nullable|string|max:255',
            'present_address' => 'required|string|max:500',
            'telephone_no' => 'nullable|string|max:20',
            'mobile_no' => 'required|string|max:20',
            'email_address' => 'nullable|email|max:255',
            'informant_name' => 'nullable|string|max:255',
            'relationship' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'hmo_name' => 'nullable|string|max:255',
            'hmo_company_id_no' => 'nullable|string|max:255',
            'validation_approval_code' => 'nullable|string|max:255',
            'validity' => 'nullable|string|max:255',
            'drug_allergies' => 'nullable|string|max:500',
            'food_allergies' => 'nullable|string|max:500',
            'past_medical_history' => 'nullable|string|max:1000',
            'family_history' => 'nullable|string|max:1000',
            'social_personal_history' => 'nullable|string|max:1000',
            'obstetrics_gynecology_history' => 'nullable|string|max:1000',
            'reason_for_transfer' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            DB::beginTransaction();

            // Determine transfer direction based on registration type and user role
            // Hospital users creating registrations = Hospital → Clinic (from hospital, to clinic)
            // Admin users creating registrations = Clinic → Hospital (from clinic, to hospital)
            // So: from_hospital=true, to_clinic=true = Hospital → Clinic
            //     from_hospital=false, to_clinic=false = Clinic → Hospital
            $fromHospital = ($registrationType === 'hospital');
            $toClinic = ($registrationType === 'hospital'); // Hospital users transfer TO clinic
            
            // Create patient transfer record instead of direct patient
            $transfer = PatientTransfer::create([
                'patient_id' => null, // Will be set when approved
                'patient_data' => $request->all(),
                'registration_type' => $registrationType,
                'approval_status' => 'pending',
                'requested_by' => $user->id,
                'transfer_reason' => $request->reason_for_transfer ?? 'Patient registration request',
                'priority' => 'medium',
                'status' => 'pending',
                'transferred_by' => $user->id,
                'transfer_date' => now(),
                'from_hospital' => $fromHospital,
                'to_clinic' => $toClinic,
            ]);

            // Create history record
            $transfer->createHistoryRecord('created', $user->id, 'Patient registration request created');

            DB::commit();

            return redirect()->route('admin.patient.transfer.registrations.index')
                ->with('success', 'Patient registration request submitted successfully. Waiting for approval.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create patient registration request: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified patient transfer
     */
    public function show(PatientTransfer $transfer): Response
    {
        $transfer->load(['patient', 'requestedBy', 'approvedBy', 'transferHistory.actionByUser']);

        // Determine patient data - check if patient relationship exists first, then use patient_data
        $patientData = [];
        if ($transfer->patient) {
            // Existing patient transfer - use relationship
            // Map field names to match frontend expectations (some fields have different names in Patient model)
            $patientData = [
                'first_name' => $transfer->patient->first_name ?? 'N/A',
                'last_name' => $transfer->patient->last_name ?? 'N/A',
                'middle_name' => $transfer->patient->middle_name ?? '',
                'birthdate' => $transfer->patient->birthdate ?? null,
                'age' => $transfer->patient->age ?? null,
                'sex' => $transfer->patient->sex ?? 'N/A',
                'civil_status' => $transfer->patient->civil_status ?? 'N/A',
                'nationality' => $transfer->patient->nationality ?? 'N/A',
                'present_address' => $transfer->patient->present_address ?? $transfer->patient->address ?? 'N/A',
                'telephone_no' => $transfer->patient->telephone_no ?? 'N/A',
                'mobile_no' => $transfer->patient->mobile_no ?? 'N/A',
                'informant_name' => $transfer->patient->informant_name ?? 'N/A',
                'relationship' => $transfer->patient->relationship ?? 'N/A',
                'company_name' => $transfer->patient->company_name ?? null,
                'hmo_name' => $transfer->patient->hmo_name ?? null,
                'hmo_company_id_no' => $transfer->patient->hmo_id_no ?? $transfer->patient->hmo_company_id_no ?? null,
                'drug_allergies' => $transfer->patient->drug_allergies ?? null,
                'food_allergies' => $transfer->patient->food_allergies ?? null,
                'past_medical_history' => $transfer->patient->past_medical_history ?? null,
                'family_history' => $transfer->patient->family_history ?? null,
                'social_personal_history' => $transfer->patient->social_history ?? null, // Patient model uses social_history
                'obstetrics_gynecology_history' => $transfer->patient->obgyn_history ?? null, // Patient model uses obgyn_history
            ];
        } elseif ($transfer->patient_data) {
            // New patient registration - use JSON field and normalize field names
            $rawData = is_array($transfer->patient_data) ? $transfer->patient_data : json_decode($transfer->patient_data, true);
            
            if ($rawData && is_array($rawData)) {
                // Map field names to match frontend expectations
                // Handle various field name variations from different sources
                $patientData = [
                    'first_name' => $rawData['first_name'] ?? $rawData['firstname'] ?? 'N/A',
                    'last_name' => $rawData['last_name'] ?? $rawData['lastname'] ?? 'N/A',
                    'middle_name' => $rawData['middle_name'] ?? $rawData['middlename'] ?? '',
                    'birthdate' => $rawData['birthdate'] ?? $rawData['date_of_birth'] ?? null,
                    'age' => $rawData['age'] ?? (isset($rawData['birthdate']) || isset($rawData['date_of_birth']) 
                        ? (function() use ($rawData) {
                            try {
                                return \Carbon\Carbon::parse($rawData['birthdate'] ?? $rawData['date_of_birth'])->age;
                            } catch (\Exception $e) {
                                return null;
                            }
                        })() 
                        : null),
                    'sex' => $rawData['sex'] ?? $rawData['gender'] ?? 'N/A',
                    'civil_status' => $rawData['civil_status'] ?? 'N/A',
                    'nationality' => $rawData['nationality'] ?? 'N/A',
                    'present_address' => $rawData['present_address'] ?? $rawData['address'] ?? 'N/A',
                    'telephone_no' => $rawData['telephone_no'] ?? $rawData['telephone'] ?? 'N/A',
                    'mobile_no' => $rawData['mobile_no'] ?? $rawData['contact_number'] ?? $rawData['mobile'] ?? 'N/A',
                    'informant_name' => $rawData['informant_name'] ?? 'N/A',
                    'relationship' => $rawData['relationship'] ?? 'N/A',
                    'company_name' => $rawData['company_name'] ?? null,
                    'hmo_name' => $rawData['hmo_name'] ?? null,
                    'hmo_company_id_no' => $rawData['hmo_company_id_no'] ?? $rawData['hmo_id_no'] ?? null,
                    'drug_allergies' => $rawData['drug_allergies'] ?? null,
                    'food_allergies' => $rawData['food_allergies'] ?? null,
                    'past_medical_history' => $rawData['past_medical_history'] ?? null,
                    'family_history' => $rawData['family_history'] ?? null,
                    'social_personal_history' => $rawData['social_personal_history'] ?? $rawData['social_history'] ?? null,
                    'obstetrics_gynecology_history' => $rawData['obstetrics_gynecology_history'] ?? $rawData['obgyn_history'] ?? null,
                ];
            } else {
                // Fallback if patient_data is empty or invalid
                $patientData = [
                    'first_name' => 'N/A',
                    'last_name' => 'N/A',
                    'middle_name' => '',
                    'birthdate' => null,
                    'age' => null,
                    'sex' => 'N/A',
                    'civil_status' => 'N/A',
                    'nationality' => 'N/A',
                    'present_address' => 'N/A',
                    'telephone_no' => 'N/A',
                    'mobile_no' => 'N/A',
                    'informant_name' => 'N/A',
                    'relationship' => 'N/A',
                ];
            }
        } else {
            // No patient data at all
            $patientData = [
                'first_name' => 'N/A',
                'last_name' => 'N/A',
                'middle_name' => '',
                'birthdate' => null,
                'age' => null,
                'sex' => 'N/A',
                'civil_status' => 'N/A',
                'nationality' => 'N/A',
                'present_address' => 'N/A',
                'telephone_no' => 'N/A',
                'mobile_no' => 'N/A',
                'informant_name' => 'N/A',
                'relationship' => 'N/A',
            ];
        }

        // Log for debugging
        \Log::info('Patient Transfer Show - Patient Data', [
            'transfer_id' => $transfer->id,
            'patient_id' => $transfer->patient_id,
            'has_patient_relationship' => $transfer->patient ? 'yes' : 'no',
            'has_patient_data' => $transfer->patient_data ? 'yes' : 'no',
            'patient_data_type' => gettype($transfer->patient_data),
            'patient_data_sample' => is_array($transfer->patient_data) ? array_slice($transfer->patient_data, 0, 5) : 'not array',
            'normalized_patient_data' => array_slice($patientData, 0, 10),
        ]);

        // Transform the transfer data for better display
        $transferData = [
            'id' => $transfer->id,
            'patient_data' => $patientData,
            'registration_type' => $transfer->registration_type,
            'approval_status' => $transfer->approval_status,
            'requested_by' => [
                'id' => $transfer->requestedBy->id,
                'name' => $transfer->requestedBy->name,
                'role' => $transfer->requestedBy->role,
            ],
            'approved_by' => $transfer->approvedBy ? [
                'id' => $transfer->approvedBy->id,
                'name' => $transfer->approvedBy->name,
                'role' => $transfer->approvedBy->role,
            ] : null,
            'created_at' => $transfer->created_at,
            'approval_date' => $transfer->approval_date,
            'approval_notes' => $transfer->approval_notes,
            'transfer_reason' => $transfer->transfer_reason,
            'priority' => $transfer->priority,
            'status' => $transfer->status,
            'patient_id' => $transfer->patient_id,
            'transferred_by' => $transfer->transferred_by,
            'transfer_date' => $transfer->transfer_date,
        ];

        // Get transfer history
        $transferHistory = $transfer->transferHistory()->with('actionByUser')->orderBy('action_date', 'desc')->get();

        return Inertia::render('admin/patient-transfers/show', [
            'transfer' => $transferData,
            'transferHistory' => $transferHistory,
        ]);
    }

    /**
     * Approve a patient transfer and create patient record
     */
    public function approve(Request $request, PatientTransfer $transfer)
    {
        $user = auth()->user();
        
        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        // Check if transfer is already approved to prevent double approval
        if ($transfer->approval_status === 'approved') {
            return back()->withErrors(['error' => 'This transfer has already been approved.']);
        }

        // Check if transfer is rejected
        if ($transfer->approval_status === 'rejected') {
            return back()->withErrors(['error' => 'This transfer has been rejected and cannot be approved.']);
        }

        try {
            DB::beginTransaction();

            // Approve the transfer
            $transfer->approve($user->id, $request->notes);

            // Convert to patient record
            $patient = $transfer->convertToPatient();

            DB::commit();

            return redirect()->route('admin.patient.transfer.registrations.index')
                ->with('success', 'Patient registration approved and patient record created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to approve patient registration: ' . $e->getMessage()]);
        }
    }

    /**
     * Reject a patient transfer
     */
    public function reject(Request $request, PatientTransfer $transfer)
    {
        $user = auth()->user();
        
        $request->validate([
            'notes' => 'required|string|max:1000',
        ]);

        // Check if transfer is already processed to prevent double processing
        if ($transfer->approval_status === 'approved') {
            return back()->withErrors(['error' => 'This transfer has already been approved and cannot be rejected.']);
        }

        if ($transfer->approval_status === 'rejected') {
            return back()->withErrors(['error' => 'This transfer has already been rejected.']);
        }

        try {
            DB::beginTransaction();

            // Reject the transfer
            $transfer->reject($user->id, $request->notes);

            DB::commit();

            return redirect()->route('admin.patient.transfer.registrations.index')
                ->with('success', 'Patient registration rejected successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to reject patient registration: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified patient transfer
     */
    public function destroy(PatientTransfer $transfer)
    {
        $user = auth()->user();
        
        try {
            // Check if transfer has been approved - prevent deletion of approved transfers
            if ($transfer->approval_status === 'approved') {
                return back()->withErrors(['error' => 'Cannot delete an approved transfer.']);
            }

            // Check if transfer has been completed - prevent deletion of completed transfers
            if ($transfer->status === 'completed') {
                return back()->withErrors(['error' => 'Cannot delete a completed transfer.']);
            }

            // Create history record before deletion (use 'cancelled' since 'deleted' is not in the enum)
            try {
                $transfer->createHistoryRecord('cancelled', $user->id, 'Transfer request deleted by ' . $user->name);
            } catch (\Exception $historyError) {
                // Log but don't fail if history record creation fails
                Log::warning('Failed to create history record for deleted transfer', [
                    'transfer_id' => $transfer->id,
                    'error' => $historyError->getMessage(),
                ]);
            }

            // Delete the transfer (soft delete)
            $transfer->delete();

            Log::info('Patient transfer deleted', [
                'transfer_id' => $transfer->id,
                'deleted_by' => $user->id,
            ]);

            return redirect()->route('admin.patient.transfer.index')
                ->with('success', 'Patient transfer deleted successfully!');

        } catch (\Exception $e) {
            Log::error('Failed to delete patient transfer', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'transfer_id' => $transfer->id,
                'user_id' => $user->id,
            ]);

            return back()
                ->with('error', 'Failed to delete patient transfer: ' . $e->getMessage());
        }
    }

    /**
     * Display transfer history with filtering
     */
    public function history(Request $request): Response
    {
        $query = PatientTransferHistory::with(['patient', 'transfer', 'actionByUser'])
            ->orderBy('action_date', 'desc');

        // Apply filters
        if ($request->filled('action')) {
            $query->byAction($request->action);
        }

        if ($request->filled('role')) {
            $query->byRole($request->role);
        }

        if ($request->filled('date_from') && $request->filled('date_to')) {
            $query->byDateRange($request->date_from, $request->date_to);
        }

        if ($request->filled('year') && $request->filled('month')) {
            $query->byMonth($request->year, $request->month);
        } elseif ($request->filled('year')) {
            $query->byYear($request->year);
        }

        $history = $query->paginate(20);

        // Calculate statistics
        $allHistory = PatientTransferHistory::query();
        $statistics = [
            'total_actions' => $allHistory->count(),
            'created_count' => $allHistory->clone()->where('action', 'created')->count(),
            'approved_count' => $allHistory->clone()->where('action', 'accepted')->count(),
            'rejected_count' => $allHistory->clone()->where('action', 'rejected')->count(),
        ];

        return Inertia::render('admin/patient-transfers/history', [
            'history' => $history,
            'filters' => $request->only(['action', 'role', 'date_from', 'date_to', 'year', 'month']),
            'statistics' => $statistics,
        ]);
    }
}
