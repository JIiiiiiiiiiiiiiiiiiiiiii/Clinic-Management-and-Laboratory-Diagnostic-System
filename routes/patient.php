<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Patient routes
Route::middleware(['auth', 'verified', 'role:patient'])
    ->prefix('patient')
    ->name('patient.')
    ->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('patient/dashboard');
        })->name('dashboard');
    });
