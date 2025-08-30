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
        Schema::create('urinalysis_results', function (Blueprint $table) {
            $table->id('urinalysis_result_id');
            $table->unsignedBigInteger('laboratory_request_id')->unique();

            // GROSS
            $table->string('color', 50)->nullable();
            $table->string('transparency', 50)->nullable();
            $table->decimal('specific_gravity', 10, 3)->nullable();
            $table->decimal('ph', 10, 1)->nullable();

            // CHEMICAL
            $table->string('albumin', 50)->nullable();
            $table->string('glucose', 50)->nullable();
            $table->string('ketone', 50)->nullable();
            $table->string('bile', 50)->nullable();
            $table->string('urobilinogen', 50)->nullable();
            $table->string('blood', 50)->nullable();

            // MICROSCOPIC
            $table->integer('white_blood_cell')->nullable();
            $table->integer('red_blood_cell')->nullable();
            $table->string('casts', 50)->nullable();
            $table->string('crystals', 50)->nullable();
            $table->string('epithelial_cells', 50)->nullable();
            $table->string('bacteria', 50)->nullable();
            $table->string('mucus_threads', 50)->nullable();
            $table->string('others', 255)->nullable();

            $table->timestamps();

            $table->foreign('laboratory_request_id')->references('laboratory_request_id')->on('laboratory_requests');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('urinalysis_results');
    }
};
