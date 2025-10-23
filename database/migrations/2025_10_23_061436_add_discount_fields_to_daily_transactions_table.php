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
        Schema::table('daily_transactions', function (Blueprint $table) {
            $table->decimal('total_amount', 10, 2)->nullable()->after('amount');
            $table->decimal('final_amount', 10, 2)->nullable()->after('total_amount');
            $table->decimal('discount_amount', 10, 2)->default(0)->after('final_amount');
            $table->decimal('senior_discount_amount', 10, 2)->default(0)->after('discount_amount');
            $table->boolean('is_senior_citizen')->default(false)->after('senior_discount_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('daily_transactions', function (Blueprint $table) {
            $table->dropColumn([
                'total_amount',
                'final_amount', 
                'discount_amount',
                'senior_discount_amount',
                'is_senior_citizen'
            ]);
        });
    }
};
