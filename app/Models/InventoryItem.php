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
        'description',
        'supplier',
        'location',
        'unit',
        'assigned_to',
        'stock',
        'low_stock_alert',
        'consumed',
        'rejected',
        'status',
        'unit_cost',
        'expiry_date',
        'barcode',
    ];

    protected $casts = [
        'stock' => 'integer',
        'low_stock_alert' => 'integer',
        'consumed' => 'integer',
        'rejected' => 'integer',
        'unit_cost' => 'decimal:2',
        'expiry_date' => 'date',
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
        return $query->whereRaw('stock > 0 AND stock <= low_stock_alert');
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

    public function addStock($quantity, $remarks = 'Stock Added', $createdBy = null)
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
        
        // Create movement record
        InventoryMovement::create([
            'inventory_id' => $this->id,
            'movement_type' => 'IN',
            'quantity' => $quantity,
            'remarks' => $remarks,
            'created_by' => $createdBy ?? auth()->id() ?? 1, // Default to user 1 if no auth
        ]);
        
        // Log the update for debugging
        \Log::info('InventoryItem addStock completed:', [
            'item_id' => $this->id,
            'item_name' => $this->item_name,
            'quantity_added' => $quantity,
            'new_stock' => $this->stock,
            'new_status' => $this->status,
            'movement_created' => true
        ]);
    }

    public function removeStock($quantity, $isRejected = false, $remarks = null, $createdBy = null)
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
        
        // Create movement record
        $movementRemarks = $remarks ?? ($isRejected ? 'Item Rejected' : 'Item Consumed');
        InventoryMovement::create([
            'inventory_id' => $this->id,
            'movement_type' => 'OUT',
            'quantity' => $quantity,
            'remarks' => $movementRemarks,
            'created_by' => $createdBy ?? auth()->id() ?? 1, // Default to user 1 if no auth
        ]);
        
        // Extract reason and parse createdBy
        $reason = null;
        $usedBy = null;
        $userId = null;
        
        // Parse remarks to extract reason
        if ($remarks) {
            // Remove prefix like "Consumed: " or "Rejected: "
            $reason = preg_replace('/^(Consumed|Rejected):\s*/i', '', $remarks);
            if (empty(trim($reason))) {
                $reason = $remarks;
            }
        }
        
        // Parse createdBy - it can be a user ID (integer) or user name (string)
        if (is_numeric($createdBy)) {
            $userId = (int)$createdBy;
            $user = \App\Models\User::find($userId);
            $usedBy = $user ? $user->name : 'System';
        } elseif ($createdBy) {
            $usedBy = $createdBy;
            // Try to find user by name
            $user = \App\Models\User::where('name', $createdBy)->first();
            $userId = $user ? $user->id : (auth()->id() ?? 1);
        } else {
            $usedBy = auth()->user()->name ?? 'System';
            $userId = auth()->id() ?? 1;
        }
        
        // Create record in inventory_used_rejected_items table
        InventoryUsedRejectedItem::create([
            'inventory_item_id' => $this->id,
            'type' => $isRejected ? 'rejected' : 'used',
            'quantity' => $quantity,
            'reason' => $reason,
            'location' => $this->location ?? $this->assigned_to ?? null,
            'used_by' => $usedBy,
            'user_id' => $userId,
            'date_used_rejected' => now()->toDateString(),
            'remarks' => $movementRemarks,
            'reference_number' => null, // Can be set when related to specific transactions
        ]);
        
        // Log the update for debugging
        \Log::info('InventoryItem removeStock completed:', [
            'item_id' => $this->id,
            'item_name' => $this->item_name,
            'quantity_removed' => $quantity,
            'new_stock' => $this->stock,
            'new_rejected' => $this->rejected,
            'new_consumed' => $this->consumed,
            'new_status' => $this->status,
            'was_rejected' => $isRejected,
            'movement_created' => true,
            'used_rejected_record_created' => true
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
