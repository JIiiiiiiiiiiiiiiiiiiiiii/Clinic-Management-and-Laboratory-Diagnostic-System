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
        Schema::create('appointment_lab_orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('appointment_id');
            $table->unsignedBigInteger('lab_order_id');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('appointment_id')->references('id')->on('appointments')->onDelete('cascade');
            $table->foreign('lab_order_id')->references('id')->on('lab_orders')->onDelete('cascade');

            // Unique constraint to prevent duplicate links
            $table->unique(['appointment_id', 'lab_order_id']);

            // Indexes
            $table->index('appointment_id');
            $table->index('lab_order_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointment_lab_orders');
    }
};
