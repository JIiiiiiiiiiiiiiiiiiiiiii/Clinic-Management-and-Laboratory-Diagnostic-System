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
        Schema::create('clinic_procedures', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->string('category'); // laboratory, diagnostic, treatment, consultation
            $table->string('subcategory')->nullable(); // blood_test, imaging, therapy, etc.
            $table->decimal('price', 10, 2);
            $table->integer('duration_minutes')->default(30); // Procedure duration
            $table->json('requirements')->nullable(); // Special requirements or preparations
            $table->json('equipment_needed')->nullable(); // Equipment required
            $table->json('personnel_required')->nullable(); // Required staff roles
            $table->boolean('is_active')->default(true);
            $table->boolean('requires_prescription')->default(false);
            $table->boolean('is_emergency')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            // Indexes
            $table->index(['category', 'is_active']);
            $table->index(['subcategory']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clinic_procedures');
    }
};
