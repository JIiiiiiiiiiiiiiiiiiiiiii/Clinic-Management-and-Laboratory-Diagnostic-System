<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\PatientTransfer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class PatientTransferController extends Controller
{
    /**
     * Display a listing of patient transfers
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        
        // Check if user has permission to access patient transfers
        if (!$user->hasModulePermission('patients', 'transfer')) {
            abort(403, 'You do not have permission to access patient transfers.');
        }

        $query = PatientTransfer::with(['patient', 'transferredBy', 'acceptedBy']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('transfer_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('transfer_date', '<=', $request->date_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('patient_no', 'like', "%{$search}%");
            });
        }

        $transfers = $query->orderBy('created_at', 'desc')->paginate(15);

        // Get filter options
        $filterOptions = [
            'statuses' => ['pending', 'completed', 'cancelled'],
            'priorities' => ['low', 'medium', 'high', 'urgent'],
        ];

        return Inertia::render('admin/patient/transfer/index', [
            'transfers' => $transfers,
            'filterOptions' => $filterOptions,
            'filters' => $request->only(['status', 'priority', 'date_from', 'date_to', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new patient transfer
     */
    public function create(Request $request): Response
    {
        $user = Auth::user();
        
        // Check if user has permission to create patient transfers
        if (!$user->hasModulePermission('patients', 'transfer')) {
            abort(403, 'You do not have permission to create patient transfers.');
        }

        $patientId = $request->get('patient_id');
        $patient = null;

        if ($patientId) {
            $patient = Patient::find($patientId);
        }

        // Get patients for selection
        $patients = Patient::select('id', 'first_name', 'last_name', 'patient_no')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('admin/patient/transfer/create', [
            'patient' => $patient,
            'patients' => $patients,
        ]);
    }

    /**
     * Store a newly created patient transfer
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        // Check if user has permission to create patient transfers
        if (!$user->hasModulePermission('patients', 'transfer')) {
            abort(403, 'You do not have permission to create patient transfers.');
        }

        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'transfer_reason' => 'required|string|max:500',
            'priority' => 'required|in:low,medium,high,urgent',
            'notes' => 'nullable|string|max:1000',
            'transfer_date' => 'required|date|after_or_equal:today',
        ]);

        try {
            $transfer = PatientTransfer::create([
                'patient_id' => $request->patient_id,
                'from_hospital' => true, // Assuming transfers are from hospital
                'to_clinic' => true,    // Assuming transfers are to clinic
                'transfer_reason' => $request->transfer_reason,
                'priority' => $request->priority,
                'notes' => $request->notes,
                'status' => 'pending',
                'transferred_by' => $user->id,
                'transfer_date' => $request->transfer_date,
            ]);

            Log::info('Patient transfer created', [
                'transfer_id' => $transfer->id,
                'patient_id' => $transfer->patient_id,
                'transferred_by' => $user->id,
            ]);

            return redirect()->route('admin.patient.transfer.index')
                ->with('success', 'Patient transfer request created successfully!');

        } catch (\Exception $e) {
            Log::error('Failed to create patient transfer', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'patient_id' => $request->patient_id,
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to create patient transfer. Please try again.');
        }
    }

    /**
     * Display the specified patient transfer
     */
    public function show(PatientTransfer $transfer): Response
    {
        $user = Auth::user();
        
        // Check if user has permission to view patient transfers
        if (!$user->hasModulePermission('patients', 'transfer')) {
            abort(403, 'You do not have permission to view patient transfers.');
        }

        $transfer->load(['patient', 'transferredBy', 'acceptedBy']);

        return Inertia::render('admin/patient/transfer/show', [
            'transfer' => $transfer,
        ]);
    }

    /**
     * Update the specified patient transfer
     */
    public function update(Request $request, PatientTransfer $transfer)
    {
        $user = Auth::user();
        
        // Check if user has permission to update patient transfers
        if (!$user->hasModulePermission('patients', 'transfer')) {
            abort(403, 'You do not have permission to update patient transfers.');
        }

        $request->validate([
            'status' => 'required|in:pending,completed,cancelled',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $updateData = [
                'status' => $request->status,
                'notes' => $request->notes,
            ];

            if ($request->status === 'completed') {
                $updateData['accepted_by'] = $user->id;
                $updateData['completion_date'] = now();
            }

            $transfer->update($updateData);

            Log::info('Patient transfer updated', [
                'transfer_id' => $transfer->id,
                'status' => $request->status,
                'updated_by' => $user->id,
            ]);

            return redirect()->route('admin.patient.transfer.show', $transfer)
                ->with('success', 'Patient transfer updated successfully!');

        } catch (\Exception $e) {
            Log::error('Failed to update patient transfer', [
                'error' => $e->getMessage(),
                'transfer_id' => $transfer->id,
                'user_id' => $user->id,
            ]);

            return back()
                ->withInput()
                ->with('error', 'Failed to update patient transfer. Please try again.');
        }
    }

    /**
     * Remove the specified patient transfer
     */
    public function destroy(PatientTransfer $transfer)
    {
        $user = Auth::user();
        
        // Check if user has permission to delete patient transfers
        if (!$user->hasModulePermission('patients', 'transfer')) {
            abort(403, 'You do not have permission to delete patient transfers.');
        }

        try {
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
                'transfer_id' => $transfer->id,
                'user_id' => $user->id,
            ]);

            return back()
                ->with('error', 'Failed to delete patient transfer. Please try again.');
        }
    }

    /**
     * Mark transfer as completed
     */
    public function complete(PatientTransfer $transfer)
    {
        $user = Auth::user();
        
        // Check if user has permission to update patient transfers
        if (!$user->hasModulePermission('patients', 'transfer')) {
            abort(403, 'You do not have permission to complete patient transfers.');
        }

        try {
            $transfer->markAsCompleted($user->id);

            Log::info('Patient transfer completed', [
                'transfer_id' => $transfer->id,
                'completed_by' => $user->id,
            ]);

            return redirect()->route('admin.patient.transfer.show', $transfer)
                ->with('success', 'Patient transfer marked as completed!');

        } catch (\Exception $e) {
            Log::error('Failed to complete patient transfer', [
                'error' => $e->getMessage(),
                'transfer_id' => $transfer->id,
                'user_id' => $user->id,
            ]);

            return back()
                ->with('error', 'Failed to complete patient transfer. Please try again.');
        }
    }

    /**
     * Mark transfer as cancelled
     */
    public function cancel(PatientTransfer $transfer)
    {
        $user = Auth::user();
        
        // Check if user has permission to update patient transfers
        if (!$user->hasModulePermission('patients', 'transfer')) {
            abort(403, 'You do not have permission to cancel patient transfers.');
        }

        try {
            $transfer->markAsCancelled();

            Log::info('Patient transfer cancelled', [
                'transfer_id' => $transfer->id,
                'cancelled_by' => $user->id,
            ]);

            return redirect()->route('admin.patient.transfer.show', $transfer)
                ->with('success', 'Patient transfer marked as cancelled!');

        } catch (\Exception $e) {
            Log::error('Failed to cancel patient transfer', [
                'error' => $e->getMessage(),
                'transfer_id' => $transfer->id,
                'user_id' => $user->id,
            ]);

            return back()
                ->with('error', 'Failed to cancel patient transfer. Please try again.');
        }
    }
}
