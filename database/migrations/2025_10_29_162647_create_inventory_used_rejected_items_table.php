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
        Schema::create('inventory_used_rejected_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->onDelete('cascade');
            $table->enum('type', ['used', 'rejected']);
            $table->integer('quantity');
            $table->text('reason')->nullable(); // Reason for rejection or usage
            $table->string('location')->nullable(); // Where it was used/rejected
            $table->string('used_by', 100); // Who used/rejected the item
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->date('date_used_rejected');
            $table->text('remarks')->nullable();
            $table->string('reference_number')->nullable(); // Reference to related transaction
            $table->timestamps();
            
            // Add indexes for better performance
            $table->index(['inventory_item_id', 'type']);
            $table->index(['date_used_rejected']);
            $table->index(['type', 'date_used_rejected']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_used_rejected_items');
    }
};