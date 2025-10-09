<?php

use App\Http\Controllers\Hospital\HospitalDashboardController;
use App\Http\Controllers\Hospital\HospitalPatientController;
use App\Http\Controllers\Hospital\HospitalReportController;
use App\Http\Controllers\Hospital\HospitalUserController;
use Illuminate\Support\Facades\Route;

// Hospital routes - separate interface for St. James Hospital staff
Route::middleware(['auth', 'verified'])
    ->prefix('hospital')
    ->name('hospital.')
    ->group(function () {
        
        // Hospital Dashboard
        Route::get('/dashboard', [HospitalDashboardController::class, 'index'])->name('dashboard');
        
        // Test route
        Route::get('/test', function () {
            return response()->json(['status' => 'working', 'message' => 'Hospital routes are working']);
        })->name('test');
        
        // Test patients route
        Route::get('/patients-test', function () {
            return response()->json([
                'status' => 'working', 
                'message' => 'Hospital patients route is working',
                'user' => auth()->user(),
                'timestamp' => now()
            ]);
        })->name('patients.test');
        
        // Patient Management (Hospital Interface)
        Route::prefix('patients')->name('patients.')->group(function () {
            Route::get('/', [HospitalPatientController::class, 'index'])->name('index');
            Route::get('/create', [HospitalPatientController::class, 'create'])->name('create');
            Route::post('/', [HospitalPatientController::class, 'store'])->name('store');
            Route::get('/refer', [HospitalPatientController::class, 'refer'])->name('refer');
            Route::post('/refer', [HospitalPatientController::class, 'processReferral'])->name('refer.process');
            Route::get('/{patient}', [HospitalPatientController::class, 'show'])->name('show');
            Route::get('/{patient}/edit', [HospitalPatientController::class, 'edit'])->name('edit');
            Route::put('/{patient}', [HospitalPatientController::class, 'update'])->name('update');
            Route::delete('/{patient}', [HospitalPatientController::class, 'destroy'])->name('destroy');
            
            // Transfer to clinic
            Route::post('/{patient}/transfer', [HospitalPatientController::class, 'transferToClinic'])->name('transfer');
            Route::get('/{patient}/transfer-history', [HospitalPatientController::class, 'transferHistory'])->name('transfer.history');
        });
        
        // Reports and Analytics (Hospital View)
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', [HospitalReportController::class, 'index'])->name('index');
            Route::get('/patients', [HospitalReportController::class, 'patients'])->name('patients');
            Route::get('/appointments', [HospitalReportController::class, 'appointments'])->name('appointments');
            Route::get('/transactions', [HospitalReportController::class, 'transactions'])->name('transactions');
            Route::get('/inventory', [HospitalReportController::class, 'inventory'])->name('inventory');
            Route::get('/transfers', [HospitalReportController::class, 'transfers'])->name('transfers');
            Route::get('/clinic-operations', [HospitalReportController::class, 'clinicOperations'])->name('clinic.operations');
            Route::get('/export/{type}', [HospitalReportController::class, 'export'])->name('export');
            
            // Debug route
            Route::get('/debug', function () {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Hospital reports routes are working',
                    'user' => auth()->user(),
                    'timestamp' => now()
                ]);
            })->name('debug');
        });
        
        // User Management (Hospital Staff)
        Route::prefix('users')->name('users.')->group(function () {
            Route::get('/', [HospitalUserController::class, 'index'])->name('index');
            Route::get('/create', [HospitalUserController::class, 'create'])->name('create');
            Route::post('/', [HospitalUserController::class, 'store'])->name('store');
            Route::get('/{user}', [HospitalUserController::class, 'show'])->name('show');
            Route::get('/{user}/edit', [HospitalUserController::class, 'edit'])->name('edit');
            Route::put('/{user}', [HospitalUserController::class, 'update'])->name('update');
            Route::delete('/{user}', [HospitalUserController::class, 'destroy'])->name('destroy');
        });
    });
