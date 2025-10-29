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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('role_id')->nullable()->after('id');
            $table->foreign('role_id')->references('id')->on('roles')->onDelete('set null');
        });

        // Map existing role enum to role_id
        $roleMapping = [
            'admin' => 1,
            'doctor' => 2,
            'nurse' => 3,
            'medtech' => 4,
            'cashier' => 5,
            'hospital_admin' => 6,
            'hospital_staff' => 6,
            'patient' => 7
        ];

        foreach ($roleMapping as $roleName => $roleId) {
            DB::table('users')
                ->where('role', $roleName)
                ->update(['role_id' => $roleId]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');
        });
    }
};