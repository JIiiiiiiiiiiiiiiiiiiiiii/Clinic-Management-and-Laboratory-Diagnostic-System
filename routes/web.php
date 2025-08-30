<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Load split route files
require __DIR__ . '/admin.php';
require __DIR__ . '/patient.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
