<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LabOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'patient_visit_id',
        'ordered_by',
        'status',
        'notes',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }


    public function orderedBy()
    {
        return $this->belongsTo(User::class, 'ordered_by');
    }

    public function results()
    {
        return $this->hasMany(LabResult::class);
    }

    public function labTests()
    {
        return $this->hasManyThrough(
            LabTest::class,
            LabResult::class,
            'lab_order_id',
            'id',
            'id',
            'lab_test_id'
        );
    }

    public function appointments()
    {
        return $this->hasManyThrough(
            Appointment::class,
            AppointmentLabOrder::class,
            'lab_order_id',
            'id',
            'id',
            'appointment_id'
        );
    }
}


