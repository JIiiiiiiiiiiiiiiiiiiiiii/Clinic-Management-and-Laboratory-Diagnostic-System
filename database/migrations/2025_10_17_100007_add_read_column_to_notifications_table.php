<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add read column to notifications table for backward compatibility
     */
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            // Add read column as boolean with default false
            if (!Schema::hasColumn('notifications', 'read')) {
                $table->boolean('read')->default(false)->after('is_read');
                $table->index('read');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn('read');
        });
    }
};

