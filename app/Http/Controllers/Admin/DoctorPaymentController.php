<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DoctorPayment;
use App\Models\DoctorSummaryReport;
use App\Models\User;
use App\Models\DailyTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class DoctorPaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = DoctorPayment::with(['doctor', 'createdBy', 'updatedBy'])
                ->orderBy('created_at', 'desc');

            // Default to today's payments if no date filter is specified
            if (!$request->filled('date') && !$request->filled('date_from') && !$request->filled('date_to')) {
                // Use Asia/Manila timezone for Philippines
                $today = now('Asia/Manila')->toDateString();
                \Log::info('Defaulting to today\'s payments:', [
                    'today' => $today,
                    'now()' => now()->toString(),
                    'now(Asia/Manila)' => now('Asia/Manila')->toString(),
                    'timezone' => config('app.timezone')
                ]);
                $query->whereDate('payment_date', $today);
            }

            // Apply filters
            if ($request->filled('search')) {
                $search = $request->search;
                $query->whereHas('doctor', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhere('notes', 'like', "%{$search}%");
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('doctor_id')) {
                $query->where('doctor_id', $request->doctor_id);
            }

            // Handle single date filter (for today's payments)
            if ($request->filled('date')) {
                \Log::info('Filtering by date:', [
                    'requested_date' => $request->date,
                    'now()' => now()->toDateString(),
                    'now(Asia/Manila)' => now('Asia/Manila')->toDateString(),
                    'timezone' => config('app.timezone')
                ]);
                $query->whereDate('payment_date', $request->date);
            }

            if ($request->filled('date_from')) {
                $query->where('payment_date', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->where('payment_date', '<=', $request->date_to);
            }

            $payments = $query->paginate(15)->withQueryString();

            // Debug: Log the first payment data
            if ($payments->count() > 0) {
                \Log::info('First payment data:', [
                    'payment_id' => $payments->first()->id,
                    'doctor_id' => $payments->first()->doctor_id,
                    'doctor_loaded' => $payments->first()->relationLoaded('doctor'),
                    'doctor_name' => $payments->first()->doctor ? $payments->first()->doctor->name : 'NULL'
                ]);
            }

            // Get summary statistics (respecting date filter)
            $summaryQuery = DoctorPayment::query();
            if ($request->filled('date')) {
                $summaryQuery->whereDate('payment_date', $request->date);
            } elseif (!$request->filled('date_from') && !$request->filled('date_to')) {
                // Default to today's data if no date filters are specified
                $summaryQuery->whereDate('payment_date', now()->toDateString());
            }
            
            $summary = [
                'total_paid' => (clone $summaryQuery)->where('status', 'paid')->sum('net_payment'),
                'pending_amount' => (clone $summaryQuery)->where('status', 'pending')->sum('net_payment'),
                'total_payments' => $summaryQuery->count(),
                'paid_payments' => (clone $summaryQuery)->where('status', 'paid')->count(),
            ];

            // Get doctors for filter dropdown
            $doctors = \App\Models\Specialist::where('role', 'Doctor')
                ->select('specialist_id as id', 'name')
                ->orderBy('name')
                ->get();

            // Debug: Log the actual data being sent to frontend
            \Log::info('Data being sent to frontend:', [
                'payments_count' => $payments->count(),
                'first_payment_doctor' => $payments->count() > 0 ? [
                    'doctor_id' => $payments->first()->doctor_id,
                    'doctor_name' => $payments->first()->doctor ? $payments->first()->doctor->name : 'NULL',
                    'doctor_loaded' => $payments->first()->relationLoaded('doctor')
                ] : 'No payments',
                'doctors_count' => $doctors->count(),
                'first_doctor' => $doctors->count() > 0 ? $doctors->first() : 'No doctors'
            ]);

            // Debug: Check if the doctor relationship is properly loaded
            if ($payments->count() > 0) {
                $firstPayment = $payments->first();
                \Log::info('First payment doctor relationship:', [
                    'doctor_id' => $firstPayment->doctor_id,
                    'doctor_loaded' => $firstPayment->relationLoaded('doctor'),
                    'doctor_object' => $firstPayment->doctor ? [
                        'specialist_id' => $firstPayment->doctor->specialist_id,
                        'name' => $firstPayment->doctor->name,
                        'role' => $firstPayment->doctor->role
                    ] : 'NULL'
                ]);
            }

            return Inertia::render('admin/billing/doctor-payments', [
                'doctorPayments' => $payments,
                'summary' => $summary,
                'doctors' => $doctors,
                'filters' => $request->only(['search', 'status', 'doctor_id', 'date', 'date_from', 'date_to']),
            ]);
        } catch (\Exception $e) {
            \Log::error('DoctorPaymentController::index error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to load doctor payments: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the doctor daily report page
     */
    public function dailyReport(Request $request)
    {
        $date = $request->get('date', now()->format('Y-m-d'));
        $doctorId = $request->get('doctor_id');
        $status = $request->get('status');
        
        // Get doctor payments for the specific date
        $query = DoctorPayment::with(['doctor'])
            ->whereDate('payment_date', $date);
            
        if ($doctorId && $doctorId !== 'all') {
            $query->where('doctor_id', $doctorId);
        }
        
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }
        
        $doctorPayments = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'doctor_id' => $payment->doctor_id,
                    'doctor_name' => $payment->doctor?->name,
                    'doctor_specialization' => $payment->doctor?->specialization ?? 'N/A',
                    'payment_date' => $payment->payment_date,
                    'total_incentives' => $payment->incentives,
                    'total_net_payment' => $payment->net_payment,
                    'payment_count' => 1, // Individual payment
                    'average_payment' => $payment->net_payment,
                    'status' => $payment->status,
                    'description' => $payment->notes,
                ];
            });
        
        // Calculate summary statistics
        $summary = [
            'total_payments' => $doctorPayments->count(),
            'total_amount' => $doctorPayments->sum('total_net_payment'),
            'paid_amount' => $doctorPayments->where('status', 'paid')->sum('total_net_payment'),
            'pending_amount' => $doctorPayments->where('status', 'pending')->sum('total_net_payment'),
            'average_payment' => $doctorPayments->count() > 0 ? $doctorPayments->avg('total_net_payment') : 0,
            'total_doctors' => $doctorPayments->unique('doctor_id')->count(),
            'highest_paid_doctor' => $doctorPayments->sortByDesc('total_net_payment')->first()?->doctor_name ?? 'N/A',
            'lowest_paid_doctor' => $doctorPayments->sortBy('total_net_payment')->first()?->doctor_name ?? 'N/A',
        ];
        
        return Inertia::render('admin/billing/doctor-daily-report', [
            'doctorPayments' => $doctorPayments,
            'summary' => $summary,
            'date' => $date,
            'doctorId' => $doctorId,
            'status' => $status,
        ]);
    }

    /**
     * Display the doctor monthly report page
     */
    public function monthlyReport(Request $request)
    {
        $month = $request->get('month', now()->format('Y-m'));
        $doctorId = $request->get('doctor_id');
        $status = $request->get('status');
        
        // Get doctor payments for the specific month
        $query = DoctorPayment::with(['doctor'])
            ->whereYear('payment_date', substr($month, 0, 4))
            ->whereMonth('payment_date', substr($month, 5, 2));
            
        if ($doctorId && $doctorId !== 'all') {
            $query->where('doctor_id', $doctorId);
        }
        
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }
        
        $doctorPayments = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'doctor_id' => $payment->doctor_id,
                    'doctor_name' => $payment->doctor?->name,
                    'doctor_specialization' => $payment->doctor?->specialization ?? 'N/A',
                    'payment_date' => $payment->payment_date,
                    'total_incentives' => $payment->incentives,
                    'total_net_payment' => $payment->net_payment,
                    'payment_count' => 1,
                    'average_payment' => $payment->net_payment,
                    'status' => $payment->status,
                    'description' => $payment->notes,
                ];
            });
        
        // Calculate summary statistics
        $totalPayments = $doctorPayments->count();
        $totalAmount = $doctorPayments->sum('total_net_payment');
        $paidAmount = $doctorPayments->where('status', 'paid')->sum('total_net_payment');
        $pendingAmount = $doctorPayments->where('status', 'pending')->sum('total_net_payment');
        
        // Calculate days in month for average daily payments
        $daysInMonth = date('t', strtotime($month . '-01'));
        $averageDailyPayments = $daysInMonth > 0 ? $totalPayments / $daysInMonth : 0;
        
        $summary = [
            'total_payments' => $totalPayments,
            'total_amount' => $totalAmount,
            'paid_amount' => $paidAmount,
            'pending_amount' => $pendingAmount,
            'average_payment' => $totalPayments > 0 ? $totalAmount / $totalPayments : 0,
            'total_doctors' => $doctorPayments->unique('doctor_id')->count(),
            'average_daily_payments' => round($averageDailyPayments, 1),
            'highest_paid_doctor' => $doctorPayments->sortByDesc('total_net_payment')->first()?->doctor_name ?? 'N/A',
            'lowest_paid_doctor' => $doctorPayments->sortBy('total_net_payment')->first()?->doctor_name ?? 'N/A',
        ];
        
        return Inertia::render('admin/billing/doctor-monthly-report', [
            'doctorPayments' => $doctorPayments,
            'summary' => $summary,
            'month' => $month,
            'doctorId' => $doctorId,
            'status' => $status,
        ]);
    }

    /**
     * Display the doctor yearly report page
     */
    public function yearlyReport(Request $request)
    {
        $year = $request->get('year', now()->format('Y'));
        $doctorId = $request->get('doctor_id');
        $status = $request->get('status');
        
        // Get doctor payments for the specific year
        $query = DoctorPayment::with(['doctor'])
            ->whereYear('payment_date', $year);
            
        if ($doctorId && $doctorId !== 'all') {
            $query->where('doctor_id', $doctorId);
        }
        
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }
        
        $doctorPayments = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'doctor_id' => $payment->doctor_id,
                    'doctor_name' => $payment->doctor?->name,
                    'doctor_specialization' => $payment->doctor?->specialization ?? 'N/A',
                    'payment_date' => $payment->payment_date,
                    'total_incentives' => $payment->incentives,
                    'total_net_payment' => $payment->net_payment,
                    'payment_count' => 1,
                    'average_payment' => $payment->net_payment,
                    'status' => $payment->status,
                    'description' => $payment->notes,
                ];
            });
        
        // Calculate summary statistics
        $totalPayments = $doctorPayments->count();
        $totalAmount = $doctorPayments->sum('total_net_payment');
        $paidAmount = $doctorPayments->where('status', 'paid')->sum('total_net_payment');
        $pendingAmount = $doctorPayments->where('status', 'pending')->sum('total_net_payment');
        
        // Calculate average monthly payments
        $averageMonthlyPayments = $totalPayments / 12;
        
        // Calculate year-over-year growth (simplified - would need previous year data)
        $yearOverYearGrowth = 0; // This would need to be calculated with previous year data
        
        $summary = [
            'total_payments' => $totalPayments,
            'total_amount' => $totalAmount,
            'paid_amount' => $paidAmount,
            'pending_amount' => $pendingAmount,
            'average_payment' => $totalPayments > 0 ? $totalAmount / $totalPayments : 0,
            'total_doctors' => $doctorPayments->unique('doctor_id')->count(),
            'average_monthly_payments' => round($averageMonthlyPayments, 1),
            'highest_paid_doctor' => $doctorPayments->sortByDesc('total_net_payment')->first()?->doctor_name ?? 'N/A',
            'lowest_paid_doctor' => $doctorPayments->sortBy('total_net_payment')->first()?->doctor_name ?? 'N/A',
            'year_over_year_growth' => $yearOverYearGrowth,
        ];
        
        return Inertia::render('admin/billing/doctor-yearly-report', [
            'doctorPayments' => $doctorPayments,
            'summary' => $summary,
            'year' => $year,
            'doctorId' => $doctorId,
            'status' => $status,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
            \Log::info('DoctorPaymentController::create method called');
            
            $doctors = \App\Models\Specialist::where('role', 'Doctor')
                ->when(\Schema::hasColumn('specialists', 'status'), function($query) {
                    return $query->where('status', 'Active');
                })
                ->select('specialist_id as id', 'name', 'specialization')
                ->orderBy('name')
                ->get();
            
            \Log::info('Doctors found: ' . $doctors->count());
            if ($doctors->count() > 0) {
                \Log::info('First doctor: ' . $doctors->first()->name);
            }

            return Inertia::render('admin/billing/doctor-payments/create', [
                'doctors' => $doctors,
            ]);
        } catch (\Exception $e) {
            \Log::error('DoctorPaymentController::create error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to load create form: ' . $e->getMessage()]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            \Log::info('DoctorPaymentController::store method called');
            \Log::info('Request data: ' . json_encode($request->all()));
            
            $request->validate([
                'doctor_id' => 'required|exists:specialists,specialist_id',
                'incentives' => 'nullable|numeric|min:0',
                'payment_date' => 'required|date',
                'status' => 'required|in:pending,paid,cancelled',
                'notes' => 'nullable|string|max:1000',
            ]);

            // Check for duplicate payment for the same doctor on the same date
            $netPayment = $request->incentives ?? 0;
            $existingPayment = DoctorPayment::where('doctor_id', $request->doctor_id)
                ->where('payment_date', $request->payment_date)
                ->where('net_payment', $netPayment)
                ->where('status', 'pending')
                ->first();

            if ($existingPayment) {
                return back()->withErrors(['error' => 'A payment for this doctor on this date with the same amount already exists.']);
            }

            DB::beginTransaction();

            $incentives = $request->incentives ?? 0;
            $netPayment = $incentives;

            $payment = DoctorPayment::create([
                'doctor_id' => $request->doctor_id,
                'incentives' => $incentives,
                'net_payment' => $netPayment,
                'payment_date' => $request->payment_date,
                'status' => $request->status,
                'notes' => $request->notes,
                'created_by' => auth()->id(),
            ]);

            // If status is paid, create summary report
            if ($request->status === 'paid') {
                $payment->markAsPaid();
            }

            DB::commit();

            return redirect()->route('admin.billing.doctor-payments.index')
                ->with('success', 'Doctor payment created successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('DoctorPaymentController::store error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to create doctor payment: ' . $e->getMessage()]);
        }
    }

    /**
     * Store a simplified doctor payment (incentives only)
     */
    public function storeSimple(Request $request)
    {
        try {
            \Log::info('=== DOCTOR PAYMENT STORE SIMPLE CALLED ===');
            \Log::info('DoctorPaymentController::storeSimple method called');
            \Log::info('Request data: ' . json_encode($request->all()));
            \Log::info('Request method: ' . $request->method());
            \Log::info('Request URL: ' . $request->fullUrl());
            \Log::info('Auth user: ' . (auth()->user() ? auth()->user()->name : 'Not authenticated'));
            \Log::info('Request headers: ' . json_encode($request->headers->all()));
            \Log::info('Request IP: ' . $request->ip());
            
            // Check if specialists table exists and has data
            $specialistCount = \App\Models\Specialist::count();
            \Log::info('Specialists count: ' . $specialistCount);
            
            // Log the doctor_id being sent
            \Log::info('Doctor ID from request: ' . $request->doctor_id);
            
            // Check if the specific doctor exists
            $doctorExists = \App\Models\Specialist::where('specialist_id', $request->doctor_id)->exists();
            \Log::info('Doctor exists: ' . ($doctorExists ? 'Yes' : 'No'));
            
            if ($specialistCount === 0) {
                return back()->withErrors(['doctor_id' => 'No specialists found in the database.']);
            }
            
            $request->validate([
                'doctor_id' => 'required|exists:specialists,specialist_id',
                'incentives' => 'required|numeric|min:0',
                'payment_date' => 'required|date',
                'status' => 'required|in:pending,paid,cancelled',
                'notes' => 'nullable|string|max:1000',
            ]);

            // Check for duplicate payment for the same doctor on the same date
            $existingPayment = DoctorPayment::where('doctor_id', $request->doctor_id)
                ->where('payment_date', $request->payment_date)
                ->where('incentives', $request->incentives)
                ->where('status', 'pending')
                ->first();

            if ($existingPayment) {
                return back()->withErrors(['error' => 'A payment for this doctor on this date with the same amount already exists.']);
            }

            DB::beginTransaction();

            $incentives = $request->incentives;
            $netPayment = $incentives; // For simplified version, net payment = incentives

            $payment = DoctorPayment::create([
                'doctor_id' => $request->doctor_id,
                'incentives' => $incentives,
                'net_payment' => $netPayment,
                'payment_date' => $request->payment_date,
                'status' => $request->status,
                'notes' => $request->notes,
                'created_by' => auth()->id(),
            ]);

            // Doctor payments are managed independently - no need for billing transactions

            // If status is paid, mark as paid
            if ($request->status === 'paid') {
                $payment->markAsPaid();
            }

            DB::commit();

            \Log::info('Doctor payment created successfully', [
                'payment_id' => $payment->id,
                'amount' => $netPayment
            ]);

            // Return success response for Inertia.js
            return redirect()->route('admin.billing.doctor-payments.index')
                ->with('success', 'Doctor payment created successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('DoctorPaymentController::storeSimple error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to create doctor payment: ' . $e->getMessage()]);
        }
    }

    /**
     * Mark doctor payment as paid
     */
    public function markPaid(Request $request, $id)
    {
        try {
            $payment = DoctorPayment::findOrFail($id);
            
            if ($payment->status === 'paid') {
                return back()->withErrors(['error' => 'Payment is already marked as paid.']);
            }

            DB::beginTransaction();

            // Update doctor payment status
            $payment->update([
                'status' => 'paid',
                'paid_date' => now()->toDateString(),
                'updated_by' => auth()->id(),
            ]);

            // Sync to daily transactions directly (no need for billing transaction links)
            $this->syncDoctorPaymentToDailyTransactions($payment);

            DB::commit();

            \Log::info('Doctor payment marked as paid', [
                'payment_id' => $payment->id,
                'amount' => $payment->net_payment
            ]);

            return back()->with('success', 'Doctor payment marked as paid successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('DoctorPaymentController::markPaid error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to mark payment as paid: ' . $e->getMessage()]);
        }
    }

    /**
     * Sync doctor payment to daily transactions
     */
    private function syncDoctorPaymentToDailyTransactions(DoctorPayment $payment)
    {
        // Check if already synced
        $existing = DailyTransaction::where('original_transaction_id', $payment->id)
            ->where('original_table', 'doctor_payments')
            ->first();

        if ($existing) {
            // Update existing record
            $existing->update([
                'status' => $payment->status,
                'amount' => -$payment->net_payment, // Negative for doctor payments (expenses)
            ]);
        } else {
            // Create new record
            DailyTransaction::create([
                'transaction_date' => $payment->payment_date,
                'transaction_type' => 'doctor_payment',
                'transaction_id' => 'DP-' . str_pad($payment->id, 6, '0', STR_PAD_LEFT),
                'patient_name' => 'Doctor Payment',
                'specialist_name' => $payment->doctor ? $payment->doctor->name : 'Unknown Doctor',
                'amount' => -$payment->net_payment, // Negative for doctor payments (expenses)
                'payment_method' => 'cash', // Default for doctor payments
                'status' => $payment->status,
                'description' => 'Doctor Payment - ' . ($payment->doctor ? $payment->doctor->name : 'Unknown'),
                'items_count' => 0,
                'appointments_count' => 0,
                'original_transaction_id' => $payment->id,
                'original_table' => 'doctor_payments',
            ]);
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(DoctorPayment $doctorPayment)
    {
        try {
            $doctorPayment->load(['doctor', 'createdBy', 'updatedBy']);

            return Inertia::render('admin/billing/doctor-payments/show', [
                'payment' => $doctorPayment,
            ]);
        } catch (\Exception $e) {
            \Log::error('DoctorPaymentController::show error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to load payment details: ' . $e->getMessage()]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DoctorPayment $doctorPayment)
    {
        try {
            if (!$doctorPayment->canBeEdited()) {
                return back()->withErrors(['error' => 'This payment cannot be edited.']);
            }

            $doctors = \App\Models\Specialist::where('role', 'Doctor')
                ->select('specialist_id as id', 'name')
                ->orderBy('name')
                ->get();

            return Inertia::render('admin/billing/doctor-payments/edit', [
                'payment' => $doctorPayment,
                'doctors' => $doctors,
            ]);
        } catch (\Exception $e) {
            \Log::error('DoctorPaymentController::edit error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to load edit form: ' . $e->getMessage()]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DoctorPayment $doctorPayment)
    {
        try {
            if (!$doctorPayment->canBeEdited()) {
                return back()->withErrors(['error' => 'This payment cannot be edited.']);
            }

            $request->validate([
                'doctor_id' => 'required|exists:users,id',
                'incentives' => 'nullable|numeric|min:0',
                'payment_date' => 'required|date',
                'status' => 'required|in:pending,paid,cancelled',
                'notes' => 'nullable|string|max:1000',
            ]);

            DB::beginTransaction();

            $incentives = $request->incentives ?? 0;
            $netPayment = $incentives;

            $doctorPayment->update([
                'doctor_id' => $request->doctor_id,
                'incentives' => $incentives,
                'net_payment' => $netPayment,
                'payment_date' => $request->payment_date,
                'status' => $request->status,
                'notes' => $request->notes,
                'updated_by' => auth()->id(),
            ]);

            // If status changed to paid, create summary report
            if ($request->status === 'paid' && $doctorPayment->status !== 'paid') {
                $doctorPayment->markAsPaid();
            }

            DB::commit();

            return redirect()->route('admin.billing.doctor-payments.index')
                ->with('success', 'Doctor payment updated successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('DoctorPaymentController::update error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to update doctor payment: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DoctorPayment $doctorPayment)
    {
        try {
            if (!$doctorPayment->canBeCancelled()) {
                return back()->withErrors(['error' => 'This payment cannot be deleted.']);
            }

            DB::beginTransaction();

            // Delete the doctor payment
            $doctorPayment->delete();

            DB::commit();

            return redirect()->route('admin.billing.doctor-payments.index')
                ->with('success', 'Doctor payment deleted successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('DoctorPaymentController::destroy error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to delete doctor payment: ' . $e->getMessage()]);
        }
    }


    /**
     * Mark doctor payment as paid
     */
    public function markAsPaid(DoctorPayment $doctorPayment)
    {
        try {
            if (!$doctorPayment->canBePaid()) {
                return back()->withErrors(['error' => 'This payment cannot be marked as paid.']);
            }

            DB::beginTransaction();

            $doctorPayment->markAsPaid();

            DB::commit();

            return back()->with('success', 'Doctor payment marked as paid successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('DoctorPaymentController::markAsPaid error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to mark payment as paid: ' . $e->getMessage()]);
        }
    }

    /**
     * Show doctor summary report
     */
    public function summary(Request $request)
    {
        try {
            $query = DoctorSummaryReport::with(['doctor', 'payment', 'createdBy'])
                ->orderBy('payment_date', 'desc');

            // Apply filters
            if ($request->filled('doctor_id')) {
                $query->where('doctor_id', $request->doctor_id);
            }

            if ($request->filled('date_from')) {
                $query->where('payment_date', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->where('payment_date', '<=', $request->date_to);
            }

            $reports = $query->paginate(15)->withQueryString();

            // Get summary statistics
            $summary = [
                'total_paid' => DoctorSummaryReport::sum('total_paid'),
                'total_reports' => DoctorSummaryReport::count(),
                'doctors_count' => DoctorSummaryReport::distinct('doctor_id')->count(),
            ];

            // Get doctors for filter dropdown
            $doctors = \App\Models\Specialist::where('role', 'Doctor')
                ->select('specialist_id as id', 'name')
                ->orderBy('name')
                ->get();

            return Inertia::render('admin/billing/doctor-payments/summary', [
                'reports' => $reports,
                'summary' => $summary,
                'doctors' => $doctors,
                'filters' => $request->only(['doctor_id', 'date_from', 'date_to']),
            ]);
        } catch (\Exception $e) {
            \Log::error('DoctorPaymentController::summary error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to load summary report: ' . $e->getMessage()]);
        }
    }

    /**
     * Show doctor summary report (main doctor summary page)
     */
    public function doctorSummary(Request $request)
    {
        try {
            // Handle different parameter formats based on report type
            $reportType = $request->get('report_type', 'daily');
            
            if ($reportType === 'daily') {
                $date = $request->get('date', now()->format('Y-m-d'));
                $filters = [
                    'date_from' => $date,
                    'date_to' => $date,
                    'report_type' => 'daily',
                    'doctor_id' => $request->get('doctor_id', 'all'),
                    'status' => $request->get('status', 'all'),
                ];
            } elseif ($reportType === 'monthly') {
                $month = $request->get('month', now()->format('Y-m'));
                $filters = [
                    'date_from' => $month . '-01',
                    'date_to' => \Carbon\Carbon::parse($month)->endOfMonth()->format('Y-m-d'),
                    'report_type' => 'monthly',
                    'doctor_id' => $request->get('doctor_id', 'all'),
                    'status' => $request->get('status', 'all'),
                ];
            } elseif ($reportType === 'yearly') {
                $year = $request->get('year', now()->format('Y'));
                $filters = [
                    'date_from' => $year . '-01-01',
                    'date_to' => $year . '-12-31',
                    'report_type' => 'yearly',
                    'doctor_id' => $request->get('doctor_id', 'all'),
                    'status' => $request->get('status', 'all'),
                ];
            } else {
                // Fallback to date range
                $filters = [
                    'date_from' => $request->get('date_from', now()->subDays(30)->format('Y-m-d')),
                    'date_to' => $request->get('date_to', now()->format('Y-m-d')),
                    'report_type' => 'daily',
                    'doctor_id' => $request->get('doctor_id', 'all'),
                    'status' => $request->get('status', 'all'),
                ];
            }

            $doctors = \App\Models\Specialist::where('role', 'Doctor')
                ->when(\Schema::hasColumn('specialists', 'status'), function($query) {
                    return $query->where('status', 'Active');
                })
                ->select('specialist_id as id', 'name', 'specialization')
                ->orderBy('name')
                ->get();

            // Use the DoctorPaymentReportService to get the data
            $reportService = new \App\Services\DoctorPaymentReportService();
            $reportData = $reportService->getReportData($filters);
            $summary = $reportService->getSummaryStatistics($filters);

            return Inertia::render('admin/billing/doctor-summary', [
                'reportData' => $reportData,
                'summary' => $summary,
                'doctors' => $doctors,
                'filters' => $filters,
            ]);
        } catch (\Exception $e) {
            \Log::error('DoctorPaymentController::doctorSummary error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return back()->withErrors(['error' => 'Failed to load doctor summary: ' . $e->getMessage()]);
        }
    }

    /**
     * Export doctor summary report
     */
    public function exportDoctorSummary(Request $request)
    {
        try {
            \Log::info('Export request received', $request->all());
            
            // Handle different parameter formats based on report type
            $reportType = $request->get('report_type', 'daily');
            
            if ($reportType === 'daily') {
                $date = $request->get('date', now()->format('Y-m-d'));
                $filters = [
                    'date_from' => $date,
                    'date_to' => $date,
                    'report_type' => 'daily',
                    'doctor_id' => $request->get('doctor_id', 'all'),
                    'status' => $request->get('status', 'all'),
                    'format' => $request->get('format', 'excel'),
                ];
            } elseif ($reportType === 'monthly') {
                $month = $request->get('month', now()->format('Y-m'));
                $filters = [
                    'date_from' => $month . '-01',
                    'date_to' => \Carbon\Carbon::parse($month)->endOfMonth()->format('Y-m-d'),
                    'report_type' => 'monthly',
                    'doctor_id' => $request->get('doctor_id', 'all'),
                    'status' => $request->get('status', 'all'),
                    'format' => $request->get('format', 'excel'),
                ];
            } elseif ($reportType === 'yearly') {
                $year = $request->get('year', now()->format('Y'));
                $filters = [
                    'date_from' => $year . '-01-01',
                    'date_to' => $year . '-12-31',
                    'report_type' => 'yearly',
                    'doctor_id' => $request->get('doctor_id', 'all'),
                    'status' => $request->get('status', 'all'),
                    'format' => $request->get('format', 'excel'),
                ];
            } else {
                // Fallback to date range
                $filters = [
                    'date_from' => $request->get('date_from', now()->subDays(30)->format('Y-m-d')),
                    'date_to' => $request->get('date_to', now()->format('Y-m-d')),
                    'report_type' => 'daily',
                    'doctor_id' => $request->get('doctor_id', 'all'),
                    'status' => $request->get('status', 'all'),
                    'format' => $request->get('format', 'excel'),
                ];
            }

            \Log::info('Export filters', $filters);

            $reportService = new \App\Services\DoctorPaymentReportService();
            $reportData = $reportService->getReportData($filters);
            $summary = $reportService->getSummaryStatistics($filters);

            \Log::info('Export data count', ['count' => count($reportData)]);

            if ($filters['format'] === 'excel') {
                $filename = 'doctor-summary-' . $reportType . '-' . now()->format('Y-m-d-H-i-s') . '.xlsx';
                return Excel::download(new \App\Exports\DoctorPaymentReportExport($reportData, $summary, $filters), $filename);
            } else {
                // PDF export
                $filename = 'doctor-summary-' . $reportType . '-' . now()->format('Y-m-d-H-i-s') . '.pdf';
                
                // Convert logo to base64 for PDF
                $logoPath = public_path('st-james-logo.png');
                $logoBase64 = null;
                if (file_exists($logoPath)) {
                    $logoData = file_get_contents($logoPath);
                    $logoBase64 = 'data:image/png;base64,' . base64_encode($logoData);
                }

                $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('exports.doctor-summary-pdf', [
                    'reportData' => $reportData,
                    'summary' => $summary,
                    'filters' => $filters,
                    'logoBase64' => $logoBase64
                ])->setPaper('a4', 'portrait')
                  ->setOptions([
                      'isHtml5ParserEnabled' => true,
                      'isRemoteEnabled' => false,
                      'defaultFont' => 'Arial'
                  ]);
                
                return $pdf->download($filename);
            }
        } catch (\Exception $e) {
            \Log::error('DoctorPaymentController::exportDoctorSummary error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return back()->withErrors(['error' => 'Failed to export doctor summary: ' . $e->getMessage()]);
        }
    }
}