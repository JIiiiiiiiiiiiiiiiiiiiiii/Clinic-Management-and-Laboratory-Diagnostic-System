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
     * Fix billing_status references and foreign key mismatches
     */
    public function up(): void
    {
        // Step 1: Fix billing_status field in appointments table
        if (Schema::hasTable('appointments')) {
            // Check if billing_status column exists and fix it
            if (Schema::hasColumn('appointments', 'billing_status')) {
                // Update the column to use proper enum values
                Schema::table('appointments', function (Blueprint $table) {
                    $table->dropColumn('billing_status');
                });
            }
            
            // Add billing_status with correct enum values
            Schema::table('appointments', function (Blueprint $table) {
                $table->enum('billing_status', ['pending', 'in_transaction', 'paid', 'cancelled'])
                      ->default('pending')
                      ->after('status');
            });
        }

        // Step 2: Fix foreign key constraints in billing_transactions
        if (Schema::hasTable('billing_transactions')) {
            // Drop existing foreign key constraints that might be causing issues
            try {
                Schema::table('billing_transactions', function (Blueprint $table) {
                    $table->dropForeign(['specialist_id']);
                });
            } catch (Exception $e) {
                // Foreign key might not exist
            }
            
            try {
                Schema::table('billing_transactions', function (Blueprint $table) {
                    $table->dropForeign(['doctor_id']);
                });
            } catch (Exception $e) {
                // Foreign key might not exist
            }
            
            // First, make specialist_id nullable if it isn't already
            Schema::table('billing_transactions', function (Blueprint $table) {
                if (Schema::hasColumn('billing_transactions', 'specialist_id')) {
                    $table->unsignedBigInteger('specialist_id')->nullable()->change();
                }
            });
            
            // Fix invalid specialist_id references
            DB::table('billing_transactions')
                ->whereNotNull('specialist_id')
                ->whereNotExists(function($query) {
                    $query->select(DB::raw(1))
                          ->from('users')
                          ->whereColumn('users.id', 'billing_transactions.specialist_id');
                })
                ->update(['specialist_id' => null]);
            
            // First, make doctor_id nullable if it isn't already
            Schema::table('billing_transactions', function (Blueprint $table) {
                if (Schema::hasColumn('billing_transactions', 'doctor_id')) {
                    $table->unsignedBigInteger('doctor_id')->nullable()->change();
                }
            });
            
            // Fix invalid doctor_id references
            DB::table('billing_transactions')
                ->whereNotNull('doctor_id')
                ->whereNotExists(function($query) {
                    $query->select(DB::raw(1))
                          ->from('specialists')
                          ->whereColumn('specialists.specialist_id', 'billing_transactions.doctor_id');
                })
                ->update(['doctor_id' => null]);
            
            // Add correct foreign key constraints
            Schema::table('billing_transactions', function (Blueprint $table) {
                if (Schema::hasColumn('billing_transactions', 'doctor_id')) {
                    $table->foreign('doctor_id')->references('specialist_id')->on('specialists')->onDelete('set null');
                }
            });
        }

        // Step 3: Fix appointments table foreign keys
        if (Schema::hasTable('appointments')) {
            // Drop existing foreign key constraints
            try {
                Schema::table('appointments', function (Blueprint $table) {
                    $table->dropForeign(['patient_id']);
                });
            } catch (Exception $e) {
                // Foreign key might not exist
            }
            
            try {
                Schema::table('appointments', function (Blueprint $table) {
                    $table->dropForeign(['specialist_id']);
                });
            } catch (Exception $e) {
                // Foreign key might not exist
            }
            
            // Fix invalid patient_id references
            DB::table('appointments')
                ->whereNotNull('patient_id')
                ->whereNotExists(function($query) {
                    $query->select(DB::raw(1))
                          ->from('patients')
                          ->whereColumn('patients.id', 'appointments.patient_id');
                })
                ->update(['patient_id' => null]);
            
            // Fix invalid specialist_id references
            DB::table('appointments')
                ->whereNotNull('specialist_id')
                ->whereNotExists(function($query) {
                    $query->select(DB::raw(1))
                          ->from('specialists')
                          ->whereColumn('specialists.specialist_id', 'appointments.specialist_id');
                })
                ->update(['specialist_id' => null]);
            
            // Add correct foreign key constraints
            Schema::table('appointments', function (Blueprint $table) {
                if (Schema::hasColumn('appointments', 'patient_id')) {
                    $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
                }
                if (Schema::hasColumn('appointments', 'specialist_id')) {
                    $table->foreign('specialist_id')->references('specialist_id')->on('specialists')->onDelete('set null');
                }
            });
        }

        // Step 4: Fix visits table foreign keys
        if (Schema::hasTable('visits')) {
            // Drop existing foreign key constraints
            try {
                Schema::table('visits', function (Blueprint $table) {
                    $table->dropForeign(['appointment_id']);
                });
            } catch (Exception $e) {
                // Foreign key might not exist
            }
            
            try {
                Schema::table('visits', function (Blueprint $table) {
                    $table->dropForeign(['patient_id']);
                });
            } catch (Exception $e) {
                // Foreign key might not exist
            }
            
            // Fix invalid appointment_id references
            DB::table('visits')
                ->whereNotNull('appointment_id')
                ->whereNotExists(function($query) {
                    $query->select(DB::raw(1))
                          ->from('appointments')
                          ->whereColumn('appointments.id', 'visits.appointment_id');
                })
                ->update(['appointment_id' => null]);
            
            // Fix invalid patient_id references
            DB::table('visits')
                ->whereNotNull('patient_id')
                ->whereNotExists(function($query) {
                    $query->select(DB::raw(1))
                          ->from('patients')
                          ->whereColumn('patients.id', 'visits.patient_id');
                })
                ->update(['patient_id' => null]);
            
            // Add correct foreign key constraints
            Schema::table('visits', function (Blueprint $table) {
                if (Schema::hasColumn('visits', 'appointment_id')) {
                    $table->foreign('appointment_id')->references('id')->on('appointments')->onDelete('cascade');
                }
                if (Schema::hasColumn('visits', 'patient_id')) {
                    $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
                }
            });
        }

        // Step 5: Fix appointment_billing_links foreign keys
        if (Schema::hasTable('appointment_billing_links')) {
            // Drop existing foreign key constraints
            try {
                Schema::table('appointment_billing_links', function (Blueprint $table) {
                    $table->dropForeign(['appointment_id']);
                });
            } catch (Exception $e) {
                // Foreign key might not exist
            }
            
            try {
                Schema::table('appointment_billing_links', function (Blueprint $table) {
                    $table->dropForeign(['billing_transaction_id']);
                });
            } catch (Exception $e) {
                // Foreign key might not exist
            }
            
            // Fix invalid appointment_id references
            DB::table('appointment_billing_links')
                ->whereNotNull('appointment_id')
                ->whereNotExists(function($query) {
                    $query->select(DB::raw(1))
                          ->from('appointments')
                          ->whereColumn('appointments.id', 'appointment_billing_links.appointment_id');
                })
                ->delete();
            
            // Fix invalid billing_transaction_id references
            DB::table('appointment_billing_links')
                ->whereNotNull('billing_transaction_id')
                ->whereNotExists(function($query) {
                    $query->select(DB::raw(1))
                          ->from('billing_transactions')
                          ->whereColumn('billing_transactions.id', 'appointment_billing_links.billing_transaction_id');
                })
                ->delete();
            
            // Add correct foreign key constraints
            Schema::table('appointment_billing_links', function (Blueprint $table) {
                if (Schema::hasColumn('appointment_billing_links', 'appointment_id')) {
                    $table->foreign('appointment_id')->references('id')->on('appointments')->onDelete('cascade');
                }
                if (Schema::hasColumn('appointment_billing_links', 'billing_transaction_id')) {
                    $table->foreign('billing_transaction_id')->references('id')->on('billing_transactions')->onDelete('cascade');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop foreign key constraints
        if (Schema::hasTable('appointments')) {
            try {
                Schema::table('appointments', function (Blueprint $table) {
                    $table->dropForeign(['patient_id']);
                    $table->dropForeign(['specialist_id']);
                });
            } catch (Exception $e) {
                // Foreign keys might not exist
            }
        }
        
        if (Schema::hasTable('visits')) {
            try {
                Schema::table('visits', function (Blueprint $table) {
                    $table->dropForeign(['appointment_id']);
                    $table->dropForeign(['patient_id']);
                });
            } catch (Exception $e) {
                // Foreign keys might not exist
            }
        }
        
        if (Schema::hasTable('billing_transactions')) {
            try {
                Schema::table('billing_transactions', function (Blueprint $table) {
                    $table->dropForeign(['doctor_id']);
                });
            } catch (Exception $e) {
                // Foreign keys might not exist
            }
        }
        
        if (Schema::hasTable('appointment_billing_links')) {
            try {
                Schema::table('appointment_billing_links', function (Blueprint $table) {
                    $table->dropForeign(['appointment_id']);
                    $table->dropForeign(['billing_transaction_id']);
                });
            } catch (Exception $e) {
                // Foreign keys might not exist
            }
        }
    }
};
