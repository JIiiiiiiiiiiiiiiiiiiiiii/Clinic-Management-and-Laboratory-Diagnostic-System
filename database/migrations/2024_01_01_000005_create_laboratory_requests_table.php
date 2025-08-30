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
        Schema::create('laboratory_requests', function (Blueprint $table) {
            $table->id('laboratory_request_id');
            $table->unsignedBigInteger('consultation_id');
            $table->unsignedBigInteger('test_id');
            $table->unsignedBigInteger('requested_by_user_id');
            $table->date('request_date')->default(DB::raw('CURRENT_DATE'));
            $table->date('sample_collected_date')->nullable();
            $table->date('result_date')->nullable();
            $table->enum('status', [
                'Requested',
                'Sample Collected',
                'Processing',
                'Completed',
                'Released',
                'Billed',
                'Cancelled'
            ])->default('Requested');
            $table->timestamps();

            $table->foreign('consultation_id')->references('consultation_id')->on('consultations');
            $table->foreign('test_id')->references('test_id')->on('laboratory_tests');
            $table->foreign('requested_by_user_id')->references('user_id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laboratory_requests');
    }
};
