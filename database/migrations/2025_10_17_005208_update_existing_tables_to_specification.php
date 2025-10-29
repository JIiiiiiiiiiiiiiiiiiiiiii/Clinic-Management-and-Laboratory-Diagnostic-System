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
        // Update patients table to match specification (only if table exists)
        if (Schema::hasTable('patients')) {
            Schema::table('patients', function (Blueprint $table) {
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('patients', 'emergency_name')) {
                $table->string('emergency_name', 100)->nullable();
            }
            if (!Schema::hasColumn('patients', 'emergency_relation')) {
                $table->string('emergency_relation', 50)->nullable();
            }
            if (!Schema::hasColumn('patients', 'insurance_company')) {
                $table->string('insurance_company', 100)->nullable();
            }
            if (!Schema::hasColumn('patients', 'approval_code')) {
                $table->string('approval_code', 100)->nullable();
            }
            if (!Schema::hasColumn('patients', 'social_history')) {
                $table->text('social_history')->nullable();
            }
            if (!Schema::hasColumn('patients', 'obgyn_history')) {
                $table->text('obgyn_history')->nullable();
            }
            });
        }

        // Update appointments table to match specification (only if table exists)
        if (Schema::hasTable('appointments')) {
            Schema::table('appointments', function (Blueprint $table) {
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('appointments', 'billing_status')) {
                $table->enum('billing_status', ['pending', 'in_transaction', 'paid', 'cancelled'])
                      ->default('pending')
                      ->after('status');
            }
            });
        }

        // Update visits table to match specification (only if table exists)
        if (Schema::hasTable('visits')) {
            Schema::table('visits', function (Blueprint $table) {
            // Ensure visit_date is datetime
            if (Schema::hasColumn('visits', 'visit_date')) {
                $table->datetime('visit_date')->nullable()->change();
            }
            });
        }

        // Update billing_transactions table to match specification (only if table exists)
        if (Schema::hasTable('billing_transactions')) {
            Schema::table('billing_transactions', function (Blueprint $table) {
            // Add missing columns if they don't exist
            if (!Schema::hasColumn('billing_transactions', 'appointment_id')) {
                $table->unsignedBigInteger('appointment_id')->unique()->after('transaction_code');
                $table->foreign('appointment_id')->references('appointment_id')->on('appointments')->onDelete('cascade');
            }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove added columns
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn([
                'emergency_name',
                'emergency_relation', 
                'insurance_company',
                'approval_code',
                'social_history',
                'obgyn_history'
            ]);
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn('billing_status');
        });

        Schema::table('billing_transactions', function (Blueprint $table) {
            $table->dropForeign(['appointment_id']);
            $table->dropColumn('appointment_id');
        });
    }
};