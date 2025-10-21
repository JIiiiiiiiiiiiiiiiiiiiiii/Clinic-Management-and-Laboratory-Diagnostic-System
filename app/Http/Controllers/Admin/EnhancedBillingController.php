<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BillingTransaction;
use App\Models\BillingTransactionItem;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use App\Models\HMOProvider;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EnhancedBillingController extends Controller
{
    public function index(): Response
    {
        $analytics = $this->getBillingAnalytics();
        $recentTransactions = $this->getRecentTransactions();
        $pendingPayments = $this->getPendingPayments();
        
        return Inertia::render('Admin/Billing/EnhancedIndex', [
            'analytics' => $analytics,
            'recentTransactions' => $recentTransactions,
            'pendingPayments' => $pendingPayments,
        ]);
    }

    public function getBillingAnalytics(): array
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        $thisYear = Carbon::now()->startOfYear();

        return [
            'overview' => [
                'total_revenue' => BillingTransaction::sum('total_amount'),
                'monthly_revenue' => BillingTransaction::where('transaction_date', '>=', $thisMonth)->sum('total_amount'),
                'today_revenue' => BillingTransaction::whereDate('transaction_date', $today)->sum('total_amount'),
                'average_transaction' => BillingTransaction::avg('total_amount'),
                'total_transactions' => BillingTransaction::count(),
            ],
            'payment_methods' => $this->getPaymentMethodBreakdown(),
            'hmo_providers' => $this->getHMOProviderBreakdown(),
            'monthly_trends' => $this->getMonthlyTrends(),
            'doctor_payments' => $this->getDoctorPaymentBreakdown(),
        ];
    }

    public function getRecentTransactions(): array
    {
        return BillingTransaction::with(['patient', 'doctor', 'appointmentLinks'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'transaction_id' => $transaction->transaction_id,
                    'patient_name' => $transaction->patient->first_name . ' ' . $transaction->patient->last_name,
                    'doctor_name' => $transaction->doctor->name ?? 'N/A',
                    'total_amount' => $transaction->total_amount,
                    'payment_method' => $transaction->payment_method,
                    'status' => $transaction->status,
                    'transaction_date' => $transaction->transaction_date,
                    'items_count' => $transaction->appointmentLinks->count(),
                ];
            });
    }

    public function getPendingPayments(): array
    {
        return BillingTransaction::where('status', 'pending')
            ->with(['patient', 'doctor'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'patient_name' => $transaction->patient->first_name . ' ' . $transaction->patient->last_name,
                    'total_amount' => $transaction->total_amount,
                    'due_date' => $transaction->due_date,
                    'days_overdue' => $transaction->due_date ? Carbon::parse($transaction->due_date)->diffInDays(Carbon::now()) : 0,
                ];
            });
    }

    public function createTransaction(): Response
    {
        $patients = Patient::select('id', 'first_name', 'last_name', 'patient_id')
            ->orderBy('first_name')
            ->get();
        
        $doctors = User::where('role', 'doctor')
            ->select('id', 'name', 'employee_id')
            ->orderBy('name')
            ->get();

        $hmoProviders = HMOProvider::where('is_active', true)
            ->orderBy('name')
            ->get();

        $paymentMethods = PaymentMethod::where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Billing/CreateTransaction', [
            'patients' => $patients,
            'doctors' => $doctors,
            'hmoProviders' => $hmoProviders,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    public function storeTransaction(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:users,id',
            'payment_type' => 'required|in:cash,card,hmo,insurance',
            'payment_method' => 'required|string',
            'hmo_provider' => 'nullable|string',
            'hmo_reference' => 'nullable|string',
            'discount_amount' => 'nullable|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.total' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Calculate totals
            $subtotal = collect($validated['items'])->sum('total');
            $discountAmount = $validated['discount_amount'] ?? 0;
            $discountPercentage = $validated['discount_percentage'] ?? 0;
            
            if ($discountPercentage > 0) {
                $discountAmount = $subtotal * ($discountPercentage / 100);
            }
            
            $totalAmount = $subtotal - $discountAmount;

            // Create transaction
            $transaction = BillingTransaction::create([
                'transaction_id' => $this->generateTransactionId(),
                'patient_id' => $validated['patient_id'],
                'doctor_id' => $validated['doctor_id'],
                'payment_type' => $validated['payment_type'],
                'total_amount' => $totalAmount,
                'discount_amount' => $discountAmount,
                'discount_percentage' => $discountPercentage,
                'hmo_provider' => $validated['hmo_provider'],
                'hmo_reference' => $validated['hmo_reference'],
                'payment_method' => $validated['payment_method'],
                'status' => 'pending',
                'description' => $validated['notes'],
                'transaction_date' => now(),
                'created_by' => auth()->id(),
            ]);

            // Create transaction items
            foreach ($validated['items'] as $item) {
                BillingTransactionItem::create([
                    'billing_transaction_id' => $transaction->id,
                    'item_type' => $item['item_type'] ?? 'other',
                    'item_name' => $item['description'],
                    'item_description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['total'],
                ]);
            }

            DB::commit();

            return redirect()->route('admin.billing.show', $transaction)
                ->with('success', 'Billing transaction created successfully!');
        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to create transaction. Please try again.'])
                ->withInput();
        }
    }

    public function showTransaction(BillingTransaction $transaction): Response
    {
        $transaction->load(['patient', 'doctor', 'items', 'createdBy', 'updatedBy']);
        
        return Inertia::render('Admin/Billing/ShowTransaction', [
            'transaction' => $transaction,
        ]);
    }

    public function processPayment(Request $request, BillingTransaction $transaction)
    {
        $validated = $request->validate([
            'payment_method' => 'required|string',
            'payment_reference' => 'nullable|string',
            'amount_paid' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        try {
            $transaction->update([
                'payment_method' => $validated['payment_method'],
                'payment_reference' => $validated['payment_reference'],
                'status' => 'paid',
                'notes' => $validated['notes'],
                'updated_by' => auth()->id(),
            ]);

            return redirect()->route('admin.billing.show', $transaction)
                ->with('success', 'Payment processed successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to process payment. Please try again.']);
        }
    }

    public function generateReceipt(BillingTransaction $transaction)
    {
        $transaction->load(['patient', 'doctor', 'items']);
        
        return Inertia::render('Admin/Billing/Receipt', [
            'transaction' => $transaction,
        ]);
    }

    public function getFinancialReport(Request $request): Response
    {
        $query = BillingTransaction::query();

        if ($request->filled('date_from')) {
            $query->where('transaction_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('transaction_date', '<=', $request->date_to);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->filled('hmo_provider')) {
            $query->where('hmo_provider', $request->hmo_provider);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $transactions = $query->with(['patient', 'doctor', 'appointmentLinks'])
            ->orderBy('transaction_date', 'desc')
            ->paginate(20);

        $summary = [
            'total_revenue' => $transactions->sum('total_amount'),
            'total_transactions' => $transactions->count(),
            'average_transaction' => $transactions->avg('total_amount'),
            'payment_methods' => $this->getPaymentMethodBreakdown($query),
            'hmo_providers' => $this->getHMOProviderBreakdown($query),
        ];

        return Inertia::render('Admin/Billing/FinancialReport', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $request->only(['date_from', 'date_to', 'payment_method', 'hmo_provider', 'status']),
        ]);
    }

    public function getDoctorPaymentReport(Request $request): Response
    {
        $query = User::where('role', 'doctor');

        if ($request->filled('doctor')) {
            $query->where('id', $request->doctor);
        }

        $doctors = $query->withCount(['billingTransactions as total_transactions'])
            ->withSum('billingTransactions as total_revenue', 'total_amount')
            ->orderBy('name')
            ->get();

        $summary = [
            'total_doctors' => $doctors->count(),
            'total_revenue' => $doctors->sum('total_revenue'),
            'average_revenue' => $doctors->avg('total_revenue'),
        ];

        return Inertia::render('Admin/Billing/DoctorPaymentReport', [
            'doctors' => $doctors,
            'summary' => $summary,
            'filters' => $request->only(['doctor']),
        ]);
    }

    private function generateTransactionId(): string
    {
        $prefix = 'TXN';
        $year = date('Y');
        $month = date('m');
        $sequence = BillingTransaction::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->count() + 1;
        
        return $prefix . $year . $month . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }

    private function getPaymentMethodBreakdown($query = null)
    {
        $query = $query ?? BillingTransaction::query();
        
        return $query->select('payment_method', DB::raw('count(*) as count'), DB::raw('sum(total_amount) as total'))
            ->groupBy('payment_method')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->payment_method => [
                    'count' => $item->count,
                    'total' => $item->total,
                ]];
            });
    }

    private function getHMOProviderBreakdown($query = null)
    {
        $query = $query ?? BillingTransaction::query();
        
        return $query->whereNotNull('hmo_provider')
            ->select('hmo_provider', DB::raw('count(*) as count'), DB::raw('sum(total_amount) as total'))
            ->groupBy('hmo_provider')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->hmo_provider => [
                    'count' => $item->count,
                    'total' => $item->total,
                ]];
            });
    }

    private function getMonthlyTrends(): array
    {
        $last6Months = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $last6Months[] = [
                'month' => $month->format('M Y'),
                'revenue' => BillingTransaction::whereMonth('transaction_date', $month->month)
                    ->whereYear('transaction_date', $month->year)
                    ->sum('total_amount'),
                'transactions' => BillingTransaction::whereMonth('transaction_date', $month->month)
                    ->whereYear('transaction_date', $month->year)
                    ->count(),
            ];
        }
        
        return $last6Months;
    }

    private function getDoctorPaymentBreakdown(): array
    {
        return User::where('role', 'doctor')
            ->withCount('billingTransactions')
            ->withSum('billingTransactions', 'total_amount')
            ->orderBy('billing_transactions_sum_total_amount', 'desc')
            ->limit(10)
            ->get()
            ->mapWithKeys(function ($doctor) {
                return [$doctor->name => [
                    'transactions' => $doctor->billing_transactions_count,
                    'revenue' => $doctor->billing_transactions_sum_total_amount,
                ]];
            });
    }
}
