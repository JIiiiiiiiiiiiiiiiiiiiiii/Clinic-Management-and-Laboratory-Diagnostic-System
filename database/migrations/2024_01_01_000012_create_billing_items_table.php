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
        Schema::create('billing_items', function (Blueprint $table) {
            $table->id('billing_item_id');
            $table->unsignedBigInteger('bill_id');
            $table->unsignedBigInteger('consultation_id')->nullable();
            $table->unsignedBigInteger('laboratory_request_id')->nullable();
            $table->string('description', 255);
            $table->decimal('amount', 10, 2);
            $table->timestamps();

            $table->foreign('bill_id')->references('bill_id')->on('billing');
            $table->foreign('consultation_id')->references('consultation_id')->on('consultations');
            $table->foreign('laboratory_request_id')->references('laboratory_request_id')->on('laboratory_requests');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_items');
    }
};
