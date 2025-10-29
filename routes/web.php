<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia as InertiaResponse;
use App\Models\User;
use App\Models\Patient;
use App\Models\Notification;

Route::get('/', function () {
    $user = auth()->user();
    $patient = null;
    $notifications = [];
    $unreadCount = 0;
    
    // If user is logged in, get their data
    if ($user) {
        $patient = Patient::where('user_id', $user->id)->first();
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
        $unreadCount = Notification::where('user_id', $user->id)
            ->where('read', false)
            ->count();
    }
    
    return Inertia::render('patient/home', [
        'user' => $user,
        'patient' => $patient,
        'notifications' => $notifications,
        'unreadCount' => $unreadCount,
    ]);
})->name('home');

// Redirect /patient/home to / for consistency
Route::get('/patient/home', function () {
    return redirect('/');
})->name('patient.home');

// API endpoints (using web routes for proper session handling)
Route::middleware(['auth:session'])->post('/api/appointments/online', [App\Http\Controllers\Api\OnlineAppointmentController::class, 'store']);
// Use admin auth for walk-in (admin-initiated) bookings
Route::middleware(['simple.auth'])->post('/api/appointments/walk-in', [App\Http\Controllers\Api\WalkInAppointmentController::class, 'store']);

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
        return redirect()->route('home');
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

