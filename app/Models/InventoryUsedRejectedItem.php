<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryUsedRejectedItem extends Model
{
    use HasFactory;

    protected $table = 'inventory_used_rejected_items';

    protected $fillable = [
        'inventory_item_id',
        'type',
        'quantity',
        'reason',
        'location',
        'used_by',
        'user_id',
        'date_used_rejected',
        'remarks',
        'reference_number',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'date_used_rejected' => 'date',
    ];

    /**
     * Get the inventory item that this record belongs to
     */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }

    /**
     * Get the user who performed this action
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for used items
     */
    public function scopeUsed($query)
    {
        return $query->where('type', 'used');
    }

    /**
     * Scope for rejected items
     */
    public function scopeRejected($query)
    {
        return $query->where('type', 'rejected');
    }

    /**
     * Scope for date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date_used_rejected', [$startDate, $endDate]);
    }

    /**
     * Get used items for a specific date range
     */
    public static function getUsedItems($startDate, $endDate)
    {
        return self::with(['inventoryItem', 'user'])
            ->used()
            ->dateRange($startDate, $endDate)
            ->orderBy('date_used_rejected', 'desc')
            ->get();
    }

    /**
     * Get rejected items for a specific date range
     */
    public static function getRejectedItems($startDate, $endDate)
    {
        return self::with(['inventoryItem', 'user'])
            ->rejected()
            ->dateRange($startDate, $endDate)
            ->orderBy('date_used_rejected', 'desc')
            ->get();
    }

    /**
     * Get all used/rejected items for a specific date range
     */
    public static function getAllUsedRejectedItems($startDate, $endDate)
    {
        return self::with(['inventoryItem', 'user'])
            ->whereIn('type', ['used', 'rejected'])
            ->dateRange($startDate, $endDate)
            ->orderBy('date_used_rejected', 'desc')
            ->get();
    }

    /**
     * Create a used item record
     */
    public static function createUsedItem($inventoryItemId, $quantity, $usedBy, $userId, $date, $reason = null, $location = null, $remarks = null, $referenceNumber = null)
    {
        return self::create([
            'inventory_item_id' => $inventoryItemId,
            'type' => 'used',
            'quantity' => $quantity,
            'reason' => $reason,
            'location' => $location,
            'used_by' => $usedBy,
            'user_id' => $userId,
            'date_used_rejected' => $date,
            'remarks' => $remarks,
            'reference_number' => $referenceNumber,
        ]);
    }

    /**
     * Create a rejected item record
     */
    public static function createRejectedItem($inventoryItemId, $quantity, $usedBy, $userId, $date, $reason = null, $location = null, $remarks = null, $referenceNumber = null)
    {
        return self::create([
            'inventory_item_id' => $inventoryItemId,
            'type' => 'rejected',
            'quantity' => $quantity,
            'reason' => $reason,
            'location' => $location,
            'used_by' => $usedBy,
            'user_id' => $userId,
            'date_used_rejected' => $date,
            'remarks' => $remarks,
            'reference_number' => $referenceNumber,
        ]);
    }
}