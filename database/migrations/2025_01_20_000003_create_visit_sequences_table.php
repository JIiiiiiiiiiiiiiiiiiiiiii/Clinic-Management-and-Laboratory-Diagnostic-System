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
        Schema::create('visit_sequences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('initial_visit_id')->constrained('visits')->onDelete('cascade');
            $table->integer('sequence_number');
            $table->foreignId('visit_id')->constrained('visits')->onDelete('cascade');
            $table->enum('visit_type', ['initial', 'lab_result_review', 'follow_up'])->notNull();
            $table->enum('status', ['scheduled', 'completed', 'cancelled'])->default('scheduled');
            $table->date('scheduled_date')->nullable();
            $table->date('completed_date')->nullable();
            $table->timestamps();
            
            // Unique constraint for sequence
            $table->unique(['patient_id', 'initial_visit_id', 'sequence_number'], 'unique_sequence');
            
            // Indexes for better performance
            $table->index(['patient_id']);
            $table->index(['initial_visit_id']);
            $table->index(['visit_id']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visit_sequences');
    }
};
