<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\OnlineAppointmentController;
use App\Http\Controllers\Api\AdminAppointmentController;
use App\Http\Controllers\Api\BillingController;
use App\Http\Controllers\Api\SystemFixController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Online Appointment API
Route::post('/appointments/online', [OnlineAppointmentController::class, 'store']);

// Admin Appointment Management API
Route::middleware('auth:sanctum')->prefix('admin/appointments')->group(function () {
    Route::get('/pending', [AdminAppointmentController::class, 'pending']);
    Route::post('/{appointment}/approve', [AdminAppointmentController::class, 'approve']);
    Route::post('/{appointment}/reject', [AdminAppointmentController::class, 'reject']);
    Route::get('/specialists', [AdminAppointmentController::class, 'specialists']);
});

// Billing API
Route::middleware('auth:sanctum')->prefix('billing')->group(function () {
    Route::get('/pending', [BillingController::class, 'pending']);
    Route::post('/{transaction}/mark-paid', [BillingController::class, 'markPaid']);
    Route::get('/daily-transactions', [BillingController::class, 'dailyTransactions']);
});

// Specialists API
Route::get('/specialists', function () {
    return App\Models\Specialist::where('status', 'Active')->get();
});

// System Fix API
Route::prefix('system')->group(function () {
    Route::get('/health-check', [SystemFixController::class, 'checkSystemHealth']);
    Route::post('/fix-all', [SystemFixController::class, 'fixAllIssues']);
    Route::post('/fix-component/{component}', [SystemFixController::class, 'fixComponent']);
});

