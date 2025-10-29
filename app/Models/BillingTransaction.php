<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillingTransaction extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'transaction_id',
        'appointment_id',
        'patient_id',
        'doctor_id',
        'payment_type',
        'total_amount',
        'amount',
        'discount_amount',
        'discount_percentage',
        'is_senior_citizen',
        'senior_discount_amount',
        'senior_discount_percentage',
        'hmo_provider',
        'hmo_reference',
        'hmo_reference_number',
        'payment_method',
        'payment_reference',
        'status',
        'is_itemized',
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
        'is_senior_citizen' => 'boolean',
        'senior_discount_amount' => 'decimal:2',
        'senior_discount_percentage' => 'decimal:2',
        'is_itemized' => 'boolean',
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

    public function appointment()
    {
        return $this->hasOneThrough(
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

    public function createdBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by', 'id');
    }

    public function updatedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'updated_by', 'id');
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

    // Business logic methods
    public function canBeEdited()
    {
        return in_array($this->status, ['pending', 'draft']);
    }

    public function canBeCancelled()
    {
        return in_array($this->status, ['pending', 'draft']);
    }

    public function canBePaid()
    {
        return $this->status === 'pending';
    }

    // Helper methods for getting related data
    public function getPatientInfo()
    {
        if ($this->patient) {
            return $this->patient;
        }
        
        // Try to get patient from appointment
        $appointment = $this->appointments()->first();
        if ($appointment && $appointment->patient) {
            return $appointment->patient;
        }
        
        return null;
    }

    public function getDoctorInfo()
    {
        if ($this->doctor) {
            return $this->doctor;
        }
        
        // Try to get doctor from appointment
        $appointment = $this->appointments()->first();
        if ($appointment && $appointment->specialist) {
            return $appointment->specialist;
        }
        
        return null;
    }

    // Methods
    public function markAsPaid($paymentMethod = 'cash', $referenceNo = null)
    {
        $this->update([
            'status' => 'paid',
            'payment_method' => $paymentMethod,
            'payment_reference' => $referenceNo,
        ]);

        // Mark appointment links as paid
        $this->appointmentLinks()->update(['status' => 'paid']);
        
        // Update appointments billing status
        $this->appointments()->update(['billing_status' => 'paid']);
    }

    public function markAsCancelled()
    {
        $this->update(['status' => 'cancelled']);
        
        // Mark appointment links as cancelled
        $this->appointmentLinks()->update(['status' => 'cancelled']);
    }

    // Boot method to generate transaction ID
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