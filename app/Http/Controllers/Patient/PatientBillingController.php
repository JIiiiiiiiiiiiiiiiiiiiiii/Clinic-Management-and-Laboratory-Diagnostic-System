<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\BillingTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientBillingController extends Controller
{
    /**
     * Display the patient's billing history.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        // Try to find patient by user_id, or by email if user_id doesn't match
        $patient = Patient::where('user_id', $user->id)->first();
        
        // If patient not found by user_id, try to find by email
        if (!$patient && $user->email) {
            \Log::info('Patient not found by user_id, trying to find by email', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
            $patient = Patient::where('email', $user->email)->first();
        }
        
        $transactions = collect([]);
        
        if ($patient) {
            \Log::info('Loading billing transactions for patient', [
                'patient_id' => $patient->id,
                'patient_no' => $patient->patient_no,
                'user_id' => $user->id,
                'user_email' => $user->email,
                'patient_email' => $patient->email ?? null,
            ]);
            
            // Get all billing transactions for this patient from the database
            // BillingTransaction.patient_id references Patient.id (integer)
            // Use created_at instead of transaction_date (which doesn't exist in database)
            $transactions = BillingTransaction::where('patient_id', $patient->id)
                ->with(['patient', 'doctor', 'items', 'createdBy'])
                ->orderBy('created_at', 'desc')
                ->get();
            
            \Log::info('Billing transactions loaded', [
                'patient_id' => $patient->id,
                'transactions_count' => $transactions->count(),
                'sample_transaction' => $transactions->first() ? [
                    'id' => $transactions->first()->id,
                    'patient_id' => $transactions->first()->patient_id,
                    'amount' => $transactions->first()->amount,
                ] : null,
            ]);
            
            $transactions = $transactions->map(function ($transaction) {
                    return [
                        'id' => $transaction->id,
                        'transaction_id' => $transaction->transaction_id, // Accessor
                        'transaction_code' => $transaction->transaction_code, // Actual database column
                        'patient' => $transaction->patient ? [
                            'id' => $transaction->patient->id,
                            'first_name' => $transaction->patient->first_name,
                            'last_name' => $transaction->patient->last_name,
                            'patient_no' => $transaction->patient->patient_no,
                        ] : null,
                        'doctor' => $transaction->doctor ? [
                            'id' => $transaction->doctor->specialist_id ?? null,
                            'name' => $transaction->doctor->name ?? 'N/A',
                            'role' => $transaction->doctor->role ?? 'Doctor',
                        ] : null,
                        'payment_method' => $transaction->payment_method ?? 'cash',
                        'total_amount' => (float) $transaction->total_amount, // Accessor (maps to amount)
                        'amount' => (float) $transaction->amount, // Actual database column
                        'is_senior_citizen' => $transaction->is_senior_citizen ?? false,
                        'senior_discount_amount' => (float) ($transaction->senior_discount_amount ?? 0),
                        'senior_discount_percentage' => $transaction->senior_discount_percentage ? (float) $transaction->senior_discount_percentage : null,
                        'hmo_provider_id' => $transaction->hmo_provider_id,
                        'hmo_reference_number' => $transaction->hmo_reference_number,
                        'reference_no' => $transaction->reference_no, // Actual database column (not payment_reference)
                        'status' => $transaction->status,
                        'notes' => $transaction->notes,
                        'transaction_date' => $transaction->transaction_date ? $transaction->transaction_date->format('Y-m-d H:i:s') : null, // Accessor (maps to created_at)
                        'created_at' => $transaction->created_at->format('Y-m-d H:i:s'),
                        'items' => $transaction->items->map(function ($item) {
                            return [
                                'id' => $item->id,
                                'item_type' => $item->item_type,
                                'item_name' => $item->item_name,
                                'item_description' => $item->item_description ?? '',
                                'quantity' => $item->quantity,
                                'unit_price' => (float) $item->unit_price,
                                'total_price' => (float) $item->total_price,
                            ];
                        }),
                        'createdBy' => $transaction->createdBy ? [
                            'id' => $transaction->createdBy->id,
                            'name' => $transaction->createdBy->name,
                        ] : null,
                    ];
                });
        }
        
        // Get notifications for the user
        $notifications = \App\Models\Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'read' => $notification->read,
                    'created_at' => $notification->created_at->format('M d, Y H:i'),
                    'data' => $notification->data,
                ];
            });

        $unreadCount = \App\Models\Notification::where('user_id', $user->id)
            ->where('read', false)
            ->count();

        return Inertia::render('patient/billing', [
            'user' => $user,
            'patient' => $patient,
            'transactions' => $transactions,
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    /**
     * Display a specific billing transaction receipt.
     */
    public function show(Request $request, $transactionId): Response
    {
        $user = $request->user();
        $patient = Patient::where('user_id', $user->id)->first();
        
        if (!$patient) {
            abort(404, 'Patient record not found');
        }
        
        // Get the transaction and verify it belongs to this patient
        $transaction = BillingTransaction::where('id', $transactionId)
            ->where('patient_id', $patient->id)
            ->with(['patient', 'doctor', 'items', 'createdBy'])
            ->first();
        
        if (!$transaction) {
            abort(404, 'Transaction not found');
        }
        
        // Format transaction data - use only fields that exist in database
        $transactionData = [
            'id' => $transaction->id,
            'transaction_id' => $transaction->transaction_id, // Accessor
            'transaction_code' => $transaction->transaction_code, // Actual database column
            'patient' => $transaction->patient ? [
                'id' => $transaction->patient->id,
                'first_name' => $transaction->patient->first_name,
                'last_name' => $transaction->patient->last_name,
                'patient_no' => $transaction->patient->patient_no,
                'present_address' => $transaction->patient->present_address ?? '',
                'mobile_no' => $transaction->patient->mobile_no ?? '',
            ] : null,
            'doctor' => $transaction->doctor ? [
                'id' => $transaction->doctor->specialist_id ?? null,
                'name' => $transaction->doctor->name ?? 'N/A',
                'role' => $transaction->doctor->role ?? 'Doctor',
            ] : null,
            'payment_method' => $transaction->payment_method ?? 'cash',
            'total_amount' => (float) $transaction->total_amount, // Accessor (maps to amount)
            'amount' => (float) $transaction->amount, // Actual database column
            'is_senior_citizen' => $transaction->is_senior_citizen ?? false,
            'senior_discount_amount' => (float) ($transaction->senior_discount_amount ?? 0),
            'senior_discount_percentage' => $transaction->senior_discount_percentage ? (float) $transaction->senior_discount_percentage : null,
            'hmo_provider_id' => $transaction->hmo_provider_id,
            'hmo_reference_number' => $transaction->hmo_reference_number,
            'reference_no' => $transaction->reference_no, // Actual database column (not payment_reference)
            'status' => $transaction->status,
            'notes' => $transaction->notes,
            'transaction_date' => $transaction->transaction_date ? $transaction->transaction_date->format('Y-m-d H:i:s') : null, // Accessor (maps to created_at)
            'created_at' => $transaction->created_at->format('Y-m-d H:i:s'),
            'items' => $transaction->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'item_type' => $item->item_type,
                    'item_name' => $item->item_name,
                    'item_description' => $item->item_description ?? '',
                    'quantity' => $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'total_price' => (float) $item->total_price,
                ];
            }),
            'createdBy' => $transaction->createdBy ? [
                'id' => $transaction->createdBy->id,
                'name' => $transaction->createdBy->name,
            ] : null,
        ];
        
        // Get notifications for the user
        $notifications = \App\Models\Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'read' => $notification->read,
                    'created_at' => $notification->created_at->format('M d, Y H:i'),
                    'data' => $notification->data,
                ];
            });

        $unreadCount = \App\Models\Notification::where('user_id', $user->id)
            ->where('read', false)
            ->count();

        return Inertia::render('patient/billing-receipt', [
            'user' => $user,
            'patient' => $patient,
            'transaction' => $transactionData,
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }
}

