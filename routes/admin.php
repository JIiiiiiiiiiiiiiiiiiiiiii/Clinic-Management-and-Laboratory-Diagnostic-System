<?php

use App\Http\Controllers\PatientController;
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

        // Laboratory Routes - Lab staff and admin only
        Route::prefix('laboratory')->name('laboratory.')->middleware(['role:laboratory_technologist,medtech,admin'])->group(function () {
            Route::get('/', function () {
                return Inertia::render('admin/laboratory/index');
            })->name('index');
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
