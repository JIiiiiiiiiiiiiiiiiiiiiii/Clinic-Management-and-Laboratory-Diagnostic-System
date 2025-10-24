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

class BillingController extends Controller
{
    public function index(Request $request)
    {
        try {
            
            // Load necessary relationships for the frontend
            $query = BillingTransaction::with(['patient', 'doctor', 'appointments']);

            // Apply filters
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('transaction_code', 'like', "%{$search}%")
                      ->orWhere('reference_no', 'like', "%{$search}%")
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

            if ($request->filled('doctor_id') && $request->doctor_id !== 'all') {
                $query->where('doctor_id', $request->doctor_id);
            }

            if ($request->filled('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $transactions = $query->orderBy('created_at', 'desc')->paginate(15);
            

            // Transform transactions to match frontend expectations
            $transactions->getCollection()->transform(function ($transaction) {
                // Ensure patient data is properly formatted
                if ($transaction->patient) {
                    $transaction->patient->patient_no = $transaction->patient->patient_no ?? 'N/A';
                }
                
                // Ensure doctor data is properly formatted
                if ($transaction->doctor) {
                    $transaction->doctor_name = $transaction->doctor->name;
                }
                
                return $transaction;
            });

            // Get pending appointments for billing
            $pendingAppointments = Appointment::where('billing_status', 'pending')
                ->with(['patient', 'specialist', 'labTests.labTest'])
                ->orderBy('appointment_date', 'asc')
                ->get();
                

        // Get summary statistics
        $summary = [
                'total_revenue' => BillingTransaction::where('status', 'paid')->sum('total_amount') ?? 0,
                'pending_amount' => BillingTransaction::where('status', 'pending')->sum('total_amount') ?? 0,
                'total_transactions' => BillingTransaction::count(),
                'paid_transactions' => BillingTransaction::where('status', 'paid')->count(),
        ];

        // Get specialists for filter
        $doctors = \App\Models\Specialist::where('role', 'Doctor')
            ->when(\Schema::hasColumn('specialists', 'status'), function($query) {
                return $query->where('status', 'Active');
            })
            ->select('specialist_id as id', 'name', 'specialization')
            ->orderBy('name')
            ->get();

            \Log::info('Billing data being sent to frontend:', [
                'transactions_count' => $transactions->count(),
                'pending_appointments_count' => $pendingAppointments->count(),
                'summary' => $summary,
                'doctors_count' => $doctors->count(),
            ]);


            // Load doctor payments data
            $doctorPayments = \App\Models\DoctorPayment::with('doctor')->orderBy('created_at', 'desc')
                ->paginate(15);


            // Load reports data
            $dateFrom = $request->get('date_from', now()->startOfMonth()->format('Y-m-d'));
            $dateTo = $request->get('date_to', now()->endOfMonth()->format('Y-m-d'));
            
            $revenueData = BillingTransaction::where('status', 'paid')
                ->whereBetween('transaction_date', [$dateFrom, $dateTo])
                ->selectRaw('DATE(transaction_date) as date, SUM(total_amount) as amount')
                ->groupBy('date')
                ->orderBy('date')
                ->get();


            $doctorPaymentData = \App\Models\DoctorPayment::where('status', 'paid')
                ->whereBetween('payment_date', [$dateFrom, $dateTo])
                ->selectRaw('DATE(payment_date) as date, SUM(net_payment) as amount')
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            // Enhanced summary with all data
            $enhancedSummary = [
                'total_revenue' => BillingTransaction::where('status', 'paid')->sum('total_amount') ?? 0,
                'pending_amount' => BillingTransaction::where('status', 'pending')->sum('total_amount') ?? 0,
                'total_transactions' => BillingTransaction::count(),
                'paid_transactions' => BillingTransaction::where('status', 'paid')->count(),
                'total_doctor_payments' => \App\Models\DoctorPayment::where('status', 'paid')->sum('net_payment') ?? 0,
                'net_profit' => (BillingTransaction::where('status', 'paid')->sum('total_amount') ?? 0) - 
                               (\App\Models\DoctorPayment::where('status', 'paid')->sum('net_payment') ?? 0),
            ];


        return Inertia::render('admin/billing/index', [
            'transactions' => $transactions,
                'pendingAppointments' => $pendingAppointments,
                'doctorPayments' => $doctorPayments,
                'revenueData' => $revenueData,
                'doctorPaymentData' => $doctorPaymentData,
                'summary' => $enhancedSummary,
            'doctors' => $doctors,
            'filters' => $request->only(['search', 'status', 'payment_method', 'doctor_id', 'date_from', 'date_to']),
            'defaultTab' => $request->get('tab', 'transactions'),
            'debug' => [
                'transactions_count' => $transactions->count(),
                'transactions_total' => $transactions->total(),
                'doctor_payments_count' => $doctorPayments->count(),
            ]
        ]);
        } catch (\Exception $e) {
            \Log::error('Billing index error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            \Log::error('Error details: ' . $e->getFile() . ':' . $e->getLine());
            
            // Return a comprehensive fallback with all required data
            return Inertia::render('admin/billing/index', [
                'transactions' => (object) [
                    'data' => [], 
                    'links' => [], 
                    'meta' => [
                        'current_page' => 1,
                        'last_page' => 1,
                        'per_page' => 15,
                        'total' => 0
                    ]
                ],
                'pendingAppointments' => [],
                'doctorPayments' => (object) [
                    'data' => [],
                    'links' => [],
                    'meta' => [
                        'current_page' => 1,
                        'last_page' => 1,
                        'per_page' => 15,
                        'total' => 0
                    ]
                ],
                'revenueData' => [],
                'doctorPaymentData' => [],
                'summary' => [
                    'total_revenue' => 0,
                    'pending_amount' => 0,
                    'total_transactions' => 0,
                    'paid_transactions' => 0,
                    'total_doctor_payments' => 0,
                    'net_profit' => 0,
                ],
                'doctors' => [],
                'filters' => $request->only(['search', 'status', 'payment_method', 'doctor_id', 'date_from', 'date_to']),
                'defaultTab' => $request->get('tab', 'transactions'),
                'debug' => [
                    'transactions_count' => 0,
                    'transactions_total' => 0,
                    'doctor_payments_count' => 0,
                    'expenses_count' => 0,
                ]
            ]);
        }
    }

    public function create()
    {
        $patients = Patient::select('id', 'first_name', 'last_name', 'patient_no')->get();
        $doctors = User::where('role', 'doctor')->select('id', 'name')->get();
        $labTests = LabTest::select('id', 'name', 'code', 'price')->get();
        $hmoProviders = \App\Models\HmoProvider::where('is_active', true)
            ->select('id', 'name', 'code', 'is_active')
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
        \Log::info('Request URL: ' . request()->fullUrl());
        \Log::info('Request parameters: ' . json_encode(request()->all()));
        
        $pendingAppointments = Appointment::pendingBilling()
            ->with(['billingLinks', 'labTests.labTest'])
            ->orderBy('appointment_date', 'asc')
            ->get();

        $doctors = User::where('role', 'doctor')->select('id', 'name')->get();
        $hmoProviders = \App\Models\HmoProvider::where('is_active', true)
            ->select('id', 'name', 'code', 'is_active')
            ->orderBy('name')
            ->get();

        // Get the appointment_id from the request to pre-select it
        $selectedAppointmentId = request()->get('appointment_id');
        \Log::info('Selected appointment ID: ' . $selectedAppointmentId);

        \Log::info('Pending appointments found: ' . $pendingAppointments->count());
        \Log::info('Doctors found: ' . $doctors->count());
        \Log::info('HMO providers found: ' . $hmoProviders->count());

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
        \Log::info('Request method: ' . $request->method());
        \Log::info('Request URL: ' . $request->fullUrl());
        \Log::info('Request data: ' . json_encode($request->all()));
        \Log::info('User authenticated: ' . (auth()->check() ? 'Yes' : 'No'));
        \Log::info('User ID: ' . (auth()->id() ?? 'No user'));
        
        
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
                ->with(['labTests.labTest']) // Load lab tests relationship
                ->get();

            \Log::info('Found appointments: ' . $appointments->count());
            \Log::info('Appointment IDs: ' . $appointments->pluck('id')->toJson());
            \Log::info('Request appointment IDs: ' . json_encode($request->appointment_ids));

            if ($appointments->isEmpty()) {
                \Log::warning('No valid pending appointments found');
                \Log::warning('Requested IDs: ' . json_encode($request->appointment_ids));
                
                // Check what appointments exist with these IDs
                $allAppointments = Appointment::whereIn('id', $request->appointment_ids)->get();
                \Log::warning('All appointments with these IDs: ' . $allAppointments->map(function($apt) {
                    return "ID: {$apt->id}, Status: {$apt->status}, Billing Status: " . ($apt->billing_status ?? 'NULL');
                })->toJson());
                
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
            \Log::info('Total amount (including lab tests): ' . $totalAmount);
            \Log::info('Lab test amount: ' . $totalLabAmount);

            // Calculate senior citizen discount
            $isSeniorCitizen = $request->boolean('is_senior_citizen', false);
            $consultationAppointments = $appointments->filter(function($apt) {
                return in_array($apt->appointment_type, ['consultation', 'general_consultation']);
            });
            
            // Calculate senior citizen discount - only apply to consultation portion (not lab tests)
            $consultationAmount = $consultationAppointments->sum('price');
            $seniorDiscountAmount = $isSeniorCitizen && $request->payment_method !== 'hmo' ? ($consultationAmount * 0.20) : 0;
            $finalAmount = $totalAmount - $seniorDiscountAmount;

            // Generate unique transaction ID (increment like patient ID)
            $transactionId = $this->getNextAvailableTransactionId();
            \Log::info('Generated transaction ID: ' . $transactionId);

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
            $transactionData = [
                'transaction_id' => $transactionId,
                'appointment_id' => $firstAppointment->id,
                'patient_id' => $patientId,
                'doctor_id' => $doctorId,
                'payment_type' => 'cash',
                'total_amount' => $totalAmount, // Original amount before discount
                'amount' => $finalAmount, // Final amount after discount
                'discount_amount' => 0, // Regular discount amount (not senior citizen)
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
            
            \Log::info('Billing transaction created with ID: ' . $transaction->id);
            
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
                // Create consultation item
                \App\Models\BillingTransactionItem::create([
                    'billing_transaction_id' => $transaction->id,
                    'item_type' => 'consultation',
                    'item_name' => ucfirst($appointment->appointment_type) . ' Appointment',
                    'item_description' => "Appointment for {$appointment->patient_name} on {$appointment->appointment_date->format('M d, Y')} at {$appointment->appointment_time->format('g:i A')}",
                    'quantity' => 1,
                    'unit_price' => $appointment->price,
                    'total_price' => $appointment->price
                ]);

                // Create lab test items if any
                if ($appointment->total_lab_amount > 0) {
                    $labTests = $appointment->labTests()->with('labTest')->get();
                    foreach ($labTests as $appointmentLabTest) {
                        \App\Models\BillingTransactionItem::create([
                            'billing_transaction_id' => $transaction->id,
                            'item_type' => 'laboratory',
                            'lab_test_id' => $appointmentLabTest->lab_test_id,
                            'item_name' => $appointmentLabTest->labTest->name,
                            'item_description' => "Lab test: {$appointmentLabTest->labTest->name}",
                            'quantity' => 1,
                            'unit_price' => $appointmentLabTest->unit_price,
                            'total_price' => $appointmentLabTest->total_price
                        ]);
                    }
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
            \Log::error('Transaction creation failed: ' . $e->getMessage());
            \Log::error('Exception trace: ' . $e->getTraceAsString());
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
            'payment_method' => 'required|in:cash,hmo',
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

            return back()->with('success', 'Transaction marked as paid successfully!');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to mark transaction as paid. Please try again.']);
        }
    }

    public function store(Request $request)
    {
        
        // SYSTEM-WIDE FIX: Ensure all appointments have valid specialist data
        \App\Helpers\SystemWideSpecialistBillingHelper::validateAllAppointments();
        \App\Helpers\SystemWideSpecialistBillingHelper::fixAllBillingTransactions();
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'nullable|exists:users,id',
            'payment_type' => 'required|in:cash,health_card,discount',
            'payment_method' => 'required|in:cash,hmo',
            'total_amount' => 'required|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'hmo_provider' => 'nullable|string|max:255',
            'hmo_reference' => 'nullable|string|max:255',
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
        ]);

        DB::beginTransaction();
        try {
            // Generate transaction ID (increment like patient ID)
            $transactionId = $this->getNextAvailableTransactionId();

            // Create billing transaction
            $transactionDate = \Carbon\Carbon::parse($request->transaction_date);
            $transaction = BillingTransaction::create([
                'transaction_id' => $transactionId,
                'patient_id' => $request->patient_id,
                'doctor_id' => $request->doctor_id,
                'payment_type' => $request->payment_type,
                'total_amount' => $request->total_amount,
                'amount' => $request->total_amount,
                'discount_amount' => $request->discount_amount ?? 0,
                'discount_percentage' => $request->discount_percentage,
                'hmo_provider' => $request->hmo_provider,
                'hmo_reference' => $request->hmo_reference,
                'payment_method' => $request->payment_method,
                'payment_reference' => $request->payment_reference,
                'status' => 'pending',
                'description' => $request->description,
                'notes' => $request->notes,
                'transaction_date' => $transactionDate,
                'transaction_date_only' => $transactionDate->toDateString(),
                'transaction_time_only' => $transactionDate->toTimeString(),
                'due_date' => $request->due_date,
                'created_by' => auth()->id(),
            ]);

            // Create transaction items
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

            return redirect()->route('admin.billing.index')
                ->with('success', 'Billing transaction created successfully.');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to create billing transaction. Please try again.']);
        }
    }

    public function show(BillingTransaction $transaction)
    {
        \Log::info('Billing show method called for transaction ID: ' . $transaction->id);
        
        // Load all necessary relationships
        $transaction->load(['patient', 'doctor', 'items', 'appointmentLinks.appointment.patient', 'createdBy', 'updatedBy']);
        
        // Use the new helper methods to get patient and doctor info
        $patientInfo = $transaction->getPatientInfo();
        $doctorInfo = $transaction->getDoctorInfo();
        
        if ($patientInfo) {
            $transaction->setRelation('patient', $patientInfo);
        }
        
        if ($doctorInfo) {
            $transaction->setRelation('doctor', $doctorInfo);
        }
        
        // Check if transaction has itemized billing (with lab tests)
        if ($transaction->items()->exists()) {
            // Use actual billing transaction items (includes consultation + lab tests)
            $itemsCollection = $transaction->items;
            $transaction->setRelation('items', $itemsCollection);
        } else {
            // Create items from appointment links (legacy billing)
            if ($transaction->appointmentLinks->isNotEmpty()) {
                $appointmentItems = [];
                foreach ($transaction->appointmentLinks as $link) {
                    $appointment = $link->appointment;
                    if ($appointment) {
                        $appointmentItems[] = (object) [
                            'id' => $link->id,
                            'item_type' => 'consultation',
                            'item_name' => ucfirst($appointment->appointment_type) . ' Appointment',
                            'item_description' => "Appointment for {$appointment->patient_name} on {$appointment->appointment_date->format('M d, Y')} at {$appointment->appointment_time->format('g:i A')}",
                            'quantity' => 1,
                            'unit_price' => $appointment->price,
                            'total_price' => $appointment->price,
                        ];
                        
                        // Add lab test items if they exist
                        if ($appointment->total_lab_amount > 0) {
                            $labTests = $appointment->labTests()->with('labTest')->get();
                            foreach ($labTests as $appointmentLabTest) {
                                $appointmentItems[] = (object) [
                                    'id' => 'lab_' . $appointmentLabTest->id,
                                    'item_type' => 'laboratory',
                                    'item_name' => $appointmentLabTest->labTest->name,
                                    'item_description' => "Lab test: {$appointmentLabTest->labTest->name}",
                                    'quantity' => 1,
                                    'unit_price' => $appointmentLabTest->unit_price,
                                    'total_price' => $appointmentLabTest->total_price,
                                ];
                            }
                        }
                    }
                }
                $itemsCollection = collect($appointmentItems);
                $transaction->setRelation('items', $itemsCollection);
            } else {
                // No appointment links, set empty collection
                $itemsCollection = collect();
                $transaction->setRelation('items', $itemsCollection);
            }
        }
        
        // Update transaction amounts if appointment has lab tests
        if ($transaction->appointmentLinks->isNotEmpty()) {
            $appointment = $transaction->appointmentLinks->first()->appointment;
            if ($appointment && $appointment->final_total_amount > $appointment->price) {
                // Calculate new amounts preserving senior citizen discount
                $newTotalAmount = $appointment->final_total_amount;
                $newAmount = $newTotalAmount;
                
                // If senior citizen discount exists, apply it to the new total
                if ($transaction->is_senior_citizen && $transaction->senior_discount_amount > 0) {
                    // Calculate the senior discount percentage based on consultation items only (not lab tests)
                    $consultationItems = $transaction->appointmentLinks->filter(function($link) {
                        return in_array($link->appointment->appointment_type, ['consultation', 'general_consultation']);
                    });
                    $consultationAmount = $consultationItems->sum('appointment_price');
                    $seniorDiscountAmount = $consultationAmount * 0.20; // 20% discount only on consultation
                    $newAmount = $newTotalAmount - $seniorDiscountAmount;
                    
                    // Update the senior discount amount
                    $transaction->update([
                        'total_amount' => $newTotalAmount,
                        'amount' => $newAmount,
                        'senior_discount_amount' => $seniorDiscountAmount
                    ]);
                } else {
                    // No senior citizen discount, just update amounts
                    $transaction->update([
                        'total_amount' => $newTotalAmount,
                        'amount' => $newAmount
                    ]);
                }
            }
        }

        \Log::info('Transaction loaded with relationships:', [
            'id' => $transaction->id,
            'transaction_id' => $transaction->transaction_id,
            'status' => $transaction->status,
            'total_amount' => $transaction->total_amount,
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
        $doctors = User::where('role', 'doctor')->select('id', 'name')->get();
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
            return redirect()->route('admin.billing.index')
                ->with('error', 'This transaction cannot be edited.');
        }

        
        // SYSTEM-WIDE FIX: Ensure all appointments have valid specialist data
        \App\Helpers\SystemWideSpecialistBillingHelper::validateAllAppointments();
        \App\Helpers\SystemWideSpecialistBillingHelper::fixAllBillingTransactions();
        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'nullable|exists:users,id',
            'payment_type' => 'required|in:cash,health_card,discount',
            'payment_method' => 'required|in:cash,hmo',
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

        DB::beginTransaction();
        try {
            // Update transaction
            $transaction->update([
                'patient_id' => $request->patient_id,
                'doctor_id' => $request->doctor_id,
                'payment_type' => $request->payment_type,
                'total_amount' => $request->total_amount,
                'discount_amount' => $request->discount_amount ?? 0,
                'discount_percentage' => $request->discount_percentage,
                'hmo_provider' => $request->hmo_provider,
                'hmo_reference' => $request->hmo_reference,
                'payment_method' => $request->payment_method,
                'payment_reference' => $request->payment_reference,
                'status' => $request->status,
                'description' => $request->description,
                'notes' => $request->notes,
                'transaction_date' => $request->transaction_date,
                'due_date' => $request->due_date,
                'updated_by' => auth()->id(),
            ]);

            // Note: No items table, items are derived from appointmentLinks
            // $transaction->items()->delete(); // Commented out - items relationship doesn't exist
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

            return redirect()->route('admin.billing.index')
                ->with('success', 'Billing transaction updated successfully.');
        } catch (\Exception $e) {
            DB::rollback();
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
            'total_amount' => $transaction->total_amount,
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
        if ($transaction->items->isEmpty() && $transaction->total_amount > 0) {
            \Log::error('No items found for transaction ' . $transaction->transaction_id . ' - this indicates a data integrity issue');
        }
        
        \Log::info('Receipt data loaded:', [
            'transaction_id' => $transaction->transaction_id,
            'total_amount' => $transaction->total_amount,
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
        // Export functionality - placeholder for now
        return response()->json(['message' => 'Export functionality will be implemented']);
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