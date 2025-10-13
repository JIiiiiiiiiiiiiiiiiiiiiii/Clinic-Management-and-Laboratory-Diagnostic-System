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
            
            // Core relationships
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('appointment_id')->nullable()->constrained('appointments')->onDelete('set null');
            $table->foreignId('doctor_id')->constrained('users')->onDelete('cascade');
            
            // Visit details
            $table->datetime('visit_date');
            $table->text('reason')->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('prescription')->nullable();
            $table->boolean('lab_request')->default(false);
            $table->foreignId('billing_id')->nullable()->constrained('billing_transactions')->onDelete('set null');
            
            // Status and tracking
            $table->enum('status', ['Pending', 'In Progress', 'Completed', 'Cancelled'])->default('Pending');
            $table->json('vitals')->nullable(); // Store vitals as JSON
            $table->text('notes')->nullable();
            
            // Follow-up
            $table->boolean('follow_up_required')->default(false);
            $table->date('follow_up_date')->nullable();
            
            // Audit fields
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for better performance
            $table->index(['patient_id', 'visit_date']);
            $table->index(['doctor_id', 'visit_date']);
            $table->index(['status']);
            $table->index(['visit_date']);
            $table->index(['appointment_id']);
            $table->index(['billing_id']);
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
