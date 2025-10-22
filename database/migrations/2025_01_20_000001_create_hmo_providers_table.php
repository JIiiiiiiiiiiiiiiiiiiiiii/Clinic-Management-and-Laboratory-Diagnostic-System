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
        Schema::create('hmo_providers', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code')->unique(); // Short code like 'MAXI', 'PHIL', 'INTEL'
            $table->text('description')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('address')->nullable();
            $table->decimal('commission_rate', 5, 2)->default(0.00); // Commission percentage
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->json('coverage_details')->nullable(); // Store coverage limits, exclusions, etc.
            $table->json('payment_terms')->nullable(); // Payment terms and conditions
            $table->date('contract_start_date')->nullable();
            $table->date('contract_end_date')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hmo_providers');
    }
};
