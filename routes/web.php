<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia as InertiaResponse;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Load split route files
require __DIR__ . '/admin.php';
require __DIR__ . '/patient.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

// Backward-compatible dashboard route used by tests and some auth flows
Route::get('/dashboard', function () {
    if (!Auth::check()) {
        return redirect('/login');
    }

    // Return a 200 response for authenticated users
    return Inertia::render('admin/dashboard');
})->name('dashboard');
