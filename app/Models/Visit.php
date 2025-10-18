<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Visit extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'id';
    
    protected $fillable = [
        'appointment_id',
        'patient_id',
        'attending_staff_id',
        'follow_up_visit_id',
        'visit_date_time_time',
        'purpose',
        'notes',
        'status',
        'visit_type',
        'visit_code',
        'visit_date_time',
    ];

    protected $casts = [
        'visit_date_time_time' => 'datetime',
    ];

    /**
     * Boot method to automatically generate visit_code
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($visit) {
            if (empty($visit->visit_code)) {
                $nextId = static::max('id') + 1;
                $visit->visit_code = 'V' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    // Relationships
    public function appointment()
    {
        return $this->belongsTo(Appointment::class, 'appointment_id', 'id');
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class, 'patient_id', 'id');
    }

    public function attendingStaff()
    {
        return $this->belongsTo(\App\Models\User::class, 'attending_staff_id', 'id');
    }

    public function doctor()
    {
        return $this->belongsTo(\App\Models\User::class, 'attending_staff_id', 'id');
    }

    public function nurse()
    {
        return $this->belongsTo(\App\Models\User::class, 'attending_staff_id', 'id');
    }

    public function medtech()
    {
        return $this->belongsTo(\App\Models\User::class, 'attending_staff_id', 'id');
    }

    public function billingTransaction()
    {
        return $this->hasOneThrough(
            BillingTransaction::class,
            Appointment::class,
            'appointment_id',
            'appointment_id',
            'appointment_id',
            'appointment_id'
        );
    }

    public function labOrders()
    {
        return $this->hasMany(LabOrder::class, 'patient_visit_id');
    }

    // SYSTEM-WIDE: Scopes for proper date handling
    public function scopeOrderByVisitDate($query, $direction = "desc")
    {
        return $query->orderBy("visit_date_time_time", $direction);
    }
    
    public function scopeByVisitDate($query, $date)
    {
        return $query->whereDate("visit_date_time_time", $date);
    }
    
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween("visit_date_time_time", [$startDate, $endDate]);
    }

    public function scopeByDate($query, $date)
    {
        return $query->whereDate('visit_date_time_time', $date);
    }

    public function scopeByStaff($query, $staffId)
    {
        return $query->where('attending_staff_id', $staffId);
    }

    public function scopeByDoctor($query, $doctorId)
    {
        return $query->where('attending_staff_id', $doctorId);
    }

    // Methods
    public function markAsCompleted()
    {
        $this->update(['status' => 'completed']);
        if ($this->appointment) {
            $this->appointment->update(['status' => 'Completed']);
        }
    }
    
    public function markAsCancelled()
    {
        $this->update(['status' => 'cancelled']);
        if ($this->appointment) {
            $this->appointment->update(['status' => 'Cancelled']);
        }
    }
}