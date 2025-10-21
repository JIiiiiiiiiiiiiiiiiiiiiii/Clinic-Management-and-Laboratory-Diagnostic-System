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
        Schema::create('specialists', function (Blueprint $table) {
            $table->id('specialist_id');
            $table->string('specialist_code', 10)->unique();
            $table->string('name', 255);
            $table->enum('role', ['Doctor', 'Nurse', 'MedTech', 'Admin']);
            $table->string('specialization', 100)->nullable();
            $table->string('contact', 20)->nullable();
            $table->string('email', 150)->nullable();
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('specialists');
    }
};