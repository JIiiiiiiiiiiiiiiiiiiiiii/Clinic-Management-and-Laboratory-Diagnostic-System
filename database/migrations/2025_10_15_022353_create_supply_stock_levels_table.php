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
        Schema::create('supply_stock_levels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('supplies')->onDelete('cascade');
            $table->string('lot_number')->nullable();
            $table->date('expiry_date')->nullable();
            $table->integer('current_stock')->default(0);
            $table->integer('reserved_stock')->default(0);
            $table->integer('available_stock')->default(0);
            $table->decimal('average_cost', 10, 2)->default(0);
            $table->decimal('total_value', 10, 2)->default(0);
            $table->boolean('is_expired')->default(false);
            $table->boolean('is_near_expiry')->default(false);
            $table->date('last_updated')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supply_stock_levels');
    }
};
