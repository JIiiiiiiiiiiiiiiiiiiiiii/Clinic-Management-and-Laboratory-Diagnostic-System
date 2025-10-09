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
            $table->foreignId('billing_transaction_id')->constrained()->onDelete('cascade');
            $table->enum('item_type', ['consultation', 'laboratory', 'medicine', 'procedure', 'other'])->default('consultation');
            $table->string('item_name');
            $table->text('item_description')->nullable();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->foreignId('lab_test_id')->nullable()->constrained('lab_tests')->onDelete('set null');
            $table->string('service_id')->nullable();
            $table->string('medicine_id')->nullable();
            $table->timestamps();
            
            $table->index(['billing_transaction_id', 'item_type']);
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
