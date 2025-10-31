<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        if (!Schema::hasTable('daily_transactions')) {
            Schema::create('daily_transactions', function (Blueprint $table) {
            $table->id();
            $table->date('transaction_date');
            $table->enum('transaction_type', ['billing','doctor_payment','expense']);
            $table->string('transaction_id', 20);
            $table->string('patient_name', 255)->nullable();
            $table->string('specialist_name', 255)->nullable();
            $table->decimal('amount', 10, 2);
            $table->string('payment_method', 50)->nullable();
            $table->string('status', 50)->nullable();
            $table->text('description')->nullable();
            $table->integer('items_count')->default(0);
            $table->integer('appointments_count')->default(0);
            $table->bigInteger('original_transaction_id')->nullable();
            $table->string('original_table', 50)->nullable();
            $table->timestamps();
            });
        }
    }
    public function down() {
        Schema::dropIfExists('daily_transactions');
    }
};
