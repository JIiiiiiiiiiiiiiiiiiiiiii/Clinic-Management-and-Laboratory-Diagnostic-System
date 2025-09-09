<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('inventory_products') && !Schema::hasTable('supplies')) {
            Schema::rename('inventory_products', 'supplies');
        }

        if (Schema::hasTable('inventory_transactions') && !Schema::hasTable('supply_transactions')) {
            Schema::rename('inventory_transactions', 'supply_transactions');
        }

        if (Schema::hasTable('inventory_stock_levels') && !Schema::hasTable('supply_stock_levels')) {
            Schema::rename('inventory_stock_levels', 'supply_stock_levels');
        }

        if (Schema::hasTable('inventory_suppliers') && !Schema::hasTable('supply_suppliers')) {
            Schema::rename('inventory_suppliers', 'supply_suppliers');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('supplies') && !Schema::hasTable('inventory_products')) {
            Schema::rename('supplies', 'inventory_products');
        }

        if (Schema::hasTable('supply_transactions') && !Schema::hasTable('inventory_transactions')) {
            Schema::rename('supply_transactions', 'inventory_transactions');
        }

        if (Schema::hasTable('supply_stock_levels') && !Schema::hasTable('inventory_stock_levels')) {
            Schema::rename('supply_stock_levels', 'inventory_stock_levels');
        }

        if (Schema::hasTable('supply_suppliers') && !Schema::hasTable('inventory_suppliers')) {
            Schema::rename('supply_suppliers', 'inventory_suppliers');
        }
    }
};


