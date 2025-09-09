<?php

namespace App\Models\Supply;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supply extends Model
{
    use HasFactory;

    protected $table = 'supplies';

    protected $fillable = [
        'name',
        'code',
        'description',
        'category',
        'unit_of_measure',
        'unit_cost',
        'minimum_stock_level',
        'maximum_stock_level',
        'is_active',
        'requires_lot_tracking',
        'requires_expiry_tracking',
    ];

    protected $casts = [
        'unit_cost' => 'float',
        'minimum_stock_level' => 'integer',
        'maximum_stock_level' => 'integer',
        'is_active' => 'boolean',
        'requires_lot_tracking' => 'boolean',
        'requires_expiry_tracking' => 'boolean',
    ];

    public function transactions()
    {
        return $this->hasMany(SupplyTransaction::class, 'product_id');
    }

    public function stockLevels()
    {
        return $this->hasMany(SupplyStockLevel::class, 'product_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function getCurrentStockAttribute()
    {
        return $this->stockLevels()->sum('current_stock');
    }

    public function getAvailableStockAttribute()
    {
        return $this->stockLevels()->sum('available_stock');
    }

    public function getTotalValueAttribute()
    {
        return $this->stockLevels()->sum('total_value');
    }

    public function getIsLowStockAttribute()
    {
        return $this->current_stock <= $this->minimum_stock_level;
    }

    public function getIsOutOfStockAttribute()
    {
        return $this->current_stock <= 0;
    }

    public function getStockByLot($lotNumber = null, $expiryDate = null)
    {
        $query = $this->stockLevels();

        if ($lotNumber) {
            $query->where('lot_number', $lotNumber);
        }

        if ($expiryDate) {
            $query->where('expiry_date', $expiryDate);
        }

        return $query->first();
    }

    public function getExpiringSoon($days = 30)
    {
        return $this->stockLevels()
            ->where('expiry_date', '<=', now()->addDays($days))
            ->where('expiry_date', '>', now())
            ->where('current_stock', '>', 0)
            ->get();
    }

    public function getExpiredStock()
    {
        return $this->stockLevels()
            ->where('expiry_date', '<', now())
            ->where('current_stock', '>', 0)
            ->get();
    }
}


