<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Admin routes for all clinic staff roles
Route::middleware(['auth', 'verified', 'role:laboratory_technologist,medtech,cashier,doctor,admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('admin/dashboard');
        })->name('dashboard');
    });
