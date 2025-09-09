<?php

namespace App\Models\Supply;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class SupplyStockLevel extends Model
{
    use HasFactory;

    protected $table = 'supply_stock_levels';

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
        'average_cost' => 'float',
        'total_value' => 'float',
        'expiry_date' => 'date',
        'is_expired' => 'boolean',
        'is_near_expiry' => 'boolean',
        'last_updated' => 'date',
    ];

    public function product()
    {
        return $this->belongsTo(Supply::class, 'product_id');
    }

    public function updateStock(int $deltaQuantity, ?float $unitCost = null): void
    {
        $current = (int) ($this->current_stock ?? 0);
        $available = (int) ($this->available_stock ?? 0);
        $avgCost = (float) ($this->average_cost ?? 0);

        // Update average cost on incoming only
        if ($deltaQuantity > 0) {
            $incomingQty = $deltaQuantity;
            $incomingUnitCost = $unitCost ?? $avgCost;
            $existingValue = $avgCost * max($current, 0);
            $incomingValue = $incomingUnitCost * $incomingQty;
            $totalQty = max($current, 0) + $incomingQty;
            $avgCost = $totalQty > 0 ? ($existingValue + $incomingValue) / $totalQty : $incomingUnitCost;
            $this->average_cost = round($avgCost, 2);
        }

        $this->current_stock = $current + $deltaQuantity;
        $this->available_stock = $available + $deltaQuantity;
        $this->total_value = round(((float) $this->average_cost) * max((int) $this->current_stock, 0), 2);

        if ($this->expiry_date) {
            $this->is_expired = now()->gt($this->expiry_date);
            $this->is_near_expiry = now()->lt($this->expiry_date) && now()->diffInDays($this->expiry_date) <= 30;
        }

        $this->save();
    }

    public static function getLowStockProducts()
    {
        return self::query()
            ->join('supplies as s', 's.id', '=', 'supply_stock_levels.product_id')
            ->selectRaw('supply_stock_levels.product_id, SUM(supply_stock_levels.current_stock) as total_stock, MIN(s.minimum_stock_level) as min_level')
            ->groupBy('supply_stock_levels.product_id')
            ->havingRaw('SUM(supply_stock_levels.current_stock) <= MIN(s.minimum_stock_level)')
            ->get();
    }

    public static function getExpiringSoon(int $days = 30)
    {
        return self::query()
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '>', now())
            ->where('expiry_date', '<=', now()->addDays($days))
            ->where('current_stock', '>', 0)
            ->get();
    }

    public static function getExpiredStock()
    {
        return self::query()
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '<', now())
            ->where('current_stock', '>', 0)
            ->get();
    }
}


