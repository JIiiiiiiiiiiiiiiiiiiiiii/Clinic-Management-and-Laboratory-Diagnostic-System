<?php

use App\Http\Controllers\Patient\PatientDashboardController;
use App\Http\Controllers\Patient\PatientAppointmentController;
use App\Http\Controllers\Patient\PatientRecordController;
use App\Http\Controllers\Patient\PatientTestResultController;
use App\Http\Controllers\Patient\PatientRegistrationController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

// Public redirect routes - accessible without authentication
// These redirect to the public routes defined in web.php
Route::prefix('patient')->name('patient.')->group(function () {
    // Home - redirect to main home page
    Route::get('/home', function () {
        return redirect('/');
    })->name('home');

    // Services (also accessible via public route /services)
    Route::get('/services', function () {
        return redirect()->route('services');
    })->name('services');

    // Contact (also accessible via public route /contact)
    Route::get('/contact', function () {
        return redirect()->route('contact');
    })->name('contact');

    // About (also accessible via public route /about)
    Route::get('/about', function () {
        return redirect()->route('about');
    })->name('about');

    // Testimonials (also accessible via public route /testimonials)
    Route::get('/testimonials', function () {
        return redirect()->route('testimonials');
    })->name('testimonials');
});

// Patient routes - Only authenticated patients can access
Route::middleware(['auth'])
    ->prefix('patient')
    ->name('patient.')
    ->group(function () {

        // Dashboard
        Route::get('/dashboard', [PatientDashboardController::class, 'home'])->name('dashboard');

        // Simple dashboard fallback
        Route::get('/dashboard-simple', [PatientDashboardController::class, 'index'])->name('dashboard.simple');


        // Patient Registration and Booking
        Route::get('/register-and-book', [PatientRegistrationController::class, 'showRegistrationAndBooking'])->name('register.and.book');
        Route::post('/register-and-book', [PatientRegistrationController::class, 'storeRegistrationAndBooking'])->name('register.and.book.store');
        Route::post('/register-and-book/force-create', [PatientRegistrationController::class, 'forceCreate'])->name('register.and.book.force');

        // Online Appointment
        Route::get('/online-appointment', [\App\Http\Controllers\Patient\OnlineAppointmentController::class, 'show'])->name('online.appointment');
        Route::post('/online-appointment', [\App\Http\Controllers\Patient\OnlineAppointmentController::class, 'store'])->name('online.appointment.store');
        Route::post('/online-appointment/force-create', [\App\Http\Controllers\Patient\OnlineAppointmentController::class, 'forceCreate'])->name('online.appointment.force');
        
        // Staff API
        Route::get('/staff', [\App\Http\Controllers\Patient\OnlineAppointmentController::class, 'getStaff'])->name('staff');

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

        // Billing History & Receipts
        Route::prefix('billing')->name('billing.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Patient\PatientBillingController::class, 'index'])->name('index');
            Route::get('/{transaction}/receipt', [\App\Http\Controllers\Patient\PatientBillingController::class, 'show'])->name('receipt');
        });


        // Profile
        Route::get('/profile', function () {
            $user = auth()->user();
            $patient = \App\Models\Patient::where('user_id', $user->id)->first();
            $notifications = \App\Models\Notification::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
            $unreadCount = \App\Models\Notification::where('user_id', $user->id)
                ->where('read', false)
                ->count();

            return Inertia::render('patient/profile', [
                'user' => $user,
                'patient' => $patient,
                'notifications' => $notifications,
                'unreadCount' => $unreadCount,
            ]);
        })->name('profile');

        Route::put('/profile', function (Request $request) {
            $user = auth()->user();
            $patient = \App\Models\Patient::where('user_id', $user->id)->first();

            // Debug logging
            \Log::info('Profile update request', [
                'user_id' => $user->id,
                'has_patient' => $patient !== null,
                'request_data' => $request->all()
            ]);

            // Validate user data
            $userValidation = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            ]);

            // Update user information
            $user->update($userValidation);

            // If patient exists, update patient information
            if ($patient) {
                $patientValidation = $request->validate([
                    'phone' => 'nullable|string|max:20',
                    'address' => 'nullable|string|max:500',
                    'emergency_contact' => 'nullable|string|max:255',
                    'emergency_relation' => 'nullable|string|max:255',
                    'allergies' => 'nullable|string|max:500',
                    'medical_conditions' => 'nullable|string|max:1000',
                ]);

                // Map form fields to patient database fields
                $patientData = [
                    'telephone_no' => $patientValidation['phone'] ?? $patient->telephone_no,
                    'present_address' => $patientValidation['address'] ?? $patient->present_address,
                    'emergency_name' => $patientValidation['emergency_contact'] ?? $patient->emergency_name,
                    'emergency_relation' => $patientValidation['emergency_relation'] ?? $patient->emergency_relation,
                    'drug_allergies' => $patientValidation['allergies'] ?? $patient->drug_allergies,
                    'past_medical_history' => $patientValidation['medical_conditions'] ?? $patient->past_medical_history,
                ];

                \Log::info('Updating patient data', [
                    'patient_id' => $patient->id,
                    'patient_data' => $patientData
                ]);

                $patient->update($patientData);
            }

            return redirect()->route('patient.profile')->with('success', 'Profile updated successfully!');
        })->name('profile.update');

        // Privacy Policy
        Route::get('/privacy', function () {
            $user = auth()->user();
            $patient = \App\Models\Patient::where('user_id', $user->id)->first();
            $notifications = \App\Models\Notification::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
            $unreadCount = \App\Models\Notification::where('user_id', $user->id)
                ->where('read', false)
                ->count();

            return Inertia::render('patient/privacy', [
                'user' => $user,
                'patient' => $patient,
                'notifications' => $notifications,
                'unreadCount' => $unreadCount,
            ]);
        })->name('privacy');

        // Terms of Service
        Route::get('/terms', function () {
            $user = auth()->user();
            $patient = \App\Models\Patient::where('user_id', $user->id)->first();
            $notifications = \App\Models\Notification::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
            $unreadCount = \App\Models\Notification::where('user_id', $user->id)
                ->where('read', false)
                ->count();

            return Inertia::render('patient/terms', [
                'user' => $user,
                'patient' => $patient,
                'notifications' => $notifications,
                'unreadCount' => $unreadCount,
            ]);
        })->name('terms');

            // Real-time appointment routes for patients
            Route::prefix('realtime')->name('realtime.')->group(function () {
                Route::get('/appointments', [\App\Http\Controllers\Admin\RealtimeAppointmentController::class, 'getAppointmentUpdates'])->name('appointments');
                Route::get('/notifications', [\App\Http\Controllers\Admin\RealtimeAppointmentController::class, 'getNotificationUpdates'])->name('notifications');
                Route::post('/notifications/{notification}/mark-read', [\App\Http\Controllers\Admin\RealtimeAppointmentController::class, 'markNotificationAsRead'])->name('notifications.mark-read');
                Route::post('/notifications/mark-all-read', [\App\Http\Controllers\Admin\RealtimeAppointmentController::class, 'markAllNotificationsAsRead'])->name('notifications.mark-all-read');
            });
    });
