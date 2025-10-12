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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_type'); // patients, laboratory, inventory, appointments, specialist_management, billing
            $table->string('report_name');
            $table->text('description')->nullable();
            $table->json('filters')->nullable(); // Store filter criteria as JSON
            $table->json('data')->nullable(); // Store report data as JSON
            $table->string('period'); // daily, monthly, yearly
            $table->date('start_date');
            $table->date('end_date');
            $table->string('status')->default('active'); // active, archived, deleted
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['report_type', 'period', 'start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
