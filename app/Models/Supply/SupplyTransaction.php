<?php

namespace App\Models\Supply;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupplyTransaction extends Model
{
    use HasFactory;

    protected $table = 'supply_transactions';

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

    public function product()
    {
        return $this->belongsTo(Supply::class, 'product_id');
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

    public function scopePendingApproval($query)
    {
        return $query->where('approval_status', 'pending');
    }

    public function approve(int $approverId): void
    {
        $this->approval_status = 'approved';
        $this->approved_by = $approverId;
        $this->approved_at = now();
        $this->save();
    }

    public function reject(int $approverId, string $reason): void
    {
        $this->approval_status = 'rejected';
        $this->approved_by = $approverId;
        $this->approved_at = now();
        $this->notes = trim(($this->notes ? $this->notes . " \n" : '') . 'Rejected: ' . $reason);
        $this->save();
    }

    public function markAsVerified(): void
    {
        $this->is_verified = true;
        $this->save();
    }

    public static function getUsedSupplies($startDate, $endDate)
    {
        return self::with(['product', 'user', 'approvedBy', 'chargedTo'])
            ->where('type', 'out')
            ->whereIn('subtype', ['consumed', 'used'])
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->get();
    }

    public static function getRejectedSupplies($startDate, $endDate)
    {
        return self::with(['product', 'user', 'approvedBy'])
            ->where('type', 'out')
            ->whereIn('subtype', ['rejected', 'expired', 'damaged'])
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->get();
    }

    public static function getIncomingSupplies($startDate, $endDate)
    {
        return self::with(['product', 'user', 'approvedBy'])
            ->where('type', 'in')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->get();
    }

    public static function getOutgoingSupplies($startDate, $endDate)
    {
        return self::with(['product', 'user', 'approvedBy', 'chargedTo'])
            ->where('type', 'out')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->get();
    }
}


