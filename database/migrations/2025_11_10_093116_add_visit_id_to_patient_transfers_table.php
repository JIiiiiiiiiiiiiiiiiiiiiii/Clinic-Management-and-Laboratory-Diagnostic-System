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
        Schema::table('patient_transfers', function (Blueprint $table) {
            if (!Schema::hasColumn('patient_transfers', 'visit_id')) {
                $table->unsignedBigInteger('visit_id')->nullable()->after('patient_id');
                $table->foreign('visit_id')->references('id')->on('visits')->onDelete('cascade');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patient_transfers', function (Blueprint $table) {
            if (Schema::hasColumn('patient_transfers', 'visit_id')) {
                $table->dropForeign(['visit_id']);
                $table->dropColumn('visit_id');
            }
        });
    }
};
