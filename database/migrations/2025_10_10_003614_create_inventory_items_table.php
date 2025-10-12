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
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('item_name', 100);
            $table->string('item_code', 50)->unique();
            $table->string('category', 50);
            $table->string('unit', 20);
            $table->enum('assigned_to', ['Doctor & Nurse', 'Med Tech']);
            $table->integer('stock')->default(0);
            $table->integer('low_stock_alert')->default(10);
            $table->integer('consumed')->default(0);
            $table->integer('rejected')->default(0);
            $table->enum('status', ['In Stock', 'Low Stock', 'Out of Stock'])->default('In Stock');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
