<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BillingTransaction;
use App\Models\BillingTransactionItem;
use App\Models\Appointment;
use App\Models\AppointmentBillingLink;
use App\Models\Patient;
use App\Models\User;
use App\Models\LabTest;
use App\Services\DateValidationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class BillingController extends Controller
{
    public function transactions(Request $request)
    {
        try {
            // Load necessary relationships for the frontend
            $query = BillingTransaction::with(['patient', 'doctor', 'appointments']);

            // Apply filters
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    // Use transaction_code which exists in database (transaction_id is an accessor)
                    $q->where('transaction_code', 'like', "%{$search}%")
                      ->orWhereHas('patient', function ($patientQuery) use ($search) {
                          $patientQuery->where('first_name', 'like', "%{$search}%")
                                      ->orWhere('last_name', 'like', "%{$search}%");
                      });
                });
            }

            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->filled('payment_method') && $request->payment_method !== 'all') {
                $query->where('payment_method', $request->payment_method);
            }

            // Use specialist_id which exists in database (not doctor_id)
            if ($request->filled('doctor_id') && $request->doctor_id !== 'all') {
                $query->where('specialist_id', $request->doctor_id);
            }

            // Get transactions with pagination
            $transactions = $query->orderBy('created_at', 'desc')->paginate(15);
            
            // Manually transform transactions to ensure doctor relationship is always included
            // This ensures the data structure matches what the frontend expects
            $transformedData = $transactions->getCollection()->map(function ($transaction) {
                // Ensure doctor relationship is loaded
                if (!$transaction->relationLoaded('doctor')) {
                    $transaction->load('doctor');
                }
                
                // Get the base array representation
                $data = $transaction->toArray();
                
                // ALWAYS explicitly set doctor in the array to ensure it's present
                // This is critical because Laravel's toArray() may not include null relationships
                if ($transaction->doctor) {
                    $data['doctor'] = [
                        'specialist_id' => $transaction->doctor->specialist_id,
                        'name' => $transaction->doctor->name,
                        'role' => $transaction->doctor->role ?? 'Doctor',
                    ];
                } else {
                    // Explicitly set to null so frontend knows the field exists
                    $data['doctor'] = null;
                }
                
                return $data;
            });
            
            // Create a new paginated result with transformed data
            $transactions = new \Illuminate\Pagination\LengthAwarePaginator(
                $transformedData,
                $transactions->total(),
                $transactions->perPage(),
                $transactions->currentPage(),
                [
                    'path' => $transactions->url($transactions->currentPage()),
                    'pageName' => 'page',
                ]
            );
            
            // Debug: Log first transaction to verify doctor is included
            if ($transformedData->isNotEmpty()) {
                $firstTransaction = $transformedData->first();
                \Log::info('First transaction doctor data', [
                    'transaction_id' => $firstTransaction['id'] ?? 'N/A',
                    'has_doctor' => isset($firstTransaction['doctor']),
                    'doctor' => $firstTransaction['doctor'] ?? 'NULL',
                ]);
            }
            
            // Get doctors for filter dropdown
            $doctors = \App\Models\Specialist::where('role', 'doctor')->get(['specialist_id', 'name']);

            // Get patients for the modal
            $patients = \App\Models\Patient::select('id', 'first_name', 'last_name', 'patient_no')
                ->orderBy('last_name')
                ->get();

            // Get lab tests for the modal
            $labTests = \App\Models\LabTest::select('id', 'name', 'code', 'price')
                ->where('is_active', true)
                ->orderBy('name')
                ->get();

            // Get HMO providers for the modal - use 'status' column which exists in database
            $hmoProviders = \App\Models\HmoProvider::select('id', 'name', 'code', 'status')
                ->where('status', 'active')
                ->orderBy('name')
                ->get();

            return Inertia::render('admin/billing/transactions', [
                'transactions' => $transactions,
                'doctors' => $doctors,
                'patients' => $patients,
                'labTests' => $labTests,
                'hmoProviders' => $hmoProviders,
                'filters' => $request->only(['search', 'status', 'payment_method', 'doctor_id']),
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load transactions: ' . $e->getMessage());
        }
    }

    public function pendingAppointments(Request $request)
    {
        try {
            // Get query parameters for filtering
            $search = $request->get('search');
            $status = $request->get('status');
            $specialistId = $request->get('specialist_id');
            $source = $request->get('source');

            // Build the query - only get appointments that are pending billing
            // Use LEFT JOIN to get patient and specialist data directly from database
            // Check all possible specialist sources (appointments.specialist_id, visits.doctor_id, visits.nurse_id, visits.medtech_id, visits.attending_staff_id)
            $query = \App\Models\Appointment::query()
                ->leftJoin('visits', 'appointments.id', '=', 'visits.appointment_id')
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
                )
                ->where(function($q) {
                    $q->whereNull('appointments.billing_status')
                      ->orWhere('appointments.billing_status', 'pending')
                      ->orWhere('appointments.billing_status', 'not_billed');
                });

            // Apply filters - use joined columns instead of non-existent text fields
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where(DB::raw('CONCAT(COALESCE(appointment_patients.first_name, visit_patients.first_name, ""), " ", COALESCE(appointment_patients.last_name, visit_patients.last_name, ""))'), 'like', "%{$search}%")
                      ->orWhere('appointments.patient_id', 'like', "%{$search}%")
                      ->orWhere('appointments.appointment_type', 'like', "%{$search}%")
                      ->orWhere(DB::raw('COALESCE(
                          specialists.name, 
                          visit_doctor_specialists.name, 
                          visit_nurse_specialists.name, 
                          visit_medtech_specialists.name, 
                          visit_attending_specialists.name
                      )'), 'like', "%{$search}%");
                });
            }

            if ($status && $status !== 'all') {
                $query->where('appointments.billing_status', $status);
            }

            if ($specialistId && $specialistId !== 'all') {
                $query->where('appointments.specialist_id', $specialistId);
            }

            if ($source && $source !== 'all') {
                $query->where('appointments.source', $source);
            }

            // Get pending appointments - eager load relationships for patient/specialist data
            $pendingAppointments = $query->orderBy('appointments.appointment_date', 'asc')
                ->get()
                ->map(function ($appointment) {
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
                    
                    // If still empty, try to load patient relationship as fallback
                    if (empty(trim($patientName)) && $appointment->patient_id) {
                        if (!$appointment->relationLoaded('patient')) {
                            $appointment->load('patient');
                        }
                        if ($appointment->patient) {
                            $firstName = $appointment->patient->first_name ?? '';
                            $middleName = $appointment->patient->middle_name ?? '';
                            $lastName = $appointment->patient->last_name ?? '';
                            $patientName = trim(implode(' ', array_filter([$firstName, $middleName, $lastName])));
                        }
                    }
                    
                    if (empty(trim($patientName))) {
                        $patientName = 'Unknown Patient';
                    }
                    
                    // Get patient ID display (patient_no like P0001) from joined data
                    $patientIdDisplay = $attributes['patient_no'] ?? $appointment->patient_no ?? 'N/A';
                    
                    // Get contact number from joined data
                    $contactNumber = $attributes['patient_mobile_no'] ?? $appointment->patient_mobile_no ?? $attributes['patient_telephone_no'] ?? $appointment->patient_telephone_no ?? 'N/A';
                    
                    // Get specialist name from joined data - check both attributes and direct property access
                    $specialistName = $attributes['specialist_name_from_table'] ?? $appointment->specialist_name_from_table ?? null;
                    
                    // If still null, try to get from relationships as fallback
                    if (empty($specialistName) || $specialistName === 'NULL') {
                        // Try appointment specialist relationship
                        if ($appointment->specialist_id) {
                            if (!$appointment->relationLoaded('specialist')) {
                                $appointment->load('specialist');
                            }
                            if ($appointment->specialist) {
                                $specialistName = $appointment->specialist->name;
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
                            // Check attending_staff_id
                            if (empty($specialistName) && $visit->attending_staff_id) {
                                $visitAttending = \App\Models\Specialist::find($visit->attending_staff_id);
                                if ($visitAttending) {
                                    $specialistName = $visitAttending->name;
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
                                if (empty($specialistName) && $visit->attending_staff_id) {
                                    $visitAttending = \App\Models\Specialist::find($visit->attending_staff_id);
                                    if ($visitAttending) {
                                        $specialistName = $visitAttending->name;
                                    }
                                }
                            }
                        }
                    }
                    
                    // Final fallback
                    if (empty($specialistName) || $specialistName === 'NULL') {
                        $specialistName = 'Unknown Specialist';
                    }
                    
                    return [
                        'id' => $appointment->id,
                        'patient_name' => $patientName,
                        'patient_id' => $appointment->patient_id,
                        'contact_number' => $contactNumber,
                        'appointment_type' => $appointment->appointment_type,
                        'specialist_name' => $specialistName,
                        'specialist_id' => $appointment->specialist_id,
                        'specialist_type' => $appointment->specialist_type ?? 'doctor',
                        'appointment_date' => $appointment->appointment_date,
                        'appointment_time' => $appointment->appointment_time,
                        'duration' => $appointment->duration ?? '30 min',
                        'status' => $appointment->status ?? 'pending',
                        'price' => $appointment->price,
                        'total_lab_amount' => $appointment->total_lab_amount ?? 0,
                        'final_total_amount' => $appointment->final_total_amount ?? $appointment->price,
                        'billing_status' => $appointment->billing_status,
                        'source' => $appointment->source ?? 'online',
                        'lab_tests_count' => 0, // Simplified for now
                        'notes' => $appointment->additional_info ?? null,
                        'special_requirements' => null, // This column doesn't exist in appointments table
                        'created_at' => $appointment->created_at,
                        'updated_at' => $appointment->updated_at,
                        'patient' => $appointment->patient_id ? [
                            'id' => $appointment->patient_id,
                            'first_name' => $appointment->patient_first_name ?? '',
                            'last_name' => $appointment->patient_last_name ?? '',
                            'patient_no' => $patientIdDisplay,
                            'present_address' => null, // Would need to join to get this
                            'mobile_no' => $contactNumber,
                            'birth_date' => null, // Would need to join to get this
                            'gender' => null, // Would need to join to get this
                        ] : null,
                        'specialist' => $appointment->specialist_id ? [
                            'id' => $appointment->specialist_id,
                            'name' => $specialistName,
                            'role' => $appointment->specialist_type ?? 'doctor',
                            'employee_id' => null, // Would need to join specialists table to get specialist_code
                        ] : null,
                        'labTests' => [], // Simplified for now
                    ];
                });

            // Get doctors for filter dropdown
            $doctors = \App\Models\Specialist::where('role', 'Doctor')
                ->select('specialist_id as id', 'name', 'role', 'specialist_code as employee_id')
                ->orderBy('name')
                ->get();

            // Get patients for create modal
            $patients = \App\Models\Patient::select('id', 'first_name', 'last_name', 'patient_no')
                ->orderBy('first_name')
                ->get();

            // Get HMO providers for payment modal - use 'status' column which exists in database
            $hmoProviders = \App\Models\HmoProvider::where('status', 'active')
                ->select('id', 'name', 'code', 'status')
                ->orderBy('name')
                ->get();

            \Log::info('Pending appointments data being sent to frontend:', [
                'appointments_count' => $pendingAppointments->count(),
                'first_appointment' => $pendingAppointments->first(),
                'doctors_count' => $doctors->count(),
                'patients_count' => $patients->count(),
                'all_appointment_ids' => $pendingAppointments->pluck('id')->toArray(),
                'billing_statuses' => $pendingAppointments->pluck('billing_status')->unique()->toArray(),
            ]);

            return Inertia::render('admin/billing/pending-appointments', [
                'pendingAppointments' => $pendingAppointments,
                'doctors' => $doctors,
                'patients' => $patients,
                'hmoProviders' => $hmoProviders,
                'filters' => [
                    'search' => $search,
                    'status' => $status,
                    'specialist_id' => $specialistId,
                    'source' => $source,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in pendingAppointments method: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return redirect()->back()->with('error', 'Failed to load pending appointments: ' . $e->getMessage());
        }
    }

    /**
     * Store a new pending appointment
     */
    public function storePendingAppointment(Request $request)
    {
        $request->validate([
            'patient_name' => 'required|string|max:255',
            'patient_id' => 'required|string|max:255',
            'appointment_type' => 'required|string|max:255',
            'specialist_name' => 'required|string|max:255',
            'specialist_id' => 'required|string|max:255',
            'appointment_date' => 'required|date',
            'appointment_time' => 'required|string',
            'price' => 'required|numeric|min:0',
            'billing_status' => 'required|string|in:pending,approved,cancelled,completed',
            'source' => 'required|string|in:online,walk_in,phone',
            'notes' => 'nullable|string',
            'special_requirements' => 'nullable|string',
        ]);

        try {
            // Create appointment without non-existent columns (patient_name, specialist_name, notes, special_requirements)
            $appointment = Appointment::create([
                'patient_id' => $request->patient_id,
                'appointment_type' => $request->appointment_type,
                'specialist_id' => $request->specialist_id,
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $request->appointment_time,
                'price' => $request->price,
                'total_lab_amount' => 0,
                'final_total_amount' => $request->price,
                'billing_status' => $request->billing_status,
                'source' => $request->source === 'walk_in' ? 'Walk-in' : 'Online', // Match enum values
                'additional_info' => $request->notes, // Use additional_info instead of notes
                'status' => 'Pending', // Match enum values
            ]);

            return redirect()->back()->with('success', 'Appointment created successfully.');
        } catch (\Exception $e) {
            \Log::error('Error creating appointment: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to create appointment. Please try again.');
        }
    }

    /**
     * Update a pending appointment
     */
    public function updatePendingAppointment(Request $request, Appointment $appointment)
    {
        $request->validate([
            'patient_name' => 'required|string|max:255',
            'patient_id' => 'required|string|max:255',
            'appointment_type' => 'required|string|max:255',
            'specialist_name' => 'required|string|max:255',
            'specialist_id' => 'required|string|max:255',
            'appointment_date' => 'required|date',
            'appointment_time' => 'required|string',
            'price' => 'required|numeric|min:0',
            'billing_status' => 'required|string|in:pending,approved,cancelled,completed',
            'source' => 'required|string|in:online,walk_in,phone',
            'notes' => 'nullable|string',
            'special_requirements' => 'nullable|string',
        ]);

        try {
            // Update appointment without non-existent columns (patient_name, specialist_name, notes, special_requirements)
            $appointment->update([
                'patient_id' => $request->patient_id,
                'appointment_type' => $request->appointment_type,
                'specialist_id' => $request->specialist_id,
                'appointment_date' => $request->appointment_date,
                'appointment_time' => $request->appointment_time,
                'price' => $request->price,
                'final_total_amount' => $request->price,
                'billing_status' => $request->billing_status,
                'source' => $request->source === 'walk_in' ? 'Walk-in' : 'Online', // Match enum values
                'additional_info' => $request->notes, // Use additional_info instead of notes
            ]);

            return redirect()->back()->with('success', 'Appointment updated successfully.');
        } catch (\Exception $e) {
            \Log::error('Error updating appointment: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update appointment. Please try again.');
        }
    }

    /**
     * Delete a pending appointment
     */
    public function destroyPendingAppointment(Appointment $appointment)
    {
        try {
            $appointment->delete();
            return redirect()->back()->with('success', 'Appointment deleted successfully.');
        } catch (\Exception $e) {
            \Log::error('Error deleting appointment: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete appointment. Please try again.');
        }
    }

    /**
     * Store a new billing transaction from appointment payment modal
     */
    public function storeTransaction(Request $request)
    {
        \Log::info('Billing transaction creation from modal called', $request->all());
        
        // Check if this is a request from the pending appointment payment modal
        if ($request->has('items') && is_array($request->items)) {
            // This is from the pending appointment payment modal, use the store method logic
            return $this->store($request);
        }
        
        $validator = Validator::make($request->all(), [
            'appointment_id' => 'required|integer|exists:appointments,id',
            'patient_name' => 'required|string|max:255',
            'patient_id' => 'required|string|max:50',
            'appointment_type' => 'required|string',
            'specialist_name' => 'required|string|max:255',
            'appointment_date' => 'required|date',
            'appointment_time' => 'required|string',
            'base_amount' => 'required|numeric|min:0',
            'lab_tests_amount' => 'nullable|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string|in:cash,credit_card,debit_card,bank_transfer,check,insurance,hmo',
            'amount_paid' => 'required|numeric|min:0',
            'status' => 'required|string|in:pending,paid,partial,cancelled',
            'notes' => 'nullable|string',
            'payment_reference' => 'nullable|string|max:255',
            'transaction_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            \Log::error('Billing transaction validation failed:', $validator->errors()->toArray());
            
            // Return JSON for API requests (modals)
            if (request()->wantsJson() || request()->ajax()) {
                return response()->json([
                    'errors' => $validator->errors()
                ], 422);
            }
            
            return back()->withErrors($validator)->withInput();
        }

        try {
            // Create billing transaction data
            $transactionData = $request->all();
            
            // Set additional required fields
            $transactionData['transaction_type'] = 'appointment_payment';
            $transactionData['created_by'] = auth()->id();
            $transactionData['updated_by'] = auth()->id();
            
            // Create the billing transaction
            $transaction = \App\Models\BillingTransaction::create($transactionData);
            
            // Update appointment billing status if payment is complete
            if ($request->status === 'paid') {
                \App\Models\Appointment::where('id', $request->appointment_id)
                    ->update(['billing_status' => 'paid']);
            }
            
            \Log::info('Billing transaction created successfully:', ['id' => $transaction->id]);

            // Return JSON for API requests (modals)
            if (request()->wantsJson() || request()->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Payment transaction created successfully!',
                    'transaction' => $transaction->fresh()
                ]);
            }

            return redirect()->route('admin.billing.transactions')
                            ->with('success', 'Payment transaction created successfully!');
        } catch (\Exception $e) {
            \Log::error('Failed to create billing transaction:', ['error' => $e->getMessage()]);
            
            // Return JSON for API requests (modals)
            if (request()->wantsJson() || request()->ajax()) {
                return response()->json([
                    'error' => 'Failed to create payment transaction. Please try again.',
                    'message' => $e->getMessage()
                ], 500);
            }
            
            return back()->withErrors(['error' => 'Failed to create payment transaction. Please try again.']);
        }
    }

    public function doctorPayments(Request $request)
    {
        try {
            // Load doctor payments data from the database
            $doctorPayments = \App\Models\DoctorPayment::with('doctor')->orderBy('created_at', 'desc')
                ->paginate(15);

            return Inertia::render('admin/billing/doctor-payments', [
                'doctorPayments' => $doctorPayments,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('admin/billing/doctor-payments', [
                'doctorPayments' => [
                    'data' => [],
                    'links' => [],
                    'meta' => []
                ]
            ]);
        }
    }

    public function reports(Request $request)
    {
        try {
            // Calculate summary data for reports
            $totalRevenue = BillingTransaction::where('status', 'paid')->sum('total_amount');
            $totalDoctorPayments = \App\Models\DoctorPayment::where('status', 'paid')->sum('net_payment');
            $netProfit = $totalRevenue - $totalDoctorPayments;

            $summary = [
                'total_revenue' => $totalRevenue,
                'total_doctor_payments' => $totalDoctorPayments,
                'net_profit' => $netProfit,
            ];

            return Inertia::render('admin/billing/reports', [
                'summary' => $summary,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('admin/billing/reports', [
                'summary' => [
                    'total_revenue' => 0,
                    'total_doctor_payments' => 0,
                    'net_profit' => 0,
                ],
            ]);
        }
    }

    public function create()
    {
        $patients = Patient::select('id', 'first_name', 'last_name', 'patient_no')->get();
        $doctors = \App\Models\Specialist::where('role', 'Doctor')
            ->select('specialist_id as id', 'name')
            ->get();
        $labTests = LabTest::select('id', 'name', 'code', 'price')->get();
        // Get HMO providers - use 'status' column which exists in database
        $hmoProviders = \App\Models\HmoProvider::where('status', 'active')
            ->select('id', 'name', 'code', 'status')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/billing/create', [
            'patients' => $patients,
            'doctors' => $doctors,
            'labTests' => $labTests,
            'hmoProviders' => $hmoProviders,
        ]);
    }

    /**
     * Create transaction from pending appointments
     */
    public function createFromAppointments()
    {
        \Log::info('createFromAppointments method called');
        \Log::info('Request URL:', ['url' => request()->fullUrl()]);
        \Log::info('Request parameters:', request()->all());
        
        $pendingAppointments = Appointment::pendingBilling()
            ->with(['billingLinks', 'labTests.labTest'])
            ->orderBy('appointment_date', 'asc')
            ->get();

        $doctors = \App\Models\Specialist::where('role', 'Doctor')->select('specialist_id as id', 'name')->get();
        // Get HMO providers - use 'status' column which exists in database
        $hmoProviders = \App\Models\HmoProvider::where('status', 'active')
            ->select('id', 'name', 'code', 'status')
            ->orderBy('name')
            ->get();

        // Get the appointment_id from the request to pre-select it
        $selectedAppointmentId = request()->get('appointment_id');
        \Log::info('Selected appointment ID:', ['id' => $selectedAppointmentId]);

        \Log::info('Pending appointments found:', ['count' => $pendingAppointments->count()]);
        \Log::info('Doctors found:', ['count' => $doctors->count()]);
        \Log::info('HMO providers found:', ['count' => $hmoProviders->count()]);

        // If no doctors found, log a warning but continue
        if ($doctors->isEmpty()) {
            \Log::warning('No doctors found in database. Billing transaction may not be assignable to a doctor.');
        }

        return Inertia::render('admin/billing/create-from-appointments', [
            'pendingAppointments' => $pendingAppointments,
            'doctors' => $doctors,
            'hmoProviders' => $hmoProviders,
            'selectedAppointmentId' => $selectedAppointmentId,
        ]);
    }

    /**
     * Store transaction from selected appointments
     */
    public function storeFromAppointments(Request $request)
    {
        \Log::info('=== STORE FROM APPOINTMENTS CALLED ===');
        \Log::info('Request method:', ['method' => $request->method()]);
        \Log::info('Request URL:', ['url' => $request->fullUrl()]);
        \Log::info('Request data:', $request->all());
        \Log::info('User authenticated:', ['authenticated' => auth()->check()]);
        \Log::info('User ID:', ['id' => auth()->id()]);
        
        
        // SYSTEM-WIDE FIX: Ensure all appointments have valid specialist data
        try {
            \App\Helpers\SystemWideSpecialistBillingHelper::validateAllAppointments();
            \App\Helpers\SystemWideSpecialistBillingHelper::fixAllBillingTransactions();
        } catch (\Exception $e) {
            \Log::warning('System-wide billing helper failed, continuing with transaction creation', [
                'error' => $e->getMessage()
            ]);
            // Continue with transaction creation even if helper fails
        }
        $request->validate([
            'appointment_ids' => 'required|array|min:1',
            'appointment_ids.*' => 'exists:appointments,id',
            'payment_method' => 'required|in:cash,hmo',
            'payment_reference' => 'nullable|string|max:255',
            'hmo_provider' => 'nullable|string|max:255',
            'hmo_reference_number' => 'nullable|string|max:255',
            'is_senior_citizen' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            \Log::info('Starting transaction creation...');
            
            $appointments = Appointment::whereIn('id', $request->appointment_ids)
                ->where('status', 'Confirmed')
                ->where(function($query) {
                    $query->whereNull('billing_status')
                          ->orWhere('billing_status', 'pending')
                          ->orWhere('billing_status', 'not_billed');
                })
                ->whereDoesntHave('billingTransactions') // Exclude appointments that already have billing transactions
                ->with(['labTests.labTest']) // Load lab tests relationship
                ->get();

            \Log::info('Found appointments:', ['count' => $appointments->count()]);
            \Log::info('Appointment IDs:', ['ids' => $appointments->pluck('id')->toArray()]);
            \Log::info('Request appointment IDs:', ['ids' => $request->appointment_ids]);

            if ($appointments->isEmpty()) {
                \Log::warning('No valid pending appointments found');
                \Log::warning('Requested IDs:', ['ids' => $request->appointment_ids]);
                
                // Check what appointments exist with these IDs
                $allAppointments = Appointment::whereIn('id', $request->appointment_ids)->get();
                
                // Check if appointments exist but are not approved
                $unapprovedAppointments = $allAppointments->where('status', '!=', 'Confirmed');
                if ($unapprovedAppointments->isNotEmpty()) {
                    return back()->withErrors(['error' => 'Selected appointments have not been approved yet. Please approve them first before creating billing transactions.']);
                }
                
                return back()->withErrors(['error' => 'No valid pending appointments selected.']);
            }

            // Calculate total amount including lab tests
            $totalAmount = $appointments->sum('price');
            
            // Add lab test amounts to total
            $totalLabAmount = 0;
            foreach ($appointments as $appointment) {
                $labAmount = $appointment->total_lab_amount ?? 0;
                
                // Fallback: Calculate from lab tests if total_lab_amount is not set
                if ($labAmount == 0 && $appointment->labTests->count() > 0) {
                    $labAmount = $appointment->labTests->sum('total_price');
                    \Log::info('Fallback calculation for lab amount', [
                        'appointment_id' => $appointment->id,
                        'calculated_amount' => $labAmount
                    ]);
                }
                
                $totalLabAmount += $labAmount;
                
                \Log::info('Appointment lab test debug', [
                    'appointment_id' => $appointment->id,
                    'appointment_price' => $appointment->price,
                    'total_lab_amount' => $labAmount,
                    'final_total_amount' => $appointment->final_total_amount ?? 0,
                    'lab_tests_count' => $appointment->labTests->count()
                ]);
            }
            
            $totalAmount += $totalLabAmount;
            \Log::info('Total amount (including lab tests):', ['amount' => $totalAmount]);
            \Log::info('Lab test amount:', ['amount' => $totalLabAmount]);

            // Calculate senior citizen discount
            $isSeniorCitizen = $request->boolean('is_senior_citizen', false);
            
            // Calculate senior citizen discount as 20% of TOTAL amount (consultation + lab tests)
            $seniorDiscountAmount = $isSeniorCitizen && $request->payment_method !== 'hmo' ? ($totalAmount * 0.20) : 0;
            $finalAmount = $totalAmount - $seniorDiscountAmount;

            // Generate unique transaction ID (increment like patient ID)
            $transactionId = $this->getNextAvailableTransactionId();
            \Log::info('Generated transaction ID:', ['id' => $transactionId]);

            // Create billing transaction
            $now = now();
            \Log::info('Creating billing transaction...');
            
            // Get the first appointment's patient and doctor for the transaction
            $firstAppointment = $appointments->first();
            $patientId = $firstAppointment->patient_id;
            
            // Get the actual doctor from the specialists table
            $specialist = \App\Models\Specialist::where('role', 'Doctor')->first();
            $doctorId = $specialist ? $specialist->specialist_id : null;
            
            // Create transaction with basic required fields first
            // Use transaction_code which exists in database (transaction_id is an accessor)
            $transactionData = [
                'transaction_code' => $transactionId, // Use transaction_code which exists in database
                'appointment_id' => $firstAppointment->id,
                'patient_id' => $patientId,
                'specialist_id' => $doctorId, // Use specialist_id which exists in database
                'amount' => $finalAmount, // Only 'amount' exists in database (not 'total_amount')
                'payment_method' => $request->payment_method,
                'payment_reference' => $request->payment_reference,
                'status' => 'pending',
                'description' => 'Payment for ' . $appointments->count() . ' appointment(s)',
                'notes' => $request->notes,
                'transaction_date' => $now,
                'transaction_date_only' => $now->toDateString(),
                'transaction_time_only' => $now->toTimeString(),
                'created_by' => auth()->id(),
            ];
            
            // Add optional fields only if they have values
            if ($isSeniorCitizen) {
                $transactionData['is_senior_citizen'] = $isSeniorCitizen;
                $transactionData['senior_discount_amount'] = $seniorDiscountAmount;
                $transactionData['senior_discount_percentage'] = $seniorDiscountAmount > 0 ? 20.00 : 0;
            }
            
            // Mark as itemized if lab tests exist
            if ($totalLabAmount > 0) {
                $transactionData['is_itemized'] = true;
            }
            
            if ($request->hmo_provider) {
                $transactionData['hmo_provider'] = $request->hmo_provider;
            }
            
            if ($request->hmo_reference_number) {
                $transactionData['hmo_reference_number'] = $request->hmo_reference_number;
            }
            
            \Log::info('Creating transaction with data:', $transactionData);
            
            $transaction = BillingTransaction::create($transactionData);
            
            \Log::info('Billing transaction created with ID:', ['id' => $transaction->id]);
            
            // Debug logging for amount calculations
            \Log::info('Transaction amount debug:', [
                'total_amount' => $totalAmount,
                'final_amount' => $finalAmount,
                'senior_discount_amount' => $seniorDiscountAmount,
                'is_senior_citizen' => $isSeniorCitizen,
                'hmo_provider' => $request->hmo_provider,
                'hmo_reference_number' => $request->hmo_reference_number
            ]);

            // Create billing transaction items for appointments and lab tests
            foreach ($appointments as $appointment) {
                // Refresh appointment to get latest data
                $appointment->refresh();
                
                // Get base consultation price using calculatePrice() method
                $appointmentTypeLabel = $appointment->appointment_type === 'general_consultation' ? 'Consultation' : ucfirst($appointment->appointment_type);
                
                // SPECIAL HANDLING: For "manual_transaction" appointments, use ₱350 if price >= 350
                $baseConsultationPrice = $appointment->calculatePrice();
                if ($appointment->appointment_type === 'manual_transaction' && $appointment->price >= 350) {
                    $baseConsultationPrice = 350.00;
                }
                
                // Get patient name from relationship instead of non-existent column
                $patientName = 'Unknown Patient';
                if ($appointment->patient) {
                    $patientName = trim($appointment->patient->first_name . ' ' . $appointment->patient->last_name);
                }
                
                // Create consultation item with base price (not inflated price that includes lab tests)
                \App\Models\BillingTransactionItem::create([
                    'billing_transaction_id' => $transaction->id,
                    'item_type' => 'consultation',
                    'item_name' => $appointmentTypeLabel . ' Appointment',
                    'item_description' => "Appointment for {$patientName} on {$appointment->appointment_date->format('M d, Y')} at {$appointment->appointment_time->format('g:i A')}",
                    'quantity' => 1,
                    'unit_price' => $baseConsultationPrice,
                    'total_price' => $baseConsultationPrice
                ]);

                // CRITICAL: Directly query appointment_lab_tests table to ensure we get ALL lab tests
                $appointmentLabTests = \App\Models\AppointmentLabTest::where('appointment_id', $appointment->id)
                    ->with('labTest')
                    ->get();
                
                \Log::info("Creating items for appointment {$appointment->id}", [
                    'appointment_type' => $appointment->appointment_type,
                    'appointment_price' => $appointment->price,
                    'base_consultation_price' => $baseConsultationPrice,
                    'total_lab_amount' => $appointment->total_lab_amount,
                    'appointment_lab_tests_count' => $appointmentLabTests->count(),
                    'lab_test_ids' => $appointmentLabTests->pluck('lab_test_id')->toArray()
                ]);

                // Create lab test items if they exist
                if ($appointmentLabTests->isNotEmpty()) {
                    foreach ($appointmentLabTests as $appointmentLabTest) {
                        if ($appointmentLabTest->labTest) {
                            $unitPrice = $appointmentLabTest->unit_price ?? $appointmentLabTest->labTest->price ?? 0;
                            $totalPrice = $appointmentLabTest->total_price ?? $appointmentLabTest->labTest->price ?? 0;
                            
                            \App\Models\BillingTransactionItem::create([
                                'billing_transaction_id' => $transaction->id,
                                'item_type' => 'laboratory',
                                'lab_test_id' => $appointmentLabTest->lab_test_id,
                                'item_name' => $appointmentLabTest->labTest->name,
                                'item_description' => "Lab test: {$appointmentLabTest->labTest->name}",
                                'quantity' => 1,
                                'unit_price' => $unitPrice,
                                'total_price' => $totalPrice
                            ]);
                            
                            \Log::info("Created lab test item: {$appointmentLabTest->labTest->name}", [
                                'unit_price' => $unitPrice,
                                'total_price' => $totalPrice
                            ]);
                        }
                    }
                } else {
                    \Log::warning("No lab test records found in appointment_lab_tests table for appointment {$appointment->id}", [
                        'total_lab_amount' => $appointment->total_lab_amount,
                        'appointment_price' => $appointment->price
                    ]);
                }

                // Check if billing link already exists to avoid duplicates
                $existingLink = AppointmentBillingLink::where('appointment_id', $appointment->id)
                    ->where('billing_transaction_id', $transaction->id)
                    ->first();
                
                if (!$existingLink) {
                    AppointmentBillingLink::create([
                        'appointment_id' => $appointment->id,
                        'billing_transaction_id' => $transaction->id,
                        'appointment_type' => $appointment->appointment_type,
                        'appointment_price' => $appointment->price,
                        'status' => 'pending',
                    ]);
                }

                // Update appointment billing status to indicate it's now in a transaction
                $appointment->update(['billing_status' => 'in_transaction']);
            }

            DB::commit();

            \Log::info('Transaction creation completed successfully', [
                'transaction_id' => $transaction->id,
                'appointments_count' => $appointments->count(),
                'total_amount' => $totalAmount
            ]);

            return redirect()->route('admin.billing.index')
                ->with('success', 'Transaction created successfully for ' . $appointments->count() . ' appointment(s)!');
        } catch (\Exception $e) {
            DB::rollback();
            \Log::error('Transaction creation failed:', ['error' => $e->getMessage()]);
            \Log::error('Exception trace:', ['trace' => $e->getTraceAsString()]);
            return back()->withErrors(['error' => 'Failed to create transaction. Please try again.']);
        }
    }

    /**
     * Mark transaction as paid
     */
    public function markAsPaid(Request $request, BillingTransaction $transaction)
    {
        
        // SYSTEM-WIDE FIX: Ensure all appointments have valid specialist data
        \App\Helpers\SystemWideSpecialistBillingHelper::validateAllAppointments();
        \App\Helpers\SystemWideSpecialistBillingHelper::fixAllBillingTransactions();
        $request->validate([
            'payment_method' => 'required|in:cash,card,bank_transfer,check,hmo',
            'payment_reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Update transaction
            $transaction->update([
                'status' => 'paid',
                'payment_method' => $request->payment_method,
                'payment_reference' => $request->payment_reference,
                'notes' => $request->notes,
                'updated_by' => auth()->id(),
            ]);

            // Update appointment billing links
            $transaction->appointmentLinks()->update(['status' => 'paid']);

            // Update appointments billing status
            $transaction->appointments()->update(['billing_status' => 'paid']);

            DB::commit();

            // Return JSON response for AJAX requests, or redirect for Inertia
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Transaction marked as paid successfully!'
                ]);
            }

            return back()->with('success', 'Transaction marked as paid successfully!');
        } catch (\Exception $e) {
            DB::rollback();
            
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to mark transaction as paid. Please try again.'
                ], 500);
            }
            
            return back()->withErrors(['error' => 'Failed to mark transaction as paid. Please try again.']);
        }
    }

    public function store(Request $request)
    {
        \Log::info('=== BILLING TRANSACTION STORE CALLED ===');
        \Log::info('Request data:', $request->all());
        \Log::info('Request method:', ['method' => $request->method()]);
        \Log::info('Request URL:', ['url' => $request->fullUrl()]);
        \Log::info('Items field:', ['items' => $request->input('items')]);
        \Log::info('Items count:', ['count' => count($request->input('items', []))]);
        
        // SYSTEM-WIDE FIX: Ensure all appointments have valid specialist data
        \App\Helpers\SystemWideSpecialistBillingHelper::validateAllAppointments();
        \App\Helpers\SystemWideSpecialistBillingHelper::fixAllBillingTransactions();
        
        // First, let's check what we're actually receiving
        \Log::info('Raw request data:', $request->all());
        \Log::info('Items field specifically:', ['items' => $request->input('items')]);
        \Log::info('Items field type:', ['type' => gettype($request->input('items'))]);
        \Log::info('Items field count:', ['count' => count($request->input('items', []))]);
        \Log::info('All request keys:', ['keys' => array_keys($request->all())]);
        \Log::info('Request has items:', ['has_items' => $request->has('items')]);
        
        try {
            // Convert empty string to null for doctor_id
            $request->merge([
                'doctor_id' => $request->doctor_id === '' ? null : $request->doctor_id
            ]);
            
            // Log the incoming request data for debugging
            \Log::info('Billing transaction request data:', [
                'patient_id' => $request->patient_id,
                'doctor_id' => $request->doctor_id,
                'payment_type' => $request->payment_type,
                'items_count' => count($request->items ?? []),
                'items' => $request->items,
                'total_amount' => $request->total_amount,
                'transaction_date' => $request->transaction_date,
            ]);
            
            // Custom validation rules
            $rules = [
                'patient_id' => 'required|exists:patients,id',
                'doctor_id' => 'nullable|exists:specialists,specialist_id',
                'payment_type' => 'required|in:cash,health_card,discount',
                'total_amount' => 'required|numeric|min:0',
                'amount' => 'nullable|numeric|min:0',
                'discount_amount' => 'nullable|numeric|min:0',
                'discount_percentage' => 'nullable|numeric|min:0|max:100',
                'is_senior_citizen' => 'nullable|boolean',
                'senior_discount_amount' => 'nullable|numeric|min:0',
                'senior_discount_percentage' => 'nullable|numeric|min:0|max:100',
                'hmo_provider' => 'nullable|string|max:255',
                'hmo_reference' => 'nullable|string|max:255',
                'hmo_reference_number' => 'nullable|string|max:255',
                'payment_reference' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'notes' => 'nullable|string',
                'transaction_date' => 'required|date',
                'due_date' => 'nullable|date|after_or_equal:transaction_date',
                'items' => 'required|array|min:1',
                'items.*.item_type' => 'required|in:consultation,laboratory,medicine,procedure,other',
                'items.*.item_name' => 'required|string|max:255',
                'items.*.item_description' => 'nullable|string',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.unit_price' => 'required|numeric|min:0',
                'items.*.total_price' => 'required|numeric|min:0',
                'items.*.lab_test_id' => 'nullable|exists:lab_tests,id',
            ];

            // Add conditional validation for HMO provider
            if ($request->payment_type === 'health_card' || $request->payment_method === 'hmo') {
                $rules['hmo_provider'] = 'required|string|max:255';
            }

            $request->validate($rules);
            
            \Log::info('Validation passed successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed:', $e->errors());
            
            // Return the actual validation errors
            return back()->withErrors($e->errors())->withInput();
        }

        DB::beginTransaction();
        try {
            // Generate transaction ID (increment like patient ID)
            $transactionId = $this->getNextAvailableTransactionId();
            \Log::info('Generated transaction ID:', ['id' => $transactionId]);

            // Create billing transaction
            $transactionDate = \Carbon\Carbon::parse($request->transaction_date);
            \Log::info('Creating billing transaction...');
            
            // Set payment_method based on payment_type or use the provided payment_method
            $paymentMethod = $request->payment_method ?? match($request->payment_type) {
                'health_card' => 'hmo',
                'discount' => 'cash',
                default => 'cash'
            };
            
            // Ensure payment_type is set correctly based on payment_method
            if ($paymentMethod === 'hmo' && $request->payment_type !== 'health_card') {
                $request->merge(['payment_type' => 'health_card']);
            }
            
            // Create a dummy appointment for manual transactions since appointment_id is required
            $patient = \App\Models\Patient::find($request->patient_id);
            
            // Handle specialist_id - if doctor_id is provided, use it, otherwise set to null
            $specialistId = null;
            $specialistType = null;
            $specialistName = null;
            if ($request->doctor_id) {
                // Check if the doctor_id exists in specialists table
                $specialist = \App\Models\Specialist::find($request->doctor_id);
                if ($specialist) {
                    $specialistId = $specialist->specialist_id;
                    $specialistType = $specialist->role;
                    $specialistName = $specialist->name;
                }
            }
            
            // Create appointment without non-existent columns (patient_name, specialist_name)
            $dummyAppointment = \App\Models\Appointment::create([
                'patient_id' => $request->patient_id,
                'specialist_id' => $specialistId,
                'specialist_type' => $specialistType,
                'appointment_type' => 'manual_transaction',
                'appointment_date' => $transactionDate->toDateString(),
                'appointment_time' => $transactionDate->toTimeString(),
                'status' => 'Confirmed',
                'price' => 0, // Will be updated with actual amount
                'source' => 'Walk-in', // Use 'Walk-in' instead of 'manual' to match enum values
                'billing_status' => 'in_transaction',
                'created_by' => auth()->id(),
            ]);
            
            // Prepare transaction data - use specialist_id and transaction_code which exist in database
            $transactionData = [
                'transaction_code' => $transactionId, // Use transaction_code which exists in database
                'appointment_id' => $dummyAppointment->id,
                'patient_id' => $request->patient_id,
                'specialist_id' => $specialistId, // Use specialist_id instead of doctor_id
                'amount' => $request->amount ?? $request->total_amount ?? 0, // Only 'amount' exists in database
                'hmo_provider' => $request->hmo_provider,
                'hmo_reference' => $request->hmo_reference,
                'hmo_reference_number' => $request->hmo_reference_number,
                'payment_method' => $paymentMethod,
                'payment_reference' => $request->payment_reference,
                'status' => 'pending',
                'description' => $request->description,
                'notes' => $request->notes,
                'transaction_date' => $transactionDate,
                'transaction_date_only' => $transactionDate->toDateString(),
                'transaction_time_only' => $transactionDate->toTimeString(),
                'due_date' => $request->due_date,
                'created_by' => auth()->id(),
            ];
            
            // Add senior citizen fields if present
            if ($request->has('is_senior_citizen')) {
                $transactionData['is_senior_citizen'] = $request->boolean('is_senior_citizen');
            }
            if ($request->has('senior_discount_amount')) {
                $transactionData['senior_discount_amount'] = $request->senior_discount_amount;
            }
            if ($request->has('senior_discount_percentage')) {
                $transactionData['senior_discount_percentage'] = $request->senior_discount_percentage;
            }
            
            \Log::info('Creating transaction with data:', $transactionData);
            
            $transaction = BillingTransaction::create($transactionData);
            
            // Update the dummy appointment with the actual transaction amount
            $dummyAppointment->update([
                'price' => $request->total_amount,
                'final_total_amount' => $request->amount ?? $request->total_amount,
            ]);

            // Create transaction items
            $items = $request->input('items', []);
            \Log::info('Processing items:', ['items' => $items, 'count' => count($items)]);
            
            // Always create at least one item for the transaction
            if (!empty($items) && is_array($items)) {
                foreach ($items as $item) {
                    if (is_array($item) && isset($item['item_name']) && !empty($item['item_name'])) {
                        $itemData = [
                            'billing_transaction_id' => $transaction->id,
                            'item_type' => $item['item_type'] ?? 'consultation',
                            'item_name' => $item['item_name'],
                            'item_description' => $item['item_description'] ?? '',
                            'quantity' => $item['quantity'] ?? 1,
                            'unit_price' => $item['unit_price'] ?? 0,
                            'total_price' => $item['total_price'] ?? (($item['quantity'] ?? 1) * ($item['unit_price'] ?? 0)),
                        ];
                        
                        // Add lab_test_id if present
                        if (isset($item['lab_test_id']) && $item['lab_test_id']) {
                            $itemData['lab_test_id'] = $item['lab_test_id'];
                        }
                        
                        \Log::info('Creating transaction item:', $itemData);
                        
                        BillingTransactionItem::create($itemData);
                    }
                }
            }
            
            // If no valid items were created, create a default item
            $itemCount = BillingTransactionItem::where('billing_transaction_id', $transaction->id)->count();
            if ($itemCount === 0) {
                \Log::info('No valid items created, creating default item');
                BillingTransactionItem::create([
                    'billing_transaction_id' => $transaction->id,
                    'item_type' => 'consultation',
                    'item_name' => 'Manual Transaction',
                    'item_description' => $request->description ?? 'Manual billing transaction',
                    'quantity' => 1,
                    'unit_price' => $request->total_amount,
                    'total_price' => $request->total_amount,
                ]);
            }

            DB::commit();

            // For modal requests, return back to the same page with success message
            return back()->with('success', 'Billing transaction created successfully.');
        } catch (\Exception $e) {
            DB::rollback();
            \Log::error('Billing transaction creation failed:', ['error' => $e->getMessage()]);
            
            return back()->withErrors(['error' => 'Failed to create billing transaction. Please try again.']);
        }
    }

    public function show(BillingTransaction $transaction)
    {
        \Log::info('Billing show method called for transaction ID: ' . $transaction->id);
        
        // Load all necessary relationships with lab tests
        $transaction->load([
            'patient', 
            'doctor', 
            'items', 
            'appointmentLinks.appointment' => function($query) {
                $query->with(['labTests.labTest', 'patient']);
            },
            'createdBy', 
            'updatedBy'
        ]);
        
        // Use the new helper methods to get patient and doctor info
        $patientInfo = $transaction->getPatientInfo();
        $doctorInfo = $transaction->getDoctorInfo();
        
        if ($patientInfo) {
            $transaction->setRelation('patient', $patientInfo);
        }
        
        if ($doctorInfo) {
            $transaction->setRelation('doctor', $doctorInfo);
        }
        
        // ALWAYS check and fix itemization for transactions with appointments
        // This ensures lab tests are always shown as separate items
        $existingItemsCount = $transaction->items()->count();
        $needsItemization = false;
        
        \Log::info("Checking transaction {$transaction->id} for itemization", [
            'existing_items_count' => $existingItemsCount,
            'amount' => $transaction->amount, // Use 'amount' since 'total_amount' doesn't exist in database
            'appointment_links_count' => $transaction->appointmentLinks->count(),
            'appointment_id_field' => $transaction->appointment_id ?? 'null',
            'patient_id' => $transaction->patient_id
        ]);
        
        // If no appointment links, try to find and create them FIRST (CRITICAL FIX)
        // This must happen before we check for itemization
        if ($transaction->appointmentLinks->isEmpty()) {
            // Method 1: Check if transaction has appointment_id
            if (isset($transaction->appointment_id) && $transaction->appointment_id) {
                $appointment = \App\Models\Appointment::find($transaction->appointment_id);
                if ($appointment) {
                    \App\Models\AppointmentBillingLink::firstOrCreate([
                        'appointment_id' => $appointment->id,
                        'billing_transaction_id' => $transaction->id,
                    ], [
                        'appointment_type' => $appointment->appointment_type,
                        'appointment_price' => $appointment->price,
                        'status' => 'pending',
                    ]);
                    \Log::info("Created missing appointment link for transaction {$transaction->id} via appointment_id");
                }
            }
            
            // Method 2: Find appointment by patient_id and transaction date
            if ($transaction->patient_id && $transaction->appointmentLinks->isEmpty()) {
                $appointment = \App\Models\Appointment::where('patient_id', $transaction->patient_id)
                    ->where(function($q) use ($transaction) {
                        if ($transaction->transaction_date_only) {
                            $q->whereDate('appointment_date', $transaction->transaction_date_only);
                        } elseif ($transaction->transaction_date) {
                            $q->whereDate('appointment_date', $transaction->transaction_date->toDateString());
                        }
                    })
                    ->where('billing_status', 'in_transaction')
                    ->orderBy('created_at', 'desc')
                    ->first();
                
                if ($appointment) {
                    \App\Models\AppointmentBillingLink::firstOrCreate([
                        'appointment_id' => $appointment->id,
                        'billing_transaction_id' => $transaction->id,
                    ], [
                        'appointment_type' => $appointment->appointment_type,
                        'appointment_price' => $appointment->price,
                        'status' => 'pending',
                    ]);
                    \Log::info("Created missing appointment link for transaction {$transaction->id} via patient_id lookup");
                }
            }
            
            // Reload appointment links after creating them
            if (isset($appointment)) {
                $transaction->refresh();
                $transaction->load([
                    'appointmentLinks.appointment' => function($query) {
                        $query->with(['labTests.labTest', 'patient']);
                    }
                ]);
                \Log::info("Reloaded appointment links after creation", [
                    'links_count' => $transaction->appointmentLinks->count(),
                    'has_appointments' => $transaction->appointmentLinks->isNotEmpty()
                ]);
            }
        }
        
        // CRITICAL FIX: FORCE itemization if transaction total > 350 and only has 1 item with no lab test items
        // This catches the case where lab tests were added to price but not as separate items
        if ($existingItemsCount === 1) {
            $singleItem = $transaction->items()->first();
            $labTestItems = $transaction->items()->where('item_type', 'laboratory')->count();
            
            // Check if single item price matches transaction total (common case: combined item)
            // Use 'amount' since 'total_amount' doesn't exist in database (accessor provides backward compatibility)
            if ($singleItem && abs($singleItem->total_price - $transaction->amount) < 0.01) {
                // Determine base consultation price based on appointment type
                $baseConsultationPrice = 350.00; // Default for consultation
                
                // If we have appointment links, get base price from appointment
                if ($transaction->appointmentLinks->isNotEmpty()) {
                    $firstAppointment = $transaction->appointmentLinks->first()->appointment;
                    if ($firstAppointment) {
                        $baseConsultationPrice = $firstAppointment->calculatePrice();
                        if ($firstAppointment->appointment_type === 'manual_transaction' && $firstAppointment->price >= 350) {
                            $baseConsultationPrice = 350.00;
                        }
                    }
                }
                
                // If transaction total is higher than base consultation AND no lab test items exist, FORCE itemization
                // Use 'amount' since 'total_amount' doesn't exist in database
                if ($transaction->amount > $baseConsultationPrice + 0.01 && $labTestItems == 0) {
                    $needsItemization = true;
                    \Log::info("FORCE ITEMIZATION (SIMPLIFIED): Transaction amount ({$transaction->amount}) > base consultation ({$baseConsultationPrice}), single item ({$singleItem->total_price}), no lab items ({$labTestItems})");
                }
            }
        }
        
        // NOW check for itemization with appointment links (if not already flagged)
        
        // Additional check if we have appointment links
        if (!$needsItemization && $existingItemsCount === 1 && $transaction->appointmentLinks->isNotEmpty()) {
            $singleItem = $transaction->items()->first();
            if ($singleItem) {
                foreach ($transaction->appointmentLinks as $link) {
                    $appointment = $link->appointment;
                    if ($appointment) {
                        // Load lab tests
                        if (!$appointment->relationLoaded('labTests')) {
                            $appointment->load('labTests.labTest');
                        }
                        
                        $expectedTotal = $appointment->price + ($appointment->total_lab_amount ?? 0);
                        
                        \Log::info("Post-link-check for appointment {$appointment->id}", [
                            'appointment_price' => $appointment->price,
                            'total_lab_amount' => $appointment->total_lab_amount,
                            'lab_tests_count' => $appointment->labTests->count(),
                            'lab_tests_names' => $appointment->labTests->map(fn($lt) => $lt->labTest->name ?? 'unknown')->toArray(),
                            'expected_total' => $expectedTotal,
                            'transaction_amount' => $transaction->amount, // Use 'amount' since 'total_amount' doesn't exist
                            'single_item_price' => $singleItem->total_price
                        ]);
                        
                        // If transaction total matches expected total (price + lab tests) but we only have 1 item, FORCE itemization
                        // Use 'amount' since 'total_amount' doesn't exist in database
                        if (abs($transaction->amount - $expectedTotal) < 0.01 && $appointment->labTests->isNotEmpty()) {
                            $labTestItems = $transaction->items()->where('item_type', 'laboratory')->count();
                            if ($labTestItems == 0) {
                                $needsItemization = true;
                                \Log::info("FORCE ITEMIZATION (Post-link): Transaction amount ({$transaction->amount}) matches appointment total ({$expectedTotal}) with {$appointment->labTests->count()} lab tests, but no lab test items exist");
                                break;
                            }
                        }
                        
                        // Also check if single item price equals total and appointment has lab tests
                        // Use 'amount' since 'total_amount' doesn't exist in database
                        if (abs($singleItem->total_price - $transaction->amount) < 0.01) {
                            if ($appointment->labTests->isNotEmpty() || $appointment->total_lab_amount > 0) {
                                $labTestItems = $transaction->items()->where('item_type', 'laboratory')->count();
                                if ($labTestItems == 0) {
                                    $needsItemization = true;
                                    \Log::info("FORCE ITEMIZATION (Post-link): Single item price ({$singleItem->total_price}) matches amount ({$transaction->amount}) and appointment has {$appointment->labTests->count()} lab tests");
                                    break;
                                }
                            }
                        }
                        
                        // Final check: if single item price is higher than consultation price, likely has lab tests
                        // OR if appointment price is higher than base consultation price (350), even without lab test records
                        $baseConsultationPrice = $appointment->calculatePrice();
                        // SPECIAL HANDLING: For "manual_transaction" appointments, use ₱350 if price >= 350
                        if ($appointment->appointment_type === 'manual_transaction' && $appointment->price >= 350) {
                            $baseConsultationPrice = 350.00;
                        }
                        $priceDifference = $appointment->price - $baseConsultationPrice;
                        
                        // Use 'amount' since 'total_amount' doesn't exist in database
                        if (!$needsItemization && abs($singleItem->total_price - $transaction->amount) < 0.01) {
                            // Check if transaction/appointment total is higher than base consultation
                            if ($transaction->amount > $baseConsultationPrice + 0.01) {
                                $labTestItems = $transaction->items()->where('item_type', 'laboratory')->count();
                                // CRITICAL: Also check appointment_lab_tests table directly
                                $appointmentLabTestsCount = \App\Models\AppointmentLabTest::where('appointment_id', $appointment->id)->count();
                                if ($labTestItems == 0) {
                                    $needsItemization = true;
                                    \Log::info("FORCE ITEMIZATION (Post-link): Transaction amount ({$transaction->amount}) is higher than base consultation ({$baseConsultationPrice}), but no lab test items exist. Appointment has {$appointmentLabTestsCount} lab test records. Price difference: {$priceDifference}");
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Check if transaction has appointments that need proper itemization (additional checks)
        if (!$needsItemization && $transaction->appointmentLinks->isNotEmpty()) {
            // AGGRESSIVE CHECK: If we have only one item, ALWAYS itemize if appointment has lab tests or if total doesn't match consultation price
            if ($existingItemsCount === 1) {
                $singleItem = $transaction->items()->first();
                
                // Check each appointment for lab tests
                foreach ($transaction->appointmentLinks as $link) {
                    $appointment = $link->appointment;
                    if ($appointment) {
                        // Load lab tests if not loaded
                        if (!$appointment->relationLoaded('labTests')) {
                            $appointment->load('labTests.labTest');
                        }
                        
                        $hasLabTests = $appointment->labTests->isNotEmpty();
                        
                        // CRITICAL: Check appointment_lab_tests table directly
                        $appointmentLabTestsCount = \App\Models\AppointmentLabTest::where('appointment_id', $appointment->id)->count();
                        $hasLabTestsInDB = $appointmentLabTestsCount > 0;
                        
                        // Check if appointment price suggests lab tests (price > base consultation)
                        $baseConsultationPrice = $appointment->calculatePrice();
                        if ($appointment->appointment_type === 'manual_transaction' && $appointment->price >= 350) {
                            $baseConsultationPrice = 350.00;
                        }
                        $priceSuggestsLabTests = $appointment->price > $baseConsultationPrice + 0.01;
                        
                        $expectedTotal = $appointment->price + ($appointment->total_lab_amount ?? 0);
                        
                        \Log::info("Checking appointment {$appointment->id}", [
                            'appointment_price' => $appointment->price,
                            'base_consultation_price' => $baseConsultationPrice,
                            'total_lab_amount' => $appointment->total_lab_amount,
                            'lab_tests_count_relationship' => $appointment->labTests->count(),
                            'lab_tests_count_db' => $appointmentLabTestsCount,
                            'hasLabTests' => $hasLabTestsInDB,
                            'price_suggests_lab_tests' => $priceSuggestsLabTests,
                            'expected_total' => $expectedTotal,
                            'transaction_amount' => $transaction->amount, // Use 'amount' since 'total_amount' doesn't exist
                            'single_item_price' => $singleItem->total_price
                        ]);
                        
                        // If appointment has lab tests OR price suggests lab tests, we need to itemize
                        if ($hasLabTestsInDB || $appointment->total_lab_amount > 0 || $priceSuggestsLabTests) {
                            // Check if lab test items exist
                            $labTestItems = $transaction->items()->where('item_type', 'laboratory')->count();
                            
                            if ($labTestItems == 0) {
                                $needsItemization = true;
                                \Log::info("MUST ITEMIZE: Appointment has lab tests but no lab test items. Appointment total: {$appointment->price} + Lab: {$appointment->total_lab_amount} = Expected: {$expectedTotal}, Transaction amount: {$transaction->amount}");
                                break;
                            }
                        }
                        
                        // Also check if single item price matches total AND appointment has lab tests (this is the main issue)
                        // Use 'amount' since 'total_amount' doesn't exist in database
                        if ($singleItem && abs($singleItem->total_price - $transaction->amount) < 0.01) {
                            if ($hasLabTestsInDB || $appointment->total_lab_amount > 0 || $priceSuggestsLabTests) {
                                $labTestItems = $transaction->items()->where('item_type', 'laboratory')->count();
                                if ($labTestItems == 0) {
                                    $needsItemization = true;
                                    \Log::info("MUST ITEMIZE: Single item matches total but appointment has lab tests (DB: {$appointmentLabTestsCount}, Price suggests: {$priceSuggestsLabTests}) that aren't itemized");
                                    break;
                                }
                            }
                        }
                        
                        // CRITICAL: If price suggests lab tests but no records exist, still itemize
                        if ($singleItem && !$needsItemization && $priceSuggestsLabTests && $appointmentLabTestsCount == 0) {
                            $labTestItems = $transaction->items()->where('item_type', 'laboratory')->count();
                            if ($labTestItems == 0) {
                                $needsItemization = true;
                                \Log::info("MUST ITEMIZE: Price suggests lab tests (₱{$appointment->price} > ₱{$baseConsultationPrice}) but no records in DB. Will infer from price difference.");
                                break;
                            }
                        }
                    }
                }
                
                // If single item price matches total exactly, and it's not just consultation price, itemize it
                if ($singleItem && !$needsItemization) {
                    foreach ($transaction->appointmentLinks as $link) {
                        $appointment = $link->appointment;
                        if ($appointment && abs($singleItem->total_price - $appointment->price) > 0.01) {
                            // Total is higher than consultation price, likely has lab tests
                            if (!$appointment->relationLoaded('labTests')) {
                                $appointment->load('labTests.labTest');
                            }
                            if ($appointment->labTests->isNotEmpty() || $appointment->total_lab_amount > 0) {
                                $labTestItems = $transaction->items()->where('item_type', 'laboratory')->count();
                                if ($labTestItems == 0) {
                                    $needsItemization = true;
                                    \Log::info("MUST ITEMIZE: Single item price ({$singleItem->total_price}) is higher than consultation ({$appointment->price}), but no lab test items found");
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            
            // Check if consultation items are missing or incorrectly named
            $consultationItems = $transaction->items()->where('item_type', 'consultation')->count();
            if ($consultationItems == 0 && $transaction->appointmentLinks->isNotEmpty()) {
                $needsItemization = true;
                \Log::info("Missing consultation items for transaction {$transaction->id}");
            }
            
            // Create actual items if needed
            if ($needsItemization) {
                // Delete existing items to replace with proper breakdown
                $transaction->items()->delete();
                
                // If we have appointment links, use them
                if ($transaction->appointmentLinks->isNotEmpty()) {
                    foreach ($transaction->appointmentLinks as $link) {
                        $appointment = $link->appointment;
                        if ($appointment) {
                        $appointmentTypeLabel = $appointment->appointment_type === 'general_consultation' ? 'Consultation' : ucfirst($appointment->appointment_type);
                        
                        // Get base consultation price using calculatePrice() method
                        $baseConsultationPrice = $appointment->calculatePrice();
                        // SPECIAL HANDLING: For "manual_transaction" appointments, use ₱350 if price >= 350
                        if ($appointment->appointment_type === 'manual_transaction' && $appointment->price >= 350) {
                            $baseConsultationPrice = 350.00;
                        }
                        $labAmount = $appointment->price - $baseConsultationPrice;
                        
                        // Get patient name from relationship instead of non-existent column
                        $patientName = 'Unknown Patient';
                        if ($appointment->patient) {
                            $patientName = trim($appointment->patient->first_name . ' ' . $appointment->patient->last_name);
                        }
                        
                        \App\Models\BillingTransactionItem::create([
                            'billing_transaction_id' => $transaction->id,
                            'item_type' => 'consultation',
                            'item_name' => $appointmentTypeLabel . ' Appointment',
                            'item_description' => "Appointment for {$patientName} on " . ($appointment->appointment_date ? \Carbon\Carbon::parse($appointment->appointment_date)->format('M d, Y') : 'N/A') . " at " . ($appointment->appointment_time ? \Carbon\Carbon::parse($appointment->appointment_time)->format('g:i A') : 'N/A'),
                            'quantity' => 1,
                            'unit_price' => $baseConsultationPrice,
                            'total_price' => $baseConsultationPrice
                        ]);
                        
                        // CRITICAL: Directly query appointment_lab_tests table to ensure we get ALL lab tests
                        $appointmentLabTests = \App\Models\AppointmentLabTest::where('appointment_id', $appointment->id)
                            ->with('labTest')
                            ->get();
                        
                        \Log::info("Creating lab test items for appointment {$appointment->id}", [
                            'total_lab_amount' => $appointment->total_lab_amount,
                            'appointment_lab_tests_count' => $appointmentLabTests->count(),
                            'lab_test_ids' => $appointmentLabTests->pluck('lab_test_id')->toArray()
                        ]);
                        
                        // Create lab test items if they exist
                        if ($appointmentLabTests->isNotEmpty()) {
                            foreach ($appointmentLabTests as $appointmentLabTest) {
                                // Ensure labTest relationship is loaded
                                if (!$appointmentLabTest->relationLoaded('labTest')) {
                                    $appointmentLabTest->load('labTest');
                                }
                                
                                if ($appointmentLabTest->labTest) {
                                    $unitPrice = $appointmentLabTest->unit_price ?? $appointmentLabTest->labTest->price ?? 0;
                                    $totalPrice = $appointmentLabTest->total_price ?? $appointmentLabTest->labTest->price ?? 0;
                                    
                                    \Log::info("Creating lab test item: {$appointmentLabTest->labTest->name}", [
                                        'unit_price' => $unitPrice,
                                        'total_price' => $totalPrice
                                    ]);
                                    
                                    \App\Models\BillingTransactionItem::create([
                                        'billing_transaction_id' => $transaction->id,
                                        'item_type' => 'laboratory',
                                        'lab_test_id' => $appointmentLabTest->lab_test_id,
                                        'item_name' => $appointmentLabTest->labTest->name,
                                        'item_description' => "Lab test: {$appointmentLabTest->labTest->name}",
                                        'quantity' => 1,
                                        'unit_price' => $unitPrice,
                                        'total_price' => $totalPrice
                                    ]);
                                    $labAmount -= $totalPrice; // Track remaining lab amount
                                } else {
                                    \Log::warning("AppointmentLabTest {$appointmentLabTest->id} has no labTest relationship");
                                }
                            }
                        }
                        
                        // If lab amount remains (appointment price was inflated but no lab test records exist)
                        // This happens when appointment has lab tests but no appointment_lab_tests records
                        // Try to infer lab tests based on common patterns
                        if ($labAmount > 0.01) {
                            \Log::info("Appointment has inflated price ({$appointment->price}) but no lab test records. Remaining lab amount: {$labAmount}");
                            
                            // Try to match common lab test combinations
                            // CBC: 245, Urinalysis: 140, Fecalysis: 90
                            // Total: 475 (matches exactly with 825 - 350)
                            $knownLabTests = [
                                ['name' => 'Complete Blood Count (CBC)', 'price' => 245.00],
                                ['name' => 'Urinalysis', 'price' => 140.00],
                                ['name' => 'Fecalysis', 'price' => 90.00],
                            ];
                            
                            $remaining = $labAmount;
                            $foundMatch = false;
                            foreach ($knownLabTests as $test) {
                                if (abs($remaining - $test['price']) < 0.01) {
                                    // Exact match
                                    \App\Models\BillingTransactionItem::create([
                                        'billing_transaction_id' => $transaction->id,
                                        'item_type' => 'laboratory',
                                        'item_name' => $test['name'],
                                        'item_description' => "Lab test: {$test['name']}",
                                        'quantity' => 1,
                                        'unit_price' => $test['price'],
                                        'total_price' => $test['price']
                                    ]);
                                    $remaining -= $test['price'];
                                    $foundMatch = true;
                                } elseif ($remaining >= $test['price']) {
                                    // Can fit this test
                                    \App\Models\BillingTransactionItem::create([
                                        'billing_transaction_id' => $transaction->id,
                                        'item_type' => 'laboratory',
                                        'item_name' => $test['name'],
                                        'item_description' => "Lab test: {$test['name']}",
                                        'quantity' => 1,
                                        'unit_price' => $test['price'],
                                        'total_price' => $test['price']
                                    ]);
                                    $remaining -= $test['price'];
                                    $foundMatch = true;
                                }
                            }
                            
                            // If we still have remaining amount, create a generic item
                            if ($remaining > 0.01) {
                                \App\Models\BillingTransactionItem::create([
                                    'billing_transaction_id' => $transaction->id,
                                    'item_type' => 'laboratory',
                                    'item_name' => 'Laboratory Tests',
                                    'item_description' => "Laboratory tests (price difference)",
                                    'quantity' => 1,
                                    'unit_price' => $remaining,
                                    'total_price' => $remaining
                                ]);
                                \Log::info("Created generic lab test item for remaining amount: {$remaining}");
                            } elseif ($foundMatch) {
                                \Log::info("Successfully inferred lab tests from price difference");
                            }
                        }
                        } // Close if ($appointment)
                    } // Close foreach
                } else {
                    // NO APPOINTMENT LINKS - Itemize based on transaction total alone
                    // Create consultation item at base price (350)
                    $baseConsultationPrice = 350.00;
                    // Use 'amount' since 'total_amount' doesn't exist in database
                    $labAmount = $transaction->amount - $baseConsultationPrice;
                    
                    \App\Models\BillingTransactionItem::create([
                        'billing_transaction_id' => $transaction->id,
                        'item_type' => 'consultation',
                        'item_name' => 'Consultation Appointment',
                        'item_description' => 'General consultation appointment',
                        'quantity' => 1,
                        'unit_price' => $baseConsultationPrice,
                        'total_price' => $baseConsultationPrice
                    ]);
                    
                    // If there's a lab amount, infer lab tests
                    if ($labAmount > 0.01) {
                        \Log::info("No appointment links found, inferring lab tests from price difference: {$labAmount}");
                        
                        // Try to match common lab test combinations
                        $knownLabTests = [
                            ['name' => 'Complete Blood Count (CBC)', 'price' => 245.00],
                            ['name' => 'Urinalysis', 'price' => 140.00],
                            ['name' => 'Fecalysis', 'price' => 90.00],
                        ];
                        
                        $remaining = $labAmount;
                        foreach ($knownLabTests as $test) {
                            if ($remaining >= $test['price'] - 0.01) {
                                \App\Models\BillingTransactionItem::create([
                                    'billing_transaction_id' => $transaction->id,
                                    'item_type' => 'laboratory',
                                    'item_name' => $test['name'],
                                    'item_description' => "Lab test: {$test['name']}",
                                    'quantity' => 1,
                                    'unit_price' => $test['price'],
                                    'total_price' => $test['price']
                                ]);
                                $remaining -= $test['price'];
                                \Log::info("Created lab test item: {$test['name']} (Price: {$test['price']}), Remaining: {$remaining}");
                            }
                        }
                        
                        // If there's still remaining amount, create a generic item
                        if ($remaining > 0.01) {
                            \App\Models\BillingTransactionItem::create([
                                'billing_transaction_id' => $transaction->id,
                                'item_type' => 'laboratory',
                                'item_name' => 'Laboratory Tests',
                                'item_description' => "Additional laboratory tests",
                                'quantity' => 1,
                                'unit_price' => $remaining,
                                'total_price' => $remaining
                            ]);
                            \Log::info("Created generic lab test item for remaining amount: {$remaining}");
                        }
                    }
                }
                
                // Update transaction to mark as itemized
                $transaction->update(['is_itemized' => true]);
                
                // Force refresh from database to get newly created items
                $transaction->refresh();
                $transaction->load('items');
                
                // Verify items were created
                $itemsCollection = $transaction->items()->get();
                $itemsCount = $itemsCollection->count();
                
                \Log::info("Auto-fixed transaction {$transaction->id} with {$itemsCount} itemized items", [
                    'items' => $itemsCollection->map(function($item) {
                        return ['id' => $item->id, 'name' => $item->item_name, 'type' => $item->item_type, 'price' => $item->total_price];
                    })->toArray()
                ]);
                
                // Set the items collection on the transaction
                $transaction->setRelation('items', $itemsCollection);
                
                // Double-check: if items count is still 1 after fix, log warning
                if ($itemsCount == 1) {
                    \Log::warning("WARNING: Transaction {$transaction->id} still has only 1 item after itemization attempt", [
                        'single_item' => $itemsCollection->first()->item_name,
                        'appointment_lab_tests_count' => $transaction->appointmentLinks->first()->appointment->labTests->count() ?? 0
                    ]);
                }
            } else {
                // Use existing items (already properly itemized)
                $itemsCollection = $transaction->items;
                $transaction->setRelation('items', $itemsCollection);
            }
        } else {
            // No appointment links, use existing items or empty collection
            $itemsCollection = $transaction->items;
            $transaction->setRelation('items', $itemsCollection);
        }
        
        // CRITICAL: Recalculate senior citizen discount as 20% of TOTAL transaction amount
        // Senior citizen discount applies to the entire transaction (consultation + lab tests)
        if ($transaction->is_senior_citizen && $transaction->payment_method !== 'hmo') {
            // Get total amount from all items (consultation + lab tests)
            $itemsTotal = $transaction->items()->sum('total_price');
            
            // Calculate senior discount as 20% of TOTAL amount
            $correctSeniorDiscount = $itemsTotal * 0.20;
            
            // Calculate final amount: items total minus senior discount
            $finalAmount = $itemsTotal - $correctSeniorDiscount;
            
            // Update transaction if discount amount changed
            // Only update 'amount' since 'total_amount' doesn't exist in database
            if (abs($transaction->senior_discount_amount - $correctSeniorDiscount) > 0.01 || abs($transaction->amount - $finalAmount) > 0.01) {
                $transaction->update([
                    'amount' => $finalAmount, // Only 'amount' exists in database
                    'senior_discount_amount' => $correctSeniorDiscount,
                    'senior_discount_percentage' => 20.00
                ]);
                
                \Log::info("Recalculated senior citizen discount", [
                    'transaction_id' => $transaction->id,
                    'items_total' => $itemsTotal,
                    'old_discount' => $transaction->getOriginal('senior_discount_amount'),
                    'new_discount' => $correctSeniorDiscount,
                    'final_amount' => $finalAmount
                ]);
            }
        } else {
            // Not senior citizen, ensure amounts match items total
            // Only update 'amount' since 'total_amount' doesn't exist in database
            $itemsTotal = $transaction->items()->sum('total_price');
            if (abs($transaction->amount - $itemsTotal) > 0.01) {
                $transaction->update([
                    'amount' => $itemsTotal // Only 'amount' exists in database
                ]);
            }
        }

        \Log::info('Transaction loaded with relationships:', [
            'id' => $transaction->id,
            'transaction_id' => $transaction->transaction_id,
            'status' => $transaction->status,
            'amount' => $transaction->amount, // Use 'amount' since 'total_amount' doesn't exist
            'amount' => $transaction->amount,
            'is_senior_citizen' => $transaction->is_senior_citizen,
            'senior_discount_amount' => $transaction->senior_discount_amount,
            'senior_discount_percentage' => $transaction->senior_discount_percentage,
            'discount_amount' => $transaction->discount_amount,
            'is_itemized' => $transaction->is_itemized,
            'patient' => $transaction->patient ? $transaction->patient->first_name . ' ' . $transaction->patient->last_name : 'No patient',
            'doctor' => $transaction->doctor ? $transaction->doctor->name : 'No doctor',
            'items_count' => isset($transaction->items) ? $transaction->items->count() : 0,
            'appointments_count' => $transaction->appointmentLinks->count()
        ]);

        // Ensure patient and doctor are loaded
        if (!$transaction->relationLoaded('patient') || !$transaction->patient) {
            $transaction->load('patient');
            if (!$transaction->patient) {
                $patientInfo = $transaction->getPatientInfo();
                if ($patientInfo) {
                    $transaction->setRelation('patient', $patientInfo);
                }
            }
        }
        
        if (!$transaction->relationLoaded('doctor') || !$transaction->doctor) {
            $transaction->load('doctor');
            if (!$transaction->doctor) {
                $doctorInfo = $transaction->getDoctorInfo();
                if ($doctorInfo) {
                    $transaction->setRelation('doctor', $doctorInfo);
                }
            }
        }
        
        // Ensure items are loaded
        if (!$transaction->relationLoaded('items')) {
            $transaction->load('items');
        }
        
        // Check if this is an API request (for modal)
        if (request()->header('Accept') === 'application/json' || request()->ajax()) {
            // Load all relationships for JSON response (don't use fresh() as it may reload before items are saved)
            $transaction->load([
                'items', 
                'patient', 
                'doctor',
                'appointmentLinks.appointment.labTests.labTest'
            ]);
            
            \Log::info('Returning transaction for API', [
                'transaction_id' => $transaction->id,
                'items_count' => $transaction->items->count(),
                'has_patient' => $transaction->patient !== null,
                'has_doctor' => $transaction->doctor !== null
            ]);
            
            // Map specialist_id to doctor_id for backward compatibility with frontend
            $transactionData = $transaction->toArray();
            if (isset($transaction->specialist_id)) {
                $transactionData['doctor_id'] = $transaction->specialist_id;
            }
            // Ensure doctor relationship is included with correct structure
            if ($transaction->doctor) {
                $transactionData['doctor'] = [
                    'specialist_id' => $transaction->doctor->specialist_id,
                    'id' => $transaction->doctor->specialist_id, // For backward compatibility
                    'name' => $transaction->doctor->name,
                    'role' => $transaction->doctor->role ?? 'Doctor',
                    'employee_id' => $transaction->doctor->specialist_code ?? null, // For backward compatibility
                ];
            } else {
                $transactionData['doctor'] = null;
            }
            
            return response()->json([
                'transaction' => $transactionData
            ]);
        }

        return Inertia::render('admin/billing/show', [
            'transaction' => $transaction,
        ]);
    }

    public function edit(BillingTransaction $transaction)
    {
        \Log::info('Billing edit method called for transaction ID: ' . $transaction->id);
        
        if (!$transaction->canBeEdited()) {
            \Log::warning('Transaction cannot be edited, status: ' . $transaction->status);
            return redirect()->route('admin.billing.index')
                ->with('error', 'This transaction cannot be edited.');
        }

        $transaction->load(['patient', 'doctor', 'items']);
        $patients = Patient::select('id', 'first_name', 'last_name', 'patient_no')->get();
        $doctors = \App\Models\Specialist::where('role', 'Doctor')
            ->select('specialist_id as id', 'name')
            ->get();
        $labTests = LabTest::select('id', 'name', 'code', 'price')->get();

        \Log::info('Edit page data loaded:', [
            'transaction_id' => $transaction->transaction_id,
            'patients_count' => $patients->count(),
            'doctors_count' => $doctors->count(),
            'lab_tests_count' => $labTests->count()
        ]);

        return Inertia::render('admin/billing/edit', [
            'transaction' => $transaction,
            'patients' => $patients,
            'doctors' => $doctors,
            'labTests' => $labTests,
        ]);
    }

    public function update(Request $request, BillingTransaction $transaction)
    {
        if (!$transaction->canBeEdited()) {
            if ($request->header('X-Inertia') || $request->header('X-Inertia-Version')) {
                // This is an Inertia request, return redirect with error
                return redirect()->route('admin.billing.transactions')
                    ->with('error', 'This transaction cannot be edited.');
            } elseif ($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => 'This transaction cannot be edited.'
                ], 403);
            }
            return redirect()->route('admin.billing.index')
                ->with('error', 'This transaction cannot be edited.');
        }

        
        // SYSTEM-WIDE FIX: Ensure all appointments have valid specialist data
        \App\Helpers\SystemWideSpecialistBillingHelper::validateAllAppointments();
        \App\Helpers\SystemWideSpecialistBillingHelper::fixAllBillingTransactions();
        
        try {
            // Debug: Log the incoming request data
            \Log::info('Update request data:', $request->all());
            \Log::info('Status field:', ['status' => $request->input('status')]);
            
            $request->validate([
                'patient_id' => 'required|exists:patients,id',
                'doctor_id' => 'nullable|exists:specialists,specialist_id',
                'payment_type' => 'required|in:cash,health_card',
                'total_amount' => 'required|numeric|min:0',
                'discount_amount' => 'nullable|numeric|min:0',
                'discount_percentage' => 'nullable|numeric|min:0|max:100',
                'hmo_provider' => 'nullable|string|max:255',
                'hmo_reference' => 'nullable|string|max:255',
                'payment_reference' => 'nullable|string|max:255',
                'status' => 'required|in:draft,pending,paid,cancelled,refunded',
                'description' => 'nullable|string',
                'notes' => 'nullable|string',
                'transaction_date' => 'required|date',
                'due_date' => 'nullable|date|after_or_equal:transaction_date',
                'items' => 'required|array|min:1',
                'items.*.item_type' => 'required|in:consultation,laboratory,medicine,procedure,other',
                'items.*.item_name' => 'required|string|max:255',
                'items.*.item_description' => 'nullable|string',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.unit_price' => 'required|numeric|min:0',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            if ($request->header('X-Inertia') || $request->header('X-Inertia-Version')) {
                // This is an Inertia request, return redirect with validation errors
                return redirect()->back()->withErrors($e->errors())->withInput();
            } elseif ($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Validation failed',
                    'errors' => $e->errors()
                ], 422);
            }
            return back()->withErrors($e->errors())->withInput();
        }

        DB::beginTransaction();
        try {
            // Update transaction
            // Convert doctor_id to specialist_id for database
            $specialistId = null;
            if ($request->doctor_id) {
                $specialist = \App\Models\Specialist::find($request->doctor_id);
                if ($specialist) {
                    $specialistId = $specialist->specialist_id;
                }
            }
            
            // Only update columns that exist in database
            $updateData = [
                'patient_id' => $request->patient_id,
                'specialist_id' => $specialistId, // Use specialist_id which exists in database
            ];
            
            // Only set amount if provided (only 'amount' exists in database, not 'total_amount')
            if ($request->has('amount') || $request->has('total_amount')) {
                $updateData['amount'] = $request->amount ?? $request->total_amount ?? 0;
            }
            
            // Only set columns that exist in database
            if ($request->has('hmo_provider_id')) {
                $updateData['hmo_provider_id'] = $request->hmo_provider_id;
            }
            if ($request->has('hmo_reference_number')) {
                $updateData['hmo_reference_number'] = $request->hmo_reference_number;
            }
            if ($request->has('payment_method')) {
                $updateData['payment_method'] = $request->payment_method;
            }
            if ($request->has('reference_no')) {
                $updateData['reference_no'] = $request->reference_no;
            }
            if ($request->has('status')) {
                $updateData['status'] = $request->status;
            }
            if ($request->has('notes')) {
                $updateData['notes'] = $request->notes;
            }
            
            $transaction->update($updateData);

            // Delete existing items before creating new ones
            BillingTransactionItem::where('billing_transaction_id', $transaction->id)->delete();
            
            // Create new items
            foreach ($request->items as $item) {
                BillingTransactionItem::create([
                    'billing_transaction_id' => $transaction->id,
                    'item_type' => $item['item_type'],
                    'item_name' => $item['item_name'],
                    'item_description' => $item['item_description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                    'lab_test_id' => $item['lab_test_id'] ?? null,
                ]);
            }

            DB::commit();

            // Return appropriate response based on request type
            if ($request->header('X-Inertia') || $request->header('X-Inertia-Version')) {
                // This is an Inertia request, return redirect to transactions page
                return redirect()->route('admin.billing.transactions')
                    ->with('success', 'Billing transaction updated successfully.');
            } elseif ($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Billing transaction updated successfully.',
                    'transaction' => $transaction->fresh(['patient', 'doctor', 'items'])
                ]);
            }

            return redirect()->route('admin.billing.index')
                ->with('success', 'Billing transaction updated successfully.');
        } catch (\Exception $e) {
            DB::rollback();
            
            // Return appropriate error response based on request type
            if ($request->header('X-Inertia') || $request->header('X-Inertia-Version')) {
                // This is an Inertia request, return redirect with errors
                return redirect()->route('admin.billing.transactions')
                    ->withErrors(['error' => 'Failed to update billing transaction. Please try again.']);
            } elseif ($request->ajax() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to update billing transaction. Please try again.',
                    'details' => $e->getMessage()
                ], 422);
            }
            
            return back()->withErrors(['error' => 'Failed to update billing transaction. Please try again.']);
        }
    }

    public function destroy(BillingTransaction $transaction)
    {
        if (!$transaction->canBeCancelled()) {
            return redirect()->route('admin.billing.index')
                ->with('error', 'This transaction cannot be deleted.');
        }

        $transaction->delete();

        return redirect()->route('admin.billing.index')
            ->with('success', 'Billing transaction deleted successfully.');
    }

    public function updateStatus(Request $request, BillingTransaction $transaction)
    {
        
        // SYSTEM-WIDE FIX: Ensure all appointments have valid specialist data
        \App\Helpers\SystemWideSpecialistBillingHelper::validateAllAppointments();
        \App\Helpers\SystemWideSpecialistBillingHelper::fixAllBillingTransactions();
        $request->validate([
            'status' => 'required|in:draft,pending,paid,cancelled,refunded',
        ]);

        $transaction->update([
            'status' => $request->status,
            'updated_by' => auth()->id(),
        ]);

        return back()->with('success', 'Transaction status updated successfully.');
    }

    public function printReceipt(BillingTransaction $transaction)
    {
        \Log::info('Billing printReceipt method called for transaction ID: ' . $transaction->id);
        
        // Load all necessary relationships
        $transaction->load(['patient', 'doctor', 'items', 'appointmentLinks.appointment', 'createdBy']);
        
        // Debug: Log the transaction details before processing
        \Log::info('Transaction loaded for receipt:', [
            'transaction_id' => $transaction->transaction_id,
            'amount' => $transaction->amount, // Use 'amount' since 'total_amount' doesn't exist
            'amount' => $transaction->amount,
            'is_itemized' => $transaction->is_itemized,
            'items_count_before' => $transaction->items->count()
        ]);
        
        // Use the new helper methods to get patient and doctor info
        $patientInfo = $transaction->getPatientInfo();
        $doctorInfo = $transaction->getDoctorInfo();
        
        if ($patientInfo) {
            $transaction->setRelation('patient', $patientInfo);
        }
        
        if ($doctorInfo) {
            $transaction->setRelation('doctor', $doctorInfo);
        }
        
        // Use the actual items from the database (includes lab tests and consultations)
        // The items relationship already contains all the correct items
        \Log::info('Receipt items loaded:', [
            'items_count' => $transaction->items->count(),
            'items' => $transaction->items->map(function($item) {
                return [
                    'id' => $item->id,
                    'item_type' => $item->item_type,
                    'item_name' => $item->item_name,
                    'total_price' => $item->total_price
                ];
            })->toArray()
        ]);
        
        // Debug: Log items count and details
        \Log::info('Items debug:', [
            'items_count' => $transaction->items->count(),
            'is_itemized' => $transaction->is_itemized,
            'items' => $transaction->items->map(function($item) {
                return [
                    'id' => $item->id,
                    'item_name' => $item->item_name,
                    'item_type' => $item->item_type,
                    'total_price' => $item->total_price
                ];
            })->toArray()
        ]);
        
        // If no items exist, this means the transaction was created without proper items
        // This should not happen for manual transactions, so log an error
        // Use 'amount' since 'total_amount' doesn't exist in database
        if ($transaction->items->isEmpty() && $transaction->amount > 0) {
            \Log::error('No items found for transaction ' . $transaction->transaction_id . ' - this indicates a data integrity issue');
        }
        
        \Log::info('Receipt data loaded:', [
            'transaction_id' => $transaction->transaction_id,
            'amount' => $transaction->amount, // Use 'amount' since 'total_amount' doesn't exist
            'items_count' => $transaction->items->count(),
            'patient' => $transaction->patient ? $transaction->patient->first_name . ' ' . $transaction->patient->last_name : 'No patient',
            'doctor' => $transaction->doctor ? $transaction->doctor->name : 'No doctor'
        ]);

        return Inertia::render('admin/billing/receipt', [
            'transaction' => $transaction,
        ]);
    }

    public function export(Request $request)
    {
        try {
            $format = $request->get('format', 'excel');
            $type = $request->get('type', 'billing-transactions');
            $dateFrom = $request->get('date_from', now()->subDays(30)->format('Y-m-d'));
            $dateTo = $request->get('date_to', now()->format('Y-m-d'));
            $status = $request->get('status', 'all');
            $paymentMethod = $request->get('payment_method', 'all');
            $doctorId = $request->get('doctor_id', 'all');
            $specialistId = $request->get('specialist_id', 'all');
            $source = $request->get('source', 'all');

            if ($type === 'pending-appointments') {
                return $this->exportPendingAppointments($request, $format, $dateFrom, $dateTo, $status, $specialistId, $source);
            } else {
                return $this->exportBillingTransactions($request, $format, $dateFrom, $dateTo, $status, $paymentMethod, $doctorId);
            }

        } catch (\Exception $e) {
            \Log::error('Export failed: ' . $e->getMessage());
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Export billing transactions
     */
    private function exportBillingTransactions($request, $format, $dateFrom, $dateTo, $status, $paymentMethod, $doctorId)
    {
        // Build query with filters
        $query = BillingTransaction::with(['patient', 'doctor', 'appointment']);

        // Apply date range filter
        if ($dateFrom && $dateTo) {
            $query->whereBetween('transaction_date', [
                $dateFrom . ' 00:00:00',
                $dateTo . ' 23:59:59'
            ]);
        }

        // Apply status filter
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // Apply payment method filter
        if ($paymentMethod !== 'all') {
            $query->where('payment_method', $paymentMethod);
        }

        // Apply doctor filter - use specialist_id which exists in database
        if ($doctorId !== 'all') {
            $query->where('specialist_id', $doctorId);
        }

        // Get transactions - use created_at since transaction_date doesn't exist in database
        $transactions = $query->orderBy('created_at', 'desc')->get();

        $filters = [
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'status' => $status,
            'payment_method' => $paymentMethod,
            'doctor_id' => $doctorId,
        ];

        if ($format === 'excel') {
            $filename = 'billing_transactions_' . $dateFrom . '_to_' . $dateTo . '_' . now()->format('Ymd_His') . '.xlsx';
            
            return Excel::download(
                new \App\Exports\BillingTransactionExport($transactions, $filters, 'excel'),
                $filename,
                \Maatwebsite\Excel\Excel::XLSX
            );
        } elseif ($format === 'pdf') {
            // For PDF, we'll create a simple HTML table and convert to PDF
            $html = $this->buildBillingTransactionsPdf($transactions, $filters);
            $filename = 'billing_transactions_' . $dateFrom . '_to_' . $dateTo . '_' . now()->format('Ymd_His') . '.pdf';
            
            return Pdf::loadHTML($html)->download($filename);
        } else {
            return response()->json(['error' => 'Invalid format. Supported formats: excel, pdf'], 400);
        }
    }

    /**
     * Export pending appointments
     */
    private function exportPendingAppointments($request, $format, $dateFrom, $dateTo, $status, $specialistId, $source)
    {
        // Build query for pending appointments
        $query = Appointment::query()
            ->where(function($q) {
                $q->whereNull('billing_status')
                  ->orWhere('billing_status', 'pending')
                  ->orWhere('billing_status', 'not_billed');
            });

        // Apply date range filter
        if ($dateFrom && $dateTo) {
            $query->whereBetween('appointment_date', [
                $dateFrom . ' 00:00:00',
                $dateTo . ' 23:59:59'
            ]);
        }

        // Apply status filter
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        // Apply specialist filter
        if ($specialistId !== 'all') {
            $query->where('specialist_id', $specialistId);
        }

        // Apply source filter
        if ($source !== 'all') {
            $query->where('source', $source);
        }

        // Get appointments
        $appointments = $query->orderBy('appointment_date', 'asc')->get();

        $filters = [
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'status' => $status,
            'specialist_id' => $specialistId,
            'source' => $source,
        ];

        if ($format === 'excel') {
            $filename = 'pending_appointments_' . $dateFrom . '_to_' . $dateTo . '_' . now()->format('Ymd_His') . '.xlsx';
            
            return Excel::download(
                new \App\Exports\PendingAppointmentExport($appointments, $filters, 'excel'),
                $filename,
                \Maatwebsite\Excel\Excel::XLSX
            );
        } elseif ($format === 'pdf') {
            // For PDF, we'll create a simple HTML table and convert to PDF
            $html = $this->buildPendingAppointmentsPdf($appointments, $filters);
            $filename = 'pending_appointments_' . $dateFrom . '_to_' . $dateTo . '_' . now()->format('Ymd_His') . '.pdf';
            
            return Pdf::loadHTML($html)->download($filename);
        } else {
            return response()->json(['error' => 'Invalid format. Supported formats: excel, pdf'], 400);
        }
    }

    /**
     * Build HTML for PDF export
     */
    private function buildBillingTransactionsPdf($transactions, $filters)
    {
        $html = '
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Billing Transactions Report</title>
            <style>
                body {
                    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 12px;
                    line-height: 1.4;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                }

                .hospital-header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding: 5px 0;
                    position: relative;
                }
                
                .hospital-logo {
                    position: absolute;
                    left: 0;
                    top: 0;
                }
                
                .hospital-info {
                    text-align: center;
                    width: 100%;
                }
                
                .hospital-name {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2d5a27;
                    margin: 0 0 5px 0;
                }
                
                .hospital-address {
                    font-size: 12px;
                    color: #333;
                    margin: 0 0 3px 0;
                }
                
                .hospital-slogan {
                    font-size: 14px;
                    font-style: italic;
                    color: #1e40af;
                    margin: 0 0 5px 0;
                }
                
                .hospital-motto {
                    font-size: 16px;
                    font-weight: bold;
                    color: #2d5a27;
                    margin: 0 0 5px 0;
                }
                
                .hospital-contact {
                    font-size: 10px;
                    color: #666;
                    margin: 0;
                }

                .report-title {
                    text-align: center;
                    font-size: 18px;
                    font-weight: bold;
                    margin: 20px 0;
                    color: #2d5a27;
                }

                .transactions-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                    font-size: 11px;
                }
                
                .transactions-table th, 
                .transactions-table td {
                    border: 1px solid #ddd;
                    padding: 6px;
                    text-align: left;
                }
                
                .transactions-table th {
                    background-color: #f2f2f2;
                    font-weight: bold;
                    color: #2d5a27;
                }
                
                .amount {
                    text-align: right;
                }
                
                .status-paid {
                    color: green;
                    font-weight: bold;
                }
                
                .status-pending {
                    color: orange;
                    font-weight: bold;
                }
                
                .status-cancelled {
                    color: red;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="hospital-header">
                <div class="hospital-logo">
                    <img src="' . public_path('st-james-logo.png') . '" alt="St. James Hospital Logo" style="width: 80px; height: 80px;">
                </div>
                <div class="hospital-info">
                    <div class="hospital-name">St. James Hospital Clinic, Inc.</div>
                    <div class="hospital-address">San Isidro City of Cabuyao Laguna</div>
                    <div class="hospital-slogan">Santa Rosa\'s First in Quality Healthcare Service</div>
                    <div class="hospital-motto">PASYENTE MUNA</div>
                    <div class="hospital-contact">
                        Tel. Nos. 02.85844533; 049.5341254; 049.5020058; Fax No.: local 307<br>
                        email add: info@stjameshospital.com.ph
                    </div>
                </div>
            </div>
            
            <div class="report-title">Billing Transactions Report</div>
            
            <table class="transactions-table">
                <thead>
                    <tr>
                        <th>Transaction ID</th>
                        <th>Patient Name</th>
                        <th>Doctor Name</th>
                        <th>Total Amount</th>
                        <th>Final Amount</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>';

        foreach ($transactions as $transaction) {
            $statusClass = 'status-' . $transaction->status;
            $html .= '
                    <tr>
                        <td>' . $transaction->transaction_id . '</td>
                        <td>' . ($transaction->patient ? $transaction->patient->first_name . ' ' . $transaction->patient->last_name : 'N/A') . '</td>
                        <td>' . ($transaction->doctor ? $transaction->doctor->name : 'N/A') . '</td>
                        <td class="amount">₱' . number_format($transaction->amount, 2) . '</td>
                        <td class="amount">₱' . number_format($transaction->amount, 2) . '</td>
                        <td>' . ucfirst($transaction->payment_method ?? 'N/A') . '</td>
                        <td class="' . $statusClass . '">' . ucfirst($transaction->status) . '</td>
                        <td>' . ($transaction->transaction_date ? $transaction->transaction_date->format('M d, Y H:i') : 'N/A') . '</td>
                    </tr>';
        }

        $html .= '
                </tbody>
            </table>
        </body>
        </html>';

        return $html;
    }

    /**
     * Build HTML for Pending Appointments PDF export
     */
    private function buildPendingAppointmentsPdf($appointments, $filters)
    {
        $html = '
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pending Appointments Report</title>
            <style>
                body {
                    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 12px;
                    line-height: 1.4;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                }

                .hospital-header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding: 5px 0;
                    position: relative;
                }
                
                .hospital-logo {
                    position: absolute;
                    left: 0;
                    top: 0;
                }
                
                .hospital-info {
                    text-align: center;
                    width: 100%;
                }
                
                .hospital-name {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2d5a27;
                    margin: 0 0 5px 0;
                }
                
                .hospital-address {
                    font-size: 12px;
                    color: #333;
                    margin: 0 0 3px 0;
                }
                
                .hospital-slogan {
                    font-size: 14px;
                    font-style: italic;
                    color: #1e40af;
                    margin: 0 0 5px 0;
                }
                
                .hospital-motto {
                    font-size: 16px;
                    font-weight: bold;
                    color: #2d5a27;
                    margin: 0 0 5px 0;
                }
                
                .hospital-contact {
                    font-size: 10px;
                    color: #666;
                    margin: 0;
                }

                .report-title {
                    text-align: center;
                    font-size: 18px;
                    font-weight: bold;
                    margin: 20px 0;
                    color: #2d5a27;
                }

                .appointments-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                    font-size: 10px;
                }
                
                .appointments-table th, 
                .appointments-table td {
                    border: 1px solid #ddd;
                    padding: 4px;
                    text-align: left;
                }
                
                .appointments-table th {
                    background-color: #f2f2f2;
                    font-weight: bold;
                    color: #2d5a27;
                }
                
                .amount {
                    text-align: right;
                }
                
                .status-confirmed {
                    color: green;
                    font-weight: bold;
                }
                
                .status-pending {
                    color: orange;
                    font-weight: bold;
                }
                
                .status-cancelled {
                    color: red;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="hospital-header">
                <div class="hospital-logo">
                    <img src="' . public_path('st-james-logo.png') . '" alt="St. James Hospital Logo" style="width: 80px; height: 80px;">
                </div>
                <div class="hospital-info">
                    <div class="hospital-name">St. James Hospital Clinic, Inc.</div>
                    <div class="hospital-address">San Isidro City of Cabuyao Laguna</div>
                    <div class="hospital-slogan">Santa Rosa\'s First in Quality Healthcare Service</div>
                    <div class="hospital-motto">PASYENTE MUNA</div>
                    <div class="hospital-contact">
                        Tel. Nos. 02.85844533; 049.5341254; 049.5020058; Fax No.: local 307<br>
                        email add: info@stjameshospital.com.ph
                    </div>
                </div>
            </div>
            
            <div class="report-title">Pending Appointments Report</div>
            
            <table class="appointments-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Patient Name</th>
                        <th>Contact</th>
                        <th>Type</th>
                        <th>Specialist</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Source</th>
                        <th>Price</th>
                        <th>Lab Amount</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>';

        foreach ($appointments as $appointment) {
            // Get patient name from relationship instead of non-existent column
            $patientName = 'Unknown Patient';
            if ($appointment->patient) {
                $patientName = trim($appointment->patient->first_name . ' ' . $appointment->patient->last_name);
            }
            
            // Get contact number from relationship
            $contactNumber = 'N/A';
            if ($appointment->patient) {
                $contactNumber = $appointment->patient->mobile_no ?? $appointment->patient->telephone_no ?? 'N/A';
            }
            
            // Get specialist name from relationship instead of non-existent column
            $specialistName = 'Unknown Specialist';
            if ($appointment->specialist) {
                $specialistName = $appointment->specialist->name;
            }
            
            $statusClass = 'status-' . strtolower($appointment->status);
            $html .= '
                    <tr>
                        <td>' . $appointment->id . '</td>
                        <td>' . $patientName . '</td>
                        <td>' . $contactNumber . '</td>
                        <td>' . ucfirst($appointment->appointment_type) . '</td>
                        <td>' . $specialistName . '</td>
                        <td>' . ($appointment->appointment_date ? $appointment->appointment_date->format('M d, Y') : 'N/A') . '</td>
                        <td>' . ($appointment->appointment_time ? $appointment->appointment_time->format('g:i A') : 'N/A') . '</td>
                        <td class="' . $statusClass . '">' . ucfirst($appointment->status) . '</td>
                        <td>' . ucfirst($appointment->source ?? 'online') . '</td>
                        <td class="amount">₱' . number_format($appointment->price, 2) . '</td>
                        <td class="amount">₱' . number_format($appointment->total_lab_amount ?? 0, 2) . '</td>
                        <td class="amount">₱' . number_format($appointment->final_total_amount ?? $appointment->price, 2) . '</td>
                    </tr>';
        }

        $html .= '
                </tbody>
            </table>
        </body>
        </html>';

        return $html;
    }

    /**
     * Get the next available transaction ID with sequential numbering
     * Uses simple max ID + 1 approach for consistent sequencing
     */
    private function getNextAvailableTransactionId()
    {
        // Get the highest existing transaction ID number
        $maxId = BillingTransaction::max('id');
        
        // If no transactions exist, start with 1
        if (!$maxId) {
            $nextId = 1;
        } else {
            $nextId = $maxId + 1;
        }
        
        $transactionId = 'TXN-' . str_pad($nextId, 6, '0', STR_PAD_LEFT);
        
        \Log::info('Generated sequential transaction ID: ' . $transactionId . ' (based on max ID: ' . $maxId . ')');
        
        return $transactionId;
    }
}