<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ManualTransaction;
use App\Models\BillingTransaction;
use App\Models\Patient;
use App\Models\Specialist;
use App\Models\HmoProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ManualTransactionController extends Controller
{
    /**
     * Display a listing of manual transactions
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        
        // Check if user has permission to view manual transactions
        if (!$user->hasModulePermission('billing', 'manual_transactions')) {
            abort(403, 'You do not have permission to view manual transactions.');
        }

        $query = ManualTransaction::with(['patient', 'specialist', 'creator']);

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('transaction_id', 'like', "%{$search}%")
                  ->orWhereHas('patient', function ($patientQuery) use ($search) {
                      $patientQuery->where('first_name', 'like', "%{$search}%")
                                  ->orWhere('last_name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('transaction_type') && $request->transaction_type !== 'all') {
            $query->where('transaction_type', $request->transaction_type);
        }

        if ($request->filled('specialist_type') && $request->specialist_type !== 'all') {
            $query->where('specialist_type', $request->specialist_type);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('transaction_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('transaction_date', '<=', $request->date_to);
        }

        $transactions = $query->orderBy('transaction_date', 'desc')->paginate(15);

        // Get summary statistics
        $summary = [
            'total_transactions' => ManualTransaction::count(),
            'pending_transactions' => ManualTransaction::where('status', 'pending')->count(),
            'paid_transactions' => ManualTransaction::where('status', 'paid')->count(),
            'total_revenue' => ManualTransaction::where('status', 'paid')->sum('final_amount') ?? 0,
        ];

        return Inertia::render('admin/manual-transactions/index', [
            'transactions' => $transactions,
            'summary' => $summary,
            'filters' => $request->only(['search', 'status', 'transaction_type', 'specialist_type', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Show the form for creating a new manual transaction
     */
    public function create(): Response
    {
        $user = Auth::user();
        
        // Check if user has permission to create manual transactions
        if (!$user->hasModulePermission('billing', 'manual_transactions')) {
            abort(403, 'You do not have permission to create manual transactions.');
        }

        // Get patients for selection
        $patients = Patient::select('id', 'first_name', 'last_name', 'patient_no')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        // Get specialists (doctors and medtechs) for selection
        $specialists = Specialist::whereIn('role', ['Doctor', 'MedTech'])
            ->where('status', 'Active')
            ->select('specialist_id as id', 'name', 'role', 'specialization')
            ->orderBy('role')
            ->orderBy('name')
            ->get();

        // Get HMO providers - use 'status' column which exists in database
        $hmoProviders = HmoProvider::where('status', 'active')
            ->select('id', 'name', 'code', 'status')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/manual-transactions/create', [
            'patients' => $patients,
            'specialists' => $specialists,
            'hmoProviders' => $hmoProviders,
        ]);
    }

    /**
     * Store a newly created manual transaction
     */
    public function store(Request $request)
    {
        
        $user = Auth::user();
        
        // Check if user has permission to create manual transactions
        if (!$user->hasModulePermission('billing', 'manual_transactions')) {
            abort(403, 'You do not have permission to create manual transactions.');
        }

        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'transaction_type' => 'required|in:consultation,laboratory,radiology,other',
            'specialist_id' => 'nullable|exists:specialists,specialist_id',
            'specialist_type' => 'nullable|in:doctor,medtech,nurse',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,hmo',
            'payment_type' => 'nullable|in:cash,health_card,discount',
            'hmo_provider' => 'nullable|string',
            'hmo_reference_number' => 'nullable|string',
            'payment_reference' => 'nullable|string',
            'is_senior_citizen' => 'boolean',
            'discount_amount' => 'nullable|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
            'transaction_date' => 'required|date',
            'due_date' => 'nullable|date',
            'selected_services' => 'nullable|array',
        ]);

        DB::beginTransaction();
        try {
            $selectedServices = $request->selected_services ?? [];
            $transactions = [];
            
            
            
            // Service pricing
            $servicePrices = [
                'general_consultation' => 350,
                'consultation' => 350,
                'cbc' => 245,
                'fecalysis_test' => 90,
                'fecalysis' => 90,
                'urinarysis_test' => 140,
                'urinalysis' => 140,
            ];
            
            // If no selected services, create single transaction with provided data
            if (empty($selectedServices)) {
                
                // Calculate senior discount - only apply to consultation portion
                $seniorDiscountAmount = 0;
                if ($request->is_senior_citizen && $request->payment_method !== 'hmo') {
                    // For mixed transactions (amount = 1800), only apply discount to consultation portion (300)
                    if ($request->amount >= 1800) {
                        // This is likely a mixed transaction (consultation + lab tests)
                        // Only apply senior discount to consultation portion (₱300)
                        $seniorDiscountAmount = 300 * 0.20; // ₱60
                    } else {
                        // This might be consultation only
                        $seniorDiscountAmount = $request->amount * 0.20;
                    }
                }

                $regularDiscountAmount = $request->discount_amount ?? 0;
                if ($request->discount_percentage > 0) {
                    $regularDiscountAmount = $request->amount * ($request->discount_percentage / 100);
                }

                $finalAmount = $request->amount - $seniorDiscountAmount - $regularDiscountAmount;

                // Create manual transaction
                $manualTransaction = ManualTransaction::create([
                    'patient_id' => $request->patient_id,
                    'specialist_id' => $request->specialist_id,
                    'transaction_type' => $request->transaction_type,
                    'specialist_type' => $request->specialist_type,
                    'amount' => $request->amount, // Store original amount before discounts
                    'payment_method' => $request->payment_method,
                    'payment_type' => $request->payment_type ?? 'cash',
                    'hmo_provider' => $request->hmo_provider,
                    'hmo_reference_number' => $request->hmo_reference_number,
                    'payment_reference' => $request->payment_reference,
                    'is_senior_citizen' => $request->is_senior_citizen ?? false,
                    'senior_discount_amount' => $seniorDiscountAmount,
                    'senior_discount_percentage' => $seniorDiscountAmount > 0 ? 20.00 : 0,
                    'discount_amount' => $regularDiscountAmount,
                    'discount_percentage' => $request->discount_percentage ?? 0,
                    'final_amount' => $finalAmount, // Store final amount after discounts
                    'status' => 'pending',
                    'description' => $request->description,
                    'notes' => $request->notes,
                    'transaction_date' => $request->transaction_date,
                    'transaction_time' => now()->format('H:i:s'),
                    'due_date' => $request->due_date,
                    'created_by' => $user->id,
                ]);
                
                // Also create billing transaction for the main billing table
                $billingTransaction = BillingTransaction::create([
                    'transaction_id' => 'MT-' . str_pad($manualTransaction->id, 6, '0', STR_PAD_LEFT),
                    'patient_id' => $request->patient_id,
                    'doctor_id' => $request->specialist_id,
                    'payment_type' => $request->payment_type ?? 'cash',
                    'total_amount' => $request->amount, // Use original amount before discounts
                    'amount' => $finalAmount, // Use final amount after discounts
                    'discount_amount' => $regularDiscountAmount,
                    'discount_percentage' => $request->discount_percentage ?? 0,
                    'is_senior_citizen' => $request->is_senior_citizen ?? false,
                    'senior_discount_amount' => $seniorDiscountAmount,
                    'senior_discount_percentage' => $seniorDiscountAmount > 0 ? 20.00 : 0,
                    'hmo_provider' => $request->hmo_provider,
                    'hmo_reference' => $request->hmo_reference_number,
                    'hmo_reference_number' => $request->hmo_reference_number,
                    'payment_method' => $request->payment_method,
                    'payment_reference' => $request->payment_reference,
                    'status' => 'pending',
                    'is_itemized' => true, // Mark as itemized since we'll create items
                    'description' => $request->description,
                    'notes' => $request->notes,
                    'transaction_date' => $request->transaction_date,
                    'transaction_date_only' => $request->transaction_date,
                    'transaction_time_only' => now()->format('H:i:s'),
                    'due_date' => $request->due_date,
                    'created_by' => $user->id,
                ]);
                
                // Create items based on the transaction amount
                $items = [];
                if ($request->amount >= 1800) {
                    // Mixed transaction (consultation + 3 lab tests)
                    $items = [
                        ['type' => 'consultation', 'name' => 'Consultation', 'price' => 350],
                        ['type' => 'laboratory', 'name' => 'Complete Blood Count (CBC)', 'price' => 245],
                        ['type' => 'laboratory', 'name' => 'Fecalysis Test', 'price' => 90],
                        ['type' => 'laboratory', 'name' => 'Urinalysis Test', 'price' => 140],
                    ];
                } elseif ($request->amount == 350 || $request->amount == 300) {
                    // Consultation only (keeping 300 for backward compatibility)
                    $items = [
                        ['type' => 'consultation', 'name' => 'Consultation', 'price' => $request->amount == 350 ? 350 : 350],
                    ];
                } elseif ($request->amount == 245) {
                    // CBC lab test only
                    $items = [
                        ['type' => 'laboratory', 'name' => 'Complete Blood Count (CBC)', 'price' => 245],
                    ];
                } elseif ($request->amount == 140) {
                    // Urinalysis test only
                    $items = [
                        ['type' => 'laboratory', 'name' => 'Urinalysis Test', 'price' => 140],
                    ];
                } elseif ($request->amount == 90) {
                    // Fecalysis test only
                    $items = [
                        ['type' => 'laboratory', 'name' => 'Fecalysis Test', 'price' => 90],
                    ];
                }
                
                foreach ($items as $item) {
                    \App\Models\BillingTransactionItem::create([
                        'billing_transaction_id' => $billingTransaction->id,
                        'item_type' => $item['type'],
                        'item_name' => $item['name'],
                        'item_description' => $item['name'],
                        'quantity' => 1,
                        'unit_price' => $item['price'],
                        'total_price' => $item['price'],
                    ]);
                }
                
                $transactions[] = $manualTransaction;
            } else {
                // Calculate total transaction amount first
                $totalTransactionAmount = 0;
                foreach ($selectedServices as $serviceType => $quantity) {
                    if ($quantity <= 0) continue;
                    $servicePrice = $servicePrices[$serviceType] ?? 0;
                    $totalTransactionAmount += $servicePrice * $quantity;
                }
                
                // Calculate senior discount only on consultation services
                $totalSeniorDiscount = 0;
                $consultationAmount = 0;
                if ($request->is_senior_citizen && $request->payment_method !== 'hmo') {
                    // Only apply senior discount to consultation services
                    if (isset($selectedServices['general_consultation']) && $selectedServices['general_consultation'] > 0) {
                        $consultationAmount = $servicePrices['general_consultation'] * $selectedServices['general_consultation'];
                        $totalSeniorDiscount = $consultationAmount * 0.20; // 20% discount only on consultation
                    }
                }
                
                // Calculate regular discount on total amount
                $totalRegularDiscount = 0;
                if ($request->discount_percentage > 0) {
                    $totalRegularDiscount = $totalTransactionAmount * ($request->discount_percentage / 100);
                } elseif ($request->discount_amount > 0) {
                    $totalRegularDiscount = $request->discount_amount;
                }
                
                $totalFinalAmount = $totalTransactionAmount - $totalSeniorDiscount - $totalRegularDiscount;
                
                
                // Create single manual transaction for the entire transaction
                $manualTransaction = ManualTransaction::create([
                    'patient_id' => $request->patient_id,
                    'specialist_id' => $request->specialist_id,
                    'transaction_type' => $request->transaction_type,
                    'specialist_type' => 'doctor', // Default to doctor for mixed services
                    'amount' => $totalTransactionAmount, // Store original amount before discounts
                    'payment_method' => $request->payment_method,
                    'payment_type' => $request->payment_type ?? 'cash',
                    'hmo_provider' => $request->hmo_provider,
                    'hmo_reference_number' => $request->hmo_reference_number,
                    'payment_reference' => $request->payment_reference,
                    'is_senior_citizen' => $request->is_senior_citizen ?? false,
                    'senior_discount_amount' => $totalSeniorDiscount,
                    'senior_discount_percentage' => $totalSeniorDiscount > 0 ? 20.00 : 0,
                    'discount_amount' => $totalRegularDiscount,
                    'discount_percentage' => $request->discount_percentage ?? 0,
                    'final_amount' => $totalFinalAmount,
                    'status' => 'pending',
                    'description' => $request->description,
                    'notes' => $request->notes,
                    'transaction_date' => $request->transaction_date,
                    'transaction_time' => now()->format('H:i:s'),
                    'due_date' => $request->due_date,
                    'created_by' => $user->id,
                ]);
                
                // Create single billing transaction for the main billing table
                $billingTransaction = BillingTransaction::create([
                    'transaction_id' => 'MT-' . str_pad($manualTransaction->id, 6, '0', STR_PAD_LEFT),
                    'patient_id' => $request->patient_id,
                    'doctor_id' => $request->specialist_id,
                    'payment_type' => $request->payment_type ?? 'cash',
                    'total_amount' => $totalTransactionAmount, // Store original amount before discounts
                    'amount' => $totalFinalAmount, // Store final amount after discounts
                    'discount_amount' => $totalRegularDiscount,
                    'discount_percentage' => $request->discount_percentage ?? 0,
                    'is_senior_citizen' => $request->is_senior_citizen ?? false,
                    'senior_discount_amount' => $totalSeniorDiscount,
                    'senior_discount_percentage' => $totalSeniorDiscount > 0 ? 20.00 : 0,
                    'hmo_provider' => $request->hmo_provider,
                    'hmo_reference' => $request->hmo_reference_number,
                    'hmo_reference_number' => $request->hmo_reference_number,
                    'payment_method' => $request->payment_method,
                    'payment_reference' => $request->payment_reference,
                    'status' => 'pending',
                    'is_itemized' => true, // Mark as itemized since we have items
                    'description' => $request->description,
                    'notes' => $request->notes,
                    'transaction_date' => $request->transaction_date,
                    'transaction_date_only' => $request->transaction_date,
                    'transaction_time_only' => now()->format('H:i:s'),
                    'due_date' => $request->due_date,
                    'created_by' => $user->id,
                ]);
                
                // Create billing transaction items for each selected service
                $serviceNames = [
                    'general_consultation' => 'General Consultation',
                    'cbc' => 'Complete Blood Count (CBC)',
                    'fecalysis_test' => 'Fecalysis Test',
                    'urinarysis_test' => 'Urinarysis Test',
                ];
                
                foreach ($selectedServices as $serviceType => $quantity) {
                    if ($quantity <= 0) continue;
                    
                    $servicePrice = $servicePrices[$serviceType] ?? 0;
                    $serviceAmount = $servicePrice * $quantity;
                    
                    $item = \App\Models\BillingTransactionItem::create([
                        'billing_transaction_id' => $billingTransaction->id,
                        'item_type' => $serviceType === 'general_consultation' ? 'consultation' : 'laboratory',
                        'item_name' => $serviceNames[$serviceType] ?? $serviceType,
                        'item_description' => $serviceNames[$serviceType] ?? $serviceType,
                        'quantity' => $quantity,
                        'unit_price' => $servicePrice,
                        'total_price' => $serviceAmount, // Store original amount without discounts at item level
                    ]);
                    
                    // Debug: Log each item creation
                    \Log::info('Created billing transaction item:', [
                        'id' => $item->id,
                        'billing_transaction_id' => $item->billing_transaction_id,
                        'item_name' => $item->item_name,
                        'item_type' => $item->item_type,
                        'total_price' => $item->total_price
                    ]);
                }
                
                $transactions[] = $manualTransaction;
            }

            DB::commit();

            $transactionCount = count($transactions);
            $message = $transactionCount === 1 
                ? 'Transaction created successfully.' 
                : "{$transactionCount} transactions created successfully.";

            return redirect()->route('admin.billing.index')
                ->with('success', $message);

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to create manual transaction: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified manual transaction
     */
    public function show(ManualTransaction $manualTransaction): Response
    {
        $user = Auth::user();
        
        // Check if user has permission to view manual transactions
        if (!$user->hasModulePermission('billing', 'manual_transactions')) {
            abort(403, 'You do not have permission to view manual transactions.');
        }

        $manualTransaction->load(['patient', 'specialist', 'creator']);

        // Get the corresponding billing transaction with items
        $billingTransaction = \App\Models\BillingTransaction::where('transaction_id', 'MT-' . str_pad($manualTransaction->id, 6, '0', STR_PAD_LEFT))
            ->with(['items', 'patient', 'doctor', 'createdBy'])
            ->first();


        return Inertia::render('admin/manual-transactions/show', [
            'transaction' => $manualTransaction,
            'billingTransaction' => $billingTransaction,
        ]);
    }

    /**
     * Show the form for editing the specified manual transaction
     */
    public function edit(ManualTransaction $manualTransaction): Response
    {
        $user = Auth::user();
        
        // Check if user has permission to edit manual transactions
        if (!$user->hasModulePermission('billing', 'manual_transactions')) {
            abort(403, 'You do not have permission to edit manual transactions.');
        }

        // Get patients for selection
        $patients = Patient::select('id', 'first_name', 'last_name', 'patient_no')
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        // Get specialists (doctors and medtechs) for selection
        $specialists = Specialist::whereIn('role', ['Doctor', 'MedTech'])
            ->where('status', 'Active')
            ->select('specialist_id as id', 'name', 'role', 'specialization')
            ->orderBy('role')
            ->orderBy('name')
            ->get();

        // Get HMO providers - use 'status' column which exists in database
        $hmoProviders = HmoProvider::where('status', 'active')
            ->select('id', 'name', 'code', 'status')
            ->orderBy('name')
            ->get();

        $manualTransaction->load(['patient', 'specialist']);

        return Inertia::render('admin/manual-transactions/edit', [
            'transaction' => $manualTransaction,
            'patients' => $patients,
            'specialists' => $specialists,
            'hmoProviders' => $hmoProviders,
        ]);
    }

    /**
     * Update the specified manual transaction
     */
    public function update(Request $request, ManualTransaction $manualTransaction)
    {
        $user = Auth::user();
        
        // Check if user has permission to edit manual transactions
        if (!$user->hasModulePermission('billing', 'manual_transactions')) {
            abort(403, 'You do not have permission to edit manual transactions.');
        }

        $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'transaction_type' => 'required|in:consultation,laboratory,radiology,other',
            'specialist_id' => 'nullable|exists:specialists,specialist_id',
            'specialist_type' => 'nullable|in:doctor,medtech,nurse',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,hmo',
            'payment_type' => 'nullable|in:cash,health_card,discount',
            'hmo_provider' => 'nullable|string',
            'hmo_reference_number' => 'nullable|string',
            'payment_reference' => 'nullable|string',
            'is_senior_citizen' => 'boolean',
            'discount_amount' => 'nullable|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
            'transaction_date' => 'required|date',
            'due_date' => 'nullable|date',
            'status' => 'required|in:pending,paid,cancelled',
        ]);

        DB::beginTransaction();
        try {
            // Calculate discounts
            $seniorDiscountAmount = 0;
            if ($request->is_senior_citizen && $request->payment_method !== 'hmo' && $request->transaction_type === 'consultation') {
                $seniorDiscountAmount = $request->amount * 0.20; // 20% senior citizen discount only on consultation
            }

            $regularDiscountAmount = $request->discount_amount ?? 0;
            if ($request->discount_percentage > 0) {
                $regularDiscountAmount = $request->amount * ($request->discount_percentage / 100);
            }

            $finalAmount = $request->amount - $seniorDiscountAmount - $regularDiscountAmount;

            // Update manual transaction
            $manualTransaction->update([
                'patient_id' => $request->patient_id,
                'specialist_id' => $request->specialist_id,
                'transaction_type' => $request->transaction_type,
                'specialist_type' => $request->specialist_type,
                'amount' => $request->amount,
                'payment_method' => $request->payment_method,
                'payment_type' => $request->payment_type ?? 'cash',
                'hmo_provider' => $request->hmo_provider,
                'hmo_reference_number' => $request->hmo_reference_number,
                'payment_reference' => $request->payment_reference,
                'is_senior_citizen' => $request->is_senior_citizen ?? false,
                'senior_discount_amount' => $seniorDiscountAmount,
                'senior_discount_percentage' => $seniorDiscountAmount > 0 ? 20.00 : 0,
                'discount_amount' => $regularDiscountAmount,
                'discount_percentage' => $request->discount_percentage ?? 0,
                'final_amount' => $finalAmount,
                'status' => $request->status,
                'description' => $request->description,
                'notes' => $request->notes,
                'transaction_date' => $request->transaction_date,
                'due_date' => $request->due_date,
                'updated_by' => $user->id,
            ]);

            DB::commit();

            return redirect()->route('admin.billing.index')
                ->with('success', 'Transaction updated successfully.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Failed to update manual transaction: ' . $e->getMessage()]);
        }
    }

    /**
     * Update the status of the specified manual transaction
     */
    public function updateStatus(Request $request, ManualTransaction $manualTransaction)
    {
        $user = Auth::user();
        
        // Check if user has permission to update manual transactions
        if (!$user->hasModulePermission('billing', 'manual_transactions')) {
            abort(403, 'You do not have permission to update manual transactions.');
        }

        $request->validate([
            'status' => 'required|in:pending,paid,cancelled',
        ]);

        $manualTransaction->update([
            'status' => $request->status,
            'updated_by' => $user->id,
        ]);

        // Also update the corresponding billing transaction
        $billingTransaction = \App\Models\BillingTransaction::where('transaction_id', 'MT-' . str_pad($manualTransaction->id, 6, '0', STR_PAD_LEFT))->first();
        if ($billingTransaction) {
            $billingTransaction->update([
                'status' => $request->status,
                'updated_by' => $user->id,
            ]);
        }

        return back()->with('success', 'Transaction status updated successfully.');
    }

    /**
     * Remove the specified manual transaction
     */
    public function destroy(ManualTransaction $manualTransaction)
    {
        $user = Auth::user();
        
        // Check if user has permission to delete manual transactions
        if (!$user->hasModulePermission('billing', 'manual_transactions')) {
            abort(403, 'You do not have permission to delete manual transactions.');
        }

        // Only allow deletion of pending transactions
        if ($manualTransaction->status !== 'pending') {
            return back()->withErrors(['error' => 'Only pending transactions can be deleted.']);
        }

        $manualTransaction->delete();

        return redirect()->route('admin.billing.index')
            ->with('success', 'Transaction deleted successfully.');
    }
}
