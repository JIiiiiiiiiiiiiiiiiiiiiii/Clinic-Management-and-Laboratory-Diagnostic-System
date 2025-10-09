<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DailyTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_date',
        'transaction_type',
        'transaction_id',
        'patient_name',
        'specialist_name',
        'amount',
        'payment_method',
        'status',
        'description',
        'items_count',
        'appointments_count',
        'original_transaction_id',
        'original_table',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'amount' => 'decimal:2',
    ];

    // Scope for filtering by date
    public function scopeForDate($query, $date)
    {
        return $query->whereDate('transaction_date', $date);
    }

    // Scope for filtering by transaction type
    public function scopeByType($query, $type)
    {
        return $query->where('transaction_type', $type);
    }

    // Scope for filtering by status
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Get formatted amount with currency
    public function getFormattedAmountAttribute()
    {
        return '₱' . number_format($this->amount, 2);
    }

    // Get transaction type badge color
    public function getTypeColorAttribute()
    {
        return match($this->transaction_type) {
            'billing' => 'green',
            'doctor_payment' => 'blue',
            'expense' => 'red',
            'appointment' => 'yellow',
            default => 'gray'
        };
    }

    // Get status badge color
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'paid' => 'green',
            'pending' => 'yellow',
            'cancelled' => 'red',
            'approved' => 'blue',
            'refunded' => 'gray',
            default => 'gray'
        };
    }
}
