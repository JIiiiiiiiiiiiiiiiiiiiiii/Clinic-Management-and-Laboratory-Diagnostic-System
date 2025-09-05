<?php

use App\Http\Controllers\PatientController;
use App\Http\Controllers\Lab\LabTestController;
use App\Http\Controllers\Lab\LabOrderController;
use App\Http\Controllers\Lab\LabResultController;
use App\Http\Controllers\Lab\LabReportController;
use App\Http\Controllers\Admin\DoctorController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Admin routes for all clinic staff roles
Route::middleware(['auth', 'verified'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        // Dashboard - All authenticated staff can access
        Route::get('/dashboard', function () {
            return Inertia::render('admin/dashboard');
        })->name('dashboard');

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
            Route::get('/patients/{patient}/orders', [LabOrderController::class, 'index'])->name('orders.index');
            Route::post('/patients/{patient}/orders', [LabOrderController::class, 'store'])->name('orders.store');
            Route::put('/orders/{order}/status', [LabOrderController::class, 'updateStatus'])->name('orders.updateStatus');

            // Results
            Route::get('/orders/{order}/results', [LabResultController::class, 'entry'])->name('results.entry');
            Route::post('/orders/{order}/results', [LabResultController::class, 'store'])->name('results.store');
            Route::put('/results/{result}', [LabResultController::class, 'update'])->name('results.update');
            Route::put('/orders/{order}/verify', [LabResultController::class, 'verify'])->name('results.verify');

            // Reports
            Route::get('/orders/{order}/report', [LabReportController::class, 'generateReport'])->name('reports.generate');
            Route::get('/orders/{order}/report/cbc', [LabReportController::class, 'generateCBCReport'])->name('reports.cbc');
            Route::get('/orders/{order}/report/urinalysis', [LabReportController::class, 'generateUrinalysisReport'])->name('reports.urinalysis');
            Route::get('/orders/{order}/report/fecalysis', [LabReportController::class, 'generateFecalysisReport'])->name('reports.fecalysis');
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
                Route::get('/', function () {
                    return Inertia::render('admin/roles/index');
                })->name('index');
            });

            Route::prefix('settings')->name('settings.')->group(function () {
                Route::get('/', function () {
                    return Inertia::render('admin/settings/index');
                })->name('index');
            });
        });
    });
