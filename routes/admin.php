<?php

use App\Http\Controllers\PatientController;
use App\Http\Controllers\Admin\PatientTransferController;
use App\Http\Controllers\Lab\LabTestController;
use App\Http\Controllers\Lab\LabOrderController;
use App\Http\Controllers\Lab\LabResultController;
use App\Http\Controllers\Lab\LabReportController;
use App\Http\Controllers\Lab\LabExportController;
use App\Http\Controllers\Admin\SpecialistController;
use App\Http\Controllers\Admin\SpecialistScheduleController;
use App\Http\Controllers\Admin\DoctorController;
use App\Http\Controllers\Admin\NurseController;
use App\Http\Controllers\Admin\MedTechController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Inventory\ProductController;
use App\Http\Controllers\Inventory\TransactionController;
use App\Http\Controllers\Inventory\ReportController;
use App\Http\Controllers\Inventory\SupplierController;
use App\Http\Controllers\Inventory\EnhancedInventoryController;
use App\Http\Controllers\Admin\UserRoleController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\AppointmentController;
use App\Http\Controllers\Admin\ClinicProcedureController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\EnhancedHmoReportController;
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
        // Redirect /admin to /admin/dashboard
        Route::get('/', function () {
            return redirect()->route('admin.dashboard');
        });
        
        // Dashboard - All authenticated staff can access
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        

        // Patient CRUD routes (URLs -> /admin/patient) - All staff can access
        Route::middleware(['module.access:patients'])->group(function () {
            Route::resource('patient', PatientController::class)->names([
                'index' => 'patient.index',
                'create' => 'patient.create',
                'store' => 'patient.store',
                'show' => 'patient.show',
                'edit' => 'patient.edit',
                'update' => 'patient.update',
                'destroy' => 'patient.destroy',
            ]);
        });

        // Patient Transfer routes - All staff with transfer permission can access
        Route::middleware(['module.access:patients'])->group(function () {
            Route::prefix('patient-transfers')->name('patient.transfer.')->group(function () {
                Route::get('/', [PatientTransferController::class, 'index'])->name('index');
                Route::get('/create', [PatientTransferController::class, 'create'])->name('create');
                Route::post('/', [PatientTransferController::class, 'store'])->name('store');
                Route::get('/{transfer}', [PatientTransferController::class, 'show'])->name('show');
                Route::put('/{transfer}', [PatientTransferController::class, 'update'])->name('update');
                Route::delete('/{transfer}', [PatientTransferController::class, 'destroy'])->name('destroy');
                Route::post('/{transfer}/complete', [PatientTransferController::class, 'complete'])->name('complete');
                Route::post('/{transfer}/cancel', [PatientTransferController::class, 'cancel'])->name('cancel');
            });
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
                // Schedule Management for Doctors
                Route::get('/{doctor}/schedule', [SpecialistScheduleController::class, 'showDoctor'])->name('schedule.show');
                Route::put('/{doctor}/schedule', [SpecialistScheduleController::class, 'updateDoctor'])->name('schedule.update');
            });

            // Nurse Management
            Route::prefix('nurses')->name('nurses.')->group(function () {
                Route::get('/', [NurseController::class, 'index'])->name('index');
                Route::get('/create', [NurseController::class, 'create'])->name('create');
                Route::post('/', [NurseController::class, 'store'])->name('store');
                Route::get('/{nurse}/edit', [NurseController::class, 'edit'])->name('edit');
                Route::put('/{nurse}', [NurseController::class, 'update'])->name('update');
                Route::delete('/{nurse}', [NurseController::class, 'destroy'])->name('destroy');
                // Schedule Management for Nurses
                Route::get('/{nurse}/schedule', [SpecialistScheduleController::class, 'showNurse'])->name('schedule.show');
                Route::put('/{nurse}/schedule', [SpecialistScheduleController::class, 'updateNurse'])->name('schedule.update');
            });

            // Med Tech Management
            Route::prefix('medtechs')->name('medtechs.')->group(function () {
                Route::get('/', [MedTechController::class, 'index'])->name('index');
                Route::get('/create', [MedTechController::class, 'create'])->name('create');
                Route::post('/', [MedTechController::class, 'store'])->name('store');
                Route::get('/{medtech}/edit', [MedTechController::class, 'edit'])->name('edit');
                Route::put('/{medtech}', [MedTechController::class, 'update'])->name('update');
                Route::delete('/{medtech}', [MedTechController::class, 'destroy'])->name('destroy');
                // Schedule Management for Med Techs
                Route::get('/{medtech}/schedule', [SpecialistScheduleController::class, 'showMedtech'])->name('schedule.show');
                Route::put('/{medtech}/schedule', [SpecialistScheduleController::class, 'updateMedtech'])->name('schedule.update');
            });
        });

        // Laboratory Routes - Lab staff, doctors, and admin
        Route::prefix('laboratory')->name('laboratory.')->middleware(['module.access:laboratory'])->group(function () {
            Route::get('/', function () {
                return Inertia::render('admin/laboratory/index');
            })->name('index');

            // Manage lab tests (admin and medtech only)
            Route::middleware(['role:admin,medtech'])->group(function () {
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

            // Lab Reports (moved to main reports section)
            Route::get('/lab-reports', [LabOrderController::class, 'reportsIndex'])->name('lab-reports.index');
            // Single-order printable reports remain
            Route::get('/orders/{order}/report', [LabReportController::class, 'generateReport'])->name('reports.generate');
            Route::get('/orders/{order}/report/cbc', [LabReportController::class, 'generateCBCReport'])->name('reports.cbc');
            Route::get('/orders/{order}/report/urinalysis', [LabReportController::class, 'generateUrinalysisReport'])->name('reports.urinalysis');
            Route::get('/orders/{order}/report/fecalysis', [LabReportController::class, 'generateFecalysisReport'])->name('reports.fecalysis');

            // Excel Exports
            Route::get('/exports/orders.xlsx', [LabExportController::class, 'exportOrders'])->name('exports.orders');
            Route::get('/orders/{order}/export.xlsx', [LabExportController::class, 'exportOrderResults'])->name('exports.orderResults');
        });

        // Laboratory Reports Routes - All staff can access
        Route::prefix('laboratory-reports')->name('laboratory-reports.')->group(function () {
            Route::get('/', [App\Http\Controllers\LaboratoryReportController::class, 'index'])->name('index');
            Route::get('/export/excel', [App\Http\Controllers\LaboratoryReportController::class, 'exportExcel'])->name('export.excel');
            Route::get('/export/pdf', [App\Http\Controllers\LaboratoryReportController::class, 'exportPdf'])->name('export.pdf');
            
        });

        // Billing Routes - Cashier and admin only
        Route::prefix('billing')->name('billing.')->middleware(['module.access:billing'])->group(function () {
            // Main billing routes
            Route::get('/', [App\Http\Controllers\Admin\BillingController::class, 'index'])->name('index');
            Route::get('/create', [App\Http\Controllers\Admin\ManualTransactionController::class, 'create'])->name('create');
            Route::post('/', [App\Http\Controllers\Admin\ManualTransactionController::class, 'store'])->name('store');
            Route::get('/export', [App\Http\Controllers\Admin\BillingController::class, 'export'])->name('export');
            
            // Appointment-based billing routes (MUST come before parameterized routes)
            Route::get('/create-from-appointments', [App\Http\Controllers\Admin\BillingController::class, 'createFromAppointments'])->name('create-from-appointments');
            Route::post('/create-from-appointments', [App\Http\Controllers\Admin\BillingController::class, 'storeFromAppointments'])->name('store-from-appointments');
            
            // Transaction Report (MUST come before parameterized routes)
            Route::get('/transaction-report', function () {
                return Inertia::render('admin/billing/transaction-report');
            })->name('transaction-report');
            
            // Daily Report (MUST come before parameterized routes)
            Route::get('/daily-report', [App\Http\Controllers\Admin\BillingReportController::class, 'dailyReport'])->name('daily-report');
            
            // Monthly Report (MUST come before parameterized routes)
            Route::get('/monthly-report', [App\Http\Controllers\Admin\BillingReportController::class, 'monthlyReport'])->name('monthly-report');
            
            // Yearly Report (MUST come before parameterized routes)
            Route::get('/yearly-report', [App\Http\Controllers\Admin\BillingReportController::class, 'yearlyReport'])->name('yearly-report');
            
            // Doctor Summary (MUST come before parameterized routes)
            Route::get('/doctor-summary', [App\Http\Controllers\Admin\DoctorPaymentController::class, 'doctorSummary'])->name('doctor-summary');
            Route::get('/doctor-summary/export', [App\Http\Controllers\Admin\DoctorPaymentController::class, 'exportDoctorSummary'])->name('doctor-summary.export');
            
            // Doctor Summary Report (MUST come before parameterized routes)
            Route::get('/doctor-summary-report', [App\Http\Controllers\Admin\DoctorSummaryReportController::class, 'index'])->name('doctor-summary-report');
            Route::get('/doctor-summary-report/daily', [App\Http\Controllers\Admin\DoctorSummaryReportController::class, 'dailyReport'])->name('doctor-summary-report.daily');
            Route::get('/doctor-summary-report/monthly', [App\Http\Controllers\Admin\DoctorSummaryReportController::class, 'monthlyReport'])->name('doctor-summary-report.monthly');
            Route::get('/doctor-summary-report/yearly', [App\Http\Controllers\Admin\DoctorSummaryReportController::class, 'yearlyReport'])->name('doctor-summary-report.yearly');
            Route::get('/doctor-summary-report/daily/export', [App\Http\Controllers\Admin\DoctorSummaryReportController::class, 'exportDailyReport'])->name('doctor-summary-report.daily.export');
            Route::get('/doctor-summary-report/monthly/export', [App\Http\Controllers\Admin\DoctorSummaryReportController::class, 'exportMonthlyReport'])->name('doctor-summary-report.monthly.export');
            Route::get('/doctor-summary-report/yearly/export', [App\Http\Controllers\Admin\DoctorSummaryReportController::class, 'exportYearlyReport'])->name('doctor-summary-report.yearly.export');
            
            // Enhanced HMO Reports (MUST come before parameterized routes)
            Route::get('/enhanced-hmo-report', [EnhancedHmoReportController::class, 'index'])->name('enhanced-hmo-report.index');
            Route::get('/enhanced-hmo-report/generate', [EnhancedHmoReportController::class, 'generateReport'])->name('enhanced-hmo-report.generate');
            Route::post('/enhanced-hmo-report/generate', [EnhancedHmoReportController::class, 'generateReport'])->name('enhanced-hmo-report.generate.post');
            Route::get('/enhanced-hmo-report/export-data', [EnhancedHmoReportController::class, 'exportData'])->name('enhanced-hmo-report.export-data');
            Route::get('/enhanced-hmo-report/provider-performance', [EnhancedHmoReportController::class, 'providerPerformance'])->name('enhanced-hmo-report.provider-performance');
            Route::get('/enhanced-hmo-report/patient-coverage', [EnhancedHmoReportController::class, 'patientCoverage'])->name('enhanced-hmo-report.patient-coverage');
            Route::get('/enhanced-hmo-report/{report}', [EnhancedHmoReportController::class, 'show'])->name('enhanced-hmo-report.show');
            Route::get('/enhanced-hmo-report/{report}/export', [EnhancedHmoReportController::class, 'export'])->name('enhanced-hmo-report.export');
            

            // Doctor Payments - Redirect to billing index with doctor payments tab
            Route::prefix('doctor-payments')->name('doctor-payments.')->group(function () {
                Route::get('/', function () {
                    return redirect()->route('admin.billing.index', ['tab' => 'doctor-payments']);
                })->name('index');
                Route::get('/create', [App\Http\Controllers\Admin\DoctorPaymentController::class, 'create'])->name('create');
                Route::post('/', [App\Http\Controllers\Admin\DoctorPaymentController::class, 'store'])->name('store');
                Route::post('/simple', [App\Http\Controllers\Admin\DoctorPaymentController::class, 'storeSimple'])->name('store-simple');
        Route::put('/{id}/mark-paid', [App\Http\Controllers\Admin\DoctorPaymentController::class, 'markPaid'])->name('mark-paid');
                Route::get('/summary', [App\Http\Controllers\Admin\DoctorPaymentController::class, 'summary'])->name('summary');
                Route::get('/{doctorPayment}', [App\Http\Controllers\Admin\DoctorPaymentController::class, 'show'])->name('show');
                Route::get('/{doctorPayment}/edit', [App\Http\Controllers\Admin\DoctorPaymentController::class, 'edit'])->name('edit');
                Route::put('/{doctorPayment}', [App\Http\Controllers\Admin\DoctorPaymentController::class, 'update'])->name('update');
                Route::delete('/{doctorPayment}', [App\Http\Controllers\Admin\DoctorPaymentController::class, 'destroy'])->name('destroy');
                Route::post('/{doctorPayment}/mark-as-paid', [App\Http\Controllers\Admin\DoctorPaymentController::class, 'markAsPaid'])->name('mark-as-paid');
            });

            // Doctor Payment Reports
            Route::prefix('doctor-payment-reports')->name('doctor-payment-reports.')->group(function () {
                Route::get('/', [App\Http\Controllers\Admin\DoctorPaymentReportController::class, 'index'])->name('index');
                Route::get('/daily', [App\Http\Controllers\Admin\DoctorPaymentReportController::class, 'daily'])->name('daily');
                Route::get('/monthly', [App\Http\Controllers\Admin\DoctorPaymentReportController::class, 'monthly'])->name('monthly');
                Route::get('/yearly', [App\Http\Controllers\Admin\DoctorPaymentReportController::class, 'yearly'])->name('yearly');
                Route::get('/export', [App\Http\Controllers\Admin\DoctorPaymentReportController::class, 'export'])->name('export');
                Route::get('/doctor/{doctorId}', [App\Http\Controllers\Admin\DoctorPaymentReportController::class, 'doctorDetails'])->name('doctor-details');
            });

            
            // Manual Transaction routes (MUST come before parameterized routes)
            Route::prefix('manual-transactions')->name('manual-transactions.')->group(function () {
                Route::get('/{manualTransaction}', [App\Http\Controllers\Admin\ManualTransactionController::class, 'show'])->name('show');
                Route::get('/{manualTransaction}/edit', [App\Http\Controllers\Admin\ManualTransactionController::class, 'edit'])->name('edit');
                Route::put('/{manualTransaction}', [App\Http\Controllers\Admin\ManualTransactionController::class, 'update'])->name('update');
                Route::delete('/{manualTransaction}', [App\Http\Controllers\Admin\ManualTransactionController::class, 'destroy'])->name('destroy');
                Route::put('/{manualTransaction}/status', [App\Http\Controllers\Admin\ManualTransactionController::class, 'updateStatus'])->name('status.update');
            });

            // Parameterized routes (MUST come after all specific routes)
            Route::get('/{transaction}', [App\Http\Controllers\Admin\BillingController::class, 'show'])->name('show');
            Route::get('/{transaction}/edit', [App\Http\Controllers\Admin\BillingController::class, 'edit'])->name('edit');
            Route::put('/{transaction}', [App\Http\Controllers\Admin\BillingController::class, 'update'])->name('update');
            Route::delete('/{transaction}', [App\Http\Controllers\Admin\BillingController::class, 'destroy'])->name('destroy');
            Route::put('/{transaction}/status', [App\Http\Controllers\Admin\BillingController::class, 'updateStatus'])->name('status.update');
            Route::get('/{transaction}/receipt', [App\Http\Controllers\Admin\BillingController::class, 'printReceipt'])->name('receipt');
            Route::put('/{transaction}/mark-paid', [App\Http\Controllers\Admin\BillingController::class, 'markAsPaid'])->name('mark-paid');




            // HMO Provider Management
            Route::prefix('hmo-providers')->name('hmo-providers.')->group(function () {
                Route::get('/', [App\Http\Controllers\Admin\HmoProviderController::class, 'index'])->name('index');
                Route::get('/create', [App\Http\Controllers\Admin\HmoProviderController::class, 'create'])->name('create');
                Route::post('/', [App\Http\Controllers\Admin\HmoProviderController::class, 'store'])->name('store');
                Route::get('/{hmoProvider}', [App\Http\Controllers\Admin\HmoProviderController::class, 'show'])->name('show');
                Route::get('/{hmoProvider}/edit', [App\Http\Controllers\Admin\HmoProviderController::class, 'edit'])->name('edit');
                Route::put('/{hmoProvider}', [App\Http\Controllers\Admin\HmoProviderController::class, 'update'])->name('update');
                Route::delete('/{hmoProvider}', [App\Http\Controllers\Admin\HmoProviderController::class, 'destroy'])->name('destroy');
                Route::put('/{hmoProvider}/toggle-status', [App\Http\Controllers\Admin\HmoProviderController::class, 'toggleStatus'])->name('toggle-status');
            });

            // Debug route for senior citizen discounts
            Route::get('/debug-senior-discounts', function() {
                $transactions = \App\Models\BillingTransaction::where('is_senior_citizen', true)
                    ->select('id', 'transaction_id', 'total_amount', 'amount', 'senior_discount_amount', 'is_senior_citizen')
                    ->get();
                
                return response()->json([
                    'transactions' => $transactions,
                    'count' => $transactions->count()
                ]);
            })->name('debug-senior-discounts');

            // Legacy Billing Reports (moved to specific billing routes)
            Route::prefix('billing-reports')->name('billing-reports.')->group(function () {
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


            
        });


        // Appointments Routes - Doctor, nurse and admin only
        Route::prefix('appointments')->name('appointments.')->middleware(['role:doctor,nurse,admin'])->group(function () {
            Route::get('/', [AppointmentController::class, 'index'])->name('index');
            Route::get('/create', [AppointmentController::class, 'create'])->name('create');
            
            // Lab Test Routes
            Route::get('/{appointment}/add-lab-tests', [\App\Http\Controllers\Admin\AppointmentLabController::class, 'showAddLabTests'])->name('show-add-lab-tests');
            
            Route::post('/{appointment}/add-lab-tests', [\App\Http\Controllers\Admin\AppointmentLabController::class, 'addLabTests'])->name('add-lab-tests');
            Route::delete('/{appointment}/remove-lab-test', [\App\Http\Controllers\Admin\AppointmentLabController::class, 'removeLabTest'])->name('remove-lab-test');
            Route::get('/api/lab-tests/available', [\App\Http\Controllers\Admin\AppointmentLabController::class, 'getAvailableLabTests'])->name('api.lab-tests.available');
            Route::get('/{appointment}/api/lab-tests', [\App\Http\Controllers\Admin\AppointmentLabController::class, 'getAppointmentLabTests'])->name('api.lab-tests');
            Route::post('/api/lab-tests/pricing', [\App\Http\Controllers\Admin\AppointmentLabController::class, 'getLabTestPricing'])->name('api.lab-tests.pricing');
            Route::get('/walk-in', function () {
                // Get doctors and medtechs for the form
                $doctors = \App\Models\User::where('role', 'doctor')->get()->map(function($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'specialization' => $user->specialization ?? 'General Practice',
                        'employee_id' => $user->employee_id ?? '',
                        'availability' => 'Available',
                        'rating' => 4.5,
                        'experience' => '5+ years',
                        'nextAvailable' => 'Today'
                    ];
                });
                
                $medtechs = \App\Models\User::where('role', 'medtech')->get()->map(function($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'specialization' => $user->specialization ?? 'Medical Technology',
                        'employee_id' => $user->employee_id ?? '',
                        'availability' => 'Available',
                        'rating' => 4.5,
                        'experience' => '3+ years',
                        'nextAvailable' => 'Today'
                    ];
                });
                
                $appointmentTypes = [
                    'general_consultation' => 'General Consultation',
                    'cbc' => 'Complete Blood Count (CBC)',
                    'fecalysis_test' => 'Fecalysis Test',
                    'urinarysis_test' => 'Urinalysis Test'
                ];
                
                return Inertia::render('shared/appointment-booking', [
                    'user' => auth()->user(),
                    'patient' => null,
                    'doctors' => $doctors,
                    'medtechs' => $medtechs,
                    'appointmentTypes' => $appointmentTypes,
                    'isExistingPatient' => false,
                    'isAdmin' => true,
                    'backUrl' => route('admin.appointments.index'),
                    'nextPatientId' => 'P001'
                ]);
            })->name('walk-in');
            Route::post('/walk-in', [AppointmentController::class, 'storeWalkIn'])->name('walk-in.store');
            Route::post('/', [AppointmentController::class, 'store'])->name('store');
            Route::get('/{appointment}', [AppointmentController::class, 'show'])->name('show');
            Route::get('/{appointment}/edit', [AppointmentController::class, 'edit'])->name('edit');
            Route::put('/{appointment}', [AppointmentController::class, 'update'])->name('update');
            Route::delete('/{appointment}', [AppointmentController::class, 'destroy'])->name('destroy');
            Route::delete('/patient/{patient_id}', [AppointmentController::class, 'destroyByPatientId'])->name('destroy.by-patient');
            Route::put('/{appointment}/status', [AppointmentController::class, 'updateStatus'])->name('status.update');
            Route::get('/api/by-date', [AppointmentController::class, 'getByDate'])->name('api.by-date');
            Route::get('/api/stats', [AppointmentController::class, 'getStats'])->name('api.stats');
            
            // Doctor availability management - Admin only
            Route::get('/availability', function () {
                return Inertia::render('admin/appointments/availability');
            })->name('availability')->middleware(['role:admin']);
        });

        // Visits Routes - Doctor and admin only
        Route::prefix('visits')->name('visits.')->middleware(['role:doctor,admin'])->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\VisitController::class, 'index'])->name('index');
            Route::get('/{visit}', [\App\Http\Controllers\Admin\VisitController::class, 'show'])->name('show');
            Route::get('/{visit}/edit', [\App\Http\Controllers\Admin\VisitController::class, 'edit'])->name('edit');
            Route::put('/{visit}', [\App\Http\Controllers\Admin\VisitController::class, 'update'])->name('update');
            Route::delete('/{visit}', [\App\Http\Controllers\Admin\VisitController::class, 'destroy'])->name('destroy');
            
            // Follow-up visit routes
            Route::get('/{visit}/follow-up', [\App\Http\Controllers\Admin\VisitController::class, 'createFollowUp'])->name('follow-up.create');
            Route::post('/{visit}/follow-up', [\App\Http\Controllers\Admin\VisitController::class, 'storeFollowUp'])->name('follow-up.store');
            
            // Status update routes
            Route::put('/{visit}/complete', [\App\Http\Controllers\Admin\VisitController::class, 'markCompleted'])->name('complete');
            Route::put('/{visit}/cancel', [\App\Http\Controllers\Admin\VisitController::class, 'markCancelled'])->name('cancel');
        });

        // Pending Appointments Routes - Doctor, nurse and admin only
        Route::prefix('pending-appointments')->name('pending-appointments.')->middleware(['role:doctor,nurse,admin'])->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\PendingAppointmentController::class, 'index'])->name('index');
            Route::get('/{pendingAppointment}', [\App\Http\Controllers\Admin\PendingAppointmentController::class, 'show'])->name('show');
            Route::post('/{pendingAppointment}/approve', [\App\Http\Controllers\Admin\PendingAppointmentController::class, 'approve'])->name('approve');
            Route::post('/{pendingAppointment}/reject', [\App\Http\Controllers\Admin\PendingAppointmentController::class, 'reject'])->name('reject');
            Route::delete('/{pendingAppointment}', [\App\Http\Controllers\Admin\PendingAppointmentController::class, 'destroy'])->name('destroy');
            
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

        // Analytics and Reporting Routes - Admin and Hospital roles
        Route::prefix('analytics')->name('analytics.')->middleware(['role:admin,hospital_admin,hospital_staff'])->group(function () {
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
            // Main reports dashboard
            Route::get('/', [App\Http\Controllers\Admin\ReportsController::class, 'index'])->name('index');
            
            // Report categories
            Route::get('/financial', [App\Http\Controllers\Admin\ReportsController::class, 'financial'])->name('financial');
            Route::get('/patients', [App\Http\Controllers\Admin\ReportsController::class, 'patients'])->name('patients');
            Route::get('/laboratory', [App\Http\Controllers\LaboratoryReportController::class, 'index'])->name('laboratory');
            Route::get('/inventory', [App\Http\Controllers\Admin\ReportsController::class, 'inventory'])->name('inventory');
            Route::get('/analytics', [App\Http\Controllers\Admin\ReportsController::class, 'analytics'])->name('analytics');
            
            // Export functionality
            Route::get('/export', [App\Http\Controllers\Admin\ReportsController::class, 'export'])->name('export');
            
            // Laboratory Reports Export
            Route::get('/laboratory/export/excel', [App\Http\Controllers\LaboratoryReportController::class, 'exportExcel'])->name('laboratory.export.excel');
            Route::get('/laboratory/export/pdf', [App\Http\Controllers\LaboratoryReportController::class, 'exportPdf'])->name('laboratory.export.pdf');
            
            // Inventory Reports - Moved from inventory section
            Route::prefix('inventory')->name('inventory.')->group(function () {
                Route::get('/', [App\Http\Controllers\InventoryReportController::class, 'index'])->name('index');
                Route::get('/used-rejected', [App\Http\Controllers\InventoryReportController::class, 'usedRejectedReport'])->name('used-rejected');
                Route::get('/used-rejected/export', [App\Http\Controllers\InventoryReportController::class, 'exportUsedRejected'])->name('used-rejected.export');
                Route::get('/in-out-supplies', [App\Http\Controllers\InventoryReportController::class, 'inOutSuppliesReport'])->name('in-out-supplies');
                Route::get('/in-out-supplies/export', [App\Http\Controllers\InventoryReportController::class, 'exportInOutSupplies'])->name('in-out-supplies.export');
                Route::get('/stock-levels', [App\Http\Controllers\InventoryReportController::class, 'stockLevelsReport'])->name('stock-levels');
                Route::get('/stock-levels/export', [App\Http\Controllers\InventoryReportController::class, 'exportStockLevels'])->name('stock-levels.export');
                Route::get('/daily-consumption', [App\Http\Controllers\InventoryReportController::class, 'dailyConsumptionReport'])->name('daily-consumption');
                Route::get('/daily-consumption/export', [App\Http\Controllers\InventoryReportController::class, 'exportDailyConsumption'])->name('daily-consumption.export');
                Route::get('/usage-by-location', [App\Http\Controllers\InventoryReportController::class, 'usageByLocationReport'])->name('usage-by-location');
                Route::get('/usage-by-location/export', [App\Http\Controllers\InventoryReportController::class, 'exportUsageByLocation'])->name('usage-by-location.export');
                Route::get('/{id}/export', [App\Http\Controllers\InventoryReportController::class, 'exportReport'])->name('individual.export');
                Route::get('/export-all', [App\Http\Controllers\InventoryReportController::class, 'exportAllReports'])->name('export-all');
                Route::delete('/{id}', [App\Http\Controllers\InventoryReportController::class, 'destroy'])->name('destroy');
            });
            
            // Appointment Reports
            Route::prefix('appointments')->name('appointments.')->group(function () {
                Route::get('/', [App\Http\Controllers\Admin\AppointmentReportController::class, 'index'])->name('index');
                Route::get('/export', [App\Http\Controllers\Admin\AppointmentReportController::class, 'export'])->name('export');
            });
            
            // Legacy hospital reports (redirected to admin reports)
            Route::get('/appointments-legacy', [App\Http\Controllers\Admin\ReportsController::class, 'appointments'])->name('appointments.legacy');
            Route::get('/specialist-management', [App\Http\Controllers\Admin\ReportsController::class, 'analytics'])->name('specialist.management');
            Route::get('/billing', [App\Http\Controllers\Admin\ReportsController::class, 'financial'])->name('billing');
            Route::get('/transfers', [App\Http\Controllers\Admin\ReportsController::class, 'patients'])->name('transfers');
            Route::get('/clinic-operations', [App\Http\Controllers\Admin\ReportsController::class, 'analytics'])->name('clinic.operations');
            Route::get('/export/{type}', [App\Http\Controllers\Admin\ReportsController::class, 'export'])->name('export.legacy');
        });


        // Inventory routes - All authenticated staff can access
        Route::prefix('inventory')->name('inventory.')->middleware(['module.access:inventory'])->group(function () {
            // Main inventory dashboard
            Route::get('/', [App\Http\Controllers\InventoryController::class, 'index'])->name('index');
            Route::get('/create', [App\Http\Controllers\InventoryController::class, 'create'])->name('create');
            Route::post('/', [App\Http\Controllers\InventoryController::class, 'store'])->name('store');
            
            // Category-specific pages (must come before {id} routes)
            Route::get('/supply-items', [App\Http\Controllers\InventoryController::class, 'supplyItems'])->name('supply-items');
            Route::get('/doctor-nurse', [App\Http\Controllers\InventoryController::class, 'doctorNurse'])->name('doctor-nurse');
            Route::get('/medtech', [App\Http\Controllers\InventoryController::class, 'medTech'])->name('medtech');
            
            // Products management routes
            Route::prefix('products')->name('products.')->group(function () {
                Route::get('/', [ProductController::class, 'index'])->name('index');
                Route::get('/create', [ProductController::class, 'create'])->name('create');
                Route::post('/', [ProductController::class, 'store'])->name('store');
                Route::get('/{product}', [ProductController::class, 'show'])->name('show');
                Route::get('/{product}/edit', [ProductController::class, 'edit'])->name('edit');
                Route::put('/{product}', [ProductController::class, 'update'])->name('update');
                Route::delete('/{product}', [ProductController::class, 'destroy'])->name('destroy');
            });
            
            // Transactions management routes
            Route::prefix('transactions')->name('transactions.')->group(function () {
                Route::get('/', [TransactionController::class, 'index'])->name('index');
                Route::get('/create', [TransactionController::class, 'create'])->name('create');
                Route::post('/', [TransactionController::class, 'store'])->name('store');
                Route::get('/{transaction}', [TransactionController::class, 'show'])->name('show');
                Route::post('/{transaction}/approve', [TransactionController::class, 'approve'])->name('approve');
                Route::post('/{transaction}/reject', [TransactionController::class, 'reject'])->name('reject');
                Route::delete('/{transaction}', [TransactionController::class, 'destroy'])->name('destroy');
            });
            
            // Suppliers management routes
            Route::prefix('suppliers')->name('suppliers.')->group(function () {
                Route::get('/', [SupplierController::class, 'index'])->name('index');
                Route::get('/create', [SupplierController::class, 'create'])->name('create');
                Route::post('/', [SupplierController::class, 'store'])->name('store');
                Route::get('/{supplier}', [SupplierController::class, 'show'])->name('show');
                Route::get('/{supplier}/edit', [SupplierController::class, 'edit'])->name('edit');
                Route::put('/{supplier}', [SupplierController::class, 'update'])->name('update');
                Route::delete('/{supplier}', [SupplierController::class, 'destroy'])->name('destroy');
            });
            
            // Supply Management routes (New system)
            Route::prefix('supplies')->name('supplies.')->group(function () {
                Route::get('/', [App\Http\Controllers\Inventory\SupplyController::class, 'index'])->name('index');
                Route::get('/create', [App\Http\Controllers\Inventory\SupplyController::class, 'create'])->name('create');
                Route::post('/', [App\Http\Controllers\Inventory\SupplyController::class, 'store'])->name('store');
                Route::get('/{supply}', [App\Http\Controllers\Inventory\SupplyController::class, 'show'])->name('show');
                Route::get('/{supply}/edit', [App\Http\Controllers\Inventory\SupplyController::class, 'edit'])->name('edit');
                Route::put('/{supply}', [App\Http\Controllers\Inventory\SupplyController::class, 'update'])->name('update');
                Route::delete('/{supply}', [App\Http\Controllers\Inventory\SupplyController::class, 'destroy'])->name('destroy');
                Route::get('/{supply}/stock-levels', [App\Http\Controllers\Inventory\SupplyController::class, 'getStockLevels'])->name('stock-levels');
                Route::get('/{supply}/transactions', [App\Http\Controllers\Inventory\SupplyController::class, 'getTransactions'])->name('transactions');
                Route::get('/low-stock', [App\Http\Controllers\Inventory\SupplyController::class, 'getLowStock'])->name('low-stock');
                Route::get('/expiring-soon', [App\Http\Controllers\Inventory\SupplyController::class, 'getExpiringSoon'])->name('expiring-soon');
            });
            
            // Supply Transactions routes
            Route::prefix('supply-transactions')->name('supply-transactions.')->group(function () {
                Route::get('/', [App\Http\Controllers\Inventory\SupplyTransactionController::class, 'index'])->name('index');
                Route::get('/create', [App\Http\Controllers\Inventory\SupplyTransactionController::class, 'create'])->name('create');
                Route::post('/', [App\Http\Controllers\Inventory\SupplyTransactionController::class, 'store'])->name('store');
                Route::get('/{transaction}', [App\Http\Controllers\Inventory\SupplyTransactionController::class, 'show'])->name('show');
                Route::post('/{transaction}/approve', [App\Http\Controllers\Inventory\SupplyTransactionController::class, 'approve'])->name('approve');
                Route::post('/{transaction}/reject', [App\Http\Controllers\Inventory\SupplyTransactionController::class, 'reject'])->name('reject');
                Route::post('/{transaction}/verify', [App\Http\Controllers\Inventory\SupplyTransactionController::class, 'verify'])->name('verify');
                Route::get('/pending-approvals', [App\Http\Controllers\Inventory\SupplyTransactionController::class, 'getPendingApprovals'])->name('pending-approvals');
                Route::get('/used-supplies', [App\Http\Controllers\Inventory\SupplyTransactionController::class, 'getUsedSupplies'])->name('used-supplies');
                Route::get('/rejected-supplies', [App\Http\Controllers\Inventory\SupplyTransactionController::class, 'getRejectedSupplies'])->name('rejected-supplies');
            });
            
            // Supply Stock Management routes
            Route::prefix('supply-stock')->name('supply-stock.')->group(function () {
                Route::get('/', [App\Http\Controllers\Inventory\SupplyStockController::class, 'index'])->name('index');
                Route::get('/low-stock', [App\Http\Controllers\Inventory\SupplyStockController::class, 'getLowStock'])->name('low-stock');
                Route::get('/expiring-soon', [App\Http\Controllers\Inventory\SupplyStockController::class, 'getExpiringSoon'])->name('expiring-soon');
                Route::get('/expired', [App\Http\Controllers\Inventory\SupplyStockController::class, 'getExpiredStock'])->name('expired');
                Route::get('/{supply}/by-lot', [App\Http\Controllers\Inventory\SupplyStockController::class, 'getStockByLot'])->name('by-lot');
                Route::get('/{supply}/history', [App\Http\Controllers\Inventory\SupplyStockController::class, 'getStockHistory'])->name('history');
                Route::get('/report', [App\Http\Controllers\Inventory\SupplyStockController::class, 'getStockReport'])->name('report');
                Route::get('/alerts', [App\Http\Controllers\Inventory\SupplyStockController::class, 'getStockAlerts'])->name('alerts');
                Route::put('/{stockLevel}', [App\Http\Controllers\Inventory\SupplyStockController::class, 'updateStockLevel'])->name('update-level');
                Route::post('/reserve', [App\Http\Controllers\Inventory\SupplyStockController::class, 'reserveStock'])->name('reserve');
                Route::post('/release-reservation', [App\Http\Controllers\Inventory\SupplyStockController::class, 'releaseReservation'])->name('release-reservation');
            });

            // Enhanced inventory dashboard and reports
            Route::prefix('enhanced')->name('enhanced.')->group(function () {
                Route::get('/', [EnhancedInventoryController::class, 'index'])->name('index');
                Route::get('/detailed-report', [EnhancedInventoryController::class, 'getDetailedReport'])->name('detailed-report');
                Route::get('/usage-report', [EnhancedInventoryController::class, 'getUsageReport'])->name('usage-report');
                Route::get('/supplier-report', [EnhancedInventoryController::class, 'getSupplierReport'])->name('supplier-report');
                Route::get('/in-out-flow-report', [EnhancedInventoryController::class, 'getInOutFlowReport'])->name('in-out-flow-report');
                Route::get('/export/{type}', [EnhancedInventoryController::class, 'exportReport'])->name('export');
            });
            
            // Movement routes (must come before {id} routes)
            Route::get('/{id}/movement', [App\Http\Controllers\InventoryController::class, 'addMovement'])->name('add-movement');
            Route::post('/{id}/movement', [App\Http\Controllers\InventoryController::class, 'storeMovement'])->name('store-movement');
            
            // Consume and Reject routes
            Route::post('/{id}/consume', [App\Http\Controllers\InventoryController::class, 'consume'])->name('consume');
            Route::post('/{id}/reject', [App\Http\Controllers\InventoryController::class, 'reject'])->name('reject');
            
            // ID-based routes for legacy inventory system (must come after specific routes)
            Route::get('/{id}', [App\Http\Controllers\InventoryController::class, 'show'])->name('show');
            Route::get('/{id}/edit', [App\Http\Controllers\InventoryController::class, 'edit'])->name('edit');
            Route::put('/{id}', [App\Http\Controllers\InventoryController::class, 'update'])->name('update');
            Route::delete('/{id}', [App\Http\Controllers\InventoryController::class, 'destroy'])->name('destroy');
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

        // Test notification routes (for debugging)
        Route::prefix('test-notifications')->name('test-notifications.')->group(function () {
            Route::post('/create', [\App\Http\Controllers\Admin\TestNotificationController::class, 'createTestNotification'])->name('create');
            Route::get('/{notificationId}/data', [\App\Http\Controllers\Admin\TestNotificationController::class, 'getNotificationData'])->name('data');
            Route::get('/debug', [\App\Http\Controllers\Admin\TestNotificationController::class, 'debugNotifications'])->name('debug');
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
