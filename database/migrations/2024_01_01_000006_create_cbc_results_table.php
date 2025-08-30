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
        Schema::create('cbc_results', function (Blueprint $table) {
            $table->id('cbc_result_id');
            $table->unsignedBigInteger('laboratory_request_id')->unique();

            // Cell Counts
            $table->decimal('hemoglobin', 10, 2)->nullable();
            $table->decimal('hematocrit', 10, 2)->nullable();
            $table->decimal('white_blood_cell', 10, 2)->nullable();
            $table->decimal('red_blood_cell', 10, 2)->nullable();
            $table->integer('platelet_count')->nullable();

            // Differential Count
            $table->decimal('segmenters', 5, 2)->nullable();
            $table->decimal('lymphocytes', 5, 2)->nullable();
            $table->decimal('mixed', 5, 2)->nullable();

            // Red Cell Indices
            $table->decimal('mcv', 10, 2)->nullable(); // Mean Corpuscular Volume
            $table->decimal('mch', 10, 2)->nullable(); // Mean Corpuscular Hemoglobin
            $table->decimal('mchc', 10, 2)->nullable(); // Mean Corpuscular Hemoglobin Concentration

            $table->timestamps();

            $table->foreign('laboratory_request_id')->references('laboratory_request_id')->on('laboratory_requests');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cbc_results');
    }
};
