<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        // User relationship
        'user_id',
        
        // Patient Identification
        'last_name',
        'first_name',
        'middle_name',
        'birthdate',
        'age',
        'sex',
        'patient_no',
        'sequence_number',

        // Demographics
        'occupation',
        'religion',
        'civil_status',
        'nationality',

        // Contact Information
        'present_address',
        'telephone_no',
        'mobile_no',

        // Emergency Contact
        'informant_name',
        'relationship',

        // Financial/Insurance
        'company_name',
        'hmo_name',
        'hmo_company_id_no',
        'validation_approval_code',
        'validity',

        // Medical History & Allergies
        'drug_allergies',
        'food_allergies',
        'past_medical_history',
        'family_history',
        'social_personal_history',
        'obstetrics_gynecology_history',
    ];

    protected $casts = [
        'birthdate' => 'date',
        'age' => 'integer',
    ];

    // Accessor for full name
    public function getFullNameAttribute()
    {
        $name = $this->last_name . ', ' . $this->first_name;
        if ($this->middle_name) {
            $name .= ' ' . $this->middle_name;
        }
        return $name;
    }

    // Scope for active patients
    public function scopeActive($query)
    {
        return $query->whereNull('deleted_at');
    }

    // Scope for searching patients
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('patient_no', 'like', "%{$search}%")
              ->orWhere('mobile_no', 'like', "%{$search}%");
        });
    }

    // Relationships
    public function labOrders()
    {
        return $this->hasMany(LabOrder::class);
    }

    public function transfers()
    {
        return $this->hasMany(PatientTransfer::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function visits()
    {
        return $this->hasMany(Visit::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Boot method to handle cascading deletes
     */
    protected static function boot()
    {
        parent::boot();

        // Note: With proper foreign key constraints, cascade delete is handled at database level
        // No need for manual deletion in model events
    }
}
