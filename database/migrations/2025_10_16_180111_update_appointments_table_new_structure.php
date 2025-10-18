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
        Schema::table('appointments', function (Blueprint $table) {
            // Add new fields that don't exist
            if (!Schema::hasColumn('appointments', 'appointment_code')) {
                $table->string('appointment_code', 10)->unique()->after('id');
            }
            
            if (!Schema::hasColumn('appointments', 'patient_id_fk')) {
                $table->foreignId('patient_id_fk')->constrained('patients')->onDelete('cascade')->after('appointment_code');
            }
            
            if (!Schema::hasColumn('appointments', 'specialist_id_fk')) {
                $table->foreignId('specialist_id_fk')->constrained('users')->onDelete('cascade')->after('patient_id_fk');
            }
            
            if (!Schema::hasColumn('appointments', 'specialist_type')) {
                $table->enum('specialist_type', ['Doctor', 'MedTech'])->after('specialist_id_fk');
            }
            
            if (!Schema::hasColumn('appointments', 'price')) {
                $table->decimal('price', 10, 2)->nullable()->after('duration');
            }
            
            if (!Schema::hasColumn('appointments', 'additional_info')) {
                $table->text('additional_info')->nullable()->after('price');
            }
            
            if (!Schema::hasColumn('appointments', 'source')) {
                $table->enum('source', ['Online', 'Walk-in'])->default('Walk-in')->after('additional_info');
            }
            
            if (!Schema::hasColumn('appointments', 'admin_notes')) {
                $table->text('admin_notes')->nullable()->after('source');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            // Remove new fields
            $table->dropColumn([
                'appointment_code',
                'patient_id',
                'specialist_id',
                'specialist_type',
                'price',
                'additional_info',
                'source',
                'admin_notes'
            ]);
            
            // Add back old fields
            $table->string('patient_name')->after('id');
            $table->string('patient_id')->unique()->after('patient_name');
            $table->string('contact_number')->nullable()->after('patient_id');
            $table->string('specialist_name')->after('appointment_type');
            $table->string('specialist_id')->after('specialist_name');
            $table->string('booking_method')->default('Admin')->after('status');
            $table->boolean('confirmation_sent')->default(false)->after('booking_method');
            $table->text('special_requirements')->nullable()->after('notes');
            $table->string('appointment_source')->after('special_requirements');
        });
    }
};
