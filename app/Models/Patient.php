<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
        'patient_code',
        'sequence_number',
        'patient_no',
        'arrival_date',
        'arrival_time',
        'last_name',
        'first_name',
        'middle_name',
        'birthdate',
        'age',
        'sex',
        'occupation',
        'religion',
        'attending_physician',
        'civil_status',
        'nationality',
        'address',
        'telephone_no',
        'mobile_no',
        'emergency_name',
        'emergency_relation',
        'insurance_company',
        'hmo_name',
        'hmo_id_no',
        'approval_code',
        'validity',
        'mode_of_arrival',
        'drug_allergies',
        'food_allergies',
        'blood_pressure',
        'heart_rate',
        'respiratory_rate',
        'temperature',
        'weight_kg',
        'height_cm',
        'pain_assessment_scale',
        'oxygen_saturation',
        'reason_for_consult',
        'time_seen',
        'history_of_present_illness',
        'pertinent_physical_findings',
        'plan_management',
        'past_medical_history',
        'family_history',
        'social_history',
        'obgyn_history',
        'lmp',
        'assessment_diagnosis',
        'status',
    ];

    protected $casts = [
        'birthdate' => 'date',
        'arrival_date' => 'date',
        'arrival_time' => 'datetime:H:i:s',
        'time_seen' => 'datetime:H:i:s',
        'weight_kg' => 'decimal:2',
        'height_cm' => 'decimal:2',
    ];

    // Relationships
    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'patient_id', 'id');
    }

    public function visits()
    {
        return $this->hasMany(Visit::class, 'patient_id', 'id');
    }

    public function billingTransactions()
    {
        return $this->hasMany(BillingTransaction::class, 'patient_id', 'id');
    }

    public function labOrders()
    {
        return $this->hasMany(LabOrder::class, 'patient_id', 'id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    // Scopes
    public function scopeBySex($query, $sex)
    {
        return $query->where('sex', $sex);
    }

    // Accessors
    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function getFormattedBirthdateAttribute()
    {
        return $this->birthdate ? $this->birthdate->format('M d, Y') : 'N/A';
    }

    // Boot method to generate patient number
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($patient) {
            // Generate patient_no if not provided
            if (empty($patient->patient_no)) {
                $nextId = static::max('id') + 1;
                $patient->patient_no = 'P' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
            }
        });
    }
}
