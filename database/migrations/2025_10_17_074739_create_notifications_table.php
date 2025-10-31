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
        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
            $table->id('notification_id');
            $table->string('ref_table', 50)->nullable();
            $table->unsignedBigInteger('ref_id')->nullable();
            $table->string('user_role', 50)->nullable(); // e.g., 'Admin'
            $table->string('title', 255)->nullable();
            $table->text('body')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('created_at')->useCurrent();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};