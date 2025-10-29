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
        // First, ensure all patient_transfers have valid requested_by values
        $defaultUser = \App\Models\User::first();
        if ($defaultUser) {
            \DB::table('patient_transfers')->whereNull('requested_by')->update(['requested_by' => $defaultUser->id]);
        }
        
        // Now add the foreign key constraints
        Schema::table('patient_transfers', function (Blueprint $table) {
            $table->foreign('requested_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patient_transfers', function (Blueprint $table) {
            $table->dropForeign(['requested_by']);
            $table->dropForeign(['approved_by']);
        });
    }
};
