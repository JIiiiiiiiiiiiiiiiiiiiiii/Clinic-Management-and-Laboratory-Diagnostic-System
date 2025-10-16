<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InventoryReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_name',
        'report_type',
        'period',
        'start_date',
        'end_date',
        'filters',
        'summary_data',
        'detailed_data',
        'status',
        'created_by',
        'exported_at',
        'export_format',
    ];

    protected $casts = [
        'filters' => 'array',
        'summary_data' => 'array',
        'detailed_data' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
        'exported_at' => 'datetime',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

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

    public function scopeExported($query)
    {
        return $query->whereNotNull('exported_at');
    }
}
