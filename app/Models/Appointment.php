<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'id';

    protected $fillable = [
        'appointment_code',
        'sequence_number',
        'patient_name',
        'patient_id',
        'contact_number',
        'appointment_type',
        'price',
        'specialist_type',
        'specialist_name',
        'specialist_id',
        'appointment_date',
        'appointment_time',
        'duration',
        'status',
        'appointment_source',
        'booking_method',
        'billing_status',
        'billing_reference',
        'confirmation_sent',
        'notes',
        'special_requirements',
        'source',
        'patient_id_fk',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'appointment_time' => 'datetime:H:i:s',
        'price' => 'decimal:2',
    ];

    // Relationships
    public function patient()
    {
        // After migration, patient_id will be bigint foreign key to patients.id
        return $this->belongsTo(Patient::class, 'patient_id', 'id');
    }

    public function specialist()
    {
        // Try to load from staff table first since that's what's being used
        return $this->belongsTo(\App\Models\Staff::class, 'specialist_id', 'staff_id');
    }

    public function visit()
    {
        return $this->hasOne(Visit::class, 'appointment_id', 'id');
    }

    public function billingLinks()
    {
        return $this->hasMany(\App\Models\AppointmentBillingLink::class, 'appointment_id', 'id');
    }

    public function billingTransactions()
    {
        return $this->hasManyThrough(
            \App\Models\BillingTransaction::class,
            \App\Models\AppointmentBillingLink::class,
            'appointment_id',
            'id',
            'id',
            'billing_transaction_id'
        );
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'Pending');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'Confirmed');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'Completed');
    }

    public function scopeByDate($query, $date)
    {
        return $query->where('appointment_date', $date);
    }

    // Methods
    public function calculatePrice()
    {
        $prices = [
            'consultation' => 300,
            'general_consultation' => 300,
            'checkup' => 300,
            'fecalysis' => 500,
            'fecalysis_test' => 500,
            'cbc' => 500,
            'urinalysis' => 500,
            'urinarysis_test' => 500,
            'x-ray' => 700,
            'ultrasound' => 800,
        ];

        return $prices[$this->appointment_type] ?? 300;
    }

    // markBillingAsPaid method removed - no direct billing relationship

    // isBillingPending method removed - no direct billing relationship

    // isBillingPaid method removed - no direct billing relationship

    // Boot method removed - existing table doesn't have appointment_code column

    // Scope for pending billing appointments
    public function scopePendingBilling($query)
    {
        return $query->where('billing_status', 'pending')
                    ->orWhere('billing_status', null)
                    ->where('status', '!=', 'Cancelled');
    }
}