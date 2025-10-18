<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('specialists', function (Blueprint $table) {
            $table->id('specialist_id');
            $table->string('specialist_code', 10)->unique()->nullable();
            $table->string('name', 255);
            $table->enum('role', ['Doctor','Nurse','MedTech','Admin']);
            $table->string('specialization', 100)->nullable();
            $table->string('contact', 20)->nullable();
            $table->string('email', 150)->nullable();
            $table->enum('status', ['Active','Inactive'])->default('Active');
            $table->timestamps();
        });
    }
    public function down() {
        Schema::dropIfExists('specialists');
    }
};
