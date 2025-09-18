<?php

use App\Http\Controllers\PatientController;
use App\Http\Controllers\PatientVisitController;
use App\Http\Controllers\Lab\LabTestController;
use App\Http\Controllers\Lab\LabOrderController;
use App\Http\Controllers\Lab\LabResultController;
use App\Http\Controllers\Lab\LabReportController;
use App\Http\Controllers\Lab\LabExportController;
use App\Http\Controllers\Admin\DoctorController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Inventory\InventoryController;
use App\Http\Controllers\Inventory\ProductController;
use App\Http\Controllers\Inventory\TransactionController;
use App\Http\Controllers\Inventory\ReportController;
use App\Http\Controllers\Admin\UserRoleController;
use App\Http\Controllers\Admin\PermissionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Models\Patient;
use App\Models\LabOrder;
use App\Models\Supply\Supply as Product;
use Illuminate\Support\Facades\DB;

// Admin routes for all clinic staff roles
Route::middleware(['auth', 'verified'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        // Dashboard - All authenticated staff can access
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

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

        // Doctor Management - Admin only
        Route::prefix('doctors')->name('doctors.')->middleware(['role:admin'])->group(function () {
            Route::get('/', [DoctorController::class, 'index'])->name('index');
            Route::get('/create', [DoctorController::class, 'create'])->name('create');
            Route::post('/', [DoctorController::class, 'store'])->name('store');
            Route::get('/{doctor}/edit', [DoctorController::class, 'edit'])->name('edit');
            Route::put('/{doctor}', [DoctorController::class, 'update'])->name('update');
            Route::delete('/{doctor}', [DoctorController::class, 'destroy'])->name('destroy');
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

        // Cashier Routes - Cashier and admin only
        Route::prefix('billing')->name('billing.')->middleware(['role:cashier,admin'])->group(function () {
            Route::get('/', function () {
                return Inertia::render('admin/billing/index');
            })->name('index');
        });

        // Doctor Routes - Doctor and admin only
        Route::prefix('appointments')->name('appointments.')->middleware(['role:doctor,admin'])->group(function () {
            Route::get('/', function () {
                return Inertia::render('admin/appointments/index');
            })->name('index');
        });

        // Admin-only routes
        Route::middleware(['role:admin'])->group(function () {
            Route::prefix('inventory')->name('inventory.')->group(function () {
                Route::get('/', function () {
                    return Inertia::render('admin/inventory/index');
                })->name('index');
            });

            Route::prefix('reports')->name('reports.')->group(function () {
                Route::get('/', function () {
                    return Inertia::render('admin/reports/index');
                })->name('index');
            });

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

            // Inventory routes - All authenticated staff can access
            Route::prefix('inventory')->name('inventory.')->group(function () {
                Route::get('/', [InventoryController::class, 'index'])->name('index');

                // Products
                Route::resource('products', ProductController::class);

                // Transactions
                Route::resource('transactions', TransactionController::class);
                Route::post('transactions/{transaction}/approve', [TransactionController::class, 'approve'])->name('transactions.approve');
                Route::post('transactions/{transaction}/reject', [TransactionController::class, 'reject'])->name('transactions.reject');

                // Reports
                Route::prefix('reports')->name('reports.')->group(function () {
                    Route::get('/', [ReportController::class, 'index'])->name('index');
                    Route::get('used-supplies', [ReportController::class, 'usedSupplies'])->name('used-supplies');
                    Route::get('rejected-supplies', [ReportController::class, 'rejectedSupplies'])->name('rejected-supplies');
                    Route::get('in-out-supplies', [ReportController::class, 'inOutSupplies'])->name('in-out-supplies');
                    Route::get('stock-levels', [ReportController::class, 'stockLevels'])->name('stock-levels');
                    Route::get('stock-levels/export', [ReportController::class, 'exportStockLevels'])->name('stock-levels.export');
                    Route::get('daily-consumption', [ReportController::class, 'dailyConsumption'])->name('daily-consumption');
                    Route::get('usage-by-location', [ReportController::class, 'usageByLocation'])->name('usage-by-location');
                    Route::get('used-supplies/export', [ReportController::class, 'exportUsedSupplies'])->name('used-supplies.export');
                    Route::get('rejected-supplies/export', [ReportController::class, 'exportRejectedSupplies'])->name('rejected-supplies.export');
                    Route::get('in-out-supplies/export', [ReportController::class, 'exportInOutSupplies'])->name('in-out-supplies.export');
                    Route::get('daily-consumption/export', [ReportController::class, 'exportDailyConsumption'])->name('daily-consumption.export');
                    Route::get('usage-by-location/export', [ReportController::class, 'exportUsageByLocation'])->name('usage-by-location.export');
                });
            });
        });
    });
