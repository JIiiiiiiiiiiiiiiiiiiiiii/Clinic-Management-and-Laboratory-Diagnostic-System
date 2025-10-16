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
        Schema::create('visits', function (Blueprint $table) {
            $table->id();
            
            // Foreign keys
            $table->foreignId('appointment_id')->constrained()->onDelete('cascade');
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->foreignId('attending_staff_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('follow_up_visit_id')->nullable()->constrained('visits')->onDelete('set null');
            
            // Visit details
            $table->datetime('visit_date_time');
            $table->string('purpose');
            $table->text('notes')->nullable();
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled'])->default('scheduled');
            $table->enum('visit_type', ['initial', 'follow_up', 'lab_result_review'])->default('initial');
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for better performance
            $table->index(['visit_date_time']);
            $table->index(['status']);
            $table->index(['visit_type']);
            $table->index(['patient_id', 'visit_date_time']);
            $table->index(['attending_staff_id', 'visit_date_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visits');
    }
};
