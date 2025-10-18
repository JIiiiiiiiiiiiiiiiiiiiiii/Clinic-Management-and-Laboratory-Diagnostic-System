<?php

namespace App\Http\Controllers;

use App\Services\CompleteAppointmentService;
use App\Models\BillingTransaction;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CompleteBillingController extends Controller
{
    protected $appointmentService;
    
    public function __construct(CompleteAppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }
    
    /**
     * Get pending billing transactions
     */
    public function getPendingTransactions()
    {
        try {
            $transactions = BillingTransaction::where('status', 'Pending')
                ->with(['appointment.patient', 'appointment.specialist'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($transaction) {
                    return [
                        'transaction_id' => $transaction->transaction_id,
                        'transaction_code' => $transaction->transaction_code,
                        'appointment_id' => $transaction->appointment_id,
                        'patient_name' => $transaction->appointment->patient->first_name . ' ' . $transaction->appointment->patient->last_name,
                        'appointment_type' => $transaction->appointment->appointment_type,
                        'appointment_date' => $transaction->appointment->appointment_date,
                        'specialist_name' => $transaction->appointment->specialist ? $transaction->appointment->specialist->name : 'Not assigned',
                        'amount' => $transaction->amount,
                        'status' => $transaction->status,
                        'created_at' => $transaction->created_at
                    ];
                });
            
            return response()->json([
                'success' => true,
                'data' => $transactions
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to get pending transactions', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve pending transactions'
            ], 500);
        }
    }
    
    /**
     * Process payment for a transaction
     */
    public function processPayment(Request $request, int $transactionId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'payment_method' => 'required|in:Cash,Card,HMO',
                'reference_no' => 'nullable|string|max:100',
                'notes' => 'nullable|string'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $result = $this->appointmentService->processPayment($transactionId, $request->all());
            
            Log::info('Payment processed successfully', $result);
            
            return response()->json([
                'success' => true,
                'message' => 'Payment processed successfully',
                'data' => $result
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to process payment', [
                'error' => $e->getMessage(),
                'transaction_id' => $transactionId
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to process payment: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get all billing transactions
     */
    public function getAllTransactions(Request $request)
    {
        try {
            $query = BillingTransaction::with(['appointment.patient', 'appointment.specialist']);
            
            // Apply filters
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }
            
            if ($request->filled('payment_method')) {
                $query->where('payment_method', $request->payment_method);
            }
            
            if ($request->filled('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }
            
            if ($request->filled('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }
            
            $transactions = $query->orderBy('created_at', 'desc')->get()
                ->map(function ($transaction) {
                    return [
                        'transaction_id' => $transaction->transaction_id,
                        'transaction_code' => $transaction->transaction_code,
                        'appointment_id' => $transaction->appointment_id,
                        'patient_name' => $transaction->appointment->patient->first_name . ' ' . $transaction->appointment->patient->last_name,
                        'appointment_type' => $transaction->appointment->appointment_type,
                        'appointment_date' => $transaction->appointment->appointment_date,
                        'specialist_name' => $transaction->appointment->specialist ? $transaction->appointment->specialist->name : 'Not assigned',
                        'amount' => $transaction->amount,
                        'payment_method' => $transaction->payment_method,
                        'reference_no' => $transaction->reference_no,
                        'status' => $transaction->status,
                        'created_at' => $transaction->created_at
                    ];
                });
            
            return response()->json([
                'success' => true,
                'data' => $transactions
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to get all transactions', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve transactions'
            ], 500);
        }
    }
    
    /**
     * Get billing summary statistics
     */
    public function getBillingSummary()
    {
        try {
            $summary = [
                'total_revenue' => BillingTransaction::where('status', 'Paid')->sum('amount') ?? 0,
                'pending_amount' => BillingTransaction::where('status', 'Pending')->sum('amount') ?? 0,
                'total_transactions' => BillingTransaction::count(),
                'paid_transactions' => BillingTransaction::where('status', 'Paid')->count(),
                'pending_transactions' => BillingTransaction::where('status', 'Pending')->count(),
                'cancelled_transactions' => BillingTransaction::where('status', 'Cancelled')->count()
            ];
            
            return response()->json([
                'success' => true,
                'data' => $summary
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to get billing summary', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve billing summary'
            ], 500);
        }
    }
}

