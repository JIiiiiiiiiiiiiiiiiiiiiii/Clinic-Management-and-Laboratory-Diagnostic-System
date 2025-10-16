<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Appointment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
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
        'billing_status',
        'billing_reference',
        'confirmation_sent',
        'notes',
        'special_requirements',
        'appointment_source',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'appointment_time' => 'datetime:H:i:s',
        'price' => 'decimal:2',
        'confirmation_sent' => 'boolean',
    ];

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

    public function scopeCancelled($query)
    {
        return $query->where('status', 'Cancelled');
    }

    public function scopeByDate($query, $date)
    {
        return $query->where('appointment_date', $date);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('appointment_date', [$startDate, $endDate]);
    }

    public function scopeBySpecialist($query, $specialistId)
    {
        return $query->where('specialist_id', $specialistId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('appointment_type', $type);
    }

    public function scopeBySpecialistType($query, $specialistType)
    {
        return $query->where('specialist_type', $specialistType);
    }

    public function scopePendingBilling($query)
    {
        return $query->where('billing_status', 'pending');
    }

    public function scopeInTransactionBilling($query)
    {
        return $query->where('billing_status', 'in_transaction');
    }

    public function scopePaidBilling($query)
    {
        return $query->where('billing_status', 'paid');
    }

    // Relationships
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function scopeCancelledBilling($query)
    {
        return $query->where('billing_status', 'cancelled');
    }

    // Accessors
    public function getFormattedDateTimeAttribute()
    {
        return $this->appointment_date->format('M d, Y') . ' at ' . $this->appointment_time->format('g:i A');
    }

    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'Pending' => 'yellow',
            'Confirmed' => 'green',
            'Completed' => 'blue',
            'Cancelled' => 'red',
            default => 'gray'
        };
    }

    public function getSpecialistTypeLabelAttribute()
    {
        return match($this->specialist_type) {
            'doctor' => 'Doctor',
            'medtech' => 'Med Tech Specialist',
            default => 'Specialist'
        };
    }

    // Methods
    public function markAsConfirmed()
    {
        $this->update([
            'status' => 'Confirmed',
            'confirmation_sent' => true
        ]);
    }

    public function markAsCompleted()
    {
        $this->update(['status' => 'Completed']);
    }

    public function markAsCancelled()
    {
        $this->update(['status' => 'Cancelled']);
    }

    public function isUpcoming()
    {
        $appointmentDateTime = $this->appointment_date->setTimeFromTimeString($this->appointment_time->format('H:i:s'));
        return $appointmentDateTime->isFuture();
    }

    public function isToday()
    {
        return $this->appointment_date->isToday();
    }

    public function isOverdue()
    {
        $appointmentDateTime = $this->appointment_date->setTimeFromTimeString($this->appointment_time->format('H:i:s'));
        return $appointmentDateTime->isPast() && $this->status === 'Pending';
    }

    // Billing relationships
    public function billingLinks()
    {
        return $this->hasMany(AppointmentBillingLink::class);
    }

    public function billingTransactions()
    {
        return $this->hasManyThrough(
            BillingTransaction::class, 
            AppointmentBillingLink::class,
            'appointment_id', // Foreign key on AppointmentBillingLink table
            'id', // Foreign key on BillingTransaction table
            'id', // Local key on Appointment table
            'billing_transaction_id' // Local key on AppointmentBillingLink table
        );
    }

    // Billing methods
    public function getFormattedPriceAttribute()
    {
        return $this->price ? '₱' . number_format($this->price, 2) : '₱0.00';
    }

    public function getBillingStatusColorAttribute()
    {
        return match($this->billing_status) {
            'pending' => 'yellow',
            'in_transaction' => 'blue',
            'paid' => 'green',
            'cancelled' => 'red',
            default => 'gray'
        };
    }

    public function calculatePrice()
    {
        $prices = [
            'consultation' => 300,
            'checkup' => 300,
            'fecalysis' => 500,
            'cbc' => 500,
            'urinalysis' => 500,
            'x-ray' => 700,
            'ultrasound' => 800,
        ];

        return $prices[$this->appointment_type] ?? 0;
    }

    public function markAsPaid()
    {
        $this->update(['billing_status' => 'paid']);
    }

    public function markAsCancelledBilling()
    {
        $this->update(['billing_status' => 'cancelled']);
    }

    public function isBillingPending()
    {
        return $this->billing_status === 'pending';
    }

    public function isBillingPaid()
    {
        return $this->billing_status === 'paid';
    }

    public function visit()
    {
        return $this->hasOne(Visit::class);
    }

    public function visits()
    {
        return $this->hasMany(Visit::class);
    }

    /**
     * Create a visit record automatically when appointment is created
     */
    public function createVisit()
    {
        // Check if visit already exists using database query to avoid race conditions
        if (!$this->visit()->exists()) {
            return Visit::create([
                'appointment_id' => $this->id,
                'patient_id' => $this->patient_id,
                'visit_date_time' => $this->appointment_date->setTimeFromTimeString($this->appointment_time->format('H:i:s')),
                'purpose' => $this->appointment_type,
                'attending_staff_id' => $this->specialist_id,
                'status' => 'scheduled',
                'visit_type' => 'initial',
                'notes' => $this->notes,
            ]);
        }
        return $this->visit;
    }

    /**
     * Boot method to automatically create visit when appointment is created
     */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($appointment) {
            // Create visit for all appointments (not just confirmed/completed)
            $appointment->createVisit();
        });

        static::updated(function ($appointment) {
            // Only create visit if appointment status changed to confirmed/completed and no visit exists
            if (in_array($appointment->status, ['Confirmed', 'Completed']) && !$appointment->visit()->exists()) {
                $appointment->createVisit();
            }
        });

        // Note: With proper foreign key constraints, cascade delete is handled at database level
        // No need for manual deletion in model events
    }


}