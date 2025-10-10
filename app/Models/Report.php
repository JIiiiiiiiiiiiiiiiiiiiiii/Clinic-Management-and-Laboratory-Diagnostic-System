<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_type',
        'report_name',
        'description',
        'filters',
        'data',
        'period',
        'start_date',
        'end_date',
        'status',
        'created_by',
        'updated_by',
        'exported_at',
    ];

    protected $casts = [
        'filters' => 'array',
        'data' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
        'exported_at' => 'datetime',
    ];

    // Relationships
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('report_type', $type);
    }

    public function scopeByPeriod($query, $period)
    {
        return $query->where('period', $period);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate]);
    }

    // Report types constants
    const TYPE_PATIENTS = 'patients';
    const TYPE_LABORATORY = 'laboratory';
    const TYPE_INVENTORY = 'inventory';
    const TYPE_APPOINTMENTS = 'appointments';
    const TYPE_SPECIALIST_MANAGEMENT = 'specialist_management';
    const TYPE_BILLING = 'billing';

    // Period constants
    const PERIOD_DAILY = 'daily';
    const PERIOD_MONTHLY = 'monthly';
    const PERIOD_YEARLY = 'yearly';

    // Status constants
    const STATUS_ACTIVE = 'active';
    const STATUS_ARCHIVED = 'archived';
    const STATUS_DELETED = 'deleted';

    // Helper methods
    public function getReportTypeLabelAttribute(): string
    {
        return match($this->report_type) {
            self::TYPE_PATIENTS => 'Patient Reports',
            self::TYPE_LABORATORY => 'Laboratory Reports',
            self::TYPE_INVENTORY => 'Inventory Reports',
            self::TYPE_APPOINTMENTS => 'Appointment Reports',
            self::TYPE_SPECIALIST_MANAGEMENT => 'Specialist Management Reports',
            self::TYPE_BILLING => 'Billing Reports',
            default => 'Unknown Report Type'
        };
    }

    public function getPeriodLabelAttribute(): string
    {
        return match($this->period) {
            self::PERIOD_DAILY => 'Daily',
            self::PERIOD_MONTHLY => 'Monthly',
            self::PERIOD_YEARLY => 'Yearly',
            default => 'Unknown Period'
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            self::STATUS_ACTIVE => 'green',
            self::STATUS_ARCHIVED => 'yellow',
            self::STATUS_DELETED => 'red',
            default => 'gray'
        };
    }
}
