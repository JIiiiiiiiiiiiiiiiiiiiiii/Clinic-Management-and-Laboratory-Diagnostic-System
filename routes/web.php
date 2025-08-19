<?php

use App\Http\Controllers\PatientController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Default route: redirect to login if not authenticated, else go to dashboard
Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

// Routes that require authentication
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/management/dashboard', function () {
        return Inertia::render('management/dashboard/index');
    })->name('dashboard');

    // Patient CRUD routes
    Route::resource('management/patient', PatientController::class)->names([
        'index'   => 'patient.index',
        'create'  => 'patient.create',
        'store'   => 'patient.store',
        'show'    => 'patient.show',
        'edit'    => 'patient.edit',
        'update'  => 'patient.update',
        'destroy' => 'patient.destroy',
    ]);
});

// Include extra route files
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';