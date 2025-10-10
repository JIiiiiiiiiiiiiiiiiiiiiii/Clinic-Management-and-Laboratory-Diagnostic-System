<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_name',
        'item_code',
        'category',
        'unit',
        'assigned_to',
        'stock',
        'low_stock_alert',
        'consumed',
        'rejected',
        'status',
    ];

    protected $casts = [
        'stock' => 'integer',
        'low_stock_alert' => 'integer',
        'consumed' => 'integer',
        'rejected' => 'integer',
    ];

    public function movements()
    {
        return $this->hasMany(InventoryMovement::class, 'inventory_id');
    }

    public function scopeByAssignedTo($query, $assignedTo)
    {
        return $query->where('assigned_to', $assignedTo);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeLowStock($query)
    {
        return $query->whereRaw('stock <= low_stock_alert');
    }

    public function updateStatus()
    {
        if ($this->stock <= 0) {
            $this->status = 'Out of Stock';
        } elseif ($this->stock <= $this->low_stock_alert) {
            $this->status = 'Low Stock';
        } else {
            $this->status = 'In Stock';
        }
        $this->save();
    }

    public function addStock($quantity)
    {
        // Update stock
        $this->stock += $quantity;
        
        // Update status
        if ($this->stock <= 0) {
            $this->status = 'Out of Stock';
        } elseif ($this->stock <= $this->low_stock_alert) {
            $this->status = 'Low Stock';
        } else {
            $this->status = 'In Stock';
        }
        
        // Save all changes atomically
        $this->save();
        
        // Log the update for debugging
        \Log::info('InventoryItem addStock completed:', [
            'item_id' => $this->id,
            'item_name' => $this->item_name,
            'quantity_added' => $quantity,
            'new_stock' => $this->stock,
            'new_status' => $this->status
        ]);
    }

    public function removeStock($quantity, $isRejected = false)
    {
        // Update all fields simultaneously
        $this->stock -= $quantity;
        if ($isRejected) {
            $this->rejected += $quantity;
        } else {
            $this->consumed += $quantity;
        }
        
        // Update status
        if ($this->stock <= 0) {
            $this->status = 'Out of Stock';
        } elseif ($this->stock <= $this->low_stock_alert) {
            $this->status = 'Low Stock';
        } else {
            $this->status = 'In Stock';
        }
        
        // Save all changes atomically
        $this->save();
        
        // Log the update for debugging
        \Log::info('InventoryItem removeStock completed:', [
            'item_id' => $this->id,
            'item_name' => $this->item_name,
            'quantity_removed' => $quantity,
            'new_stock' => $this->stock,
            'new_rejected' => $this->rejected,
            'new_consumed' => $this->consumed,
            'new_status' => $this->status,
            'was_rejected' => $isRejected
        ]);
    }

    // Get total rejected items across all inventory
    public static function getTotalRejected()
    {
        return self::sum('rejected');
    }

    // Get items with rejections
    public static function getItemsWithRejections()
    {
        return self::where('rejected', '>', 0)->orderBy('rejected', 'desc')->get();
    }

    // Get rejection rate for this item
    public function getRejectionRate()
    {
        $totalUsed = $this->consumed + $this->rejected;
        if ($totalUsed == 0) return 0;
        return round(($this->rejected / $totalUsed) * 100, 2);
    }
}
