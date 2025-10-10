<?php

use App\Http\Controllers\PatientController;
use App\Http\Controllers\PatientVisitController;
use App\Http\Controllers\Lab\LabTestController;
use App\Http\Controllers\Lab\LabOrderController;
use App\Http\Controllers\Lab\LabResultController;
use App\Http\Controllers\Lab\LabReportController;
use App\Http\Controllers\Lab\LabExportController;
use App\Http\Controllers\Admin\SpecialistController;
use App\Http\Controllers\Admin\DoctorController;
use App\Http\Controllers\Admin\NurseController;
use App\Http\Controllers\Admin\MedTechController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Inventory\InventoryController;
use App\Http\Controllers\Inventory\ProductController;
use App\Http\Controllers\Inventory\TransactionController;
use App\Http\Controllers\Inventory\ReportController;
use App\Http\Controllers\Admin\UserRoleController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\AppointmentController;
use App\Http\Controllers\Admin\ClinicProcedureController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\NotificationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Models\Patient;
use App\Models\LabOrder;
use App\Models\Supply\Supply as Product;
use Illuminate\Support\Facades\DB;

// Admin routes for all clinic staff roles
Route::prefix('admin')
    ->name('admin.')
    ->middleware(['simple.auth'])
    ->group(function () {
        // Dashboard - All authenticated staff can access
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Test route for debugging
        Route::get('/patient-test', function () {
            return response()->json([
                'message' => 'Admin patient route is working!',
                'timestamp' => now(),
                'user' => auth()->user() ? auth()->user()->name : 'Not authenticated'
            ]);
        })->name('patient.test');

        // Simple HTML test route
        Route::get('/patient-html-test', function () {
            return '<html><body><h1>Admin Patient Route Test</h1><p>This route is working!</p><p>User: ' . (auth()->user() ? auth()->user()->name : 'Not authenticated') . '</p></body></html>';
        })->name('patient.html.test');

        // Simple patient list without Inertia
        Route::get('/patient-simple', function () {
            try {
                $patients = \App\Models\Patient::take(5)->get();
                $html = '<html><body><h1>Patient List (Simple)</h1>';
                $html .= '<p>Found ' . $patients->count() . ' patients</p>';
                foreach ($patients as $patient) {
                    $html .= '<p>' . $patient->first_name . ' ' . $patient->last_name . ' (#' . $patient->patient_no . ')</p>';
                }
                $html .= '</body></html>';
                return $html;
            } catch (\Exception $e) {
                return '<html><body><h1>Error</h1><p>' . $e->getMessage() . '</p></body></html>';
            }
        })->name('patient.simple');

        // Test route to bypass Inertia completely
        Route::get('/patient-bypass', function () {
            return '<html><body><h1>Patient Route Bypass Test</h1><p>This route works without Inertia!</p><p>User: ' . (auth()->user() ? auth()->user()->name : 'Not authenticated') . '</p></body></html>';
        })->name('patient.bypass');

        // Patient CRUD routes (URLs -> /admin/patient) - All staff can access
        Route::resource('patient', PatientController::class)->names([
            'index' => 'patient.index',
            'create' => 'patient.create',
            'store' => 'patient.store',
            'show' => 'patient.show',
            'edit' => 'patient.edit',
            'update' => 'patient.update',
            'destroy' => 'patient.destroy',
        ]);

        // Patient Visit routes - All staff can access
        Route::prefix('patient/{patient}/visits')->name('patient.visits.')->group(function () {
            Route::get('/', [PatientVisitController::class, 'index'])->name('index');
            Route::get('/create', [PatientVisitController::class, 'create'])->name('create');
            Route::post('/', [PatientVisitController::class, 'store'])->name('store');
            Route::get('/{visit}', [PatientVisitController::class, 'show'])->name('show');
            Route::get('/{visit}/edit', [PatientVisitController::class, 'edit'])->name('edit');
            Route::put('/{visit}', [PatientVisitController::class, 'update'])->name('update');
            Route::delete('/{visit}', [PatientVisitController::class, 'destroy'])->name('destroy');
        });

        // Specialist Management - Admin only
        Route::prefix('specialists')->name('specialists.')->middleware(['role:admin'])->group(function () {
            Route::get('/', [SpecialistController::class, 'index'])->name('index');
            
            // Doctor Management
            Route::prefix('doctors')->name('doctors.')->group(function () {
                Route::get('/', [DoctorController::class, 'index'])->name('index');
                Route::get('/create', [DoctorController::class, 'create'])->name('create');
                Route::post('/', [DoctorController::class, 'store'])->name('store');
                Route::get('/{doctor}/edit', [DoctorController::class, 'edit'])->name('edit');
                Route::put('/{doctor}', [DoctorController::class, 'update'])->name('update');
                Route::delete('/{doctor}', [DoctorController::class, 'destroy'])->name('destroy');
            });

            // Nurse Management
            Route::prefix('nurses')->name('nurses.')->group(function () {
                Route::get('/', [NurseController::class, 'index'])->name('index');
                Route::get('/create', [NurseController::class, 'create'])->name('create');
                Route::post('/', [NurseController::class, 'store'])->name('store');
                Route::get('/{nurse}/edit', [NurseController::class, 'edit'])->name('edit');
                Route::put('/{nurse}', [NurseController::class, 'update'])->name('update');
                Route::delete('/{nurse}', [NurseController::class, 'destroy'])->name('destroy');
            });

            // Med Tech Management
            Route::prefix('medtechs')->name('medtechs.')->group(function () {
                Route::get('/', [MedTechController::class, 'index'])->name('index');
                Route::get('/create', [MedTechController::class, 'create'])->name('create');
                Route::post('/', [MedTechController::class, 'store'])->name('store');
                Route::get('/{medtech}/edit', [MedTechController::class, 'edit'])->name('edit');
                Route::put('/{medtech}', [MedTechController::class, 'update'])->name('update');
                Route::delete('/{medtech}', [MedTechController::class, 'destroy'])->name('destroy');
            });
        });

        // Laboratory Routes - Lab staff, doctors, and admin
        Route::prefix('laboratory')->name('laboratory.')->middleware(['role:laboratory_technologist,medtech,doctor,admin'])->group(function () {
            Route::get('/', function () {
                return Inertia::render('admin/laboratory/index');
            })->name('index');

            // Manage lab tests (admin only)
            Route::middleware(['role:admin'])->group(function () {
                Route::get('/tests', [LabTestController::class, 'index'])->name('tests.index');
                Route::get('/tests/create', [LabTestController::class, 'create'])->name('tests.create');
                Route::post('/tests', [LabTestController::class, 'store'])->name('tests.store');
                Route::get('/tests/{labTest}/edit', [LabTestController::class, 'edit'])->name('tests.edit');
                Route::put('/tests/{labTest}', [LabTestController::class, 'update'])->name('tests.update');
                Route::delete('/tests/{labTest}', [LabTestController::class, 'destroy'])->name('tests.destroy');
            });

            // Lab orders management
            Route::get('/orders', [LabOrderController::class, 'allOrders'])->name('orders.all');
            Route::get('/orders/create', [LabOrderController::class, 'create'])->name('orders.create');
            Route::get('/patients/{patient}/orders', [LabOrderController::class, 'index'])->name('orders.index');
            Route::post('/patients/{patient}/orders', [LabOrderController::class, 'store'])->name('orders.store');
            Route::get('/orders/{order}', [LabOrderController::class, 'show'])->name('orders.show');
            Route::put('/orders/{order}/status', [LabOrderController::class, 'updateStatus'])->name('orders.updateStatus');

            // Results
            Route::get('/orders/{order}/results', [LabResultController::class, 'entry'])->name('results.entry');
            Route::get('/orders/{order}/results/view', [LabResultController::class, 'show'])->name('results.show');
            Route::post('/orders/{order}/results', [LabResultController::class, 'store'])->name('results.store');
            Route::put('/results/{result}', [LabResultController::class, 'update'])->name('results.update');
            Route::put('/orders/{order}/verify', [LabResultController::class, 'verify'])->name('results.verify');

            // Reports pages within Laboratory
            Route::get('/reports', [LabOrderController::class, 'reportsIndex'])->name('reports.index');
            // Single-order printable reports remain
            Route::get('/orders/{order}/report', [LabReportController::class, 'generateReport'])->name('reports.generate');
            Route::get('/orders/{order}/report/cbc', [LabReportController::class, 'generateCBCReport'])->name('reports.cbc');
            Route::get('/orders/{order}/report/urinalysis', [LabReportController::class, 'generateUrinalysisReport'])->name('reports.urinalysis');
            Route::get('/orders/{order}/report/fecalysis', [LabReportController::class, 'generateFecalysisReport'])->name('reports.fecalysis');

            // Excel Exports
            Route::get('/exports/orders.xlsx', [LabExportController::class, 'exportOrders'])->name('exports.orders');
            Route::get('/orders/{order}/export.xlsx', [LabExportController::class, 'exportOrderResults'])->name('exports.orderResults');
        });

        // Billing Routes - Cashier and admin only
        Route::prefix('billing')->name('billing.')->group(function () {
            // Main billing routes
            Route::get('/', [App\Http\Controllers\Admin\BillingController::class, 'index'])->name('index');
            Route::get('/create', [App\Http\Controllers\Admin\BillingController::class, 'create'])->name('create');
            Route::post('/', [App\Http\Controllers\Admin\BillingController::class, 'store'])->name('store');
            Route::get('/export', [App\Http\Controllers\Admin\BillingController::class, 'export'])->name('export');
            
            // Appointment-based billing routes (MUST come before parameterized routes)
            Route::get('/create-from-appointments', [App\Http\Controllers\Admin\BillingController::class, 'createFromAppointments'])->name('create-from-appointments');
            Route::post('/create-from-appointments', [App\Http\Controllers\Admin\BillingController::class, 'storeFromAppointments'])->name('store-from-appointments');
            
            // Transaction Report (MUST come before parameterized routes)
            Route::get('/transaction-report', function () {
                return Inertia::render('admin/billing/transaction-report');
            })->name('transaction-report');
            
            // Doctor Summary (MUST come before parameterized routes)
            Route::get('/doctor-summary', [App\Http\Controllers\Admin\DoctorPaymentController::class, 'doctorSummary'])->name('doctor-summary');
            
            // Doctor Payments - Redirect to billing index with doctor payments tab
            Route::prefix('doctor-payments')->name('doctor-payments.')->group(function () {
                Route::get('/', function () {
                    return redirect()->route('admin.billing.index', ['tab' => 'doctor-payments']);
                })->name('index');
                Route::get('/create', [App\Http\Controllers\Admin\DoctorPaymentController::class, 'create'])->name('create');
                Route::post('/', [App\Http\Controllers\Admin\DoctorPaymentController::class, 'store'])->name('store');
                Route::get('/summary', [App\Http\Controllers\Admin\DoctorPaymentController::class, 'summary'])->name('summary');
                Route::get('/{doctorPayment}', [App\Http\Controllers\Admin\DoctorPaymentController::class, 'show'])->name('show');
                Route::get('/{doctorPayment}/edit', [App\Http\Controllers\Admin\DoctorPaymentController::class, 'edit'])->name('edit');
                Route::put('/{doctorPayment}', [App\Http\Controllers\Admin\DoctorPaymentController::class, 'update'])->name('update');
                Route::delete('/{doctorPayment}', [App\Http\Controllers\Admin\DoctorPaymentController::class, 'destroy'])->name('destroy');
                Route::post('/{doctorPayment}/add-to-transactions', [App\Http\Controllers\Admin\DoctorPaymentController::class, 'addToTransactions'])->name('add-to-transactions');
                Route::post('/{doctorPayment}/mark-as-paid', [App\Http\Controllers\Admin\DoctorPaymentController::class, 'markAsPaid'])->name('mark-as-paid');
            });

            // Test routes for doctor payments (MUST come after main routes)
            Route::get('/test-doctor-payments', function () {
                try {
                    $doctorPayments = \App\Models\DoctorPayment::with(['doctor', 'billingTransactions'])->get();
                    $billingTransactions = \App\Models\BillingTransaction::where('total_amount', '<', 0)->with(['doctor'])->get();
                    
                    return response()->json([
                        'success' => true,
                        'doctor_payments_count' => $doctorPayments->count(),
                        'billing_transactions_count' => $billingTransactions->count(),
                        'doctor_payments' => $doctorPayments,
                        'billing_transactions' => $billingTransactions,
                    ]);
                } catch (\Exception $e) {
                    return response()->json([
                        'success' => false,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            })->name('test-doctor-payments');

            // Direct test route for doctor payments create
            Route::get('/doctor-payments/create-direct', function () {
                try {
                    $doctors = \App\Models\User::where('role', 'doctor')->select('id', 'name')->get();
                    return \Inertia\Inertia::render('admin/billing/doctor-payments/create', [
                        'doctors' => $doctors,
                    ]);
                } catch (\Exception $e) {
                    return response()->json(['error' => $e->getMessage()]);
                }
            })->name('doctor-payments.create-direct');

            // Test routes for doctor payments
            Route::get('/doctor-payments/test', function () {
                return \Inertia\Inertia::render('admin/billing/doctor-payments/test');
            })->name('doctor-payments.test');

            Route::get('/doctor-payments/simple-test', function () {
                return \Inertia\Inertia::render('admin/billing/doctor-payments/simple-test');
            })->name('doctor-payments.simple-test');
            
            // Parameterized routes (MUST come after all specific routes)
            Route::get('/{transaction}', [App\Http\Controllers\Admin\BillingController::class, 'show'])->name('show');
            Route::get('/{transaction}/edit', [App\Http\Controllers\Admin\BillingController::class, 'edit'])->name('edit');
            Route::put('/{transaction}', [App\Http\Controllers\Admin\BillingController::class, 'update'])->name('update');
            Route::delete('/{transaction}', [App\Http\Controllers\Admin\BillingController::class, 'destroy'])->name('destroy');
            Route::put('/{transaction}/status', [App\Http\Controllers\Admin\BillingController::class, 'updateStatus'])->name('status.update');
            Route::get('/{transaction}/receipt', [App\Http\Controllers\Admin\BillingController::class, 'printReceipt'])->name('receipt');
            Route::put('/{transaction}/mark-paid', [App\Http\Controllers\Admin\BillingController::class, 'markAsPaid'])->name('mark-paid');


            // Test route for doctor payments create
            Route::get('/test-doctor-payments-create', function () {
                try {
                    $doctors = \App\Models\User::where('role', 'doctor')->select('id', 'name')->get();
                    return response()->json([
                        'success' => true,
                        'message' => 'Doctor payments create route is working',
                        'doctors' => $doctors,
                        'doctors_count' => $doctors->count(),
                        'route' => 'admin.billing.doctor-payments.create',
                        'url' => '/admin/billing/doctor-payments/create'
                    ]);
                } catch (\Exception $e) {
                    return response()->json([
                        'success' => false,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            })->name('test-doctor-payments-create');

            // Debug route to check billing data
            Route::get('/debug-billing-data', function () {
                try {
                    $transactions = \App\Models\BillingTransaction::take(5)->get();
                    $doctorPayments = \App\Models\DoctorPayment::take(5)->get();
                    
                    return response()->json([
                        'success' => true,
                        'transactions_count' => \App\Models\BillingTransaction::count(),
                        'doctor_payments_count' => \App\Models\DoctorPayment::count(),
                        'sample_transactions' => $transactions->map(function($t) {
                            return [
                                'id' => $t->id,
                                'transaction_id' => $t->transaction_id,
                                'total_amount' => $t->total_amount,
                                'status' => $t->status,
                                'patient_id' => $t->patient_id,
                                'doctor_id' => $t->doctor_id
                            ];
                        }),
                        'sample_doctor_payments' => $doctorPayments->map(function($p) {
                            return [
                                'id' => $p->id,
                                'doctor_id' => $p->doctor_id,
                                'net_payment' => $p->net_payment,
                                'status' => $p->status
                            ];
                        })
                    ]);
                } catch (\Exception $e) {
                    return response()->json([
                        'success' => false,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            })->name('debug-billing-data');

            // Test authentication route
            Route::get('/test-auth-setup', function () {
                try {
                    $user = \App\Models\User::first();
                    if ($user) {
                        session(['auth.user' => $user, 'auth.login' => true]);
                        return response()->json([
                            'success' => true,
                            'message' => 'Authentication session created',
                            'user' => $user->name,
                            'user_id' => $user->id,
                            'session_auth_user' => session('auth.user') ? 'Yes' : 'No',
                            'session_auth_login' => session('auth.login') ? 'Yes' : 'No'
                        ]);
                    } else {
                        return response()->json([
                            'success' => false,
                            'message' => 'No users found in database'
                        ]);
                    }
                } catch (\Exception $e) {
                    return response()->json([
                        'success' => false,
                        'error' => $e->getMessage()
                    ]);
                }
            })->name('test-auth-setup');

            // Simple test route for doctor payments index
            Route::get('/test-doctor-payments-index', function () {
                try {
                    \Log::info('Test route called for doctor payments index');
                    $doctors = \App\Models\User::where('role', 'doctor')->select('id', 'name')->get();
                    $payments = \App\Models\DoctorPayment::with(['doctor', 'createdBy', 'updatedBy'])->get();
                    
                    return response()->json([
                        'success' => true,
                        'doctors_count' => $doctors->count(),
                        'payments_count' => $payments->count(),
                        'doctors' => $doctors,
                        'payments' => $payments,
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Test route error: ' . $e->getMessage());
                    return response()->json([
                        'success' => false,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            })->name('test-doctor-payments-index');

            // Test route to create a doctor payment
            Route::post('/test-create-doctor-payment', function (\Illuminate\Http\Request $request) {
                try {
                    \Log::info('Test create doctor payment called');
                    \Log::info('Request data: ' . json_encode($request->all()));
                    
                    $doctorPayment = \App\Models\DoctorPayment::create([
                        'doctor_id' => 1, // Use first doctor
                        'basic_salary' => 50000,
                        'deductions' => 5000,
                        'holiday_pay' => 2000,
                        'incentives' => 1000,
                        'net_payment' => 48000,
                        'payment_date' => now()->toDateString(),
                        'status' => 'pending',
                        'notes' => 'Test payment',
                        'created_by' => auth()->id() ?? 1,
                    ]);
                    
                    return response()->json([
                        'success' => true,
                        'message' => 'Doctor payment created successfully',
                        'payment_id' => $doctorPayment->id,
                        'payment' => $doctorPayment
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Test create doctor payment failed: ' . $e->getMessage());
                    return response()->json([
                        'success' => false,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            })->name('test-create-doctor-payment');

            // Test route without authentication
            Route::get('/test-doctor-payments-no-auth', function () {
                return response()->json([
                    'message' => 'This route works without authentication',
                    'timestamp' => now(),
                ]);
            })->name('test-doctor-payments-no-auth');

            // Test route to check authentication
            Route::get('/test-auth-status', function () {
                return response()->json([
                    'authenticated' => auth()->check(),
                    'user_id' => auth()->id(),
                    'user' => auth()->user(),
                    'session_auth_user' => session('auth.user'),
                    'session_auth_login' => session('auth.login'),
                    'timestamp' => now(),
                ]);
            })->name('test-auth-status');

            // Simple test route for create
            Route::get('/test-create', function () {
                return response()->json(['message' => 'Create route is working']);
            })->name('test-create');

            // Test POST route for doctor payments
            Route::post('/test-store', function (\Illuminate\Http\Request $request) {
                return response()->json([
                    'message' => 'Store route is working',
                    'data' => $request->all()
                ]);
            })->name('test-store');

            // Expenses
            Route::prefix('expenses')->name('expenses.')->group(function () {
                Route::get('/', [App\Http\Controllers\Admin\ExpenseController::class, 'index'])->name('index');
                Route::get('/create', [App\Http\Controllers\Admin\ExpenseController::class, 'create'])->name('create');
                Route::post('/', [App\Http\Controllers\Admin\ExpenseController::class, 'store'])->name('store');
                Route::get('/{expense}', [App\Http\Controllers\Admin\ExpenseController::class, 'show'])->name('show');
                Route::get('/{expense}/edit', [App\Http\Controllers\Admin\ExpenseController::class, 'edit'])->name('edit');
                Route::put('/{expense}', [App\Http\Controllers\Admin\ExpenseController::class, 'update'])->name('update');
                Route::delete('/{expense}', [App\Http\Controllers\Admin\ExpenseController::class, 'destroy'])->name('destroy');
                Route::put('/{expense}/status', [App\Http\Controllers\Admin\ExpenseController::class, 'updateStatus'])->name('status.update');
            });

            // Reports
            Route::prefix('reports')->name('reports.')->group(function () {
                Route::get('/', [App\Http\Controllers\Admin\BillingReportController::class, 'index'])->name('index');
                Route::get('/daily', [App\Http\Controllers\Admin\BillingReportController::class, 'dailyReport'])->name('daily');
                Route::get('/monthly', [App\Http\Controllers\Admin\BillingReportController::class, 'monthlyReport'])->name('monthly');
                Route::get('/yearly', [App\Http\Controllers\Admin\BillingReportController::class, 'yearlyReport'])->name('yearly');
                Route::get('/hmo', [App\Http\Controllers\Admin\BillingReportController::class, 'hmoReport'])->name('hmo');
                Route::get('/doctor-summary', [App\Http\Controllers\Admin\BillingReportController::class, 'doctorSummary'])->name('doctor-summary');
                Route::get('/export', [App\Http\Controllers\Admin\BillingReportController::class, 'exportReport'])->name('export');
                Route::get('/export-all', [App\Http\Controllers\Admin\BillingReportController::class, 'exportAll'])->name('export-all');
                Route::get('/daily/export', [App\Http\Controllers\Admin\BillingReportController::class, 'exportDailyReport'])->name('daily.export');
                Route::get('/monthly/export', [App\Http\Controllers\Admin\BillingReportController::class, 'exportMonthlyReport'])->name('monthly.export');
                Route::get('/yearly/export', [App\Http\Controllers\Admin\BillingReportController::class, 'exportYearlyReport'])->name('yearly.export');
            });

            
            // Test doctor payments route (temporary)
            Route::get('/test-doctor-payments', function () {
                try {
                    $doctors = \App\Models\User::where('role', 'doctor')->count();
                    $payments = \App\Models\DoctorPayment::count();
                    $transactions = \App\Models\BillingTransaction::count();
                    $links = \App\Models\DoctorPaymentBillingLink::count();
                    
                    return response()->json([
                        'doctors_count' => $doctors,
                        'payments_count' => $payments,
                        'transactions_count' => $transactions,
                        'links_count' => $links,
                        'status' => 'success',
                        'message' => 'Doctor payment system is working correctly!'
                    ]);
                } catch (\Exception $e) {
                    return response()->json([
                        'error' => $e->getMessage(),
                        'status' => 'error'
                    ]);
                }
            })->name('test-doctor-payments');
            
            // Test route for billing transaction creation
            Route::get('/test-billing-transaction', function () {
                try {
                    \Log::info('Testing billing transaction creation...');
                    
                    // Test creating a simple transaction
                    $transaction = \App\Models\BillingTransaction::create([
                        'transaction_id' => 'TXN-TEST-' . time(),
                        'patient_id' => null,
                        'doctor_id' => null,
                        'payment_type' => 'cash',
                        'total_amount' => 100.00,
                        'discount_amount' => 0,
                        'payment_method' => 'cash',
                        'status' => 'pending',
                        'description' => 'Test transaction',
                        'transaction_date' => now(),
                        'transaction_date_only' => now()->toDateString(),
                        'transaction_time_only' => now()->toTimeString(),
                        'created_by' => auth()->id() ?? 1,
                    ]);
                    
                    \Log::info('Test transaction created with ID: ' . $transaction->id);
                    
                    return response()->json([
                        'success' => true,
                        'message' => 'Test transaction created successfully!',
                        'transaction_id' => $transaction->id,
                        'transaction' => $transaction
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Test transaction creation failed: ' . $e->getMessage());
                    \Log::error('Exception trace: ' . $e->getTraceAsString());
                    
                    return response()->json([
                        'success' => false,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            })->name('test-billing-transaction');
            
            // Test export route (temporary)
            Route::get('/test-export', function () {
                $testData = [
                    [
                        'Type' => 'Billing Transaction',
                        'Transaction ID' => 'TXN-001',
                        'Patient Name' => 'John Doe',
                        'Specialist' => 'Dr. Smith',
                        'Amount' => 500.00,
                        'Payment Method' => 'Cash',
                        'Status' => 'Paid',
                        'Description' => 'Test transaction',
                        'Time' => '2024-01-01 10:00:00',
                        'Items Count' => 1,
                        'Appointments Count' => 0,
                    ]
                ];
                
                $format = request('format', 'excel');
                
                if ($format === 'pdf') {
                    $html = '<html><head><title>Test Export</title></head><body>';
                    $html .= '<h1>Test Export</h1>';
                    $html .= '<table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse: collapse;">';
                    $html .= '<tr style="background-color: #f5f5f5;">';
                    foreach (array_keys($testData[0]) as $header) {
                        $html .= '<th>' . $header . '</th>';
                    }
                    $html .= '</tr>';
                    foreach ($testData as $row) {
                        $html .= '<tr>';
                        foreach ($row as $cell) {
                            $html .= '<td>' . $cell . '</td>';
                        }
                        $html .= '</tr>';
                    }
                    $html .= '</table></body></html>';
                    
                    return \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)->download('test-export.pdf');
                }
                
                return \Maatwebsite\Excel\Facades\Excel::download(
                    new \App\Exports\ArrayExport($testData, 'Test Export'), 
                    'test-export.xlsx'
                );
            })->name('test-export');
        });

        // Appointments Routes - Doctor and admin only
        Route::prefix('appointments')->name('appointments.')->middleware(['role:doctor,admin'])->group(function () {
            Route::get('/', [AppointmentController::class, 'index'])->name('index');
            Route::get('/create', [AppointmentController::class, 'create'])->name('create');
            Route::post('/', [AppointmentController::class, 'store'])->name('store');
            Route::get('/{appointment}', [AppointmentController::class, 'show'])->name('show');
            Route::get('/{appointment}/edit', [AppointmentController::class, 'edit'])->name('edit');
            Route::put('/{appointment}', [AppointmentController::class, 'update'])->name('update');
            Route::delete('/{appointment}', [AppointmentController::class, 'destroy'])->name('destroy');
            Route::delete('/patient/{patient_id}', [AppointmentController::class, 'destroyByPatientId'])->name('destroy.by-patient');
            Route::put('/{appointment}/status', [AppointmentController::class, 'updateStatus'])->name('status.update');
            Route::get('/api/by-date', [AppointmentController::class, 'getByDate'])->name('api.by-date');
            Route::get('/api/stats', [AppointmentController::class, 'getStats'])->name('api.stats');
            Route::get('/test', function() {
                $appointments = \App\Models\Appointment::all();
                return response()->json([
                    'count' => $appointments->count(),
                    'appointments' => $appointments
                ]);
            })->name('test');
            
            // Doctor availability management - Admin only
            Route::get('/availability', function () {
                return Inertia::render('admin/appointments/availability');
            })->name('availability')->middleware(['role:admin']);
        });

        // Pending Appointments Routes - Admin only
        Route::prefix('pending-appointments')->name('pending-appointments.')->middleware(['role:admin'])->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\PendingAppointmentController::class, 'index'])->name('index');
            Route::get('/{pendingAppointment}', [\App\Http\Controllers\Admin\PendingAppointmentController::class, 'show'])->name('show');
            Route::post('/{pendingAppointment}/approve', [\App\Http\Controllers\Admin\PendingAppointmentController::class, 'approve'])->name('approve');
            Route::post('/{pendingAppointment}/reject', [\App\Http\Controllers\Admin\PendingAppointmentController::class, 'reject'])->name('reject');
            Route::delete('/{pendingAppointment}', [\App\Http\Controllers\Admin\PendingAppointmentController::class, 'destroy'])->name('destroy');
            
            // Test route for debugging
            Route::get('/debug/status', function () {
                $pendingAppointments = \App\Models\PendingAppointment::all();
                $notifications = \App\Models\Notification::where('type', 'appointment')->latest()->limit(5)->get();
                
                return response()->json([
                    'pending_appointments' => $pendingAppointments->map(function($apt) {
                        return [
                            'id' => $apt->id,
                            'status_approval' => $apt->status_approval,
                            'patient_name' => $apt->patient_name,
                            'created_at' => $apt->created_at
                        ];
                    }),
                    'recent_notifications' => $notifications->map(function($notif) {
                        return [
                            'id' => $notif->id,
                            'title' => $notif->title,
                            'message' => $notif->message,
                            'user_id' => $notif->user_id,
                            'created_at' => $notif->created_at
                        ];
                    })
                ]);
            })->name('debug.status');
            
            // Cleanup route to remove pending appointments
            Route::get('/cleanup/remove-pending', function () {
                $pendingAppointments = \App\Models\PendingAppointment::where('status_approval', 'pending')->get();
                $removedCount = 0;
                $removedAppointments = [];
                
                foreach ($pendingAppointments as $appointment) {
                    $removedAppointments[] = [
                        'id' => $appointment->id,
                        'patient_name' => $appointment->patient_name,
                        'appointment_type' => $appointment->appointment_type,
                        'status_approval' => $appointment->status_approval
                    ];
                    $appointment->delete();
                    $removedCount++;
                }
                
                return response()->json([
                    'message' => "Successfully removed {$removedCount} pending appointments",
                    'removed_appointments' => $removedAppointments,
                    'remaining_count' => \App\Models\PendingAppointment::count()
                ]);
            })->name('cleanup.remove-pending');
            
            // Cleanup route to remove ALL pending appointments (including approved ones)
            Route::get('/cleanup/remove-all', function () {
                $pendingAppointments = \App\Models\PendingAppointment::all();
                $removedCount = 0;
                $removedAppointments = [];
                
                foreach ($pendingAppointments as $appointment) {
                    $removedAppointments[] = [
                        'id' => $appointment->id,
                        'patient_name' => $appointment->patient_name,
                        'appointment_type' => $appointment->appointment_type,
                        'status_approval' => $appointment->status_approval
                    ];
                    $appointment->delete();
                    $removedCount++;
                }
                
                return response()->json([
                    'message' => "Successfully removed {$removedCount} pending appointments (all statuses)",
                    'removed_appointments' => $removedAppointments,
                    'remaining_count' => \App\Models\PendingAppointment::count()
                ]);
            })->name('cleanup.remove-all');
        });

        // Clinic Procedures Routes - Admin and lab staff only
        Route::prefix('clinic-procedures')->name('clinic-procedures.')->middleware(['role:admin,laboratory_technologist,medtech'])->group(function () {
            Route::get('/', [ClinicProcedureController::class, 'index'])->name('index');
            Route::get('/create', [ClinicProcedureController::class, 'create'])->name('create');
            Route::post('/', [ClinicProcedureController::class, 'store'])->name('store');
            Route::get('/{clinicProcedure}', [ClinicProcedureController::class, 'show'])->name('show');
            Route::get('/{clinicProcedure}/edit', [ClinicProcedureController::class, 'edit'])->name('edit');
            Route::put('/{clinicProcedure}', [ClinicProcedureController::class, 'update'])->name('update');
            Route::delete('/{clinicProcedure}', [ClinicProcedureController::class, 'destroy'])->name('destroy');
            Route::put('/{clinicProcedure}/toggle-status', [ClinicProcedureController::class, 'toggleStatus'])->name('toggle-status');
            Route::get('/api/by-category', [ClinicProcedureController::class, 'getByCategory'])->name('api.by-category');
            Route::get('/api/by-subcategory', [ClinicProcedureController::class, 'getBySubcategory'])->name('api.by-subcategory');
        });

        // Analytics and Reporting Routes - Admin only
        Route::prefix('analytics')->name('analytics.')->middleware(['role:admin'])->group(function () {
            Route::get('/', [AnalyticsController::class, 'index'])->name('index');
            Route::get('/patients', [AnalyticsController::class, 'getPatientReport'])->name('patients');
            Route::get('/specialists', [AnalyticsController::class, 'getSpecialistReport'])->name('specialists');
            Route::get('/procedures', [AnalyticsController::class, 'getProcedureReport'])->name('procedures');
            Route::get('/financial', [AnalyticsController::class, 'getFinancialReport'])->name('financial');
            Route::get('/inventory', [AnalyticsController::class, 'getInventoryReport'])->name('inventory');
            Route::get('/export/{type}', [AnalyticsController::class, 'exportReport'])->name('export');
        });

        // Comprehensive Reports Routes - All staff can access
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', [App\Http\Controllers\Hospital\HospitalReportController::class, 'index'])->name('index');
            Route::get('/patients', [App\Http\Controllers\Hospital\HospitalReportController::class, 'patients'])->name('patients');
            Route::get('/laboratory', [App\Http\Controllers\Hospital\HospitalReportController::class, 'laboratory'])->name('laboratory');
            Route::get('/inventory', [App\Http\Controllers\Hospital\HospitalReportController::class, 'inventory'])->name('inventory');
            Route::get('/appointments', [App\Http\Controllers\Hospital\HospitalReportController::class, 'appointments'])->name('appointments');
            Route::get('/specialist-management', [App\Http\Controllers\Hospital\HospitalReportController::class, 'specialistManagement'])->name('specialist.management');
            Route::get('/billing', [App\Http\Controllers\Hospital\HospitalReportController::class, 'transactions'])->name('billing');
            Route::get('/transfers', [App\Http\Controllers\Hospital\HospitalReportController::class, 'transfers'])->name('transfers');
            Route::get('/clinic-operations', [App\Http\Controllers\Hospital\HospitalReportController::class, 'clinicOperations'])->name('clinic.operations');
            Route::get('/export/{type}', [App\Http\Controllers\Hospital\HospitalReportController::class, 'export'])->name('export');
        });

        // Test route for debugging
        Route::get('/test-inventory', function () {
            $items = \App\Models\InventoryItem::all();
            $data = [];
            foreach ($items as $item) {
                $data[] = [
                    'id' => $item->id,
                    'name' => $item->item_name,
                    'stock' => $item->stock,
                    'consumed' => $item->consumed,
                    'rejected' => $item->rejected,
                ];
            }
            return response()->json($data);
        });

        // Test reject functionality
        Route::post('/test-reject/{id}', function ($id) {
            $item = \App\Models\InventoryItem::findOrFail($id);
            $item->removeStock(1, true); // Reject 1 item
            return response()->json([
                'success' => true,
                'item' => [
                    'id' => $item->id,
                    'name' => $item->item_name,
                    'stock' => $item->stock,
                    'consumed' => $item->consumed,
                    'rejected' => $item->rejected,
                ]
            ]);
        });

        // Test rejected items functionality
        Route::get('/test-rejected-items', function () {
            $itemsWithRejections = \App\Models\InventoryItem::where('rejected', '>', 0)->get();
            $totalRejected = \App\Models\InventoryItem::getTotalRejected();
            $rejectedMovements = \App\Models\InventoryMovement::with(['inventoryItem'])
                ->where('movement_type', 'OUT')
                ->where('remarks', 'like', '%rejected%')
                ->get();
            
            return response()->json([
                'success' => true,
                'totalRejectedItems' => $totalRejected,
                'itemsWithRejections' => $itemsWithRejections->map(function($item) {
                    return [
                        'id' => $item->id,
                        'name' => $item->item_name,
                        'code' => $item->item_code,
                        'rejected' => $item->rejected,
                        'consumed' => $item->consumed,
                        'stock' => $item->stock,
                        'rejectionRate' => $item->getRejectionRate()
                    ];
                }),
                'rejectedMovements' => $rejectedMovements->map(function($movement) {
                    return [
                        'id' => $movement->id,
                        'item_name' => $movement->inventoryItem->item_name,
                        'quantity' => $movement->quantity,
                        'remarks' => $movement->remarks,
                        'created_by' => $movement->created_by,
                        'created_at' => $movement->created_at->format('Y-m-d H:i:s')
                    ];
                }),
                'summary' => [
                    'totalRejectedItems' => $totalRejected,
                    'totalRejectedProducts' => $itemsWithRejections->count(),
                    'totalRejectedMovements' => $rejectedMovements->count()
                ]
            ]);
        });

        // Inventory routes - All authenticated staff can access
        Route::prefix('inventory')->name('inventory.')->group(function () {
            Route::get('/', [App\Http\Controllers\InventoryController::class, 'index'])->name('index');
            Route::get('/create', [App\Http\Controllers\InventoryController::class, 'create'])->name('create');
            Route::post('/', [App\Http\Controllers\InventoryController::class, 'store'])->name('store');
            
            // Category-specific pages (must come before {id} routes)
            Route::get('/doctor-nurse', [App\Http\Controllers\InventoryController::class, 'doctorNurse'])->name('doctor-nurse');
            Route::get('/medtech', [App\Http\Controllers\InventoryController::class, 'medTech'])->name('medtech');
            
            // Reports routes (must come before general /reports route)
            Route::get('/reports', [App\Http\Controllers\InventoryController::class, 'reports'])->name('reports');
            Route::get('/reports/export', [App\Http\Controllers\InventoryController::class, 'exportReport'])->name('reports.export');
            
            // ID-based routes (must come after specific routes)
            Route::get('/{id}', [App\Http\Controllers\InventoryController::class, 'show'])->name('show');
            Route::get('/{id}/edit', [App\Http\Controllers\InventoryController::class, 'edit'])->name('edit');
            Route::put('/{id}', [App\Http\Controllers\InventoryController::class, 'update'])->name('update');
            Route::delete('/{id}', [App\Http\Controllers\InventoryController::class, 'destroy'])->name('destroy');
            Route::post('/{id}/movement', [App\Http\Controllers\InventoryController::class, 'movement'])->name('movement');
        });

        // Notifications Routes - All staff can access
        Route::prefix('notifications')->name('notifications.')->group(function () {
            Route::get('/', [NotificationController::class, 'index'])->name('index');
            Route::get('/{notification}', [NotificationController::class, 'show'])->name('show');
            Route::post('/{notification}/mark-read', [NotificationController::class, 'markAsRead'])->name('mark-read');
            Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
            Route::get('/unread-count', [NotificationController::class, 'getUnreadCount'])->name('unread-count');
            
            // Appointment approval/rejection
            Route::post('/{appointment}/approve', [NotificationController::class, 'approveAppointment'])->name('approve-appointment');
            Route::post('/{appointment}/reject', [NotificationController::class, 'rejectAppointment'])->name('reject-appointment');
        });

        // Real-time appointment routes
        Route::prefix('realtime')->name('realtime.')->group(function () {
            Route::get('/appointments', [\App\Http\Controllers\Admin\RealtimeAppointmentController::class, 'getAppointmentUpdates'])->name('appointments');
            Route::get('/notifications', [\App\Http\Controllers\Admin\RealtimeAppointmentController::class, 'getNotificationUpdates'])->name('notifications');
            Route::post('/notifications/{notification}/mark-read', [\App\Http\Controllers\Admin\RealtimeAppointmentController::class, 'markNotificationAsRead'])->name('notifications.mark-read');
            Route::post('/notifications/mark-all-read', [\App\Http\Controllers\Admin\RealtimeAppointmentController::class, 'markAllNotificationsAsRead'])->name('notifications.mark-all-read');
            Route::post('/appointments/{appointment}/broadcast', [\App\Http\Controllers\Admin\RealtimeAppointmentController::class, 'broadcastNewAppointment'])->name('appointments.broadcast');
            Route::post('/appointments/{appointment}/status-broadcast', [\App\Http\Controllers\Admin\RealtimeAppointmentController::class, 'broadcastAppointmentStatusChange'])->name('appointments.status-broadcast');
        });

        // Admin-only routes
        Route::middleware(['role:admin'])->group(function () {

            Route::prefix('roles')->name('roles.')->group(function () {
                Route::get('/', [RoleController::class, 'index'])->name('index');
                Route::get('/create', [RoleController::class, 'create'])->name('create');
                Route::post('/', [RoleController::class, 'store'])->name('store');
                Route::get('/{role}/edit', [RoleController::class, 'edit'])->name('edit');
                Route::put('/{role}', [RoleController::class, 'update'])->name('update');
                Route::delete('/{role}', [RoleController::class, 'destroy'])->name('destroy');
                Route::put('/users/{user}/role', [UserRoleController::class, 'update'])->name('users.role.update');
                Route::post('/users', [UserRoleController::class, 'store'])->name('users.store');
            });

            Route::prefix('permissions')->name('permissions.')->group(function () {
                Route::get('/', [PermissionController::class, 'index'])->name('index');
                Route::get('/create', [PermissionController::class, 'create'])->name('create');
                Route::post('/', [PermissionController::class, 'store'])->name('store');
                Route::get('/{permission}/edit', [PermissionController::class, 'edit'])->name('edit');
                Route::put('/{permission}', [PermissionController::class, 'update'])->name('update');
                Route::delete('/{permission}', [PermissionController::class, 'destroy'])->name('destroy');
            });

            Route::prefix('settings')->name('settings.')->group(function () {
                Route::get('/', function () {
                    return Inertia::render('admin/settings/index');
                })->name('index');
            });
        });
    });
