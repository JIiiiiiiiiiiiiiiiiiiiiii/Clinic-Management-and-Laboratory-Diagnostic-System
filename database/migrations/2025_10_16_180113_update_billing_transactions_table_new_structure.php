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
        Schema::table('billing_transactions', function (Blueprint $table) {
            // Add new fields that don't exist
            if (!Schema::hasColumn('billing_transactions', 'transaction_code')) {
                $table->string('transaction_code', 15)->unique()->after('id');
            }
            
            if (!Schema::hasColumn('billing_transactions', 'appointment_id')) {
                $table->foreignId('appointment_id')->constrained()->onDelete('cascade')->after('transaction_code');
            }
            
            if (!Schema::hasColumn('billing_transactions', 'specialist_id')) {
                $table->foreignId('specialist_id')->constrained('users')->onDelete('cascade')->after('patient_id');
            }
            
            if (!Schema::hasColumn('billing_transactions', 'amount')) {
                $table->decimal('amount', 10, 2)->after('specialist_id');
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
            // Remove new fields
            $table->dropColumn([
                'transaction_code',
                'appointment_id',
                'specialist_id',
                'amount',
                'payment_method',
                'reference_no',
                'notes',
                'status'
            ]);
            
            // Add back old fields
            $table->string('transaction_id')->unique()->after('id');
            $table->foreignId('doctor_id')->nullable()->constrained('users')->onDelete('set null')->after('patient_id');
            $table->enum('payment_type', ['cash', 'health_card', 'discount'])->default('cash')->after('doctor_id');
            $table->decimal('total_amount', 10, 2)->after('payment_type');
            $table->decimal('discount_amount', 10, 2)->default(0)->after('total_amount');
            $table->decimal('discount_percentage', 5, 2)->nullable()->after('discount_amount');
            $table->string('hmo_provider')->nullable()->after('discount_percentage');
            $table->string('hmo_reference')->nullable()->after('hmo_provider');
            $table->enum('payment_method', ['cash', 'card', 'bank_transfer', 'check', 'hmo'])->default('cash')->after('hmo_reference');
            $table->string('payment_reference')->nullable()->after('payment_method');
            $table->enum('status', ['draft', 'pending', 'paid', 'cancelled', 'refunded'])->default('pending')->after('payment_reference');
            $table->text('description')->nullable()->after('status');
            $table->datetime('transaction_date')->after('description');
            $table->date('due_date')->nullable()->after('transaction_date');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade')->after('due_date');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null')->after('created_by');
        });
    }
};
