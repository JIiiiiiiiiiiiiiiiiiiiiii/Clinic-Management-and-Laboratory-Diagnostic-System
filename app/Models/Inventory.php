<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inventory extends Model
{
    use HasFactory;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'inventory_id';

    protected $fillable = [
        'item_name',
        'description',
        'category',
        'quantity',
        'unit',
        'added_date',
        'expiration_date',
        'storage_instructions',
    ];

    protected $casts = [
        'added_date' => 'date',
        'expiration_date' => 'date',
        'quantity' => 'integer',
    ];

    /**
     * Get the inventory logs for this item.
     */
    public function inventoryLogs(): HasMany
    {
        return $this->hasMany(InventoryLog::class, 'inventory_id');
    }

    /**
     * Scope for items by category.
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope for low stock items.
     */
    public function scopeLowStock($query, $threshold = 10)
    {
        return $query->where('quantity', '<=', $threshold);
    }

    /**
     * Scope for expired items.
     */
    public function scopeExpired($query)
    {
        return $query->where('expiration_date', '<', now());
    }

    /**
     * Scope for expiring soon items.
     */
    public function scopeExpiringSoon($query, $days = 30)
    {
        return $query->where('expiration_date', '<=', now()->addDays($days))
                    ->where('expiration_date', '>', now());
    }

    /**
     * Check if item is low in stock.
     */
    public function isLowStock($threshold = 10): bool
    {
        return $this->quantity <= $threshold;
    }

    /**
     * Check if item is expired.
     */
    public function isExpired(): bool
    {
        return $this->expiration_date && $this->expiration_date->isPast();
    }
}
