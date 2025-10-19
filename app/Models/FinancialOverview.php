<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class FinancialOverview extends Model
{
    use HasFactory;

    protected $table = 'financial_overview';

    protected $fillable = [
        'date',
        'total_transactions',
        'total_revenue',
        'pending_amount',
        'cash_total',
        'hmo_total',
        'other_payment_total',
        'paid_transactions',
        'pending_transactions',
        'cancelled_transactions',
    ];

    protected $casts = [
        'date' => 'date',
        'total_revenue' => 'decimal:2',
        'pending_amount' => 'decimal:2',
        'cash_total' => 'decimal:2',
        'hmo_total' => 'decimal:2',
        'other_payment_total' => 'decimal:2',
    ];

    /**
     * Get transactions for this date
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(BillingTransaction::class, 'transaction_date', 'date');
    }

    /**
     * Update or create financial overview for a specific date
     */
    public static function updateForDate($date): self
    {
        $dateFormatted = Carbon::parse($date)->format('Y-m-d');
        
        // Get all transactions for this date
        $transactions = BillingTransaction::whereDate('transaction_date', $dateFormatted)->get();
        
        // Calculate totals
        $totalTransactions = $transactions->count();
        $totalRevenue = $transactions->where('status', 'paid')->sum('total_amount');
        $pendingAmount = $transactions->where('status', 'pending')->sum('total_amount');
        $cashTotal = $transactions->where('payment_method', 'Cash')->sum('total_amount');
        $hmoTotal = $transactions->where('payment_method', 'HMO')->sum('total_amount');
        $otherPaymentTotal = $transactions->whereNotIn('payment_method', ['Cash', 'HMO'])->sum('total_amount');
        
        $paidTransactions = $transactions->where('status', 'paid')->count();
        $pendingTransactions = $transactions->where('status', 'pending')->count();
        $cancelledTransactions = $transactions->where('status', 'cancelled')->count();

        // Update or create the record
        return self::updateOrCreate(
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
    }

    /**
     * Get financial overview for a date range
     */
    public static function getForDateRange($startDate, $endDate)
    {
        return self::whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'desc')
            ->get();
    }

    /**
     * Sync all financial overview data
     */
    public static function syncAll()
    {
        // Get all unique transaction dates
        $dates = BillingTransaction::selectRaw('DATE(transaction_date) as date')
            ->distinct()
            ->pluck('date');

        foreach ($dates as $date) {
            self::updateForDate($date);
        }
    }

    /**
     * Accessor for formatted date
     */
    public function getFormattedDateAttribute()
    {
        return $this->date->format('M d, Y');
    }

    /**
     * Accessor for total revenue formatted
     */
    public function getFormattedTotalRevenueAttribute()
    {
        return '₱' . number_format($this->total_revenue, 2);
    }

    /**
     * Accessor for pending amount formatted
     */
    public function getFormattedPendingAmountAttribute()
    {
        return '₱' . number_format($this->pending_amount, 2);
    }

    /**
     * Accessor for cash total formatted
     */
    public function getFormattedCashTotalAttribute()
    {
        return '₱' . number_format($this->cash_total, 2);
    }
}