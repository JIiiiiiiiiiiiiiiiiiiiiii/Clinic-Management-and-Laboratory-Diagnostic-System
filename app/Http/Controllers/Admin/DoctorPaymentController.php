<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DoctorPayment;
use App\Models\DoctorPaymentBillingLink;
use App\Models\DoctorSummaryReport;
use App\Models\User;
use App\Models\BillingTransaction;
use App\Models\DailyTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

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

            // Get summary statistics
            $summary = [
                'total_paid' => DoctorPayment::where('status', 'paid')->sum('net_payment'),
                'pending_amount' => DoctorPayment::where('status', 'pending')->sum('net_payment'),
                'total_payments' => DoctorPayment::count(),
                'paid_payments' => DoctorPayment::where('status', 'paid')->count(),
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

            return Inertia::render('admin/billing/doctor-payments/index', [
                'payments' => $payments,
                'summary' => $summary,
                'doctors' => $doctors,
                'filters' => $request->only(['search', 'status', 'doctor_id', 'date_from', 'date_to']),
            ]);
        } catch (\Exception $e) {
            \Log::error('DoctorPaymentController::index error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to load doctor payments: ' . $e->getMessage()]);
        }
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
                'doctor_id' => 'required|exists:users,id',
                'basic_salary' => 'required|numeric|min:0',
                'deductions' => 'nullable|numeric|min:0',
                'holiday_pay' => 'nullable|numeric|min:0',
                'incentives' => 'nullable|numeric|min:0',
                'payment_date' => 'required|date',
                'status' => 'required|in:pending,paid,cancelled',
                'notes' => 'nullable|string|max:1000',
            ]);

            DB::beginTransaction();

            $basicSalary = $request->basic_salary;
            $deductions = $request->deductions ?? 0;
            $holidayPay = $request->holiday_pay ?? 0;
            $incentives = $request->incentives ?? 0;
            $netPayment = $basicSalary + $holidayPay + $incentives - $deductions;

            $payment = DoctorPayment::create([
                'doctor_id' => $request->doctor_id,
                'basic_salary' => $basicSalary,
                'deductions' => $deductions,
                'holiday_pay' => $holidayPay,
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

            DB::beginTransaction();

            $incentives = $request->incentives;
            $netPayment = $incentives; // For simplified version, net payment = incentives

            $payment = DoctorPayment::create([
                'doctor_id' => $request->doctor_id,
                'basic_salary' => 0, // No basic salary for simplified version
                'deductions' => 0,
                'holiday_pay' => 0,
                'incentives' => $incentives,
                'net_payment' => $netPayment,
                'payment_date' => $request->payment_date,
                'status' => $request->status,
                'notes' => $request->notes,
                'created_by' => auth()->id(),
            ]);

            // Create a billing transaction for this doctor payment
            $billingTransaction = BillingTransaction::create([
                'transaction_id' => 'DP-' . str_pad($payment->id, 6, '0', STR_PAD_LEFT),
                'patient_id' => null, // Doctor payments don't have patients
                'doctor_id' => $request->doctor_id,
                'payment_type' => 'cash', // Use valid enum value
                'total_amount' => $netPayment,
                'amount' => $netPayment,
                'discount_amount' => 0,
                'payment_method' => 'cash',
                'status' => $request->status,
                'description' => "Doctor Payment - Incentives",
                'notes' => $request->notes,
                'transaction_date' => now(),
                'transaction_date_only' => $request->payment_date,
                'transaction_time_only' => now()->toTimeString(),
                'created_by' => auth()->id(),
            ]);

            // Create link between payment and transaction
            DoctorPaymentBillingLink::create([
                'doctor_payment_id' => $payment->id,
                'billing_transaction_id' => $billingTransaction->id,
                'payment_amount' => $netPayment,
                'status' => $request->status,
            ]);

            // If status is paid, mark as paid
            if ($request->status === 'paid') {
                $payment->markAsPaid();
            }

            DB::commit();

            \Log::info('Doctor payment created successfully', [
                'payment_id' => $payment->id,
                'transaction_id' => $billingTransaction->id,
                'amount' => $netPayment
            ]);

            // Return success response for Inertia.js
            return redirect()->route('admin.billing.index', ['tab' => 'transactions'])
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
                'updated_by' => auth()->id(),
            ]);

            // Update billing transaction status
            $billingLink = DoctorPaymentBillingLink::where('doctor_payment_id', $payment->id)->first();
            if ($billingLink) {
                $billingTransaction = BillingTransaction::find($billingLink->billing_transaction_id);
                if ($billingTransaction) {
                    $billingTransaction->update([
                        'status' => 'paid',
                        'updated_by' => auth()->id(),
                    ]);
                }
            }

            // Sync to daily transactions
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
        $billingLink = DoctorPaymentBillingLink::where('doctor_payment_id', $payment->id)->first();
        if (!$billingLink) return;

        $billingTransaction = BillingTransaction::find($billingLink->billing_transaction_id);
        if (!$billingTransaction) return;

        // Check if already synced
        $existing = DailyTransaction::where('original_transaction_id', $billingTransaction->id)
            ->where('original_table', 'billing_transactions')
            ->first();

        if ($existing) {
            // Update existing record
            $existing->update([
                'status' => $billingTransaction->status,
                'payment_method' => $billingTransaction->payment_method,
                'amount' => -$billingTransaction->total_amount, // Negative for doctor payments (expenses)
            ]);
        } else {
            // Create new record
            DailyTransaction::create([
                'transaction_date' => $billingTransaction->transaction_date,
                'transaction_type' => 'doctor_payment',
                'transaction_id' => $billingTransaction->transaction_id,
                'patient_name' => 'Doctor Payment',
                'specialist_name' => $this->getSpecialistName($billingTransaction),
                'amount' => -$billingTransaction->total_amount, // Negative for doctor payments (expenses)
                'payment_method' => $billingTransaction->payment_method,
                'status' => $billingTransaction->status,
                'description' => $billingTransaction->description ?: 'Doctor Payment - Incentives',
                'items_count' => 0,
                'appointments_count' => 0,
                'original_transaction_id' => $billingTransaction->id,
                'original_table' => 'billing_transactions',
            ]);
        }
    }

    /**
     * Get specialist name for daily transaction
     */
    private function getSpecialistName(BillingTransaction $transaction)
    {
        if ($transaction->doctor) {
            return $transaction->doctor->name;
        }
        return 'Unknown';
    }

    /**
     * Display the specified resource.
     */
    public function show(DoctorPayment $doctorPayment)
    {
        try {
            $doctorPayment->load(['doctor', 'createdBy', 'updatedBy', 'billingLinks.billingTransaction']);

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
                'basic_salary' => 'required|numeric|min:0',
                'deductions' => 'nullable|numeric|min:0',
                'holiday_pay' => 'nullable|numeric|min:0',
                'incentives' => 'nullable|numeric|min:0',
                'payment_date' => 'required|date',
                'status' => 'required|in:pending,paid,cancelled',
                'notes' => 'nullable|string|max:1000',
            ]);

            DB::beginTransaction();

            $basicSalary = $request->basic_salary;
            $deductions = $request->deductions ?? 0;
            $holidayPay = $request->holiday_pay ?? 0;
            $incentives = $request->incentives ?? 0;
            $netPayment = $basicSalary + $holidayPay + $incentives - $deductions;

            $doctorPayment->update([
                'doctor_id' => $request->doctor_id,
                'basic_salary' => $basicSalary,
                'deductions' => $deductions,
                'holiday_pay' => $holidayPay,
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

            // Delete related records
            $doctorPayment->billingLinks()->delete();
            $doctorPayment->summaryReports()->delete();
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
     * Add doctor payment to billing transactions
     */
    public function addToTransactions(DoctorPayment $doctorPayment)
    {
        try {
            if ($doctorPayment->status !== 'pending') {
                return back()->withErrors(['error' => 'Only pending payments can be added to transactions.']);
            }

            DB::beginTransaction();

            // Create billing transaction
            $billingTransaction = BillingTransaction::create([
                'patient_id' => null, // Doctor payments don't have patients
                'transaction_type' => 'doctor_payment',
                'amount' => $doctorPayment->net_payment,
                'description' => "Doctor Payment - {$doctorPayment->doctor->name}",
                'status' => 'pending',
                'created_by' => auth()->id(),
            ]);

            // Create link between payment and transaction
            DoctorPaymentBillingLink::create([
                'doctor_payment_id' => $doctorPayment->id,
                'billing_transaction_id' => $billingTransaction->id,
                'payment_amount' => $doctorPayment->net_payment,
                'status' => 'pending',
            ]);

            DB::commit();

            return back()->with('success', 'Doctor payment added to transactions successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('DoctorPaymentController::addToTransactions error: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Failed to add payment to transactions: ' . $e->getMessage()]);
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

            // Update billing links status
            $doctorPayment->billingLinks()->update(['status' => 'paid']);

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
}