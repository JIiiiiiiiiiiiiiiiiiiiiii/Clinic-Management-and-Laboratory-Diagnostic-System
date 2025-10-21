<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisitSequence extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'initial_visit_id',
        'sequence_number',
        'visit_id',
        'visit_type',
        'status',
        'scheduled_date',
        'completed_date'
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'completed_date' => 'date',
    ];

    // Relationships
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function initialVisit()
    {
        return $this->belongsTo(Visit::class, 'initial_visit_id');
    }

    public function visit()
    {
        return $this->belongsTo(Visit::class);
    }

    // Methods
    public function markAsCompleted()
    {
        $this->update([
            'status' => 'completed',
            'completed_date' => now()->toDateString()
        ]);
    }

    public function markAsCancelled()
    {
        $this->update(['status' => 'cancelled']);
    }

    public function isCompleted()
    {
        return $this->status === 'completed';
    }

    public function isScheduled()
    {
        return $this->status === 'scheduled';
    }

    public function isCancelled()
    {
        return $this->status === 'cancelled';
    }

    // Scopes
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    public function scopeByPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeByInitialVisit($query, $initialVisitId)
    {
        return $query->where('initial_visit_id', $initialVisitId);
    }
}
