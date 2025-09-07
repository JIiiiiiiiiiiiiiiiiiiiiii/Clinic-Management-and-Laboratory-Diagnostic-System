<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PatientVisit extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'patient_id',
        'arrival_date',
        'arrival_time',
        'mode_of_arrival',
        'attending_physician',
        'reason_for_consult',
        'time_seen',
        'blood_pressure',
        'heart_rate',
        'respiratory_rate',
        'temperature',
        'weight_kg',
        'height_cm',
        'pain_assessment_scale',
        'oxygen_saturation',
        'history_of_present_illness',
        'pertinent_physical_findings',
        'plan_management',
        'assessment_diagnosis',
        'lmp',
        'status',
        'notes',
    ];

    protected $casts = [
        'arrival_date' => 'date',
        'arrival_time' => 'datetime',
        'time_seen' => 'datetime',
        'weight_kg' => 'decimal:2',
        'height_cm' => 'decimal:2',
    ];

    // Relationships
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function labOrders()
    {
        // Lab orders are currently linked to patients via patient_id
        // Map this visit's patient_id to lab_orders.patient_id
        return $this->hasMany(LabOrder::class, 'patient_id', 'patient_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('arrival_date', [$startDate, $endDate]);
    }

    public function scopeByPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    // Accessors
    public function getVisitNumberAttribute()
    {
        return 'V' . str_pad($this->id, 6, '0', STR_PAD_LEFT);
    }

    public function getFullArrivalDateTimeAttribute()
    {
        return $this->arrival_date->format('M d, Y') . ' at ' . $this->arrival_time->format('H:i');
    }
}
