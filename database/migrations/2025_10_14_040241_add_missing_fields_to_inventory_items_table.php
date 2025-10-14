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
            // Add description field for item details
            $table->text('description')->nullable()->after('category');
            
            // Add supplier information
            $table->string('supplier', 100)->nullable()->after('description');
            
            // Add location field for storage
            $table->string('location', 100)->nullable()->after('supplier');
            
            // Add cost information
            $table->decimal('unit_cost', 10, 2)->nullable()->after('location');
            
            // Add expiry date for perishable items
            $table->date('expiry_date')->nullable()->after('unit_cost');
            
            // Add barcode field
            $table->string('barcode', 50)->nullable()->after('expiry_date');
            
            // Add indexes for better performance
            $table->index(['assigned_to', 'status']);
            $table->index(['category']);
            $table->index(['supplier']);
            $table->index(['expiry_date']);
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
};
