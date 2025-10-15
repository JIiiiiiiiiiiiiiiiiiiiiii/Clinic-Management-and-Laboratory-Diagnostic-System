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
        Schema::create('supply_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('supplies')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('charged_to')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('type', ['in', 'out']);
            $table->enum('subtype', ['purchase', 'return', 'adjustment', 'consumed', 'used', 'rejected', 'expired', 'damaged']);
            $table->integer('quantity');
            $table->decimal('unit_cost', 10, 2)->default(0);
            $table->decimal('total_cost', 10, 2)->default(0);
            $table->string('lot_number')->nullable();
            $table->date('expiry_date')->nullable();
            $table->date('date_opened')->nullable();
            $table->text('notes')->nullable();
            $table->string('reference_number')->nullable();
            $table->date('transaction_date');
            $table->datetime('transaction_time');
            $table->integer('remaining_quantity')->default(0);
            $table->boolean('is_verified')->default(false);
            $table->string('usage_location')->nullable();
            $table->text('usage_purpose')->nullable();
            $table->datetime('approved_at')->nullable();
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supply_transactions');
    }
};
