<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;
    
    protected $primaryKey = 'staff_id';

    protected $fillable = [
        'staff_code',
        'name',
        'role',
        'specialization',
        'contact',
        'email',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    /**
     * Boot method to automatically generate staff code
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($staff) {
            // Generate staff code before insert
            if (empty($staff->staff_code)) {
                // Get the next available ID
                $nextId = static::max('staff_id') + 1;
                $staff->staff_code = 'S' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
            }
        });
    }

    // Relationships
    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'specialist_id');
    }

    public function visits()
    {
        return $this->hasMany(Visit::class, 'staff_id');
    }

    public function billingTransactions()
    {
        return $this->hasMany(BillingTransaction::class, 'specialist_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    public function scopeDoctors($query)
    {
        return $query->where('role', 'Doctor');
    }

    public function scopeMedTechs($query)
    {
        return $query->where('role', 'MedTech');
    }

    public function scopeAdmins($query)
    {
        return $query->where('role', 'Admin');
    }

    // Accessors
    public function getFullNameAttribute()
    {
        return $this->name;
    }

    public function getRoleLabelAttribute()
    {
        return match($this->role) {
            'Doctor' => 'Doctor',
            'MedTech' => 'Medical Technologist',
            'Admin' => 'Administrator',
            default => 'Staff'
        };
    }

    // Methods
    public function isDoctor()
    {
        return $this->role === 'Doctor';
    }

    public function isMedTech()
    {
        return $this->role === 'MedTech';
    }

    public function isAdmin()
    {
        return $this->role === 'Admin';
    }

    public function isActive()
    {
        return $this->status === 'Active';
    }
}