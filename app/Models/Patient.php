<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        // Arrival Information
        'arrival_date',
        'arrival_time',

        // Patient Identification
        'last_name',
        'first_name',
        'middle_name',
        'birthdate',
        'age',
        'sex',
        'patient_no',

        // Demographics
        'occupation',
        'religion',
        'attending_physician',
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

        // Emergency Staff Nurse Section
        'mode_of_arrival',
        'drug_allergies',
        'food_allergies',

        // Vital Signs
        'blood_pressure',
        'heart_rate',
        'respiratory_rate',
        'temperature',
        'weight_kg',
        'height_cm',
        'pain_assessment_scale',
        'oxygen_saturation',

        // Medical Assessment
        'reason_for_consult',
        'time_seen',
        'history_of_present_illness',
        'pertinent_physical_findings',
        'plan_management',
        'past_medical_history',
        'family_history',
        'social_personal_history',
        'obstetrics_gynecology_history',
        'lmp',
        'assessment_diagnosis',
    ];

    protected $casts = [
        'arrival_date' => 'date',
        'arrival_time' => 'datetime',
        'birthdate' => 'date',
        'age' => 'integer',
        'weight_kg' => 'decimal:2',
        'height_cm' => 'decimal:2',
        'time_seen' => 'datetime',
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
}
