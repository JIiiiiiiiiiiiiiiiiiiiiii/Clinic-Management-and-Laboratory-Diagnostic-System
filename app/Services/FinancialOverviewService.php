<?php

namespace App\Services;

use App\Models\FinancialOverview;
use App\Models\BillingTransaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FinancialOverviewService
{
    /**
     * Update financial overview when a transaction is created, updated, or deleted
     */
    public static function updateForTransaction(BillingTransaction $transaction, string $action = 'created'): void
    {
        try {
            $date = $transaction->transaction_date->format('Y-m-d');
            
            // If transaction was deleted, we need to recalculate the entire day
            if ($action === 'deleted') {
                self::updateForDate($date);
                return;
            }
            
            // For created/updated, update the specific date
            self::updateForDate($date);
            
        } catch (\Exception $e) {
            Log::error('FinancialOverviewService::updateForTransaction error: ' . $e->getMessage());
        }
    }

    /**
     * Update financial overview for a specific date
     */
    public static function updateForDate(string $date): void
    {
        try {
            DB::beginTransaction();
            
            $dateFormatted = Carbon::parse($date)->format('Y-m-d');
            
            // Get all transactions for this date
            $transactions = BillingTransaction::whereDate('transaction_date', $dateFormatted)->get();
            
            if ($transactions->isEmpty()) {
                // If no transactions, delete the overview record
                FinancialOverview::where('date', $dateFormatted)->delete();
                DB::commit();
                return;
            }
            
            // Calculate totals
            $totalTransactions = $transactions->count();
            $totalRevenue = $transactions->where('status', 'paid')->sum('total_amount');
            $pendingAmount = $transactions->where('status', 'pending')->sum('total_amount');
            $cashTotal = $transactions->where('payment_method', 'cash')->sum('total_amount');
            $hmoTotal = $transactions->where('payment_method', 'hmo')->sum('total_amount');
            $otherPaymentTotal = $transactions->whereNotIn('payment_method', ['cash', 'hmo'])->sum('total_amount');
            
            $paidTransactions = $transactions->where('status', 'paid')->count();
            $pendingTransactions = $transactions->where('status', 'pending')->count();
            $cancelledTransactions = $transactions->where('status', 'cancelled')->count();

            // Update or create the record
            FinancialOverview::updateOrCreate(
                ['date' => $dateFormatted],
                [
                    'total_transactions' => $totalTransactions,
                    'total_revenue' => $totalRevenue,
                    'pending_amount' => $pendingAmount,
                    'cash_total' => $cashTotal,
                    'hmo_total' => $hmoTotal,
                    'other_payment_total' => $otherPaymentTotal,
                    'paid_transactions' => $paidTransactions,
                    'pending_transactions' => $pendingTransactions,
                    'cancelled_transactions' => $cancelledTransactions,
                ]
            );
            
            DB::commit();
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('FinancialOverviewService::updateForDate error: ' . $e->getMessage());
        }
    }

    /**
     * Sync all financial overview data
     */
    public static function syncAll(): void
    {
        try {
            DB::beginTransaction();
            
            // Get all unique transaction dates
            $dates = BillingTransaction::selectRaw('DATE(transaction_date) as date')
                ->distinct()
                ->pluck('date');

            foreach ($dates as $date) {
                self::updateForDate($date);
            }
            
            DB::commit();
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('FinancialOverviewService::syncAll error: ' . $e->getMessage());
        }
    }

    /**
     * Get financial overview for a date range
     */
    public static function getForDateRange(string $startDate, string $endDate)
    {
        return FinancialOverview::whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'desc')
            ->get();
    }

    /**
     * Get financial overview for a specific date
     */
    public static function getForDate(string $date)
    {
        return FinancialOverview::where('date', $date)->first();
    }

    /**
     * Recalculate all financial overview data
     */
    public static function recalculateAll(): void
    {
        try {
            // Clear all existing data
            FinancialOverview::truncate();
            
            // Recalculate from transactions
            self::syncAll();
            
        } catch (\Exception $e) {
            Log::error('FinancialOverviewService::recalculateAll error: ' . $e->getMessage());
        }
    }
}
