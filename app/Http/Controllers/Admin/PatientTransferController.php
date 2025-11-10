<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\PatientTransfer;
use App\Models\Visit;
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

        $query = PatientTransfer::with(['patient', 'visit.appointment.specialist', 'transferredBy', 'acceptedBy']);

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
     * 
     * IMPORTANT: This is ONLY for transferring EXISTING patients.
     * It does NOT create new patients. Only existing patients with
     * consultation records can be selected for transfer.
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

        // IMPORTANT: Only query EXISTING patients from the database
        // This is NOT for creating new patients - only for selecting existing ones
        // Get patients for selection - only those who have been consulted by a doctor
        // Priority: Patients with visits marked for transfer appear first
        // A patient must have:
        // 1. At least one visit record (existing record)
        // 2. At least one visit linked to an appointment with specialist_type = 'Doctor'/'doctor'
        //    OR a visit with attending_staff_id that is a doctor
        $patients = Patient::select('id', 'first_name', 'last_name', 'patient_no')
            ->withCount(['visits as transfer_required_count' => function ($query) {
                $query->where('transfer_required', true);
            }])
            ->whereHas('visits', function ($query) {
                $query->where(function ($q) {
                    // Check if visit has appointment with doctor specialist_type
                    $q->where(function ($subQ) {
                        $subQ->whereNotNull('appointment_id')
                            ->whereHas('appointment', function ($apptQuery) {
                                $apptQuery->where(function ($sq) {
                                    $sq->where('specialist_type', 'Doctor')
                                       ->orWhere('specialist_type', 'doctor')
                                       ->orWhere('specialist_type', 'DOCTOR');
                                });
                            });
                    })
                    // OR check if visit has attending_staff that is a doctor
                    ->orWhere(function ($subQ) {
                        $subQ->whereNotNull('attending_staff_id')
                            ->whereHas('attendingStaff', function ($staffQuery) {
                                $staffQuery->where('role', 'doctor')
                                           ->orWhere('role', 'Doctor')
                                           ->orWhere('role', 'DOCTOR');
                            });
                    });
                });
            })
            ->orderBy('transfer_required_count', 'desc') // Patients with transfer-required visits first
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        // If a patient is selected, get their visits with doctor consultations
        $visits = collect();
        if ($patient) {
            // Get ALL visits for the patient first, then filter in PHP
            // This ensures we don't miss any visits due to relationship loading issues
            $allVisits = \App\Models\Visit::with(['appointment.specialist', 'attendingStaff'])
                ->where('patient_id', $patient->id)
                ->orderBy('transfer_required', 'desc') // Transfer-required visits first
                ->orderBy('visit_date_time', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            // Filter visits that have doctor consultations
            $visits = $allVisits->filter(function ($visit) {
                // Check if visit has appointment with doctor specialist_type
                $hasDoctorAppointment = false;
                if ($visit->appointment_id && $visit->appointment) {
                    $specialistType = strtolower(trim($visit->appointment->specialist_type ?? ''));
                    // Handle various case variations: 'doctor', 'Doctor', 'DOCTOR'
                    $hasDoctorAppointment = in_array($specialistType, ['doctor']);
                }

                // Check if visit has attending_staff that is a doctor
                $hasDoctorStaff = false;
                if ($visit->attending_staff_id && $visit->attendingStaff) {
                    $staffRole = strtolower(trim($visit->attendingStaff->role ?? ''));
                    // Handle various case variations: 'doctor', 'Doctor', 'DOCTOR'
                    $hasDoctorStaff = in_array($staffRole, ['doctor']);
                }

                // Debug logging (can be removed in production)
                // if (!$hasDoctorAppointment && !$hasDoctorStaff && $visit->appointment_id) {
                //     Log::info('Visit filtered out in create method', [...]);
                // }

                // Return true if either condition is met
                return $hasDoctorAppointment || $hasDoctorStaff;
            })
            ->values(); // Re-index the collection
        }

        return Inertia::render('admin/patient/transfer/create', [
            'patient' => $patient,
            'patients' => $patients,
            'visits' => $visits,
        ]);
    }

    /**
     * Store a newly created patient transfer
     * 
     * IMPORTANT: This ONLY transfers EXISTING patients.
     * It does NOT create new patients. The patient_id must reference
     * an existing patient record in the database.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        // Check if user has permission to create patient transfers
        if (!$user->hasModulePermission('patients', 'transfer')) {
            abort(403, 'You do not have permission to create patient transfers.');
        }

        $request->validate([
            // CRITICAL: patient_id must exist in patients table - this ensures we're only transferring existing patients
            'patient_id' => 'required|exists:patients,id',
            // CRITICAL: visit_id must exist and belong to the patient - this links the transfer to the specific consultation
            'visit_id' => 'required|exists:visits,id',
            'transfer_reason' => 'required|string|max:500',
            'priority' => 'required|in:low,medium,high,urgent',
            'notes' => 'nullable|string|max:1000',
            'transfer_date' => 'required|date|after_or_equal:today',
        ]);

        try {
            // IMPORTANT: Get EXISTING patient - this does NOT create a new patient
            // If patient doesn't exist, findOrFail will throw an exception
            $patient = Patient::findOrFail($request->patient_id);

            // Validate: Patient must have existing visit records (consultation/appointment records)
            // This ensures the patient has been seen/consulted before
            $hasVisits = $patient->visits()->exists();
            
            if (!$hasVisits) {
                return back()
                    ->withInput()
                    ->withErrors([
                        'patient_id' => 'This patient has no visit records. A patient must have at least one consultation/visit record before they can be transferred.'
                    ])
                    ->with('error', 'Patient must have existing visit records before transfer.');
            }

            // Validate: Patient must have been consulted by a doctor (attending physician)
            // Check if patient has visits with:
            // 1. Appointment with specialist_type = 'Doctor'/'doctor'
            // 2. OR attending_staff_id that is a doctor
            $hasDoctorConsultation = $patient->visits()
                ->where(function ($query) {
                    // Check if visit has appointment with doctor specialist_type
                    $query->where(function ($q) {
                        $q->whereNotNull('appointment_id')
                          ->whereHas('appointment', function ($apptQuery) {
                              $apptQuery->where(function ($sq) {
                                  $sq->where('specialist_type', 'Doctor')
                                     ->orWhere('specialist_type', 'doctor')
                                     ->orWhere('specialist_type', 'DOCTOR');
                              });
                          });
                    })
                    // OR check if visit has attending_staff that is a doctor
                    ->orWhere(function ($q) {
                        $q->whereNotNull('attending_staff_id')
                          ->whereHas('attendingStaff', function ($staffQuery) {
                              $staffQuery->where('role', 'doctor')
                                         ->orWhere('role', 'Doctor')
                                         ->orWhere('role', 'DOCTOR');
                          });
                    });
                })
                ->exists();

            if (!$hasDoctorConsultation) {
                return back()
                    ->withInput()
                    ->withErrors([
                        'patient_id' => 'This patient has not been consulted by an attending physician (doctor). A patient must be consulted by a doctor before they can be transferred.'
                    ])
                    ->with('error', 'Patient must be consulted by an attending physician before transfer.');
            }

            // Validate: The visit_id must belong to the selected patient
            $visit = \App\Models\Visit::with(['appointment', 'attendingStaff'])->findOrFail($request->visit_id);
            if ($visit->patient_id != $request->patient_id) {
                return back()
                    ->withInput()
                    ->withErrors([
                        'visit_id' => 'The selected visit does not belong to the selected patient.'
                    ])
                    ->with('error', 'Invalid visit selection.');
            }

            // Validate: The visit must be a doctor consultation
            // Check if visit has appointment with doctor OR attending_staff is a doctor
            $isDoctorConsultation = false;
            if ($visit->appointment && in_array(strtolower($visit->appointment->specialist_type ?? ''), ['doctor'])) {
                $isDoctorConsultation = true;
            } elseif ($visit->attendingStaff && in_array(strtolower($visit->attendingStaff->role ?? ''), ['doctor'])) {
                $isDoctorConsultation = true;
            }

            if (!$isDoctorConsultation) {
                return back()
                    ->withInput()
                    ->withErrors([
                        'visit_id' => 'The selected visit must be a doctor consultation. The visit must be linked to an appointment with a doctor or have an attending physician who is a doctor.'
                    ])
                    ->with('error', 'Selected visit must be a doctor consultation.');
            }

            // All validations passed - create the transfer record for the EXISTING patient
            // NOTE: This does NOT create a new patient - it only creates a transfer record
            // linking to the existing patient_id and visit_id
            $transfer = PatientTransfer::create([
                'patient_id' => $request->patient_id, // This is an existing patient ID, not a new patient
                'visit_id' => $request->visit_id, // Link to the specific visit/consultation
                'from_hospital' => true, // Assuming transfers are from hospital
                'to_clinic' => true,    // Assuming transfers are to clinic
                'transfer_reason' => $request->transfer_reason,
                'priority' => $request->priority,
                'notes' => $request->notes,
                'status' => 'pending',
                'transferred_by' => $user->id,
                'requested_by' => $user->id, // Set requested_by for existing patient transfers
                'transfer_date' => $request->transfer_date,
            ]);

            Log::info('Patient transfer created', [
                'transfer_id' => $transfer->id,
                'patient_id' => $transfer->patient_id,
                'transferred_by' => $user->id,
            ]);

            return redirect()->route('admin.patient.transfer.index')
                ->with('success', 'Patient transfer request created successfully!');

        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Database error creating patient transfer', [
                'error' => $e->getMessage(),
                'sql' => $e->getSql() ?? 'N/A',
                'bindings' => $e->getBindings() ?? [],
                'user_id' => $user->id,
                'patient_id' => $request->patient_id,
            ]);

            $errorMessage = 'Failed to create patient transfer due to a database error.';
            if (str_contains($e->getMessage(), 'Field \'id\' doesn\'t have a default value')) {
                $errorMessage = 'Database configuration error. Please contact the administrator.';
            }

            return back()
                ->withInput()
                ->withErrors(['general' => $errorMessage])
                ->with('error', $errorMessage);
        } catch (\Exception $e) {
            Log::error('Failed to create patient transfer', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $user->id,
                'patient_id' => $request->patient_id,
            ]);

            return back()
                ->withInput()
                ->withErrors(['general' => 'Failed to create patient transfer. Please try again.'])
                ->with('error', 'Failed to create patient transfer: ' . $e->getMessage());
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

        $transfer->load(['patient', 'visit.appointment.specialist', 'transferredBy', 'acceptedBy']);

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

    /**
     * Get visits for a specific patient (AJAX endpoint)
     * Returns visits that are linked to doctor consultations
     */
    public function getPatientVisits(Request $request)
    {
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
        ]);

        // Get ALL visits for the patient first, then filter in PHP
        // This ensures we don't miss any visits due to relationship loading issues
        $allVisits = Visit::with(['appointment', 'appointment.specialist', 'attendingStaff'])
            ->where('patient_id', $request->patient_id)
            ->orderBy('transfer_required', 'desc') // Transfer-required visits first
            ->orderBy('visit_date_time', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        // Debug logging (can be removed in production)
        // Log::info('getPatientVisits - All visits fetched', [
        //     'patient_id' => $request->patient_id,
        //     'total_visits' => $allVisits->count(),
        // ]);

        // Filter visits that have doctor consultations
        $visits = $allVisits->filter(function ($visit) {
            // Check if visit has appointment with doctor specialist_type
            $hasDoctorAppointment = false;
            if ($visit->appointment_id) {
                // Reload appointment if not loaded
                if (!$visit->relationLoaded('appointment')) {
                    $visit->load('appointment');
                }
                
                if ($visit->appointment) {
                    $specialistType = strtolower(trim($visit->appointment->specialist_type ?? ''));
                    // Handle various case variations: 'doctor', 'Doctor', 'DOCTOR'
                    $hasDoctorAppointment = in_array($specialistType, ['doctor']);
                }
            }

            // Check if visit has attending_staff that is a doctor
            $hasDoctorStaff = false;
            if ($visit->attending_staff_id) {
                // Reload attendingStaff if not loaded
                if (!$visit->relationLoaded('attendingStaff')) {
                    $visit->load('attendingStaff');
                }
                
                if ($visit->attendingStaff) {
                    $staffRole = strtolower(trim($visit->attendingStaff->role ?? ''));
                    // Handle various case variations: 'doctor', 'Doctor', 'DOCTOR'
                    $hasDoctorStaff = in_array($staffRole, ['doctor']);
                }
            }

            // Debug logging (can be removed in production)
            // if (!$hasDoctorAppointment && !$hasDoctorStaff && $visit->appointment_id) {
            //     Log::info('Visit filtered out', [...]);
            // }

            // Return true if either condition is met
            return $hasDoctorAppointment || $hasDoctorStaff;
        })
        ->map(function ($visit) {
            // Determine doctor name from appointment or attending staff
            $doctorName = 'Unknown Doctor';
            if ($visit->appointment && $visit->appointment->specialist) {
                $doctorName = $visit->appointment->specialist->name;
            } elseif ($visit->attendingStaff) {
                $doctorName = $visit->attendingStaff->name;
            }

            return [
                'id' => $visit->id,
                'visit_code' => $visit->visit_code,
                'visit_date_time' => $visit->visit_date_time,
                'appointment_date' => $visit->appointment->appointment_date ?? null,
                'appointment_time' => $visit->appointment->appointment_time ? 
                    (\Carbon\Carbon::parse($visit->appointment->appointment_time)->format('H:i') ?? null) : null,
                'doctor_name' => $doctorName,
                'reason_for_consult' => $visit->reason_for_consult,
                'assessment_diagnosis' => $visit->assessment_diagnosis,
                'plan_management' => $visit->plan_management,
                'transfer_required' => $visit->transfer_required ?? false,
                'transfer_reason_notes' => $visit->transfer_reason_notes,
            ];
        })
        ->values(); // Re-index the collection

        // Debug logging (can be removed in production)
        // Log::info('getPatientVisits - Filtered visits result', [
        //     'patient_id' => $request->patient_id,
        //     'filtered_visits_count' => $visits->count(),
        // ]);

        return response()->json(['visits' => $visits]);
    }
}
