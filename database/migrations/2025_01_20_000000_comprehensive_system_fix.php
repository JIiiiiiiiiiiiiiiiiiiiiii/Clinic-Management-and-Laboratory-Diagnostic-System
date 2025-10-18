<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * COMPREHENSIVE SYSTEM FIX - Fixes all database schema issues
     */
    public function up(): void
    {
        // Step 1: Fix patients table structure
        $this->fixPatientsTable();
        
        // Step 2: Fix appointments table structure  
        $this->fixAppointmentsTable();
        
        // Step 3: Fix visits table structure
        $this->fixVisitsTable();
        
        // Step 4: Fix billing_transactions table structure
        $this->fixBillingTransactionsTable();
        
        // Step 5: Fix appointment_billing_links table structure
        $this->fixAppointmentBillingLinksTable();
        
        // Step 6: Fix daily_transactions table structure
        $this->fixDailyTransactionsTable();
        
        // Step 7: Fix pending_appointments table structure
        $this->fixPendingAppointmentsTable();
        
        // Step 8: Create missing tables if they don't exist
        $this->createMissingTables();
        
        // Step 9: Fix all foreign key relationships
        $this->fixForeignKeys();
        
        // Step 10: Add missing indexes for performance
        $this->addPerformanceIndexes();
    }

    private function fixPatientsTable()
    {
        // Ensure patients table has all required columns
        if (Schema::hasTable('patients')) {
            Schema::table('patients', function (Blueprint $table) {
                // Add missing columns if they don't exist
                if (!Schema::hasColumn('patients', 'patient_no')) {
                    $table->string('patient_no', 10)->unique()->nullable();
                }
                if (!Schema::hasColumn('patients', 'sequence_number')) {
                    $table->integer('sequence_number')->nullable();
                }
                if (!Schema::hasColumn('patients', 'user_id')) {
                    $table->unsignedBigInteger('user_id')->nullable();
                }
                if (!Schema::hasColumn('patients', 'arrival_date')) {
                    $table->date('arrival_date')->nullable();
                }
                if (!Schema::hasColumn('patients', 'arrival_time')) {
                    $table->time('arrival_time')->nullable();
                }
                if (!Schema::hasColumn('patients', 'attending_physician')) {
                    $table->string('attending_physician')->nullable();
                }
                if (!Schema::hasColumn('patients', 'time_seen')) {
                    $table->time('time_seen')->nullable();
                }
                if (!Schema::hasColumn('patients', 'emergency_name')) {
                    $table->string('emergency_name')->nullable();
                }
                if (!Schema::hasColumn('patients', 'emergency_relation')) {
                    $table->string('emergency_relation')->nullable();
                }
                if (!Schema::hasColumn('patients', 'insurance_company')) {
                    $table->string('insurance_company')->nullable();
                }
                if (!Schema::hasColumn('patients', 'hmo_name')) {
                    $table->string('hmo_name')->nullable();
                }
                if (!Schema::hasColumn('patients', 'hmo_id_no')) {
                    $table->string('hmo_id_no')->nullable();
                }
                if (!Schema::hasColumn('patients', 'approval_code')) {
                    $table->string('approval_code')->nullable();
                }
                if (!Schema::hasColumn('patients', 'validity')) {
                    $table->date('validity')->nullable();
                }
                if (!Schema::hasColumn('patients', 'drug_allergies')) {
                    $table->text('drug_allergies')->nullable();
                }
                if (!Schema::hasColumn('patients', 'food_allergies')) {
                    $table->text('food_allergies')->nullable();
                }
                if (!Schema::hasColumn('patients', 'past_medical_history')) {
                    $table->text('past_medical_history')->nullable();
                }
                if (!Schema::hasColumn('patients', 'family_history')) {
                    $table->text('family_history')->nullable();
                }
                if (!Schema::hasColumn('patients', 'social_history')) {
                    $table->text('social_history')->nullable();
                }
                if (!Schema::hasColumn('patients', 'obgyn_history')) {
                    $table->text('obgyn_history')->nullable();
                }
                if (!Schema::hasColumn('patients', 'status')) {
                    $table->string('status')->default('active');
                }
            });
        }
    }

    private function fixAppointmentsTable()
    {
        if (Schema::hasTable('appointments')) {
            Schema::table('appointments', function (Blueprint $table) {
                // Ensure proper data types
                if (Schema::hasColumn('appointments', 'patient_id')) {
                    $table->unsignedBigInteger('patient_id')->nullable()->change();
                }
                if (Schema::hasColumn('appointments', 'specialist_id')) {
                    $table->unsignedBigInteger('specialist_id')->nullable()->change();
                }
                if (!Schema::hasColumn('appointments', 'appointment_code')) {
                    $table->string('appointment_code', 20)->nullable();
                }
                if (!Schema::hasColumn('appointments', 'sequence_number')) {
                    $table->integer('sequence_number')->nullable();
                }
                if (!Schema::hasColumn('appointments', 'source')) {
                    $table->string('source')->default('Walk-in');
                }
                if (!Schema::hasColumn('appointments', 'booking_method')) {
                    $table->string('booking_method')->default('Walk-in');
                }
                if (!Schema::hasColumn('appointments', 'billing_status')) {
                    $table->string('billing_status')->default('pending');
                }
                if (!Schema::hasColumn('appointments', 'billing_reference')) {
                    $table->string('billing_reference')->nullable();
                }
                if (!Schema::hasColumn('appointments', 'confirmation_sent')) {
                    $table->boolean('confirmation_sent')->default(false);
                }
            });
        }
    }

    private function fixVisitsTable()
    {
        if (Schema::hasTable('visits')) {
            Schema::table('visits', function (Blueprint $table) {
                // Ensure proper structure
                if (!Schema::hasColumn('visits', 'visit_code')) {
                    $table->string('visit_code', 10)->unique()->nullable();
                }
                if (!Schema::hasColumn('visits', 'appointment_id')) {
                    $table->unsignedBigInteger('appointment_id')->nullable();
                }
                if (!Schema::hasColumn('visits', 'patient_id')) {
                    $table->unsignedBigInteger('patient_id')->nullable();
                }
                if (!Schema::hasColumn('visits', 'attending_staff_id')) {
                    $table->unsignedBigInteger('attending_staff_id')->nullable();
                }
                if (!Schema::hasColumn('visits', 'doctor_id')) {
                    $table->unsignedBigInteger('doctor_id')->nullable();
                }
                if (!Schema::hasColumn('visits', 'nurse_id')) {
                    $table->unsignedBigInteger('nurse_id')->nullable();
                }
                if (!Schema::hasColumn('visits', 'medtech_id')) {
                    $table->unsignedBigInteger('medtech_id')->nullable();
                }
                if (!Schema::hasColumn('visits', 'purpose')) {
                    $table->string('purpose')->nullable();
                }
                if (!Schema::hasColumn('visits', 'visit_date_time')) {
                    $table->dateTime('visit_date_time')->nullable();
                }
                if (!Schema::hasColumn('visits', 'visit_date_time_time')) {
                    $table->dateTime('visit_date_time_time')->nullable();
                }
                if (!Schema::hasColumn('visits', 'status')) {
                    $table->string('status')->default('Ongoing');
                }
                if (!Schema::hasColumn('visits', 'visit_type')) {
                    $table->string('visit_type')->nullable();
                }
                if (!Schema::hasColumn('visits', 'notes')) {
                    $table->text('notes')->nullable();
                }
            });
        }
    }

    private function fixBillingTransactionsTable()
    {
        if (Schema::hasTable('billing_transactions')) {
            Schema::table('billing_transactions', function (Blueprint $table) {
                // Ensure proper structure
                if (!Schema::hasColumn('billing_transactions', 'transaction_id')) {
                    $table->string('transaction_id', 50)->unique()->nullable();
                }
                if (!Schema::hasColumn('billing_transactions', 'transaction_code')) {
                    $table->string('transaction_code', 50)->nullable();
                }
                if (!Schema::hasColumn('billing_transactions', 'appointment_id')) {
                    $table->unsignedBigInteger('appointment_id')->nullable();
                }
                if (!Schema::hasColumn('billing_transactions', 'patient_id')) {
                    $table->unsignedBigInteger('patient_id')->nullable();
                }
                if (!Schema::hasColumn('billing_transactions', 'doctor_id')) {
                    $table->unsignedBigInteger('doctor_id')->nullable();
                }
                if (!Schema::hasColumn('billing_transactions', 'payment_type')) {
                    $table->string('payment_type')->default('cash');
                }
                if (!Schema::hasColumn('billing_transactions', 'total_amount')) {
                    $table->decimal('total_amount', 10, 2)->default(0);
                }
                if (!Schema::hasColumn('billing_transactions', 'discount_amount')) {
                    $table->decimal('discount_amount', 10, 2)->default(0);
                }
                if (!Schema::hasColumn('billing_transactions', 'discount_percentage')) {
                    $table->decimal('discount_percentage', 5, 2)->default(0);
                }
                if (!Schema::hasColumn('billing_transactions', 'hmo_provider')) {
                    $table->string('hmo_provider')->nullable();
                }
                if (!Schema::hasColumn('billing_transactions', 'hmo_reference')) {
                    $table->string('hmo_reference')->nullable();
                }
                if (!Schema::hasColumn('billing_transactions', 'payment_method')) {
                    $table->string('payment_method')->default('Cash');
                }
                if (!Schema::hasColumn('billing_transactions', 'payment_reference')) {
                    $table->string('payment_reference')->nullable();
                }
                if (!Schema::hasColumn('billing_transactions', 'status')) {
                    $table->string('status')->default('pending');
                }
                if (!Schema::hasColumn('billing_transactions', 'description')) {
                    $table->text('description')->nullable();
                }
                if (!Schema::hasColumn('billing_transactions', 'notes')) {
                    $table->text('notes')->nullable();
                }
                if (!Schema::hasColumn('billing_transactions', 'transaction_date')) {
                    $table->dateTime('transaction_date')->nullable();
                }
                if (!Schema::hasColumn('billing_transactions', 'transaction_date_only')) {
                    $table->date('transaction_date_only')->nullable();
                }
                if (!Schema::hasColumn('billing_transactions', 'transaction_time_only')) {
                    $table->time('transaction_time_only')->nullable();
                }
                if (!Schema::hasColumn('billing_transactions', 'due_date')) {
                    $table->date('due_date')->nullable();
                }
                if (!Schema::hasColumn('billing_transactions', 'created_by')) {
                    $table->unsignedBigInteger('created_by')->nullable();
                }
                if (!Schema::hasColumn('billing_transactions', 'updated_by')) {
                    $table->unsignedBigInteger('updated_by')->nullable();
                }
            });
        }
    }

    private function fixAppointmentBillingLinksTable()
    {
        if (Schema::hasTable('appointment_billing_links')) {
            Schema::table('appointment_billing_links', function (Blueprint $table) {
                // Ensure proper structure
                if (!Schema::hasColumn('appointment_billing_links', 'appointment_id')) {
                    $table->unsignedBigInteger('appointment_id');
                }
                if (!Schema::hasColumn('appointment_billing_links', 'billing_transaction_id')) {
                    $table->unsignedBigInteger('billing_transaction_id');
                }
                if (!Schema::hasColumn('appointment_billing_links', 'appointment_type')) {
                    $table->string('appointment_type')->nullable();
                }
                if (!Schema::hasColumn('appointment_billing_links', 'appointment_price')) {
                    $table->decimal('appointment_price', 10, 2)->default(0);
                }
                if (!Schema::hasColumn('appointment_billing_links', 'status')) {
                    $table->string('status')->default('pending');
                }
            });
        }
    }

    private function fixDailyTransactionsTable()
    {
        if (Schema::hasTable('daily_transactions')) {
            Schema::table('daily_transactions', function (Blueprint $table) {
                // Ensure proper structure
                if (!Schema::hasColumn('daily_transactions', 'transaction_date')) {
                    $table->date('transaction_date');
                }
                if (!Schema::hasColumn('daily_transactions', 'transaction_type')) {
                    $table->string('transaction_type');
                }
                if (!Schema::hasColumn('daily_transactions', 'transaction_id')) {
                    $table->string('transaction_id')->nullable();
                }
                if (!Schema::hasColumn('daily_transactions', 'patient_name')) {
                    $table->string('patient_name')->nullable();
                }
                if (!Schema::hasColumn('daily_transactions', 'specialist_name')) {
                    $table->string('specialist_name')->nullable();
                }
                if (!Schema::hasColumn('daily_transactions', 'amount')) {
                    $table->decimal('amount', 10, 2)->default(0);
                }
                if (!Schema::hasColumn('daily_transactions', 'payment_method')) {
                    $table->string('payment_method')->nullable();
                }
                if (!Schema::hasColumn('daily_transactions', 'status')) {
                    $table->string('status')->default('pending');
                }
                if (!Schema::hasColumn('daily_transactions', 'description')) {
                    $table->text('description')->nullable();
                }
                if (!Schema::hasColumn('daily_transactions', 'items_count')) {
                    $table->integer('items_count')->default(0);
                }
                if (!Schema::hasColumn('daily_transactions', 'appointments_count')) {
                    $table->integer('appointments_count')->default(0);
                }
                if (!Schema::hasColumn('daily_transactions', 'original_transaction_id')) {
                    $table->unsignedBigInteger('original_transaction_id')->nullable();
                }
                if (!Schema::hasColumn('daily_transactions', 'original_table')) {
                    $table->string('original_table')->nullable();
                }
            });
        }
    }

    private function fixPendingAppointmentsTable()
    {
        if (Schema::hasTable('pending_appointments')) {
            Schema::table('pending_appointments', function (Blueprint $table) {
                // Ensure proper structure
                if (!Schema::hasColumn('pending_appointments', 'patient_id')) {
                    $table->string('patient_id')->nullable();
                }
                if (!Schema::hasColumn('pending_appointments', 'patient_name')) {
                    $table->string('patient_name')->nullable();
                }
                if (!Schema::hasColumn('pending_appointments', 'contact_number')) {
                    $table->string('contact_number')->nullable();
                }
                if (!Schema::hasColumn('pending_appointments', 'specialist_id')) {
                    $table->string('specialist_id')->nullable();
                }
                if (!Schema::hasColumn('pending_appointments', 'specialist_name')) {
                    $table->string('specialist_name')->nullable();
                }
                if (!Schema::hasColumn('pending_appointments', 'appointment_type')) {
                    $table->string('appointment_type')->nullable();
                }
                if (!Schema::hasColumn('pending_appointments', 'specialist_type')) {
                    $table->string('specialist_type')->nullable();
                }
                if (!Schema::hasColumn('pending_appointments', 'appointment_date')) {
                    $table->date('appointment_date')->nullable();
                }
                if (!Schema::hasColumn('pending_appointments', 'appointment_time')) {
                    $table->time('appointment_time')->nullable();
                }
                if (!Schema::hasColumn('pending_appointments', 'duration')) {
                    $table->string('duration')->nullable();
                }
                if (!Schema::hasColumn('pending_appointments', 'price')) {
                    $table->decimal('price', 10, 2)->default(0);
                }
                if (!Schema::hasColumn('pending_appointments', 'notes')) {
                    $table->text('notes')->nullable();
                }
                if (!Schema::hasColumn('pending_appointments', 'special_requirements')) {
                    $table->text('special_requirements')->nullable();
                }
                if (!Schema::hasColumn('pending_appointments', 'booking_method')) {
                    $table->string('booking_method')->default('Online');
                }
                if (!Schema::hasColumn('pending_appointments', 'status')) {
                    $table->string('status')->default('Pending Approval');
                }
                if (!Schema::hasColumn('pending_appointments', 'status_approval')) {
                    $table->string('status_approval')->default('pending');
                }
                if (!Schema::hasColumn('pending_appointments', 'source')) {
                    $table->string('source')->default('Online');
                }
            });
        }
    }

    private function createMissingTables()
    {
        // Create specialists table if it doesn't exist
        if (!Schema::hasTable('specialists')) {
            try {
                Schema::create('specialists', function (Blueprint $table) {
                    $table->id('specialist_id');
                    $table->string('specialist_code', 20)->unique();
                    $table->string('name');
                    $table->string('role'); // Doctor, Nurse, MedTech
                    $table->string('specialization')->nullable();
                    $table->string('contact_number')->nullable();
                    $table->string('email')->nullable();
                    $table->boolean('is_active')->default(true);
                    $table->timestamps();
                });
            } catch (\Exception $e) {
                // Table might already exist, continue
            }
        }

        // Create staff table if it doesn't exist
        if (!Schema::hasTable('staff')) {
            try {
                Schema::create('staff', function (Blueprint $table) {
                    $table->id('staff_id');
                    $table->string('staff_code', 20)->unique();
                    $table->string('name');
                    $table->string('role'); // Doctor, Nurse, MedTech
                    $table->string('specialization')->nullable();
                    $table->string('contact_number')->nullable();
                    $table->string('email')->nullable();
                    $table->boolean('is_active')->default(true);
                    $table->timestamps();
                });
            } catch (\Exception $e) {
                // Table might already exist, continue
            }
        }
    }

    private function fixForeignKeys()
    {
        // Fix patients table foreign keys
        if (Schema::hasTable('patients') && Schema::hasColumn('patients', 'user_id')) {
            try {
                Schema::table('patients', function (Blueprint $table) {
                    $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
                });
            } catch (Exception $e) {
                // Foreign key might already exist
            }
        }

        // Fix appointments table foreign keys
        if (Schema::hasTable('appointments')) {
            try {
                Schema::table('appointments', function (Blueprint $table) {
                    if (Schema::hasColumn('appointments', 'patient_id')) {
                        $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
                    }
                });
            } catch (Exception $e) {
                // Foreign key might already exist
            }
        }

        // Fix visits table foreign keys
        if (Schema::hasTable('visits')) {
            try {
                Schema::table('visits', function (Blueprint $table) {
                    if (Schema::hasColumn('visits', 'appointment_id')) {
                        $table->foreign('appointment_id')->references('id')->on('appointments')->onDelete('cascade');
                    }
                    if (Schema::hasColumn('visits', 'patient_id')) {
                        $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
                    }
                });
            } catch (Exception $e) {
                // Foreign key might already exist
            }
        }

        // Fix billing_transactions table foreign keys
        if (Schema::hasTable('billing_transactions')) {
            try {
                Schema::table('billing_transactions', function (Blueprint $table) {
                    if (Schema::hasColumn('billing_transactions', 'patient_id')) {
                        $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
                    }
                    if (Schema::hasColumn('billing_transactions', 'appointment_id')) {
                        $table->foreign('appointment_id')->references('id')->on('appointments')->onDelete('cascade');
                    }
                });
            } catch (Exception $e) {
                // Foreign key might already exist
            }
        }

        // Fix appointment_billing_links table foreign keys
        if (Schema::hasTable('appointment_billing_links')) {
            try {
                Schema::table('appointment_billing_links', function (Blueprint $table) {
                    if (Schema::hasColumn('appointment_billing_links', 'appointment_id')) {
                        $table->foreign('appointment_id')->references('id')->on('appointments')->onDelete('cascade');
                    }
                    if (Schema::hasColumn('appointment_billing_links', 'billing_transaction_id')) {
                        $table->foreign('billing_transaction_id')->references('id')->on('billing_transactions')->onDelete('cascade');
                    }
                });
            } catch (Exception $e) {
                // Foreign key might already exist
            }
        }
    }

    private function addPerformanceIndexes()
    {
        // Add indexes for better performance
        if (Schema::hasTable('appointments')) {
            try {
                Schema::table('appointments', function (Blueprint $table) {
                    $table->index(['patient_id', 'appointment_date']);
                    $table->index(['status', 'appointment_date']);
                    $table->index(['specialist_id', 'appointment_date']);
                });
            } catch (Exception $e) {
                // Indexes might already exist
            }
        }

        if (Schema::hasTable('visits')) {
            try {
                Schema::table('visits', function (Blueprint $table) {
                    $table->index(['patient_id', 'visit_date_time_time']);
                    $table->index(['appointment_id']);
                    $table->index(['status']);
                });
            } catch (Exception $e) {
                // Indexes might already exist
            }
        }

        if (Schema::hasTable('billing_transactions')) {
            try {
                Schema::table('billing_transactions', function (Blueprint $table) {
                    $table->index(['patient_id', 'transaction_date']);
                    $table->index(['status', 'transaction_date']);
                    $table->index(['appointment_id']);
                });
            } catch (Exception $e) {
                // Indexes might already exist
            }
        }

        if (Schema::hasTable('daily_transactions')) {
            try {
                Schema::table('daily_transactions', function (Blueprint $table) {
                    $table->index(['transaction_date', 'transaction_type']);
                    $table->index(['status']);
                });
            } catch (Exception $e) {
                // Indexes might already exist
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is comprehensive and should not be rolled back
        // as it fixes critical system issues
    }
};
