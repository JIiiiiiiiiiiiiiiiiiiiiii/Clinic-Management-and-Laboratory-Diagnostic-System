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
        // Create lab_orders table if it doesn't exist
        if (!Schema::hasTable('lab_orders')) {
            Schema::create('lab_orders', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('patient_id');
                $table->foreign('patient_id')->references('patient_id')->on('patients')->cascadeOnDelete();
                $table->foreignId('doctor_id')->nullable()->constrained('users')->nullOnDelete();
                $table->json('lab_tests')->nullable();
                $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
                $table->text('notes')->nullable();
                $table->timestamp('ordered_at')->nullable();
                $table->timestamp('completed_at')->nullable();
                $table->timestamps();
            });
        }

        // Create lab_results table if it doesn't exist
        if (!Schema::hasTable('lab_results')) {
            Schema::create('lab_results', function (Blueprint $table) {
                $table->id();
                $table->foreignId('lab_order_id')->constrained('lab_orders')->cascadeOnDelete();
                $table->foreignId('lab_test_id')->constrained('lab_tests')->cascadeOnDelete();
                $table->json('results')->nullable();
                $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('verified_at')->nullable();
                $table->timestamps();
            });
        }

        // Create lab_result_values table if it doesn't exist
        if (!Schema::hasTable('lab_result_values')) {
            Schema::create('lab_result_values', function (Blueprint $table) {
                $table->id();
                $table->foreignId('lab_result_id')->constrained('lab_results')->cascadeOnDelete();
                $table->string('parameter_name');
                $table->string('value')->nullable();
                $table->string('unit')->nullable();
                $table->string('reference_range')->nullable();
                $table->enum('status', ['normal', 'abnormal', 'critical'])->default('normal');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lab_result_values');
        Schema::dropIfExists('lab_results');
        Schema::dropIfExists('lab_orders');
    }
};