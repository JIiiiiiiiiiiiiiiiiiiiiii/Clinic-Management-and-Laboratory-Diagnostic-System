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
        // Fix existing billing transactions where amount equals total_amount
        // This happens when senior citizen discounts were not properly applied
        DB::statement("
            UPDATE billing_transactions 
            SET amount = total_amount - senior_discount_amount 
            WHERE is_senior_citizen = 1 
            AND senior_discount_amount > 0 
            AND amount = total_amount
        ");
        
        // Log the fix
        \Log::info('Fixed existing billing transaction amounts for senior citizen discounts');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is not reversible as it fixes data inconsistencies
        \Log::info('Cannot reverse billing transaction amount fixes');
    }
};
