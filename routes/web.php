<?php

use App\Http\Controllers\PatientController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\LaboratoryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/management/dashboard', function () {
        return Inertia::render('management/dashboard/index');
    })->name('dashboard');

    // Patient CRUD routes
    Route::resource('management/patient', PatientController::class)->names([
        'index' => 'patient.index',
        'create' => 'patient.create',
        'store' => 'patient.store',
        'show' => 'patient.show',
        'edit' => 'patient.edit',
        'update' => 'patient.update',
        'destroy' => 'patient.destroy',
    ]);

    // Appointment routes
    Route::resource('management/appointment', AppointmentController::class)->names([
        'index' => 'appointment.index',
        'create' => 'appointment.create',
        'store' => 'appointment.store',
        'show' => 'appointment.show',
        'edit' => 'appointment.edit',
        'update' => 'appointment.update',
        'destroy' => 'appointment.destroy',
    ]);

    // Additional appointment routes
    Route::patch('/management/appointment/{appointment}/status', [AppointmentController::class, 'updateStatus'])
        ->name('appointment.updateStatus');
    Route::get('/management/appointment/slots', [AppointmentController::class, 'getAvailableSlots'])
        ->name('appointment.getAvailableSlots');

    // Laboratory routes
    Route::resource('management/laboratory', LaboratoryController::class)->parameters([
        'laboratory' => 'laboratory'
    ])->names([
        'index' => 'laboratory.index',
        'create' => 'laboratory.create',
        'store' => 'laboratory.store',
        'show' => 'laboratory.show',
        'edit' => 'laboratory.edit',
        'update' => 'laboratory.update',
        'destroy' => 'laboratory.destroy',
    ]);

    // Laboratory helpers
    Route::get('/management/laboratory-tests', [LaboratoryController::class, 'testsList'])->name('laboratory.tests');
    Route::get('/management/laboratory-schema/{testId}', [LaboratoryController::class, 'resultSchema'])->name('laboratory.schema');
    Route::post('/management/laboratory/{laboratory}/results', [LaboratoryController::class, 'saveResults'])->name('laboratory.results.save');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
