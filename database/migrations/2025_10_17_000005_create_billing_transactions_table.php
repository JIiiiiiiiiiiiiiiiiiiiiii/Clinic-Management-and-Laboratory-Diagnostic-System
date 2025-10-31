<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        if (!Schema::hasTable('billing_transactions')) {
            Schema::create('billing_transactions', function (Blueprint $table) {
            $table->id('transaction_id');
            $table->string('transaction_code', 20)->unique()->nullable();
            $table->foreignId('appointment_id')->constrained('appointments', 'appointment_id')->onDelete('cascade');
            $table->foreignId('patient_id')->constrained('patients', 'patient_id')->onDelete('cascade');
            $table->foreignId('doctor_id')->nullable()->constrained('specialists', 'specialist_id')->onDelete('set null');
            $table->foreignId('medtech_id')->nullable()->constrained('specialists', 'specialist_id')->onDelete('set null');
            $table->foreignId('nurse_id')->nullable()->constrained('specialists', 'specialist_id')->onDelete('set null');
            $table->decimal('amount', 10, 2);
            $table->enum('payment_method', ['Cash','Card','HMO','Insurance'])->default('Cash');
            $table->string('reference_no', 100)->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['Pending','Paid','Cancelled'])->default('Pending');
            $table->timestamp('transaction_date')->useCurrent();
            $table->timestamps();
            });
        }
    }
    public function down() {
        Schema::dropIfExists('billing_transactions');
    }
};
