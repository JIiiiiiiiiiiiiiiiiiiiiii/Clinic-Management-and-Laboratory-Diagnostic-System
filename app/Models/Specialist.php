<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Specialist extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'specialist_id';

    protected $fillable = [
        'specialist_code',
        'name',
        'role',
        'specialization',
        'contact',
        'email',
        'status',
    ];

    // Relationships
    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'specialist_id', 'specialist_id');
    }

    public function visits()
    {
        return $this->hasMany(Visit::class, 'doctor_id', 'specialist_id')
            ->orWhere('nurse_id', 'specialist_id')
            ->orWhere('medtech_id', 'specialist_id');
    }

    public function billingTransactions()
    {
        return $this->hasMany(BillingTransaction::class, 'doctor_id', 'specialist_id')
            ->orWhere('medtech_id', 'specialist_id')
            ->orWhere('nurse_id', 'specialist_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    public function scopeDoctors($query)
    {
        return $query->where('role', 'Doctor');
    }

    public function scopeNurses($query)
    {
        return $query->where('role', 'Nurse');
    }

    public function scopeMedtechs($query)
    {
        return $query->where('role', 'MedTech');
    }

    // Boot method to generate specialist code
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($specialist) {
            if (empty($specialist->specialist_code)) {
                $nextId = static::max('specialist_id') + 1;
                $specialist->specialist_code = 'S' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
            }
        });
    }
}