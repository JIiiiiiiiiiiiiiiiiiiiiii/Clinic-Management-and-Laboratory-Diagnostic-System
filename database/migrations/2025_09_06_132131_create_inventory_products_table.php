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
        Schema::create('inventory_products', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Product name (e.g., MICROPORE)
            $table->string('code')->unique(); // Product code for easy identification
            $table->text('description')->nullable();
            $table->string('category')->nullable(); // Medical supplies, equipment, etc.
            $table->string('unit_of_measure'); // pieces, boxes, liters, etc.
            $table->decimal('unit_cost', 10, 2)->default(0); // Cost per unit
            $table->integer('minimum_stock_level')->default(0); // Reorder point
            $table->integer('maximum_stock_level')->nullable(); // Maximum stock to maintain
            $table->boolean('is_active')->default(true);
            $table->boolean('requires_lot_tracking')->default(false); // For products that need lot/expiry tracking
            $table->boolean('requires_expiry_tracking')->default(false); // For products with expiry dates
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_products');
    }
};