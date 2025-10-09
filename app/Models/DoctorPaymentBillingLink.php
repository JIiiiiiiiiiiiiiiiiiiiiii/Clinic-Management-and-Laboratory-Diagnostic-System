<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DoctorPaymentBillingLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_payment_id',
        'billing_transaction_id',
        'payment_amount',
        'status',
    ];

    protected $casts = [
        'payment_amount' => 'decimal:2',
    ];

    // Relationships
    public function doctorPayment()
    {
        return $this->belongsTo(DoctorPayment::class);
    }

    public function billingTransaction()
    {
        return $this->belongsTo(BillingTransaction::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }
}