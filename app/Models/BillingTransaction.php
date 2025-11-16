<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillingTransaction extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'transaction_code', // Actual database column (transaction_id is an accessor)
        'appointment_id',
        'patient_id',
        'specialist_id', // Use specialist_id which exists in database (not doctor_id)
        'amount', // Only 'amount' exists in database (not 'total_amount')
        'is_senior_citizen',
        'senior_discount_amount',
        'senior_discount_percentage',
        'hmo_provider_id',
        'hmo_reference_number',
        'payment_method',
        'reference_no',
        'status',
        'is_itemized',
        'notes',
        'visit_id',
        'is_visit_based',
        'consultation_amount',
        'lab_amount',
        'follow_up_amount',
        'total_visits',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2', // Only 'amount' exists in database (not 'total_amount')
        'is_senior_citizen' => 'boolean',
        'senior_discount_amount' => 'decimal:2',
        'senior_discount_percentage' => 'decimal:2',
        'is_itemized' => 'boolean',
        'is_visit_based' => 'boolean',
        'consultation_amount' => 'decimal:2',
        'lab_amount' => 'decimal:2',
        'follow_up_amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Append accessors to JSON output for backward compatibility
    protected $appends = ['transaction_id', 'transaction_date', 'total_amount'];
    
    // Accessor: Map amount to total_amount for backward compatibility
    // Since total_amount column doesn't exist in database, use amount
    public function getTotalAmountAttribute()
    {
        // If total_amount exists in attributes (from fillable), use it
        // Otherwise, fall back to amount
        if (isset($this->attributes['total_amount'])) {
            return $this->attributes['total_amount'];
        }
        
        // Use amount as the total amount
        return $this->amount ?? 0;
    }

    // Relationships
    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'id');
    }

    // Relationship to specialist - check both specialist_id and doctor_id columns
    public function doctor()
    {
        // Check which column exists in the database (cache the result to avoid repeated checks)
        static $foreignKey = null;
        if ($foreignKey === null) {
            $foreignKey = \Illuminate\Support\Facades\Schema::hasColumn('billing_transactions', 'specialist_id') 
                ? 'specialist_id' 
                : 'doctor_id';
        }
        
        return $this->belongsTo(\App\Models\Specialist::class, $foreignKey, 'specialist_id');
    }
    
    // Alias for backward compatibility
    public function specialist()
    {
        return $this->doctor();
    }
    
    // Accessor to get the specialist ID regardless of column name
    public function getSpecialistIdAttribute()
    {
        // Check which column exists and return its value (cache the result)
        static $columnName = null;
        if ($columnName === null) {
            if (\Illuminate\Support\Facades\Schema::hasColumn('billing_transactions', 'specialist_id')) {
                $columnName = 'specialist_id';
            } elseif (\Illuminate\Support\Facades\Schema::hasColumn('billing_transactions', 'doctor_id')) {
                $columnName = 'doctor_id';
            } else {
                $columnName = false;
            }
        }
        
        if ($columnName) {
            return $this->attributes[$columnName] ?? null;
        }
        return null;
    }
    
    // Method to always get fresh specialist data (bypasses relationship cache)
    public function getFreshDoctor()
    {
        $specialistId = $this->getSpecialistIdAttribute();
        if ($specialistId) {
            return \App\Models\Specialist::find($specialistId);
        }
        return null;
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
        // Use created_at since transaction_date doesn't exist in database
        return $query->whereBetween('created_at', [$startDate, $endDate]);
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

    // Accessor: Map transaction_code to transaction_id for backward compatibility
    // Since transaction_id column doesn't exist in database, use transaction_code
    public function getTransactionIdAttribute()
    {
        // If transaction_code exists, use it as transaction_id
        if (isset($this->attributes['transaction_code'])) {
            return $this->attributes['transaction_code'];
        }
        
        // Fallback: generate from id if transaction_code is null
        if (isset($this->attributes['id'])) {
            return 'TXN-' . str_pad($this->attributes['id'], 6, '0', STR_PAD_LEFT);
        }
        
        return null;
    }

    // Accessor: Map created_at to transaction_date for backward compatibility
    // Since transaction_date column doesn't exist in database, use created_at
    public function getTransactionDateAttribute()
    {
        // If transaction_date exists in attributes (from fillable), use it
        // Otherwise, fall back to created_at
        if (isset($this->attributes['transaction_date'])) {
            return $this->attributes['transaction_date'];
        }
        
        // Use created_at as the transaction date
        return $this->created_at;
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

    // Boot method to generate transaction code
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($transaction) {
            // Generate transaction_code if not provided (use transaction_code which exists in database)
            if (empty($transaction->transaction_code)) {
                $nextId = static::max('id') + 1;
                $transaction->transaction_code = 'TXN-' . str_pad($nextId, 6, '0', STR_PAD_LEFT);
            }
        });
    }
    
    /**
     * Override toArray to ensure doctor relationship is always included, even when null
     */
    public function toArray()
    {
        $array = parent::toArray();
        
        // Ensure doctor relationship is always included in the array, even when null
        if (!isset($array['doctor'])) {
            if ($this->relationLoaded('doctor')) {
                $array['doctor'] = $this->doctor ? $this->doctor->toArray() : null;
            } else {
                $array['doctor'] = null;
            }
        }
        
        return $array;
    }
}