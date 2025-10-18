<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\BillingService;
use App\Models\BillingTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BillingController extends Controller
{
    protected $billingService;

    public function __construct(BillingService $billingService)
    {
        $this->billingService = $billingService;
    }

    /**
     * Get pending billing transactions
     */
    public function pending()
    {
        try {
            $transactions = BillingTransaction::where('status', 'Pending')
                ->with(['appointment.patient', 'doctor', 'medtech', 'nurse'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $transactions
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve pending transactions', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve pending transactions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark transaction as paid
     */
    public function markPaid(Request $request, $transactionId)
    {
        try {
            $request->validate([
                'payment_method' => 'required|in:Cash,Card,HMO,Insurance',
                'reference_no' => 'nullable|string|max:100',
            ]);

            $result = $this->billingService->markAsPaid($transactionId, [
                'payment_method' => $request->input('payment_method'),
                'reference_no' => $request->input('reference_no'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Transaction marked as paid successfully',
                'data' => $result
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to mark transaction as paid', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to mark transaction as paid: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get daily transactions for reporting
     */
    public function dailyTransactions(Request $request)
    {
        try {
            $date = $request->get('date', now()->format('Y-m-d'));

            $transactions = \App\Models\DailyTransaction::where('transaction_date', $date)
                ->orderBy('created_at', 'asc')
                ->get();

            $summary = [
                'total_revenue' => $transactions->where('transaction_type', 'billing')->sum('amount'),
                'total_transactions' => $transactions->where('transaction_type', 'billing')->count(),
                'pending_transactions' => $transactions->where('status', 'Pending')->count(),
                'paid_transactions' => $transactions->where('status', 'Paid')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $transactions,
                'summary' => $summary
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve daily transactions', [
                'date' => $request->get('date'),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve daily transactions: ' . $e->getMessage()
            ], 500);
        }
    }
}