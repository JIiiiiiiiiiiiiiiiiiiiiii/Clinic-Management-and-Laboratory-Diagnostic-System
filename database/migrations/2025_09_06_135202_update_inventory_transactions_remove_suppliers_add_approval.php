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
        Schema::table('inventory_transactions', function (Blueprint $table) {
            // Remove supplier foreign key constraint and column
            $table->dropForeign(['supplier_id']);
            $table->dropColumn('supplier_id');

            // Add approval tracking fields
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('charged_to')->nullable()->constrained('users')->onDelete('set null');
            $table->string('usage_location')->nullable(); // Where the supply was used
            $table->text('usage_purpose')->nullable(); // Purpose of usage
            $table->timestamp('approved_at')->nullable(); // When it was approved
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('pending');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_transactions', function (Blueprint $table) {
            // Remove approval tracking fields
            $table->dropForeign(['approved_by']);
            $table->dropForeign(['charged_to']);
            $table->dropColumn(['approved_by', 'charged_to', 'usage_location', 'usage_purpose', 'approved_at', 'approval_status']);

            // Add back supplier column
            $table->foreignId('supplier_id')->nullable()->constrained('inventory_suppliers')->onDelete('set null');
        });
    }
};
