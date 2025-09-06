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
        Schema::create('inventory_stock_levels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('inventory_products')->onDelete('cascade');
            $table->string('lot_number')->nullable(); // For lot-specific tracking
            $table->date('expiry_date')->nullable(); // For expiry-specific tracking
            
            // Stock levels
            $table->integer('current_stock')->default(0); // Current available stock
            $table->integer('reserved_stock')->default(0); // Stock reserved for specific purposes
            $table->integer('available_stock')->default(0); // Available stock (current - reserved)
            
            // Cost tracking
            $table->decimal('average_cost', 10, 2)->default(0); // Average cost per unit
            $table->decimal('total_value', 10, 2)->default(0); // Total value of current stock
            
            // Status tracking
            $table->boolean('is_expired')->default(false); // Whether this lot is expired
            $table->boolean('is_near_expiry')->default(false); // Whether this lot is near expiry (within 30 days)
            $table->date('last_updated')->nullable(); // Last time stock level was updated
            
            $table->timestamps();
            
            // Unique constraint for product + lot combination
            $table->unique(['product_id', 'lot_number', 'expiry_date']);
            
            // Indexes for better performance
            $table->index(['product_id', 'is_expired']);
            $table->index(['expiry_date', 'is_near_expiry']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_stock_levels');
    }
};