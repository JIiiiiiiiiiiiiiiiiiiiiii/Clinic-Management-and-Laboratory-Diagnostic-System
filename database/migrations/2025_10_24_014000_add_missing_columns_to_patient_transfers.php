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
            // Add missing columns for patient registration system
            if (!Schema::hasColumn('patient_transfers', 'registration_type')) {
                $table->enum('registration_type', ['admin', 'hospital'])->default('admin');
            }
            if (!Schema::hasColumn('patient_transfers', 'approval_status')) {
                $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('pending');
            }
            if (!Schema::hasColumn('patient_transfers', 'requested_by')) {
                $table->unsignedBigInteger('requested_by')->nullable();
            }
            if (!Schema::hasColumn('patient_transfers', 'approved_by')) {
                $table->unsignedBigInteger('approved_by')->nullable();
            }
            if (!Schema::hasColumn('patient_transfers', 'approval_date')) {
                $table->datetime('approval_date')->nullable();
            }
            if (!Schema::hasColumn('patient_transfers', 'approval_notes')) {
                $table->text('approval_notes')->nullable();
            }
        });
        
        // Update existing records to have a default requested_by user
        $defaultUser = \App\Models\User::first();
        if ($defaultUser) {
            \DB::table('patient_transfers')->whereNull('requested_by')->update(['requested_by' => $defaultUser->id]);
        }
        
        // Add foreign key constraints if they don't exist
        Schema::table('patient_transfers', function (Blueprint $table) {
            if (!Schema::hasColumn('patient_transfers', 'requested_by_foreign')) {
                $table->foreign('requested_by')->references('id')->on('users')->onDelete('cascade');
            }
            if (!Schema::hasColumn('patient_transfers', 'approved_by_foreign')) {
                $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            }
            
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
            // Drop the added columns
            $table->dropColumn([
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
