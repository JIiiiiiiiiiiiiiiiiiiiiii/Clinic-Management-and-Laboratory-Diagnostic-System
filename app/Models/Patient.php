<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    use HasFactory;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'patient_id';

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

        // Simple patient profile additions
        'gender',
        'birth_date',
        'contact_info',
        'address',
        'user_id',
    ];

    protected $casts = [
        'arrival_date' => 'date',
        'arrival_time' => 'datetime:H:i:s',
        'birthdate' => 'date',
        'age' => 'integer',
        'weight_kg' => 'decimal:2',
        'height_cm' => 'decimal:2',
        'time_seen' => 'datetime:H:i:s',
        'birth_date' => 'date',
    ];

    /**
     * Get the user associated with the patient.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the appointments for this patient.
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'patient_id');
    }

    /**
     * Get the billing records for this patient.
     */
    public function billing(): HasMany
    {
        return $this->hasMany(Billing::class, 'patient_id');
    }

    /**
     * Get the custom clinical record values for this patient.
     */
    public function customClinicalRecordValues(): HasMany
    {
        return $this->hasMany(CustomClinicalRecordValue::class, 'patient_id');
    }

    // Accessor for full name
    public function getFullNameAttribute()
    {
        $name = '';
        if ($this->last_name) {
            $name .= $this->last_name;
        }
        if ($this->first_name) {
            $name .= ($name ? ', ' : '') . $this->first_name;
        }
        return $name ?: 'Unknown Patient';
    }

    // Scope for searching patients
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('patient_no', 'like', "%{$search}%")
              ->orWhere('mobile_no', 'like', "%{$search}%")
              ->orWhere('contact_info', 'like', "%{$search}%");
        });
    }
}
