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
            // Add new columns for patient registration system
            $table->json('patient_data')->nullable(); // Store complete patient registration data
            $table->enum('registration_type', ['admin', 'hospital'])->default('admin');
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->unsignedBigInteger('requested_by')->nullable(); // Make nullable first
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->datetime('approval_date')->nullable();
            $table->text('approval_notes')->nullable();
            
            // Modify existing columns
            $table->string('transfer_reason')->nullable()->change(); // Make nullable since it's not always a transfer
            $table->boolean('from_hospital')->default(false)->change();
            $table->boolean('to_clinic')->default(false)->change();
        });
        
        // Update existing records to have a default requested_by user
        $defaultUser = \App\Models\User::first();
        if ($defaultUser) {
            \DB::table('patient_transfers')->update(['requested_by' => $defaultUser->id]);
        }
        
        // Now add the foreign key constraints
        Schema::table('patient_transfers', function (Blueprint $table) {
            $table->foreign('requested_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            
            // Add indexes
            $table->index(['registration_type', 'approval_status']);
            $table->index(['requested_by', 'approval_status']);
            $table->index(['approved_by', 'approval_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patient_transfers', function (Blueprint $table) {
            // Drop the new columns
            $table->dropColumn([
                'patient_data',
                'registration_type', 
                'approval_status',
                'requested_by',
                'approved_by',
                'approval_date',
                'approval_notes'
            ]);
            
            // Drop indexes
            $table->dropIndex(['registration_type', 'approval_status']);
            $table->dropIndex(['requested_by', 'approval_status']);
            $table->dropIndex(['approved_by', 'approval_date']);
        });
    }
};
