<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop unused inventory tables that are not part of the current system
        // These tables were created by old migrations but are not being used
        
        // Drop old inventory tables that are not needed
        Schema::dropIfExists('inventory_products');
        Schema::dropIfExists('inventory_suppliers');
        Schema::dropIfExists('inventory_transactions');
        Schema::dropIfExists('inventory_stock_levels');
        
        // Note: We keep the following tables as they are actively used:
        // - inventory_items (main inventory table)
        // - inventory_movements (movement tracking)
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration only drops unused tables
        // If you need to rollback, you would need to recreate the old tables
        // But since they were unused, this is not recommended
    }
};
