<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LaboratoryReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_type',
        'report_date',
        'total_orders',
        'pending_orders',
        'completed_orders',
        'order_details',
        'test_summary',
    ];

    protected $casts = [
        'report_date' => 'date',
        'order_details' => 'array',
        'test_summary' => 'array',
    ];

    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('report_type', $type);
    }

    public function scopeByDate($query, $date)
    {
        return $query->where('report_date', $date);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('report_date', [$startDate, $endDate]);
    }

    // Accessors
    public function getFormattedDateAttribute()
    {
        return $this->report_date->format('M d, Y');
    }

    public function getCompletionRateAttribute()
    {
        if ($this->total_orders == 0) {
            return 0;
        }
        return round(($this->completed_orders / $this->total_orders) * 100, 2);
    }
}
