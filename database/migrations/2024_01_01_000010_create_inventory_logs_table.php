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
        Schema::create('inventory_logs', function (Blueprint $table) {
            $table->id('log_id');
            $table->unsignedBigInteger('inventory_id');
            $table->unsignedBigInteger('user_id');
            $table->integer('quantity_changed');
            $table->enum('change_type', ['Add', 'Remove']);
            $table->dateTime('change_date')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->foreign('inventory_id')->references('inventory_id')->on('inventory');
            $table->foreign('user_id')->references('user_id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_logs');
    }
};
