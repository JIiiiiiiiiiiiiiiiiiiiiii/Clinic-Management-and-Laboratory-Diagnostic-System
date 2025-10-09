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
        Schema::table('users', function (Blueprint $table) {
            // Add columns only if they don't exist
            if (!Schema::hasColumn('users', 'availability')) {
                $table->string('availability')->nullable();
            }
            if (!Schema::hasColumn('users', 'rating')) {
                $table->decimal('rating', 3, 2)->default(0);
            }
            if (!Schema::hasColumn('users', 'experience')) {
                $table->string('experience')->nullable();
            }
            if (!Schema::hasColumn('users', 'nextAvailable')) {
                $table->string('nextAvailable')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['availability', 'rating', 'experience', 'nextAvailable']);
        });
    }
};
