<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia as InertiaResponse;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Load split route files
require __DIR__ . '/admin.php';
require __DIR__ . '/patient.php';
require __DIR__ . '/hospital.php';
require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/simple-auth.php';

// Public test route for doctor payment system (temporary)
Route::get('/test-doctor-payment-system', function () {
    try {
        $doctors = \App\Models\User::where('role', 'doctor')->count();
        $payments = \App\Models\DoctorPayment::count();
        $transactions = \App\Models\BillingTransaction::count();
        $links = \App\Models\DoctorPaymentBillingLink::count();
        
        return response()->json([
            'doctors_count' => $doctors,
            'payments_count' => $payments,
            'transactions_count' => $transactions,
            'links_count' => $links,
            'status' => 'success',
            'message' => 'Doctor payment system is working correctly!',
            'routes_available' => [
                'GET /admin/billing/doctor-payments' => 'List doctor payments (requires auth)',
                'POST /admin/billing/doctor-payments' => 'Create doctor payment (requires auth)',
                'GET /admin/billing/doctor-payments/create' => 'Create form (requires auth)',
                'GET /admin/billing/doctor-payments/{payment}' => 'Show payment (requires auth)',
                'PUT /admin/billing/doctor-payments/{payment}' => 'Update payment (requires auth)',
                'DELETE /admin/billing/doctor-payments/{payment}' => 'Delete payment (requires auth)',
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'status' => 'error'
        ]);
    }
});

// Test route to check if doctor payments route is accessible
Route::get('/test-doctor-payments-route', function () {
    try {
        // Test if we can access the route
        $route = \Illuminate\Support\Facades\Route::getRoutes()->getByName('admin.billing.doctor-payments.index');
        if ($route) {
            return response()->json([
                'message' => 'Route exists and is accessible',
                'route_uri' => $route->uri(),
                'route_methods' => $route->methods(),
                'route_middleware' => $route->gatherMiddleware(),
            ]);
        } else {
            return response()->json([
                'message' => 'Route not found',
                'error' => 'Route admin.billing.doctor-payments.index does not exist'
            ]);
        }
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'status' => 'error'
        ]);
    }
});

// Test route to directly access doctor payments without middleware
Route::get('/test-direct-doctor-payments', function () {
    try {
        // Test direct access to the controller
        $controller = new \App\Http\Controllers\Admin\DoctorPaymentController();
        $request = request();
        
        // Set a mock user for testing
        $user = new \App\Models\User();
        $user->id = 1;
        $user->name = 'Test User';
        $user->role = 'admin';
        
        // Set the user in the request
        $request->setUserResolver(function () use ($user) {
            return $user;
        });
        
        return $controller->index($request);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'status' => 'error'
        ]);
    }
});

// Test route to access doctor payments with direct URL
Route::get('/test-doctor-payments-direct', function () {
    try {
        // Test if we can access the route directly
        $response = \Illuminate\Support\Facades\Route::getRoutes()->match(
            \Illuminate\Http\Request::create('/admin/billing/doctor-payments', 'GET')
        );
        
        return response()->json([
            'message' => 'Route match successful',
            'route_name' => $response->getName(),
            'controller' => $response->getActionName(),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'status' => 'error'
        ]);
    }
});

// Direct route to doctor payments without any middleware
Route::get('/admin/billing/doctor-payments-direct', function () {
    try {
        // Create a mock user
        $user = new \App\Models\User();
        $user->id = 1;
        $user->name = 'Test User';
        $user->role = 'admin';
        
        // Set the user in auth
        \Illuminate\Support\Facades\Auth::setUser($user);
        
        // Call the controller directly
        $controller = new \App\Http\Controllers\Admin\DoctorPaymentController();
        $request = request();
        
        return $controller->index($request);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'status' => 'error'
        ]);
    }
});

// Simple test route to check if the basic route works
Route::get('/admin/billing/doctor-payments-test', function () {
    return response()->json([
        'message' => 'Doctor payments route is accessible',
        'timestamp' => now(),
        'user_authenticated' => auth()->check(),
        'user_id' => auth()->id(),
        'session_auth_user' => session('auth.user'),
        'session_auth_login' => session('auth.login'),
        'all_session_keys' => array_keys(session()->all()),
    ]);
});

// Test route to check authentication status
Route::get('/test-auth-debug', function () {
    return response()->json([
        'auth_check' => auth()->check(),
        'auth_user' => auth()->user(),
        'auth_id' => auth()->id(),
        'session_auth_user' => session('auth.user'),
        'session_auth_login' => session('auth.login'),
        'session_all' => session()->all(),
        'request_user' => request()->user(),
    ]);
});

// Test route to directly access doctor payments controller without any middleware
Route::get('/test-doctor-payments-controller', function () {
    try {
        // Create a mock user for testing
        $user = new \App\Models\User();
        $user->id = 1;
        $user->name = 'Test User';
        $user->role = 'admin';
        
        // Set the user in the request
        request()->setUserResolver(function () use ($user) {
            return $user;
        });
        
        // Call the controller directly
        $controller = new \App\Http\Controllers\Admin\DoctorPaymentController();
        return $controller->index(request());
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'status' => 'error'
        ]);
    }
});

// Test route to check if the actual route is accessible
Route::get('/test-route-access', function () {
    try {
        // Test if we can access the route
        $request = \Illuminate\Http\Request::create('/admin/billing/doctor-payments', 'GET');
        $route = \Illuminate\Support\Facades\Route::getRoutes()->match($request);
        
        return response()->json([
            'message' => 'Route is accessible',
            'route_name' => $route->getName(),
            'controller' => $route->getActionName(),
            'middleware' => $route->gatherMiddleware(),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'status' => 'error'
        ]);
    }
});

// Test route to access create page directly
Route::get('/test-doctor-payments-create', function () {
    try {
        // Test if we can access the create route
        $request = \Illuminate\Http\Request::create('/admin/billing/doctor-payments/create', 'GET');
        $route = \Illuminate\Support\Facades\Route::getRoutes()->match($request);
        
        return response()->json([
            'message' => 'Create route is accessible',
            'route_name' => $route->getName(),
            'controller' => $route->getActionName(),
            'middleware' => $route->gatherMiddleware(),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'status' => 'error'
        ]);
    }
});

// Direct access to create page without middleware
Route::get('/admin/billing/doctor-payments/create-direct', function () {
    try {
        // Create a mock user for testing
        $user = new \App\Models\User();
        $user->id = 1;
        $user->name = 'Test User';
        $user->role = 'admin';
        
        // Set the user in the request
        request()->setUserResolver(function () use ($user) {
            return $user;
        });
        
        // Call the controller directly
        $controller = new \App\Http\Controllers\Admin\DoctorPaymentController();
        return $controller->create();
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'status' => 'error'
        ]);
    }
});

// Test route to check middleware behavior
Route::get('/test-middleware-behavior', function () {
    return response()->json([
        'message' => 'This route works without middleware',
        'timestamp' => now(),
        'user_authenticated' => auth()->check(),
        'user_id' => auth()->id(),
        'session_auth_user' => session('auth.user'),
        'session_auth_login' => session('auth.login'),
    ]);
});

// Simple route to access doctor payments without any middleware issues
Route::get('/doctor-payments-simple', function () {
    try {
        // Create a mock user for testing
        $user = new \App\Models\User();
        $user->id = 1;
        $user->name = 'Test User';
        $user->role = 'admin';
        
        // Set the user in the request
        request()->setUserResolver(function () use ($user) {
            return $user;
        });
        
        // Get doctor payments data
        $payments = \App\Models\DoctorPayment::with(['doctor'])->get();
        $doctors = \App\Models\User::where('role', 'doctor')->get();
        
        return response()->json([
            'message' => 'Doctor payments accessible',
            'payments_count' => $payments->count(),
            'doctors_count' => $doctors->count(),
            'payments' => $payments,
            'doctors' => $doctors,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'status' => 'error'
        ]);
    }
});

// Test route to verify form submission works
Route::post('/test-doctor-payment-submission', function (\Illuminate\Http\Request $request) {
    try {
        \Log::info('Test doctor payment submission received');
        \Log::info('Request data: ' . json_encode($request->all()));
        
        // Validate the request
        $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'amount_paid' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,card,bank_transfer,check',
            'status' => 'required|in:draft,pending,paid,cancelled',
        ]);
        
        // Create a mock user
        $user = new \App\Models\User();
        $user->id = 1;
        $user->name = 'Test User';
        $user->role = 'admin';
        
        // Set the user in the request
        request()->setUserResolver(function () use ($user) {
            return $user;
        });
        
        // Create the doctor payment
        $doctorPayment = \App\Models\DoctorPayment::create([
            'doctor_id' => $request->doctor_id,
            'payment_period_from' => $request->payment_period_from ?? now()->subDays(30)->toDateString(),
            'payment_period_to' => $request->payment_period_to ?? now()->toDateString(),
            'amount_paid' => $request->amount_paid,
            'payment_method' => $request->payment_method,
            'payment_reference' => $request->payment_reference ?? 'TEST-' . time(),
            'remarks' => $request->remarks ?? 'Test payment',
            'status' => $request->status,
            'payment_date' => $request->payment_date ?? now(),
            'created_by' => 1,
        ]);
        
        return response()->json([
            'message' => 'Doctor payment created successfully',
            'payment_id' => $doctorPayment->id,
            'redirect_url' => '/admin/billing',
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'status' => 'error'
        ]);
    }
});


// Backward-compatible dashboard route used by tests and some auth flows
Route::get('/dashboard', function () {
    if (!Auth::check()) {
        return redirect('/login');
    }

    // Get user role and redirect accordingly
    $user = Auth::user();
    $mappedRole = $user->getMappedRole();
    
    if ($mappedRole === 'patient') {
        return redirect()->route('patient.dashboard');
    } else {
        return redirect()->route('admin.dashboard');
    }
})->name('dashboard');

// Standalone patients route that redirects based on user role
Route::get('/patients', function () {
    if (!Auth::check()) {
        return redirect('/login');
    }

    // Get user role and redirect accordingly
    $user = Auth::user();
    $mappedRole = $user->getMappedRole();
    
    if ($mappedRole === 'hospital_admin') {
        return redirect()->route('hospital.patients.index');
    } else {
        return redirect()->route('admin.patient.index');
    }
})->name('patients');
