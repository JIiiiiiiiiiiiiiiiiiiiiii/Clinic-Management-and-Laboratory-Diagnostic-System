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
        Schema::create('patient_transfer_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->foreignId('transfer_id')->constrained('patient_transfers')->onDelete('cascade');
            $table->enum('action', ['created', 'accepted', 'rejected', 'cancelled', 'completed']);
            $table->string('action_by_role'); // 'admin', 'hospital_admin', 'hospital_staff'
            $table->foreignId('action_by_user')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->json('transfer_data')->nullable(); // Store the full transfer data for history
            $table->datetime('action_date');
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['patient_id', 'action_date']);
            $table->index(['transfer_id', 'action']);
            $table->index(['action_by_role', 'action_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_transfer_history');
    }
};
