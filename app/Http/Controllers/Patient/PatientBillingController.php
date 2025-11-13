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
        $patient = Patient::where('user_id', $user->id)->first();
        
        $transactions = collect([]);
        
        if ($patient) {
            // Get all billing transactions for this patient from the database
            $transactions = BillingTransaction::where('patient_id', $patient->id)
                ->with(['patient', 'doctor', 'items', 'createdBy'])
                ->orderBy('transaction_date', 'desc')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($transaction) {
                    return [
                        'id' => $transaction->id,
                        'transaction_id' => $transaction->transaction_id,
                        'patient' => $transaction->patient ? [
                            'id' => $transaction->patient->id,
                            'first_name' => $transaction->patient->first_name,
                            'last_name' => $transaction->patient->last_name,
                            'patient_no' => $transaction->patient->patient_no,
                        ] : null,
                        'doctor' => $transaction->doctor ? [
                            'id' => $transaction->doctor->id ?? null,
                            'name' => $transaction->doctor->name ?? 'N/A',
                        ] : null,
                        'payment_type' => $transaction->payment_type,
                        'total_amount' => (float) $transaction->total_amount,
                        'amount' => (float) $transaction->amount,
                        'discount_amount' => (float) $transaction->discount_amount,
                        'discount_percentage' => $transaction->discount_percentage ? (float) $transaction->discount_percentage : null,
                        'is_senior_citizen' => $transaction->is_senior_citizen ?? false,
                        'senior_discount_amount' => (float) ($transaction->senior_discount_amount ?? 0),
                        'senior_discount_percentage' => $transaction->senior_discount_percentage ? (float) $transaction->senior_discount_percentage : null,
                        'hmo_provider' => $transaction->hmo_provider,
                        'hmo_reference' => $transaction->hmo_reference,
                        'hmo_reference_number' => $transaction->hmo_reference_number,
                        'payment_method' => $transaction->payment_method,
                        'payment_reference' => $transaction->payment_reference,
                        'status' => $transaction->status,
                        'description' => $transaction->description,
                        'notes' => $transaction->notes,
                        'transaction_date' => $transaction->transaction_date ? $transaction->transaction_date->format('Y-m-d H:i:s') : null,
                        'due_date' => $transaction->due_date ? $transaction->due_date->format('Y-m-d') : null,
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
        
        // Format transaction data
        $transactionData = [
            'id' => $transaction->id,
            'transaction_id' => $transaction->transaction_id,
            'patient' => $transaction->patient ? [
                'id' => $transaction->patient->id,
                'first_name' => $transaction->patient->first_name,
                'last_name' => $transaction->patient->last_name,
                'patient_no' => $transaction->patient->patient_no,
                'present_address' => $transaction->patient->present_address ?? '',
                'mobile_no' => $transaction->patient->mobile_no ?? '',
            ] : null,
            'doctor' => $transaction->doctor ? [
                'id' => $transaction->doctor->id ?? null,
                'name' => $transaction->doctor->name ?? 'N/A',
            ] : null,
            'payment_type' => $transaction->payment_type,
            'total_amount' => (float) $transaction->total_amount,
            'amount' => (float) $transaction->amount,
            'discount_amount' => (float) $transaction->discount_amount,
            'discount_percentage' => $transaction->discount_percentage ? (float) $transaction->discount_percentage : null,
            'is_senior_citizen' => $transaction->is_senior_citizen ?? false,
            'senior_discount_amount' => (float) ($transaction->senior_discount_amount ?? 0),
            'senior_discount_percentage' => $transaction->senior_discount_percentage ? (float) $transaction->senior_discount_percentage : null,
            'hmo_provider' => $transaction->hmo_provider,
            'hmo_reference' => $transaction->hmo_reference,
            'hmo_reference_number' => $transaction->hmo_reference_number,
            'payment_method' => $transaction->payment_method,
            'payment_reference' => $transaction->payment_reference,
            'status' => $transaction->status,
            'description' => $transaction->description,
            'notes' => $transaction->notes,
            'transaction_date' => $transaction->transaction_date ? $transaction->transaction_date->format('Y-m-d H:i:s') : null,
            'due_date' => $transaction->due_date ? $transaction->due_date->format('Y-m-d') : null,
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

