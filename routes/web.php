<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia as InertiaResponse;
use App\Models\User;

Route::get('/', function () {
    if (Auth::check()) {
        // User is logged in, redirect to appropriate dashboard
        $user = Auth::user();
        $mappedRole = $user->getMappedRole();
        
        if ($mappedRole === 'patient') {
            return redirect()->route('patient.dashboard.simple');
        } else {
            return redirect()->route('admin.dashboard');
        }
    } else {
        // User is not logged in, redirect to login
        return redirect()->route('login');
    }
})->name('home');

// API endpoints (using web routes for proper session handling)
Route::middleware(['auth:session'])->post('/api/appointments/online', [App\Http\Controllers\Api\OnlineAppointmentController::class, 'store']);

// Admin Appointment Management API
Route::middleware(['auth:session'])->prefix('api/admin/appointments')->group(function () {
    Route::get('/pending', [App\Http\Controllers\Api\AdminAppointmentController::class, 'pending']);
    Route::post('/{appointment}/approve', [App\Http\Controllers\Api\AdminAppointmentController::class, 'approve']);
    Route::post('/{appointment}/reject', [App\Http\Controllers\Api\AdminAppointmentController::class, 'reject']);
});

// Billing API
Route::middleware(['auth:session'])->prefix('api/billing')->group(function () {
    Route::get('/pending', [App\Http\Controllers\Api\BillingController::class, 'pending']);
    Route::post('/{transaction}/mark-paid', [App\Http\Controllers\Api\BillingController::class, 'markPaid']);
});

// Load split route files
require __DIR__ . '/admin.php';
require __DIR__ . '/patient.php';
require __DIR__.'/settings.php';

// Load complete API routes
require __DIR__ . '/complete-api.php';
require __DIR__.'/auth.php';
// require __DIR__.'/simple-auth.php'; // Removed - using main auth system



// Backward-compatible dashboard route used by tests and some auth flows
Route::get('/dashboard', function () {
    if (!Auth::check()) {
        return redirect('/login');
    }

    // Get user role and redirect accordingly
    $user = Auth::user();
    $mappedRole = $user->getMappedRole();
    
    if ($mappedRole === 'patient') {
        return redirect()->route('patient.dashboard.simple');
    } else {
        return redirect()->route('admin.dashboard');
    }
})->name('dashboard');

// Standalone patients route that redirects based on user role
Route::get('/patients', function () {
    if (!Auth::check()) {
        return redirect('/login');
    }

    // All staff (including hospital) use admin routes
    return redirect()->route('admin.patient.index');
})->name('patients');

