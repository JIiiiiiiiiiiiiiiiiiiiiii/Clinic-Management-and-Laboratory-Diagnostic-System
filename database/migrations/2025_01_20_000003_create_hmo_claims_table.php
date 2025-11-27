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
        if (!Schema::hasTable('hmo_claims')) {
            Schema::create('hmo_claims', function (Blueprint $table) {
                $table->id();
                $table->string('claim_number')->unique();
                $table->foreignId('billing_transaction_id')->constrained('billing_transactions')->onDelete('cascade');
                $table->foreignId('hmo_provider_id')->constrained('hmo_providers')->onDelete('cascade');
                $table->foreignId('patient_id')->constrained()->onDelete('cascade');
                $table->string('member_id')->nullable();
                $table->decimal('claim_amount', 10, 2);
                $table->decimal('approved_amount', 10, 2)->nullable();
                $table->decimal('rejected_amount', 10, 2)->nullable();
                $table->enum('status', ['submitted', 'under_review', 'approved', 'rejected', 'paid', 'cancelled'])->default('submitted');
                $table->date('submission_date');
                $table->date('review_date')->nullable();
                $table->date('approval_date')->nullable();
                $table->date('payment_date')->nullable();
                $table->text('rejection_reason')->nullable();
                $table->text('notes')->nullable();
                $table->json('supporting_documents')->nullable(); // Store document paths/names
                $table->string('hmo_reference_number')->nullable();
                $table->foreignId('submitted_by')->constrained('users')->onDelete('cascade');
                $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
                $table->timestamps();
                
                $table->index(['status', 'submission_date']);
                $table->index(['hmo_provider_id', 'status']);
                $table->index(['patient_id', 'submission_date']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hmo_claims');
    }
};
