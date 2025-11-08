<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InventoryMovement extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'inventory_id',
        'movement_type',
        'quantity',
        'remarks',
        'created_by',
        'expiry_date',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'expiry_date' => 'date',
    ];

    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_id');
    }

    public function scopeIn($query)
    {
        return $query->where('movement_type', 'IN');
    }

    public function scopeOut($query)
    {
        return $query->where('movement_type', 'OUT');
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }
}
