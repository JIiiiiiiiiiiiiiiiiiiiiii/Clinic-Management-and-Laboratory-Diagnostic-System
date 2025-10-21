<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, let's make the foreign key fields nullable to avoid constraint issues
        Schema::table('visits', function (Blueprint $table) {
            if (Schema::hasColumn('visits', 'staff_id')) {
                $table->dropForeign(['staff_id']);
                $table->unsignedBigInteger('staff_id')->nullable()->change();
            }
        });

        // Now let's add the foreign key constraint back
        Schema::table('visits', function (Blueprint $table) {
            if (Schema::hasColumn('visits', 'staff_id')) {
                $table->foreign('staff_id')->references('id')->on('users')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('visits', function (Blueprint $table) {
            if (Schema::hasColumn('visits', 'staff_id')) {
                $table->dropForeign(['staff_id']);
            }
        });
    }
};