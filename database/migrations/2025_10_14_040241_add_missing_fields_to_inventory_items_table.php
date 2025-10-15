<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

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
            
            // Add indexes for better performance (only if they don't exist)
            if (!$this->indexExists('inventory_items', 'inventory_items_assigned_status_index')) {
                $table->index(['assigned_to', 'status'], 'inventory_items_assigned_status_index');
            }
            if (!$this->indexExists('inventory_items', 'inventory_items_category_index')) {
                $table->index(['category'], 'inventory_items_category_index');
            }
            if (!$this->indexExists('inventory_items', 'inventory_items_supplier_index')) {
                $table->index(['supplier'], 'inventory_items_supplier_index');
            }
            if (!$this->indexExists('inventory_items', 'inventory_items_expiry_index')) {
                $table->index(['expiry_date'], 'inventory_items_expiry_index');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex(['assigned_to', 'status']);
            $table->dropIndex(['category']);
            $table->dropIndex(['supplier']);
            $table->dropIndex(['expiry_date']);
            
            // Drop columns
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

    /**
     * Check if an index exists on a table
     */
    private function indexExists($table, $indexName)
    {
        try {
            $indexes = DB::select("SHOW INDEX FROM {$table}");
            foreach ($indexes as $index) {
                if ($index->Key_name === $indexName) {
                    return true;
                }
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }
};
