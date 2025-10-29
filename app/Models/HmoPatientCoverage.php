<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HmoPatientCoverage extends Model
{
    use HasFactory;

    protected $table = 'hmo_patient_coverage';

    protected $fillable = [
        'patient_id',
        'hmo_provider_id',
        'member_id',
        'policy_number',
        'group_number',
        'coverage_start_date',
        'coverage_end_date',
        'annual_limit',
        'used_amount',
        'remaining_amount',
        'status',
        'notes',
        'coverage_details',
    ];

    protected $casts = [
        'annual_limit' => 'decimal:2',
        'used_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'coverage_start_date' => 'date',
        'coverage_end_date' => 'date',
        'coverage_details' => 'array',
    ];

    // Relationships
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function hmoProvider()
    {
        return $this->belongsTo(HmoProvider::class);
    }

    public function claims()
    {
        return $this->hasMany(HmoClaim::class, 'patient_id', 'patient_id')
                    ->where('hmo_provider_id', $this->hmo_provider_id);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'expired');
    }

    public function scopeByProvider($query, $providerId)
    {
        return $query->where('hmo_provider_id', $providerId);
    }

    // Helper methods
    public function updateUsedAmount()
    {
        $usedAmount = $this->claims()
            ->whereIn('status', ['approved', 'paid'])
            ->sum('approved_amount');
            
        $remainingAmount = $this->annual_limit ? 
            max(0, $this->annual_limit - $usedAmount) : null;

        $this->update([
            'used_amount' => $usedAmount,
            'remaining_amount' => $remainingAmount,
        ]);
    }

    public function isCoverageActive()
    {
        if ($this->status !== 'active') {
            return false;
        }

        if (!$this->coverage_start_date || !$this->coverage_end_date) {
            return true; // No date restrictions
        }

        $now = now();
        return $now->between($this->coverage_start_date, $this->coverage_end_date);
    }

    public function hasRemainingCoverage()
    {
        if (!$this->annual_limit) {
            return true; // No limit
        }

        return $this->remaining_amount > 0;
    }

    public function getCoveragePercentage()
    {
        if (!$this->annual_limit || $this->annual_limit == 0) {
            return 0;
        }

        return ($this->used_amount / $this->annual_limit) * 100;
    }

    // Boot method to update remaining amount when used amount changes
    protected static function boot()
    {
        parent::boot();

        static::updating(function ($coverage) {
            if ($coverage->isDirty('used_amount') && $coverage->annual_limit) {
                $coverage->remaining_amount = max(0, $coverage->annual_limit - $coverage->used_amount);
            }
        });
    }
}
