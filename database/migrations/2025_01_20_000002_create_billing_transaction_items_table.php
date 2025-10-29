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
        Schema::create('billing_transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('billing_transaction_id')->constrained('billing_transactions')->onDelete('cascade');
            $table->foreignId('visit_id')->nullable()->constrained('visits')->onDelete('set null');
            $table->enum('item_type', ['consultation', 'lab_test', 'follow_up', 'procedure'])->notNull();
            $table->unsignedBigInteger('item_id')->nullable(); // lab_test_id or procedure_id
            $table->string('item_name');
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['billing_transaction_id']);
            $table->index(['visit_id']);
            $table->index(['item_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_transaction_items');
    }
};
