<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_result_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lab_result_id')->constrained('lab_results')->cascadeOnDelete();
            $table->string('parameter_key');
            $table->string('parameter_label')->nullable();
            $table->string('value')->nullable();
            $table->string('unit')->nullable();
            $table->string('reference_text')->nullable();
            $table->string('reference_min')->nullable();
            $table->string('reference_max')->nullable();
            $table->timestamps();
            $table->unique(['lab_result_id', 'parameter_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_result_values');
    }
};


