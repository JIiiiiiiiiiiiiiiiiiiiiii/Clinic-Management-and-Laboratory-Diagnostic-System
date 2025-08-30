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
        Schema::create('inventory', function (Blueprint $table) {
            $table->id('inventory_id');
            $table->string('item_name', 100);
            $table->text('description')->nullable();
            $table->string('category', 50); // e.g., 'Medication', 'Laboratory Supply', 'Equipment'
            $table->integer('quantity')->default(0);
            $table->string('unit', 20);
            $table->date('added_date')->default(DB::raw('CURRENT_DATE'));
            $table->date('expiration_date')->nullable(); // For medications
            $table->text('storage_instructions')->nullable(); // For specific items
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory');
    }
};
