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
        // Note: discount_amount, discount_percentage, is_senior_citizen, senior_discount_amount, 
        // senior_discount_percentage columns don't exist in database - stored in notes as JSON
        'hmo_provider_id',
        'hmo_reference_number',
        'payment_method',
        'reference_no',
        'status',
        'is_itemized',
        'notes', // Discount info stored here as [BILLING_DATA:...] JSON
        'visit_id',
        'is_visit_based',
        'consultation_amount',
        'lab_amount',
        'follow_up_amount',
        'total_visits',
        // Note: created_by and updated_by columns don't exist in billing_transactions table
        // Removed from fillable to match actual database structure
    ];

    protected $casts = [
        'amount' => 'decimal:2', // Only 'amount' exists in database (not 'total_amount')
        // Note: discount_amount, discount_percentage, is_senior_citizen, senior_discount_amount, 
        // senior_discount_percentage are accessors (parsed from notes), not database columns
        'is_itemized' => 'boolean',
        'is_visit_based' => 'boolean',
        'consultation_amount' => 'decimal:2',
        'lab_amount' => 'decimal:2',
        'follow_up_amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Append accessors to JSON output for backward compatibility
    protected $appends = ['transaction_id', 'transaction_date', 'total_amount', 'discount_amount', 'discount_percentage', 'is_senior_citizen', 'senior_discount_amount', 'senior_discount_percentage', 'notes_display'];
    
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
    
    /**
     * Parse discount information from notes field
     * Format: [BILLING_DATA:{"discount_amount":50,"discount_percentage":null,...}]
     */
    private function parseBillingDataFromNotes()
    {
        if (!$this->notes) {
            return null;
        }
        
        // Look for [BILLING_DATA:...] pattern in notes
        if (preg_match('/\[BILLING_DATA:(.+?)\]/', $this->notes, $matches)) {
            try {
                $data = json_decode($matches[1], true);
                return $data ?: null;
            } catch (\Exception $e) {
                \Log::warning('Failed to parse billing data from notes', [
                    'transaction_id' => $this->id,
                    'notes' => $this->notes,
                    'error' => $e->getMessage()
                ]);
                return null;
            }
        }
        
        return null;
    }
    
    /**
     * Accessor: Get discount_amount from notes or calculate from difference
     */
    public function getDiscountAmountAttribute()
    {
        $billingData = $this->parseBillingDataFromNotes();
        if ($billingData && isset($billingData['discount_amount'])) {
            return (float) $billingData['discount_amount'];
        }
        
        // Fallback: Calculate from difference if items exist
        if ($this->relationLoaded('items') && $this->items->isNotEmpty()) {
            $subtotal = $this->items->sum('total_price');
            $seniorDiscount = $this->getSeniorDiscountAmountAttribute();
            $calculatedDiscount = $subtotal - $seniorDiscount - $this->amount;
            if ($calculatedDiscount > 0.01) {
                return $calculatedDiscount;
            }
        }
        
        return 0.0;
    }
    
    /**
     * Accessor: Get discount_percentage from notes
     */
    public function getDiscountPercentageAttribute()
    {
        $billingData = $this->parseBillingDataFromNotes();
        if ($billingData && isset($billingData['discount_percentage'])) {
            return $billingData['discount_percentage'] ? (float) $billingData['discount_percentage'] : null;
        }
        return null;
    }
    
    /**
     * Accessor: Get is_senior_citizen from notes
     */
    public function getIsSeniorCitizenAttribute()
    {
        $billingData = $this->parseBillingDataFromNotes();
        if ($billingData && isset($billingData['is_senior_citizen'])) {
            return (bool) $billingData['is_senior_citizen'];
        }
        return false;
    }
    
    /**
     * Accessor: Get senior_discount_amount from notes
     */
    public function getSeniorDiscountAmountAttribute()
    {
        $billingData = $this->parseBillingDataFromNotes();
        if ($billingData && isset($billingData['senior_discount_amount'])) {
            return (float) $billingData['senior_discount_amount'];
        }
        return 0.0;
    }
    
    /**
     * Accessor: Get senior_discount_percentage from notes
     */
    public function getSeniorDiscountPercentageAttribute()
    {
        $billingData = $this->parseBillingDataFromNotes();
        if ($billingData && isset($billingData['senior_discount_percentage'])) {
            return (float) $billingData['senior_discount_percentage'];
        }
        return null;
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
        // Method 1: Direct patient relationship
        if ($this->patient) {
            return $this->patient;
        }
        
        // Method 2: Try to get patient from appointment links using getPatientWithFallback
        if ($this->relationLoaded('appointmentLinks')) {
            foreach ($this->appointmentLinks as $link) {
                if ($link->appointment) {
                    // Use appointment's getPatientWithFallback which extracts from unique_appointment_key
                    $patient = $link->appointment->getPatientWithFallback();
                    if ($patient) {
                        return $patient;
                    }
                }
            }
        } else {
            // Load appointment links if not already loaded
            $this->load('appointmentLinks.appointment');
            foreach ($this->appointmentLinks as $link) {
                if ($link->appointment) {
                    // Use appointment's getPatientWithFallback which extracts from unique_appointment_key
                    $patient = $link->appointment->getPatientWithFallback();
                    if ($patient) {
                        return $patient;
                    }
                }
            }
        }
        
        // Method 3: Try to get patient from appointments relationship using getPatientWithFallback
        $appointment = $this->appointments()->first();
        if ($appointment) {
            $patient = $appointment->getPatientWithFallback();
            if ($patient) {
                return $patient;
            }
        }
        
        // Method 4: Try direct appointment relationship (if appointment_id exists)
        if ($this->appointment_id) {
            $appointment = \App\Models\Appointment::find($this->appointment_id);
            if ($appointment) {
                $patient = $appointment->getPatientWithFallback();
                if ($patient) {
                    return $patient;
                }
            }
        }
        
        // Method 5: Final fallback - Load patient directly from patient_id if it exists
        if ($this->patient_id) {
            $patient = \App\Models\Patient::find($this->patient_id);
            if ($patient) {
                return $patient;
            }
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
    
    /**
     * Accessor: Get clean notes without [BILLING_DATA:...] JSON for display
     */
    public function getNotesDisplayAttribute()
    {
        if (!$this->notes) {
            return '';
        }
        
        // Remove [BILLING_DATA:...] pattern from notes for display
        $cleanNotes = preg_replace('/\[BILLING_DATA:.+?\]/', '', $this->notes);
        
        // Clean up any extra whitespace or newlines
        $cleanNotes = trim($cleanNotes);
        
        return $cleanNotes;
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
     * Override toArray to ensure doctor relationship and discount fields are always included
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
        
        // Ensure discount fields are always included, even if null or 0
        if (!isset($array['discount_amount'])) {
            $array['discount_amount'] = $this->discount_amount ?? 0;
        }
        if (!isset($array['discount_percentage'])) {
            $array['discount_percentage'] = $this->discount_percentage ?? null;
        }
        if (!isset($array['senior_discount_amount'])) {
            $array['senior_discount_amount'] = $this->senior_discount_amount ?? 0;
        }
        if (!isset($array['senior_discount_percentage'])) {
            $array['senior_discount_percentage'] = $this->senior_discount_percentage ?? null;
        }
        if (!isset($array['is_senior_citizen'])) {
            $array['is_senior_citizen'] = $this->is_senior_citizen ?? false;
        }
        
        return $array;
    }
}