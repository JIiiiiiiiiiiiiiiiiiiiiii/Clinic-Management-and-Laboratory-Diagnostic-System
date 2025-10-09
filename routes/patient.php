<?php

use App\Http\Controllers\Patient\PatientDashboardController;
use App\Http\Controllers\Patient\PatientAppointmentController;
use App\Http\Controllers\Patient\PatientRecordController;
use App\Http\Controllers\Patient\PatientTestResultController;
use App\Http\Controllers\Patient\UnifiedPatientController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

// Simple test route to verify patient routes are working
Route::get('/patient-simple-test', function () {
    return 'Patient routes are working!';
});

// Debug route to check patient interface without middleware
Route::get('/patient-debug', function () {
    $user = auth()->user();
    $patient = null;
    
    if ($user) {
        $patient = \App\Models\Patient::where('user_id', $user->id)->first();
    }
    
    return response()->json([
        'authenticated' => auth()->check(),
        'user' => $user ? [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role
        ] : null,
        'patient' => $patient ? [
            'id' => $patient->id,
            'first_name' => $patient->first_name,
            'last_name' => $patient->last_name,
            'patient_no' => $patient->patient_no,
            'user_id' => $patient->user_id
        ] : null,
        'timestamp' => now()
    ]);
});

// Test route without authentication
Route::get('/patient-test-no-auth', function () {
    return response()->json([
        'message' => 'Patient test route without auth is working!',
        'timestamp' => now(),
        'user_authenticated' => auth()->check(),
        'user_id' => auth()->id()
    ]);
});

// Patient routes - Only authenticated patients can access
Route::middleware(['auth'])
    ->prefix('patient')
    ->name('patient.')
    ->group(function () {
        // Unified patient registration and appointment booking
        Route::get('/register-and-book', [UnifiedPatientController::class, 'create'])->name('register.and.book');
        Route::post('/register-and-book', [UnifiedPatientController::class, 'store'])->name('register.and.book.store');
        
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
        
        // Test route to verify patient interface is working
        Route::get('/test', function () {
            return Inertia::render('Patient/Dashboard', [
                'user' => auth()->user()
            ]);
        })->name('test');
        
        
        // Debug route for dashboard
        Route::get('/debug-dashboard', function () {
            $user = auth()->user();
            $patient = \App\Models\Patient::where('user_id', $user->id)->first();
            return response()->json([
                'user_id' => $user->id,
                'patient_exists' => $patient ? true : false,
                'patient_id' => $patient ? $patient->id : null,
                'patient_no' => $patient ? $patient->patient_no : null,
                'timestamp' => now()
            ]);
        })->name('debug.dashboard');
        
        // Fix patient number route
        Route::get('/fix-patient-number', function () {
            $user = auth()->user();
            $patient = \App\Models\Patient::where('user_id', $user->id)->first();
            if ($patient) {
                // Generate proper patient number format (P001, P002, etc.)
                $patientNo = 'P' . str_pad($patient->id, 3, '0', STR_PAD_LEFT);
                $patient->update(['patient_no' => $patientNo]);
                return response()->json([
                    'message' => 'Patient number updated',
                    'patient_no' => $patient->patient_no
                ]);
            }
            return response()->json([
                'message' => 'Patient not found'
            ]);
        })->name('fix.patient.number');
        
        // Simple dashboard test
        Route::get('/test-dashboard', function () {
            $user = auth()->user();
            $patient = \App\Models\Patient::where('user_id', $user->id)->first();
            return response()->json([
                'user_id' => $user->id,
                'patient_id' => $patient->id,
                'patient_no' => $patient->patient_no,
                'appointments_count' => \App\Models\Appointment::where('patient_id', $patient->patient_no)->count(),
                'all_appointments' => \App\Models\Appointment::select('id', 'patient_id', 'appointment_date')->get()
            ]);
        })->name('test.dashboard');
        
        // Fix appointment patient ID
        Route::get('/fix-appointment', function () {
            $user = auth()->user();
            $patient = \App\Models\Patient::where('user_id', $user->id)->first();
            
            // Update the existing appointment to use the correct patient ID
            $appointment = \App\Models\Appointment::find(37);
            if ($appointment) {
                $appointment->update(['patient_id' => $patient->patient_no]);
                return response()->json([
                    'message' => 'Appointment updated',
                    'appointment_id' => $appointment->id,
                    'new_patient_id' => $appointment->patient_id
                ]);
            }
            return response()->json(['message' => 'Appointment not found']);
        })->name('fix.appointment');
        
        // Simple dashboard without complex data
        Route::get('/simple-dashboard', function () {
            $user = auth()->user();
            $patient = \App\Models\Patient::where('user_id', $user->id)->first();
            
            return \Inertia\Inertia::render('Patient/SimpleDashboard', [
                'user' => $user,
                'patient' => $patient,
                'stats' => [
                    'total_appointments' => 0,
                    'upcoming_appointments' => 0,
                    'completed_appointments' => 0,
                    'total_visits' => 0,
                    'pending_lab_results' => 0,
                ],
                'recent_appointments' => [],
                'recent_lab_orders' => [],
                'recent_visits' => [],
                'notifications' => [],
                'unreadCount' => 0,
            ]);
        })->name('simple.dashboard');
        
        // Ultra simple test
        Route::get('/test-page', function () {
            return \Inertia\Inertia::render('Patient/TestPage', [
                'message' => 'Hello World'
            ]);
        })->name('test.page');
        
        // Basic dashboard test
        Route::get('/basic-dashboard', function () {
            $user = auth()->user();
            $patient = \App\Models\Patient::where('user_id', $user->id)->first();
            
            return \Inertia\Inertia::render('Patient/BasicDashboard', [
                'user' => $user,
                'patient' => $patient,
            ]);
        })->name('basic.dashboard');
        
        // Minimal dashboard test
        Route::get('/minimal-dashboard', function () {
            $user = auth()->user();
            $patient = \App\Models\Patient::where('user_id', $user->id)->first();
            
            return \Inertia\Inertia::render('Patient/MinimalDashboard', [
                'user' => $user,
                'patient' => $patient,
            ]);
        })->name('minimal.dashboard');
        
        // Ultra simple test
        Route::get('/ultra-simple', function () {
            return \Inertia\Inertia::render('Patient/UltraSimple');
        })->name('ultra.simple');
        
        // Simple working dashboard without profile requirements
        Route::get('/working-dashboard', function () {
            $user = auth()->user();
            $patient = \App\Models\Patient::where('user_id', $user->id)->first();
            
            return \Inertia\Inertia::render('Patient/WorkingDashboard', [
                'user' => $user,
                'patient' => $patient,
                'stats' => [
                    'total_appointments' => 0,
                    'upcoming_appointments' => 0,
                    'completed_appointments' => 0,
                    'total_visits' => 0,
                    'pending_lab_results' => 0,
                ],
                'recent_appointments' => [],
                'recent_lab_orders' => [],
                'recent_visits' => [],
                'notifications' => [],
                'unreadCount' => 0,
            ]);
        })->name('working.dashboard');
        
        // HTML test (no Inertia)
        Route::get('/html-test', function () {
            return response('<h1>HTML Test</h1><p>If you can see this, the server is working!</p>');
        })->name('html.test');
        
        // Test dashboard (minimal)
        Route::get('/test-dashboard-minimal', function () {
            $user = auth()->user();
            return Inertia::render('patient/TestDashboard', [
                'user' => $user
            ]);
        })->name('test.dashboard.minimal');

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
