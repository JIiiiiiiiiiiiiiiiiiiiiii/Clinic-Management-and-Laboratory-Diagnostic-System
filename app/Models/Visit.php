<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Visit extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'patient_id',
        'appointment_id',
        'doctor_id',
        'visit_date',
        'reason',
        'diagnosis',
        'prescription',
        'lab_request',
        'billing_id',
        'status',
        'vitals',
        'notes',
        'follow_up_required',
        'follow_up_date',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'visit_date' => 'datetime',
        'lab_request' => 'boolean',
        'follow_up_required' => 'boolean',
        'follow_up_date' => 'date',
        'vitals' => 'array',
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

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function billing()
    {
        return $this->belongsTo(BillingTransaction::class, 'billing_id');
    }

    // Note: Lab orders are managed separately through PatientVisit
    // This relationship can be added later if needed

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'Pending');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'In Progress');
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
        return $query->whereDate('visit_date', $date);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('visit_date', [$startDate, $endDate]);
    }

    public function scopeByDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    public function scopeByPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeWithLabRequests($query)
    {
        return $query->where('lab_request', true);
    }

    public function scopeRequiringFollowUp($query)
    {
        return $query->where('follow_up_required', true);
    }

    // Accessors
    public function getVisitNumberAttribute()
    {
        return 'V' . str_pad($this->id, 6, '0', STR_PAD_LEFT);
    }

    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'Pending' => 'yellow',
            'In Progress' => 'blue',
            'Completed' => 'green',
            'Cancelled' => 'red',
            default => 'gray'
        };
    }

    public function getFormattedVisitDateAttribute()
    {
        return $this->visit_date->format('M d, Y \a\t g:i A');
    }

    public function getVitalsSummaryAttribute()
    {
        if (!$this->vitals) return 'No vitals recorded';
        
        $summary = [];
        if (isset($this->vitals['blood_pressure'])) {
            $summary[] = 'BP: ' . $this->vitals['blood_pressure'];
        }
        if (isset($this->vitals['temperature'])) {
            $summary[] = 'Temp: ' . $this->vitals['temperature'] . '°C';
        }
        if (isset($this->vitals['heart_rate'])) {
            $summary[] = 'HR: ' . $this->vitals['heart_rate'] . ' bpm';
        }
        
        return implode(', ', $summary) ?: 'Basic vitals recorded';
    }

    // Methods
    public function markAsInProgress()
    {
        $this->update(['status' => 'In Progress']);
    }

    public function markAsCompleted()
    {
        $this->update(['status' => 'Completed']);
    }

    public function markAsCancelled()
    {
        $this->update(['status' => 'Cancelled']);
    }

    public function isPending()
    {
        return $this->status === 'Pending';
    }

    public function isInProgress()
    {
        return $this->status === 'In Progress';
    }

    public function isCompleted()
    {
        return $this->status === 'Completed';
    }

    public function isCancelled()
    {
        return $this->status === 'Cancelled';
    }

    public function hasLabRequests()
    {
        return $this->lab_request;
    }

    public function requiresFollowUp()
    {
        return $this->follow_up_required;
    }

    public function getTotalBillingAmount()
    {
        if ($this->billing) {
            return $this->billing->total_amount;
        }
        return 0;
    }

    public function getFormattedBillingAmount()
    {
        return '₱' . number_format($this->getTotalBillingAmount(), 2);
    }

    // Static methods for creating visits from appointments
    public static function createFromAppointment(Appointment $appointment, $doctorId = null)
    {
        return self::create([
            'patient_id' => $appointment->patient_id,
            'appointment_id' => $appointment->id,
            'doctor_id' => $doctorId ?? $appointment->specialist_id,
            'visit_date' => now(),
            'reason' => $appointment->notes ?? 'Consultation',
            'status' => 'In Progress',
            'created_by' => auth()->id(),
        ]);
    }

    // Generate visit summary for printing
    public function generateSummary()
    {
        return [
            'visit_number' => $this->visit_number,
            'patient_name' => $this->patient->full_name,
            'patient_no' => $this->patient->patient_no,
            'visit_date' => $this->formatted_visit_date,
            'doctor' => $this->doctor->name ?? 'N/A',
            'reason' => $this->reason,
            'diagnosis' => $this->diagnosis,
            'prescription' => $this->prescription,
            'vitals' => $this->vitals_summary,
            'lab_requested' => $this->hasLabRequests(),
            'follow_up_required' => $this->requiresFollowUp(),
            'follow_up_date' => $this->follow_up_date?->format('M d, Y'),
            'billing_amount' => $this->formatted_billing_amount,
        ];
    }
}
