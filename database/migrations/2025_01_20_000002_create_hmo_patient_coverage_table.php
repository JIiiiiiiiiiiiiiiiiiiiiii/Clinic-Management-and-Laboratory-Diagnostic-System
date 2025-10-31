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
        if (!Schema::hasTable('hmo_patient_coverage')) {
            Schema::create('hmo_patient_coverage', function (Blueprint $table) {
                $table->id();
                $table->foreignId('patient_id')->constrained()->onDelete('cascade');
                $table->foreignId('hmo_provider_id')->constrained('hmo_providers')->onDelete('cascade');
                $table->string('member_id')->nullable(); // Patient's HMO member ID
                $table->string('policy_number')->nullable();
                $table->string('group_number')->nullable();
                $table->date('coverage_start_date')->nullable();
                $table->date('coverage_end_date')->nullable();
                $table->decimal('annual_limit', 10, 2)->nullable(); // Annual coverage limit
                $table->decimal('used_amount', 10, 2)->default(0.00); // Amount used this year
                $table->decimal('remaining_amount', 10, 2)->nullable(); // Calculated remaining amount
                $table->enum('status', ['active', 'inactive', 'expired', 'suspended'])->default('active');
                $table->text('notes')->nullable();
                $table->json('coverage_details')->nullable(); // Specific coverage details
                $table->timestamps();
                
                $table->index(['patient_id', 'hmo_provider_id']);
                $table->index(['status', 'coverage_end_date']);
                $table->unique(['patient_id', 'hmo_provider_id', 'member_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hmo_patient_coverage');
    }
};
