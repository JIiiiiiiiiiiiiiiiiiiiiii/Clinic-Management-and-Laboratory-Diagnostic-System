<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Patient routes - Only authenticated patients can access
Route::middleware(['auth', 'verified', 'role:patient'])
    ->prefix('patient')
    ->name('patient.')
    ->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('patient/dashboard');
        })->name('dashboard');

        Route::get('/records', function () {
            return Inertia::render('patient/records');
        })->name('records');

        Route::get('/appointments', function () {
            return Inertia::render('patient/appointments');
        })->name('appointments');

        Route::get('/test-results', function () {
            return Inertia::render('patient/test-results');
        })->name('test-results');

        Route::get('/profile', function () {
            return Inertia::render('patient/profile');
        })->name('profile');

        Route::get('/contact', function () {
            return Inertia::render('patient/contact');
        })->name('contact');
    });
