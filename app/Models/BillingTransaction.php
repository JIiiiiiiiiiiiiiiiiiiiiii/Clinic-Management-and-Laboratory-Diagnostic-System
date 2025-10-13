<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BillingTransaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'transaction_id',
        'patient_id',
        'doctor_id',
        'payment_type',
        'total_amount',
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
        return $this->belongsTo(Patient::class);
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function items()
    {
        return $this->hasMany(BillingTransactionItem::class);
    }

    public function appointmentLinks()
    {
        return $this->hasMany(AppointmentBillingLink::class);
    }

    public function appointments()
    {
        return $this->belongsToMany(
            Appointment::class,
            'appointment_billing_links',
            'billing_transaction_id',
            'appointment_id'
        );
    }

    public function doctorPaymentLinks()
    {
        return $this->hasMany(DoctorPaymentBillingLink::class);
    }

    public function doctorPayments()
    {
        return $this->belongsToMany(
            DoctorPayment::class,
            'doctor_payment_billing_links',
            'billing_transaction_id',
            'doctor_payment_id'
        );
    }

    // Get patient information from linked appointments
    public function getPatientFromAppointments()
    {
        $appointment = $this->appointments()->first();
        if ($appointment) {
            return (object) [
                'id' => 0, // No actual patient record
                'first_name' => explode(' ', $appointment->patient_name)[0] ?? '',
                'last_name' => explode(' ', $appointment->patient_name, 2)[1] ?? '',
                'patient_no' => $appointment->patient_id,
            ];
        }
        return null;
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

    public function scopeByDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    public function scopeByHmoProvider($query, $provider)
    {
        return $query->where('hmo_provider', $provider);
    }

    // Accessors
    public function getNetAmountAttribute()
    {
        return $this->total_amount - $this->discount_amount;
    }

    public function getFormattedAmountAttribute()
    {
        return '₱' . number_format($this->total_amount, 2);
    }

    public function getFormattedNetAmountAttribute()
    {
        return '₱' . number_format($this->net_amount, 2);
    }

    // Methods
    public function calculateDiscount()
    {
        if ($this->discount_percentage) {
            $this->discount_amount = ($this->total_amount * $this->discount_percentage) / 100;
        }
        return $this;
    }

    public function isOverdue()
    {
        return $this->status === 'pending' && $this->due_date < now()->toDateString();
    }

    public function canBeEdited()
    {
        return in_array($this->status, ['pending', 'draft']);
    }

    public function canBeCancelled()
    {
        return in_array($this->status, ['pending', 'draft']);
    }

    public function visit()
    {
        return $this->hasOne(Visit::class);
    }
}
