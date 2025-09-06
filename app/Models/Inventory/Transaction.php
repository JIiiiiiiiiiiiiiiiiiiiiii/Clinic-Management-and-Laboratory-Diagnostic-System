<?php

namespace App\Models\Inventory;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $table = 'inventory_transactions';

    protected $fillable = [
        'product_id',
        'user_id',
        'approved_by',
        'charged_to',
        'type',
        'subtype',
        'quantity',
        'unit_cost',
        'total_cost',
        'lot_number',
        'expiry_date',
        'date_opened',
        'notes',
        'reference_number',
        'transaction_date',
        'transaction_time',
        'remaining_quantity',
        'is_verified',
        'usage_location',
        'usage_purpose',
        'approved_at',
        'approval_status',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'expiry_date' => 'date',
        'date_opened' => 'date',
        'transaction_date' => 'date',
        'transaction_time' => 'datetime',
        'remaining_quantity' => 'integer',
        'is_verified' => 'boolean',
        'approved_at' => 'datetime',
    ];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function chargedTo()
    {
        return $this->belongsTo(User::class, 'charged_to');
    }

    // Scopes
    public function scopeIncoming($query)
    {
        return $query->where('type', 'in');
    }

    public function scopeOutgoing($query)
    {
        return $query->where('type', 'out');
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('transaction_date', [$startDate, $endDate]);
    }

    public function scopeByProduct($query, $productId)
    {
        return $query->where('product_id', $productId);
    }

    public function scopeByApprovalStatus($query, $status)
    {
        return $query->where('approval_status', $status);
    }

    public function scopePendingApproval($query)
    {
        return $query->where('approval_status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('approval_status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('approval_status', 'rejected');
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeUnverified($query)
    {
        return $query->where('is_verified', false);
    }

    // Accessors
    public function getFormattedQuantityAttribute()
    {
        $sign = $this->type === 'in' ? '+' : '-';
        return $sign . abs($this->quantity);
    }

    public function getFormattedTransactionDateAttribute()
    {
        return $this->transaction_date->format('M d, Y');
    }

    public function getFormattedExpiryDateAttribute()
    {
        return $this->expiry_date ? $this->expiry_date->format('M d, Y') : 'N/A';
    }

    public function getIsExpiredAttribute()
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    public function getIsNearExpiryAttribute()
    {
        return $this->expiry_date && $this->expiry_date->isFuture() && $this->expiry_date->diffInDays(now()) <= 30;
    }

    public function getIsPendingApprovalAttribute()
    {
        return $this->approval_status === 'pending';
    }

    public function getIsApprovedAttribute()
    {
        return $this->approval_status === 'approved';
    }

    public function getIsRejectedAttribute()
    {
        return $this->approval_status === 'rejected';
    }

    // Methods
    public function markAsVerified()
    {
        $this->update(['is_verified' => true]);
    }

    public function markAsUnverified()
    {
        $this->update(['is_verified' => false]);
    }

    public function approve($approvedBy)
    {
        $this->update([
            'approval_status' => 'approved',
            'approved_by' => $approvedBy,
            'approved_at' => now(),
        ]);
    }

    public function reject($approvedBy, $reason = null)
    {
        $this->update([
            'approval_status' => 'rejected',
            'approved_by' => $approvedBy,
            'approved_at' => now(),
            'notes' => $reason ? $this->notes . "\nRejection reason: " . $reason : $this->notes,
        ]);
    }

    // Static methods for reporting
    public static function getUsedSupplies($startDate = null, $endDate = null)
    {
        $query = static::where('type', 'out')
            ->whereIn('subtype', ['consumed', 'used']);

        if ($startDate && $endDate) {
            $query->byDateRange($startDate, $endDate);
        }

        return $query->with(['product', 'user', 'approvedBy', 'chargedTo'])->get();
    }

    public static function getRejectedSupplies($startDate = null, $endDate = null)
    {
        $query = static::where('type', 'out')
            ->where('subtype', 'rejected');

        if ($startDate && $endDate) {
            $query->byDateRange($startDate, $endDate);
        }

        return $query->with(['product', 'user', 'approvedBy', 'chargedTo'])->get();
    }

    public static function getIncomingSupplies($startDate = null, $endDate = null)
    {
        $query = static::where('type', 'in');

        if ($startDate && $endDate) {
            $query->byDateRange($startDate, $endDate);
        }

        return $query->with(['product', 'user', 'approvedBy', 'chargedTo'])->get();
    }

    public static function getOutgoingSupplies($startDate = null, $endDate = null)
    {
        $query = static::where('type', 'out');

        if ($startDate && $endDate) {
            $query->byDateRange($startDate, $endDate);
        }

        return $query->with(['product', 'user', 'approvedBy', 'chargedTo'])->get();
    }
}
