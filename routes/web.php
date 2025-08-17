<?php

use App\Http\Controllers\PatientController;
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
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
