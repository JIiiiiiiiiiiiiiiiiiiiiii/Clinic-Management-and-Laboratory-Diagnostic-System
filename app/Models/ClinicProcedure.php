<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClinicProcedure extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'category',
        'subcategory',
        'price',
        'duration_minutes',
        'requirements',
        'equipment_needed',
        'personnel_required',
        'is_active',
        'requires_prescription',
        'is_emergency',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'requirements' => 'array',
        'equipment_needed' => 'array',
        'personnel_required' => 'array',
        'is_active' => 'boolean',
        'requires_prescription' => 'boolean',
        'is_emergency' => 'boolean',
    ];

    // Relationships
    public function labOrders()
    {
        return $this->hasMany(LabOrder::class, 'procedure_id');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'procedure_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeBySubcategory($query, $subcategory)
    {
        return $query->where('subcategory', $subcategory);
    }

    public function scopeEmergency($query)
    {
        return $query->where('is_emergency', true);
    }

    public function scopeRequiresPrescription($query)
    {
        return $query->where('requires_prescription', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    // Accessors
    public function getFormattedPriceAttribute()
    {
        return '₱' . number_format($this->price, 2);
    }

    public function getDurationFormattedAttribute()
    {
        if ($this->duration_minutes < 60) {
            return $this->duration_minutes . ' minutes';
        }
        
        $hours = floor($this->duration_minutes / 60);
        $minutes = $this->duration_minutes % 60;
        
        if ($minutes === 0) {
            return $hours . ' hour' . ($hours > 1 ? 's' : '');
        }
        
        return $hours . ' hour' . ($hours > 1 ? 's' : '') . ' ' . $minutes . ' minutes';
    }

    public function getCategoryLabelAttribute()
    {
        return match($this->category) {
            'laboratory' => 'Laboratory',
            'diagnostic' => 'Diagnostic',
            'treatment' => 'Treatment',
            'consultation' => 'Consultation',
            default => ucfirst($this->category)
        };
    }

    // Methods
    public function canBePerformedBy($userRole)
    {
        if (!$this->personnel_required) {
            return true;
        }

        return in_array($userRole, $this->personnel_required);
    }

    public function getRequiredEquipment()
    {
        return $this->equipment_needed ?? [];
    }

    public function getRequirements()
    {
        return $this->requirements ?? [];
    }
}
