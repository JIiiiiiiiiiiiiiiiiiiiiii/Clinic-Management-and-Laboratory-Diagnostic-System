<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\SimpleUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        try {
            // Clean and normalize input
            $email = trim(strtolower($request->input('email')));
            $password = trim($request->input('password'));

            // Debug logging
            \Log::info('Login attempt', [
                'original_email' => $request->input('email'),
                'cleaned_email' => $email,
                'password_length' => strlen($password)
            ]);

            // First try database authentication
            $user = \App\Models\User::where('email', $email)->first();

            if ($user && \Hash::check($password, $user->password)) {
                // Database user found and password matches
                \Log::info('Database user authenticated successfully', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'role' => $user->role
                ]);

                // Login the user using Laravel's standard authentication
                Auth::login($user);

                // Redirect based on role
                $mappedRole = $user->getMappedRole();
                if ($mappedRole === 'patient') {
                    return redirect()->route('patient.dashboard.simple');
                } elseif (in_array($mappedRole, ['hospital_admin', 'hospital_staff'])) {
                    return redirect()->route('hospital.dashboard');
                } else {
                    return redirect()->route('admin.dashboard');
                }
            }

            // Fallback to temporary credentials for development
            $validCredentials = $this->getTemporaryCredentials();

            if (isset($validCredentials[$email]) && $validCredentials[$email] === $password) {
                // Create a temporary user object
                $tempUser = $this->createTemporaryUser($email);

                // Store user in session for custom provider
                $request->session()->put('auth.user', $tempUser);
                $request->session()->put('auth.login', true);
                $request->session()->regenerate();

                // Debug: Log the authenticated user
                \Log::info('Temporary user authenticated successfully', [
                    'user_id' => $tempUser->id ?? 'temp',
                    'email' => $tempUser->email,
                    'role' => $tempUser->role ?? 'admin',
                    'mapped_role' => $tempUser->getMappedRole()
                ]);

                // Redirect based on mapped role
                \Log::info('Redirecting user to: ' . $tempUser->getRedirectPath());
                return redirect($tempUser->getRedirectPath());
            } else {
                // Provide more specific error message
                $errorMessage = 'Invalid credentials. Please check your email and password.';
                if (!$user && !isset($validCredentials[$email])) {
                    $errorMessage = 'Email not found. Please use one of the valid email addresses.';
                } elseif ($user && !\Hash::check($password, $user->password)) {
                    $errorMessage = 'Incorrect password. Please try again.';
                }

                \Log::warning('Login failed', [
                    'email' => $email,
                    'password_provided' => !empty($password),
                    'user_found_in_db' => $user ? true : false,
                    'temp_credentials_exist' => isset($validCredentials[$email])
                ]);

                throw ValidationException::withMessages([
                    'email' => $errorMessage,
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Authentication failed', [
                'email' => $request->email,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Get temporary credentials for development
     */
    private function getTemporaryCredentials(): array
    {
        return [
            'admin@clinic.com' => 'password',
            'doctor@clinic.com' => 'password',
            'labtech@clinic.com' => 'password',
            'medtech@clinic.com' => 'password',
            'cashier@clinic.com' => 'password',
            'patient@clinic.com' => 'password',
            'ron@patient.com' => 'password',
            'hospital@stjames.com' => 'password',
        ];
    }

    /**
     * Create a temporary user object for authentication
     */
    private function createTemporaryUser(string $email): SimpleUser
    {
        $roleMap = [
            'admin@clinic.com' => 'admin',
            'doctor@clinic.com' => 'doctor',
            'labtech@clinic.com' => 'laboratory_technologist',
            'medtech@clinic.com' => 'medtech',
            'cashier@clinic.com' => 'cashier',
            'patient@clinic.com' => 'patient',
            'ron@patient.com' => 'patient',
            'hospital@stjames.com' => 'hospital_admin',
        ];

        $role = $roleMap[$email] ?? 'admin';

        return new SimpleUser($email, $role);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Clear custom session authentication
        $request->session()->forget('auth.user');
        $request->session()->forget('auth.login');

        // Also clear standard Laravel auth
        Auth::guard('web')->logout();
        Auth::guard('session')->logout();

        // Completely invalidate and regenerate session
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Clear all session data
        $request->session()->flush();

        \Log::info('User logged out successfully');

        return redirect('/');
    }
}
