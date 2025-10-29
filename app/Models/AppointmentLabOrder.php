<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppointmentLabOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'lab_order_id',
    ];

    // Relationships
    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }

    public function labOrder()
    {
        return $this->belongsTo(LabOrder::class);
    }
}
