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
        // Fix invalid appointment_id values in billing_transactions
        DB::table('billing_transactions')
            ->whereNotIn('appointment_id', function($query) {
                $query->select('id')->from('appointments');
            })
            ->update(['appointment_id' => null]);

        // Fix invalid specialist_id values in billing_transactions
        DB::table('billing_transactions')
            ->whereNotIn('specialist_id', function($query) {
                $query->select('id')->from('users');
            })
            ->update(['specialist_id' => null]);

        // Now try to add the foreign key constraints
        Schema::table('billing_transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('billing_transactions', 'appointment_id')) {
                $table->foreignId('appointment_id')->nullable()->constrained()->onDelete('cascade')->after('transaction_code');
            }
            if (!Schema::hasColumn('billing_transactions', 'specialist_id')) {
                $table->foreignId('specialist_id')->nullable()->constrained('users')->onDelete('cascade')->after('patient_id');
            }
            if (!Schema::hasColumn('billing_transactions', 'amount')) {
                $table->decimal('amount', 10, 2)->nullable()->after('specialist_id');
            }
            if (!Schema::hasColumn('billing_transactions', 'payment_method')) {
                $table->enum('payment_method', ['Cash', 'Card', 'HMO'])->default('Cash')->after('amount');
            }
            if (!Schema::hasColumn('billing_transactions', 'reference_no')) {
                $table->string('reference_no', 100)->nullable()->after('payment_method');
            }
            if (!Schema::hasColumn('billing_transactions', 'notes')) {
                $table->text('notes')->nullable()->after('reference_no');
            }
            if (!Schema::hasColumn('billing_transactions', 'status')) {
                $table->enum('status', ['Pending', 'Paid', 'Cancelled'])->default('Pending')->after('notes');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('billing_transactions', function (Blueprint $table) {
            if (Schema::hasColumn('billing_transactions', 'appointment_id')) {
                $table->dropForeign(['appointment_id']);
                $table->dropColumn('appointment_id');
            }
            if (Schema::hasColumn('billing_transactions', 'specialist_id')) {
                $table->dropForeign(['specialist_id']);
                $table->dropColumn('specialist_id');
            }
            if (Schema::hasColumn('billing_transactions', 'amount')) {
                $table->dropColumn('amount');
            }
            if (Schema::hasColumn('billing_transactions', 'payment_method')) {
                $table->dropColumn('payment_method');
            }
            if (Schema::hasColumn('billing_transactions', 'reference_no')) {
                $table->dropColumn('reference_no');
            }
            if (Schema::hasColumn('billing_transactions', 'notes')) {
                $table->dropColumn('notes');
            }
            if (Schema::hasColumn('billing_transactions', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};