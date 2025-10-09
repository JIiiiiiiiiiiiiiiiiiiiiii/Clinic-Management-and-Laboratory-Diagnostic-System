<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppointmentBillingLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'billing_transaction_id',
        'appointment_type',
        'appointment_price',
        'status',
    ];

    protected $casts = [
        'appointment_price' => 'decimal:2',
    ];

    // Relationships
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
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

    // Accessors
    public function getFormattedPriceAttribute()
    {
        return '₱' . number_format($this->appointment_price, 2);
    }

    // Methods
    public function markAsPaid()
    {
        $this->update(['status' => 'paid']);
    }

    public function markAsCancelled()
    {
        $this->update(['status' => 'cancelled']);
    }
}
