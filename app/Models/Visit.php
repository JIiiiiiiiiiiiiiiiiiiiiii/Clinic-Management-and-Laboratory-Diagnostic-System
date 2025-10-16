<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Visit extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'appointment_id',
        'patient_id',
        'visit_date_time',
        'purpose',
        'attending_staff_id',
        'follow_up_visit_id',
        'notes',
        'status',
        'visit_type',
    ];

    protected $casts = [
        'visit_date_time' => 'datetime',
    ];

    // Relationships
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function attendingStaff()
    {
        return $this->belongsTo(\App\Models\User::class, 'attending_staff_id');
    }

    public function followUpVisit()
    {
        return $this->belongsTo(Visit::class, 'follow_up_visit_id');
    }

    public function followUpVisits()
    {
        return $this->hasMany(Visit::class, 'follow_up_visit_id');
    }

    // Scopes
    public function scopeByDate($query, $date)
    {
        return $query->whereDate('visit_date_time', $date);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('visit_date_time', [$startDate, $endDate]);
    }

    public function scopeByStaff($query, $staffId)
    {
        return $query->where('attending_staff_id', $staffId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('visit_type', $type);
    }

    public function scopeFollowUp($query)
    {
        return $query->whereNotNull('follow_up_visit_id');
    }

    public function scopeInitial($query)
    {
        return $query->whereNull('follow_up_visit_id');
    }

    // Accessors
    public function getFormattedDateTimeAttribute()
    {
        return $this->visit_date_time->format('M d, Y \a\t g:i A');
    }

    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'scheduled' => 'blue',
            'in_progress' => 'yellow',
            'completed' => 'green',
            'cancelled' => 'red',
            default => 'gray'
        };
    }

    public function getVisitTypeLabelAttribute()
    {
        return match($this->visit_type) {
            'initial' => 'Initial Visit',
            'follow_up' => 'Follow-up Visit',
            'lab_result_review' => 'Lab Result Review',
            default => 'Visit'
        };
    }

    // Methods
    public function markAsCompleted()
    {
        $this->update(['status' => 'completed']);
    }

    public function markAsCancelled()
    {
        $this->update(['status' => 'cancelled']);
    }

    public function isFollowUp()
    {
        return !is_null($this->follow_up_visit_id);
    }

    public function isInitial()
    {
        return is_null($this->follow_up_visit_id);
    }

    public function createFollowUpVisit($data)
    {
        return static::create([
            'appointment_id' => $this->appointment_id,
            'patient_id' => $this->patient_id,
            'visit_date_time' => $data['visit_date_time'],
            'purpose' => $data['purpose'] ?? 'Follow-up: ' . $this->purpose,
            'attending_staff_id' => $data['attending_staff_id'] ?? $this->attending_staff_id,
            'follow_up_visit_id' => $this->id,
            'notes' => $data['notes'] ?? null,
            'status' => $data['status'] ?? 'scheduled',
            'visit_type' => 'follow_up',
        ]);
    }
}
