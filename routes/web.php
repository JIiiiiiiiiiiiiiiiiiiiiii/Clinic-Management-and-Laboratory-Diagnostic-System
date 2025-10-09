<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Load split route files
require __DIR__ . '/admin.php';
require __DIR__ . '/patient.php';
require __DIR__ . '/hospital.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/simple-auth.php';

// Backward-compatible dashboard route used by tests and some auth flows
Route::get('/dashboard', function () {
    if (!Auth::check()) {
        return redirect('/login');
    }

    // Get user role and redirect accordingly
    $user = Auth::user();
    $mappedRole = $user->getMappedRole();

    if ($mappedRole === 'patient') {
        return redirect()->route('patient.dashboard');
    } else {
        return redirect()->route('admin.dashboard');
    }
})->name('dashboard');

// Standalone patients route that redirects based on user role
Route::get('/patients', function () {
    if (!Auth::check()) {
        return redirect('/login');
    }

    // Get user role and redirect accordingly
    $user = Auth::user();
    $mappedRole = $user->getMappedRole();

    if ($mappedRole === 'hospital_admin') {
        return redirect()->route('hospital.patients.index');
    } else {
        return redirect()->route('admin.patient.index');
    }
})->name('patients');
