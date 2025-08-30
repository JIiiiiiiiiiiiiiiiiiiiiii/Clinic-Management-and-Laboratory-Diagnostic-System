<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Billing extends Model
{
    use HasFactory;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'bill_id';

    protected $fillable = [
        'patient_id',
        'billing_date',
        'total_amount',
    ];

    protected $casts = [
        'billing_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the patient for this bill.
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class, 'patient_id');
    }

    /**
     * Get the billing items for this bill.
     */
    public function billingItems(): HasMany
    {
        return $this->hasMany(BillingItem::class, 'bill_id');
    }

    /**
     * Get the payments for this bill.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'bill_id');
    }

    /**
     * Get the total paid amount.
     */
    public function getTotalPaidAttribute()
    {
        return $this->payments->sum('amount');
    }

    /**
     * Get the remaining balance.
     */
    public function getBalanceAttribute()
    {
        return $this->total_amount - $this->total_paid;
    }

    /**
     * Check if the bill is fully paid.
     */
    public function isFullyPaid(): bool
    {
        return $this->balance <= 0;
    }

    /**
     * Scope for bills by date range.
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('billing_date', [$startDate, $endDate]);
    }

    /**
     * Scope for unpaid bills.
     */
    public function scopeUnpaid($query)
    {
        return $query->whereHas('payments', function ($q) {
            $q->havingRaw('SUM(amount) < billing.total_amount');
        })->orWhereDoesntHave('payments');
    }

    /**
     * Scope for paid bills.
     */
    public function scopePaid($query)
    {
        return $query->whereHas('payments', function ($q) {
            $q->havingRaw('SUM(amount) >= billing.total_amount');
        });
    }
}
