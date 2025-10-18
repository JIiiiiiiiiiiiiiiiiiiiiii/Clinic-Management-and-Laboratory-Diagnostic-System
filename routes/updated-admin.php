<?php

use App\Http\Controllers\Admin\UpdatedAppointmentController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\PatientController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\BillingController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\PendingAppointmentController;
use Illuminate\Support\Facades\Route;

// Admin routes - Only authenticated admins can access
Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Updated Appointment Management
        Route::prefix('appointments')->name('appointments.')->group(function () {
            Route::get('/', [UpdatedAppointmentController::class, 'index'])->name('index');
            Route::get('/pending', [UpdatedAppointmentController::class, 'pending'])->name('pending');
            Route::get('/{appointment}', [UpdatedAppointmentController::class, 'show'])->name('show');
            Route::post('/{appointment}/approve', [UpdatedAppointmentController::class, 'approve'])->name('approve');
            Route::get('/create-walkin', [UpdatedAppointmentController::class, 'createWalkIn'])->name('create.walkin');
            Route::post('/create-walkin', [UpdatedAppointmentController::class, 'storeWalkIn'])->name('store.walkin');
        });

        // Patient Management
        Route::prefix('patients')->name('patients.')->group(function () {
            Route::get('/', [PatientController::class, 'index'])->name('index');
            Route::get('/create', [PatientController::class, 'create'])->name('create');
            Route::post('/', [PatientController::class, 'store'])->name('store');
            Route::get('/{patient}', [PatientController::class, 'show'])->name('show');
            Route::get('/{patient}/edit', [PatientController::class, 'edit'])->name('edit');
            Route::put('/{patient}', [PatientController::class, 'update'])->name('update');
            Route::delete('/{patient}', [PatientController::class, 'destroy'])->name('destroy');
            Route::get('/{patient}/export', [PatientController::class, 'export'])->name('export');
        });
        
        // Patient export route (for bulk export)
        Route::get('/patient/export', [PatientController::class, 'export'])->name('patient.export');

        // Staff Management
        Route::prefix('staff')->name('staff.')->group(function () {
            Route::get('/', [StaffController::class, 'index'])->name('index');
            Route::get('/create', [StaffController::class, 'create'])->name('create');
            Route::post('/', [StaffController::class, 'store'])->name('store');
            Route::get('/{staff}', [StaffController::class, 'show'])->name('show');
            Route::get('/{staff}/edit', [StaffController::class, 'edit'])->name('edit');
            Route::put('/{staff}', [StaffController::class, 'update'])->name('update');
            Route::delete('/{staff}', [StaffController::class, 'destroy'])->name('destroy');
        });

        // Billing Management
        Route::prefix('billing')->name('billing.')->group(function () {
            Route::get('/', [BillingController::class, 'index'])->name('index');
            Route::get('/pending', [BillingController::class, 'pending'])->name('pending');
            Route::get('/transactions', [BillingController::class, 'transactions'])->name('transactions');
            Route::post('/transactions/{transaction}/process-payment', [UpdatedAppointmentController::class, 'processPayment'])->name('process.payment');
        });

        // Reports
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', [ReportController::class, 'index'])->name('index');
            Route::get('/daily', [ReportController::class, 'daily'])->name('daily');
            Route::get('/monthly', [ReportController::class, 'monthly'])->name('monthly');
            Route::get('/yearly', [ReportController::class, 'yearly'])->name('yearly');
            Route::get('/doctor-summary', [ReportController::class, 'doctorSummary'])->name('doctor.summary');
            Route::get('/hmo-report', [ReportController::class, 'hmoReport'])->name('hmo.report');
        });

        // Legacy Pending Appointments (for backward compatibility)
        Route::prefix('pending-appointments')->name('pending.appointments.')->group(function () {
            Route::get('/', [PendingAppointmentController::class, 'index'])->name('index');
            Route::get('/{pendingAppointment}', [PendingAppointmentController::class, 'show'])->name('show');
            Route::post('/{pendingAppointment}/approve', [PendingAppointmentController::class, 'approve'])->name('approve');
            Route::post('/{pendingAppointment}/reject', [PendingAppointmentController::class, 'reject'])->name('reject');
        });

        // Real-time updates
        Route::prefix('realtime')->name('realtime.')->group(function () {
            Route::get('/appointments', [\App\Http\Controllers\Admin\RealtimeAppointmentController::class, 'getAppointmentUpdates'])->name('appointments');
            Route::get('/notifications', [\App\Http\Controllers\Admin\RealtimeAppointmentController::class, 'getNotificationUpdates'])->name('notifications');
            Route::post('/notifications/{notification}/mark-read', [\App\Http\Controllers\Admin\RealtimeAppointmentController::class, 'markNotificationAsRead'])->name('notifications.mark-read');
            Route::post('/notifications/mark-all-read', [\App\Http\Controllers\Admin\RealtimeAppointmentController::class, 'markAllNotificationsAsRead'])->name('notifications.mark-all-read');
        });
    });

