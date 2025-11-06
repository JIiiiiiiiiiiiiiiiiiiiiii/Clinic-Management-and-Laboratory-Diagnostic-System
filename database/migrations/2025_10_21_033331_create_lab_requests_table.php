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
        // Check if table already exists before creating
        if (!Schema::hasTable('lab_requests')) {
            Schema::create('lab_requests', function (Blueprint $table) {
                $table->id();
                $table->foreignId('visit_id')->constrained('visits')->onDelete('cascade');
                $table->foreignId('lab_test_id')->constrained('lab_tests')->onDelete('cascade');
                $table->foreignId('requested_by')->constrained('users')->onDelete('cascade');
                $table->string('status')->default('requested'); // requested, processing, completed, cancelled
                $table->text('notes')->nullable();
                $table->decimal('price', 10, 2)->default(0);
                $table->timestamps();

                // Indexes for better performance
                $table->index(['visit_id', 'status']);
                $table->index(['lab_test_id']);
                $table->index(['requested_by']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lab_requests');
    }
};
