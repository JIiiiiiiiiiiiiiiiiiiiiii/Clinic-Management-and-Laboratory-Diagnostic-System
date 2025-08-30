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
        Schema::create('fecalysis_results', function (Blueprint $table) {
            $table->id('fecalysis_result_id');
            $table->unsignedBigInteger('laboratory_request_id')->unique();
            $table->string('color', 50)->nullable();
            $table->string('consistency', 50)->nullable();
            $table->string('parasites', 255)->nullable();
            $table->string('ova', 255)->nullable();
            $table->timestamps();

            $table->foreign('laboratory_request_id')->references('laboratory_request_id')->on('laboratory_requests');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fecalysis_results');
    }
};
