<?php

use App\Http\Controllers\Auth\SimpleAuthController;
use Illuminate\Support\Facades\Route;

// Simple authentication routes
Route::get('/login', [SimpleAuthController::class, 'showLogin'])->name('login');
Route::post('/login', [SimpleAuthController::class, 'login']);
Route::post('/logout', [SimpleAuthController::class, 'logout'])->name('logout');

// Password reset route (placeholder)
Route::get('/forgot-password', function () {
    return redirect('/login')->with('status', 'Password reset not available in demo mode');
})->name('password.request');
