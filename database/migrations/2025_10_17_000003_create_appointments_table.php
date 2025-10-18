<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id('appointment_id');
            $table->string('appointment_code', 10)->unique()->nullable();
            $table->foreignId('patient_id')->constrained('patients', 'patient_id')->onDelete('cascade');
            $table->foreignId('specialist_id')->nullable()->constrained('specialists', 'specialist_id')->onDelete('set null');
            $table->foreignId('nurse_id')->nullable()->constrained('specialists', 'specialist_id')->onDelete('set null');
            $table->string('appointment_type', 100);
            $table->enum('specialist_type', ['doctor','medtech']);
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->integer('duration')->default(30);
            $table->decimal('price', 10, 2)->default(0.00);
            $table->text('additional_info')->nullable();
            $table->enum('source', ['Online','Walk-in'])->default('Online');
            $table->enum('status', ['Pending','Confirmed','Completed','Cancelled'])->default('Pending');
            $table->text('admin_notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }
    public function down() {
        Schema::dropIfExists('appointments');
    }
};
