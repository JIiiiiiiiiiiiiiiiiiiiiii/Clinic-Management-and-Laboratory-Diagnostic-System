<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillingTransaction extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'id';

    protected $fillable = [
        'transaction_id',
        'transaction_code',
        'appointment_id',
        'patient_id',
        'doctor_id',
        'payment_type',
        'total_amount',
        'amount',
        'discount_amount',
        'discount_percentage',
        'hmo_provider',
        'hmo_reference',
        'payment_method',
        'payment_reference',
        'status',
        'description',
        'notes',
        'transaction_date',
        'transaction_date_only',
        'transaction_time_only',
        'due_date',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'transaction_date' => 'datetime',
        'transaction_date_only' => 'date',
        'transaction_time_only' => 'datetime:H:i:s',
        'due_date' => 'date',
    ];

    // Relationships
    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'id');
    }

    public function doctor()
    {
        return $this->belongsTo(\App\Models\Specialist::class, 'doctor_id', 'specialist_id');
    }

    public function appointmentLinks()
    {
        return $this->hasMany(\App\Models\AppointmentBillingLink::class, 'billing_transaction_id', 'id');
    }

    public function appointments()
    {
        return $this->hasManyThrough(
            \App\Models\Appointment::class,
            \App\Models\AppointmentBillingLink::class,
            'billing_transaction_id',
            'id',
            'id',
            'appointment_id'
        );
    }

    public function items()
    {
        return $this->hasMany(\App\Models\BillingTransactionItem::class, 'billing_transaction_id', 'id');
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByPaymentMethod($query, $method)
    {
        return $query->where('payment_method', $method);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('transaction_date', [$startDate, $endDate]);
    }

    // Methods
    public function markAsPaid($paymentMethod = 'Cash', $referenceNo = null)
    {
        $this->update([
            'status' => 'Paid',
            'payment_method' => $paymentMethod,
            'reference_no' => $referenceNo,
        ]);

        // Mark appointment and visit as completed
        if ($this->appointment) {
            $this->appointment->update(['status' => 'Completed']);
            if ($this->appointment->visit) {
                $this->appointment->visit->update(['status' => 'Completed']);
            }
        }
    }

    public function markAsCancelled()
    {
        $this->update(['status' => 'Cancelled']);
    }

    // Boot method to generate transaction code
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($transaction) {
            if (empty($transaction->transaction_id)) {
                $nextId = static::max('id') + 1;
                $transaction->transaction_id = 'TXN-' . str_pad($nextId, 6, '0', STR_PAD_LEFT);
            }
        });
    }
}