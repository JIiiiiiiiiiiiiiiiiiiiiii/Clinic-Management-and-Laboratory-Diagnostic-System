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
        Schema::table('inventory_items', function (Blueprint $table) {
            // Add description field for item details (only if it doesn't exist)
            if (!Schema::hasColumn('inventory_items', 'description')) {
                $table->text('description')->nullable()->after('category');
            }
            
            // Add supplier information (only if it doesn't exist)
            if (!Schema::hasColumn('inventory_items', 'supplier')) {
                $table->string('supplier', 100)->nullable()->after('description');
            }
            
            // Add location field for storage (only if it doesn't exist)
            if (!Schema::hasColumn('inventory_items', 'location')) {
                $table->string('location', 100)->nullable()->after('supplier');
            }
            
            // Add cost information (only if it doesn't exist)
            if (!Schema::hasColumn('inventory_items', 'unit_cost')) {
                $table->decimal('unit_cost', 10, 2)->nullable()->after('location');
            }
            
            // Add expiry date for perishable items (only if it doesn't exist)
            if (!Schema::hasColumn('inventory_items', 'expiry_date')) {
                $table->date('expiry_date')->nullable()->after('unit_cost');
            }
            
            // Add barcode field (only if it doesn't exist)
            if (!Schema::hasColumn('inventory_items', 'barcode')) {
                $table->string('barcode', 50)->nullable()->after('expiry_date');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropColumn([
                'description',
                'supplier', 
                'location',
                'unit_cost',
                'expiry_date',
                'barcode'
            ]);
        });
    }
};
