<?php

namespace App\Http\Controllers;

use App\Models\PatientTransfer;
use App\Models\PatientTransferHistory;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        
        // Build the base query - only show pending transfers by default to prevent double approval
        $query = PatientTransfer::with(['patient', 'requestedBy', 'approvedBy']);

        // Filter based on user role for cross-approval system
        if ($user->role === 'admin') {
            // Admin sees hospital registrations (from hospital admin) that need approval
            $query->byRegistrationType('hospital');
        } elseif (in_array($user->role, ['hospital_admin', 'hospital_staff'])) {
            // Hospital sees admin registrations (from admin) that need approval
            $query->byRegistrationType('admin');
        }

        // Apply status filter - default to pending only to prevent double approval
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('approval_status', $request->status);
        } else {
            // Default to showing only pending transfers to prevent double approval
            $query->where('approval_status', 'pending');
        }

        $transfers = $query->orderBy('created_at', 'desc')->paginate(15);

        // Calculate statistics for the user's role
        $allTransfers = PatientTransfer::query();
        if ($user->role === 'admin') {
            $allTransfers->byRegistrationType('hospital');
        } elseif (in_array($user->role, ['hospital_admin', 'hospital_staff'])) {
            $allTransfers->byRegistrationType('admin');
        }

        $statistics = [
            'total_transfers' => $allTransfers->count(),
            'pending_transfers' => $allTransfers->clone()->where('approval_status', 'pending')->count(),
            'approved_transfers' => $allTransfers->clone()->where('approval_status', 'approved')->count(),
            'rejected_transfers' => $allTransfers->clone()->where('approval_status', 'rejected')->count(),
        ];

        // Transform the data to ensure patient_data is properly formatted
        $transfers->getCollection()->transform(function ($transfer) {
            return [
                'id' => $transfer->id,
                'patient_data' => $transfer->patient_data ?: [
                    'first_name' => 'N/A',
                    'last_name' => 'N/A',
                    'middle_name' => '',
                    'birthdate' => null,
                    'age' => null,
                    'sex' => 'N/A',
                    'mobile_no' => 'N/A',
                ],
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
            ];
        });

        return Inertia::render('admin/patient-transfers/index', [
            'transfers' => $transfers,
            'userRole' => $user->role,
            'statistics' => $statistics,
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

            // Create patient transfer record instead of direct patient
            $transfer = PatientTransfer::create([
                'patient_id' => null, // Will be set when approved
                'patient_data' => $request->all(),
                'registration_type' => $registrationType,
                'approval_status' => 'pending',
                'requested_by' => $user->id,
                'transfer_reason' => 'Patient registration request',
                'priority' => 'medium',
                'status' => 'pending',
                'transferred_by' => $user->id,
                'transfer_date' => now(),
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

        // Transform the transfer data for better display
        $transferData = [
            'id' => $transfer->id,
            'patient_data' => $transfer->patient_data ?: [
                'first_name' => 'N/A',
                'last_name' => 'N/A',
                'middle_name' => '',
                'birthdate' => null,
                'age' => null,
                'sex' => 'N/A',
                'mobile_no' => 'N/A',
            ],
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
