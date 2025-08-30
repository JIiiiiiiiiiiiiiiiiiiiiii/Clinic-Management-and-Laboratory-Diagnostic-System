<?php

use App\Http\Controllers\PatientController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Test route to check authentication
Route::get('/test-auth', function () {
    if (Auth::check()) {
        $user = Auth::user();
        return response()->json([
            'authenticated' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'mapped_role' => $user->getMappedRole()
            ]
        ]);
    }
    return response()->json(['authenticated' => false]);
})->middleware('auth');

// Test role redirection
Route::get('/test-redirect', function () {
    if (Auth::check()) {
        $user = Auth::user();
        $mappedRole = $user->getMappedRole();
        $redirectPath = $user->getRedirectPath();

        return response()->json([
            'user_id' => $user->id,
            'email' => $user->email,
            'raw_role' => $user->role,
            'mapped_role' => $mappedRole,
            'redirect_path' => $redirectPath,
            'is_patient' => $mappedRole === 'patient',
            'is_staff' => in_array($mappedRole, ['admin', 'doctor', 'laboratory_technologist', 'medtech', 'cashier'])
        ]);
    }
    return response()->json(['authenticated' => false]);
})->middleware('auth');

// Simple test route without middleware
Route::get('/test-simple', function () {
    return response()->json([
        'message' => 'Route accessible',
        'auth_check' => Auth::check(),
        'user' => Auth::user() ? Auth::user()->name : 'None'
    ]);
});

// Group admin routes to match resources/js/pages/admin/*
Route::middleware(['auth', 'verified'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('admin/dashboard');
        })->name('dashboard');

    });

// load split route files
require __DIR__ . '/admin.php';
require __DIR__ . '/patient.php';

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
