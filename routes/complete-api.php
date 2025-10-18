<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CompleteOnlineAppointmentController;
use App\Http\Controllers\CompleteAdminAppointmentController;
use App\Http\Controllers\CompleteBillingController;

/*
|--------------------------------------------------------------------------
| Complete API Routes
|--------------------------------------------------------------------------
|
| These routes implement the complete transactional appointment system
| as specified in the requirements.
|
*/

// Patient-side routes (Online Appointment Booking)
Route::prefix('api/patient')->group(function () {
    Route::post('/appointments', [CompleteOnlineAppointmentController::class, 'store'])
        ->name('api.patient.appointments.store');
    
    Route::get('/appointments', [CompleteOnlineAppointmentController::class, 'getPatientAppointments'])
        ->name('api.patient.appointments.index');
});

// Admin-side routes (Walk-in Appointments & Management)
Route::prefix('api/admin')->group(function () {
    // Appointment management
    Route::post('/appointments/walk-in', [CompleteAdminAppointmentController::class, 'createWalkIn'])
        ->name('api.admin.appointments.walk-in');
    
    Route::get('/appointments/pending', [CompleteAdminAppointmentController::class, 'getPendingAppointments'])
        ->name('api.admin.appointments.pending');
    
    Route::post('/appointments/{appointmentId}/approve', [CompleteAdminAppointmentController::class, 'approveAppointment'])
        ->name('api.admin.appointments.approve');
    
    Route::get('/appointments', [CompleteAdminAppointmentController::class, 'getAllAppointments'])
        ->name('api.admin.appointments.index');
    
    Route::get('/staff', [CompleteAdminAppointmentController::class, 'getStaff'])
        ->name('api.admin.staff.index');
});

// Billing routes
Route::prefix('api/billing')->group(function () {
    Route::get('/pending', [CompleteBillingController::class, 'getPendingTransactions'])
        ->name('api.billing.pending');
    
    Route::post('/transactions/{transactionId}/payment', [CompleteBillingController::class, 'processPayment'])
        ->name('api.billing.payment');
    
    Route::get('/transactions', [CompleteBillingController::class, 'getAllTransactions'])
        ->name('api.billing.transactions.index');
    
    Route::get('/summary', [CompleteBillingController::class, 'getBillingSummary'])
        ->name('api.billing.summary');
});

