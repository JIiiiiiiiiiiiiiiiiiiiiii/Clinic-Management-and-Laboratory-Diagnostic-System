<?php

use App\Http\Controllers\Patient\PatientDashboardController;
use App\Http\Controllers\Patient\PatientAppointmentController;
use App\Http\Controllers\Patient\PatientRecordController;
use App\Http\Controllers\Patient\PatientTestResultController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;


// Patient routes - Only authenticated patients can access
Route::middleware(['auth'])
    ->prefix('patient')
    ->name('patient.')
    ->group(function () {

        // Dashboard
        Route::get('/dashboard', [PatientDashboardController::class, 'index'])->name('dashboard');

        // Simple dashboard fallback
        Route::get('/dashboard-simple', function () {
            $user = auth()->user();
            $patient = \App\Models\Patient::where('user_id', $user->id)->first();

            return Inertia::render('patient/dashboard', [
                'user' => $user,
                'patient' => $patient,
                'stats' => [
                    'total_appointments' => 0,
                    'upcoming_appointments' => 0,
                    'completed_appointments' => 0,
                    'pending_lab_results' => 0,
                    'total_visits' => 0,
                ],
                'recent_appointments' => [],
                'upcoming_appointments' => [],
                'recent_lab_orders' => [],
                'recent_visits' => [],
                'notifications' => [],
                'unreadCount' => 0,
            ]);
        })->name('dashboard.simple');


        // Appointments
        Route::prefix('appointments')->name('appointments.')->group(function () {
            Route::get('/', [PatientAppointmentController::class, 'index'])->name('index');
            Route::get('/create', [PatientAppointmentController::class, 'create'])->name('create');
            Route::get('/book', [PatientAppointmentController::class, 'book'])->name('book');
            Route::post('/', [PatientAppointmentController::class, 'store'])->name('store');
            Route::get('/{appointment}', [PatientAppointmentController::class, 'show'])->name('show');
            Route::get('/{appointment}/edit', [PatientAppointmentController::class, 'edit'])->name('edit');
            Route::put('/{appointment}', [PatientAppointmentController::class, 'update'])->name('update');
            Route::delete('/{appointment}', [PatientAppointmentController::class, 'destroy'])->name('destroy');

            // Get available doctors/specialists
            Route::get('/available-doctors', [PatientAppointmentController::class, 'getAvailableDoctors'])->name('available.doctors');
            Route::get('/available-times', [PatientAppointmentController::class, 'getAvailableTimes'])->name('available.times');
        });

        // Direct appointment routes for easier navigation
        Route::get('/appointments', [PatientAppointmentController::class, 'index'])->name('appointments');
        Route::get('/appointments/create', [PatientAppointmentController::class, 'create'])->name('appointments.create');
        Route::get('/appointments/book', [PatientAppointmentController::class, 'book'])->name('appointments.book');


        // Medical Records
        Route::get('/records', [PatientRecordController::class, 'index'])->name('records');

        // Test Results
        Route::get('/test-results', [PatientTestResultController::class, 'index'])->name('test-results');


        // Profile
        Route::get('/profile', function () {
            $user = auth()->user();
            $patient = \App\Models\Patient::where('user_id', $user->id)->first();

            return Inertia::render('patient/profile', [
                'user' => $user,
                'patient' => $patient,
            ]);
        })->name('profile');

        Route::put('/profile', function (Request $request) {
            $user = auth()->user();

            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:users,email,' . $user->id,
                'phone' => 'nullable|string|max:20',
            ]);

            $user->update($request->only(['name', 'email', 'phone']));

            return redirect()->route('patient.profile')->with('success', 'Profile updated successfully!');
        })->name('profile.update');

        // Contact
        Route::get('/contact', function () {
            return Inertia::render('patient/contact');
        })->name('contact');

            // Real-time appointment routes for patients
            Route::prefix('realtime')->name('realtime.')->group(function () {
                Route::get('/appointments', [\App\Http\Controllers\Admin\RealtimeAppointmentController::class, 'getAppointmentUpdates'])->name('appointments');
                Route::get('/notifications', [\App\Http\Controllers\Admin\RealtimeAppointmentController::class, 'getNotificationUpdates'])->name('notifications');
                Route::post('/notifications/{notification}/mark-read', [\App\Http\Controllers\Admin\RealtimeAppointmentController::class, 'markNotificationAsRead'])->name('notifications.mark-read');
                Route::post('/notifications/mark-all-read', [\App\Http\Controllers\Admin\RealtimeAppointmentController::class, 'markAllNotificationsAsRead'])->name('notifications.mark-all-read');
            });
    });
