<?php

namespace App\Models\Inventory;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockLevel extends Model
{
    use HasFactory;

    protected $table = 'inventory_stock_levels';

    protected $fillable = [
        'product_id',
        'lot_number',
        'expiry_date',
        'current_stock',
        'reserved_stock',
        'available_stock',
        'average_cost',
        'total_value',
        'is_expired',
        'is_near_expiry',
        'last_updated',
    ];

    protected $casts = [
        'current_stock' => 'integer',
        'reserved_stock' => 'integer',
        'available_stock' => 'integer',
        'average_cost' => 'decimal:2',
        'total_value' => 'decimal:2',
        'expiry_date' => 'date',
        'is_expired' => 'boolean',
        'is_near_expiry' => 'boolean',
        'last_updated' => 'date',
    ];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Scopes
    public function scopeExpired($query)
    {
        return $query->where('is_expired', true);
    }

    public function scopeNearExpiry($query)
    {
        return $query->where('is_near_expiry', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('current_stock', '>', 0);
    }

    public function scopeOutOfStock($query)
    {
        return $query->where('current_stock', '<=', 0);
    }

    public function scopeByLot($query, $lotNumber)
    {
        return $query->where('lot_number', $lotNumber);
    }

    public function scopeByExpiryDate($query, $expiryDate)
    {
        return $query->where('expiry_date', $expiryDate);
    }

    // Accessors
    public function getIsLowStockAttribute()
    {
        return $this->current_stock <= $this->product->minimum_stock_level;
    }

    public function getDaysToExpiryAttribute()
    {
        if (!$this->expiry_date) {
            return null;
        }

        return $this->expiry_date->diffInDays(now());
    }

    public function getFormattedExpiryDateAttribute()
    {
        return $this->expiry_date ? $this->expiry_date->format('M d, Y') : 'N/A';
    }

    // Methods
    public function updateStock($quantity, $cost = null)
    {
        $this->current_stock += $quantity;
        $this->available_stock = $this->current_stock - $this->reserved_stock;

        if ($cost && $quantity > 0) {
            // Update average cost using weighted average
            $totalCost = ($this->average_cost * ($this->current_stock - $quantity)) + ($cost * $quantity);
            $this->average_cost = $this->current_stock > 0 ? (float)($totalCost / $this->current_stock) : 0.0;
        }

        $this->total_value = (float)($this->current_stock * $this->average_cost);
        $this->last_updated = now()->toDateString();

        // Update expiry status
        $this->updateExpiryStatus();

        $this->save();
    }

    public function reserveStock($quantity)
    {
        if ($this->available_stock >= $quantity) {
            $this->reserved_stock += $quantity;
            $this->available_stock = $this->current_stock - $this->reserved_stock;
            $this->save();
            return true;
        }
        return false;
    }

    public function releaseReservedStock($quantity)
    {
        $this->reserved_stock = max(0, $this->reserved_stock - $quantity);
        $this->available_stock = $this->current_stock - $this->reserved_stock;
        $this->save();
    }

    public function updateExpiryStatus()
    {
        if (!$this->expiry_date) {
            $this->is_expired = false;
            $this->is_near_expiry = false;
            return;
        }

        $this->is_expired = $this->expiry_date->isPast();
        $this->is_near_expiry = $this->expiry_date->isFuture() && $this->expiry_date->diffInDays(now()) <= 30;
    }

    // Static methods
    public static function updateAllExpiryStatus()
    {
        $stockLevels = static::whereNotNull('expiry_date')->get();

        foreach ($stockLevels as $stockLevel) {
            $stockLevel->updateExpiryStatus();
            $stockLevel->save();
        }
    }

    public static function getExpiringSoon($days = 30)
    {
        return static::where('expiry_date', '<=', now()->addDays($days))
            ->where('expiry_date', '>', now())
            ->where('current_stock', '>', 0)
            ->with('product')
            ->get();
    }

    public static function getExpiredStock()
    {
        return static::where('expiry_date', '<', now())
            ->where('current_stock', '>', 0)
            ->with('product')
            ->get();
    }

    public static function getLowStockProducts()
    {
        return static::whereHas('product', function ($query) {
            $query->whereRaw('inventory_stock_levels.current_stock <= inventory_products.minimum_stock_level');
        })
        ->where('current_stock', '>', 0)
        ->with('product')
        ->get();
    }
}
