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
        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('inventory_products')->onDelete('cascade');
            $table->foreignId('supplier_id')->nullable()->constrained('inventory_suppliers')->onDelete('set null');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Technician/Staff who performed the action

            // Transaction details
            $table->enum('type', ['in', 'out', 'adjustment', 'transfer']); // in=received, out=consumed/used/rejected
            $table->enum('subtype', ['received', 'consumed', 'used', 'rejected', 'expired', 'damaged', 'adjustment', 'transfer_in', 'transfer_out'])->nullable();
            $table->integer('quantity'); // Positive for 'in', negative for 'out'
            $table->decimal('unit_cost', 10, 2)->nullable(); // Cost per unit at time of transaction
            $table->decimal('total_cost', 10, 2)->nullable(); // Total cost of transaction

            // Lot and expiry tracking (based on the inventory sheet)
            $table->string('lot_number')->nullable(); // Lot number from the sheet
            $table->date('expiry_date')->nullable(); // Expiry date from the sheet
            $table->date('date_opened')->nullable(); // When the product was first opened (from the sheet)

            // Additional details
            $table->text('notes')->nullable(); // Additional notes or reason for rejection
            $table->string('reference_number')->nullable(); // Invoice number, PO number, etc.
            $table->date('transaction_date'); // Date of the transaction
            $table->time('transaction_time')->nullable(); // Time of the transaction

            // For tracking purposes
            $table->integer('remaining_quantity')->nullable(); // Remaining quantity after this transaction
            $table->boolean('is_verified')->default(false); // Whether the transaction has been verified

            $table->timestamps();

            // Indexes for better performance
            $table->index(['product_id', 'transaction_date']);
            $table->index(['type', 'transaction_date']);
            $table->index(['lot_number', 'expiry_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
    }
};
