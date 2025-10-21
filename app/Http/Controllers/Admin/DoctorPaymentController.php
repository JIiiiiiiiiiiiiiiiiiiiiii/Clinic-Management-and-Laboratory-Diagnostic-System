<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DoctorPayment;
use App\Models\DoctorPaymentBillingLink;
use App\Models\DoctorSummaryReport;
use App\Models\User;
use App\Models\BillingTransaction;
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

            // Get summary statistics
            $summary = [
                'total_paid' => DoctorPayment::where('status', 'paid')->sum('net_payment'),
                'pending_amount' => DoctorPayment::where('status', 'pending')->sum('net_payment'),
                'total_payments' => DoctorPayment::count(),
                'paid_payments' => DoctorPayment::where('status', 'paid')->count(),
            ];

            // Get doctors for filter dropdown
            $doctors = User::where('role', 'doctor')
                ->select('id', 'name')
                ->orderBy('name')
                ->get();

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
            
            $doctors = User::where('role', 'doctor')
                ->select('id', 'name')
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

            $doctors = User::where('role', 'doctor')
                ->select('id', 'name')
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
            $doctors = User::where('role', 'doctor')
                ->select('id', 'name')
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