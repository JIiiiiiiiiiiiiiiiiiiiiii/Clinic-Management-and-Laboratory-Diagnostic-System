<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\SimpleUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
            // Use temporary authentication for development (bypass database)
            $validCredentials = $this->getTemporaryCredentials();
            $email = $request->input('email');
            $password = $request->input('password');
            
            if (isset($validCredentials[$email]) && $validCredentials[$email] === $password) {
                // Create a temporary user object
                $user = $this->createTemporaryUser($email);
                
                // Store user in session for custom provider
                $request->session()->put('auth.user', $user);
                $request->session()->put('auth.login', true);
                $request->session()->regenerate();

                // Debug: Log the authenticated user
                \Log::info('User authenticated successfully', [
                    'user_id' => $user->id ?? 'temp',
                    'email' => $user->email,
                    'role' => $user->role ?? 'admin',
                    'mapped_role' => $user->getMappedRole()
                ]);

                // Redirect based on mapped role (admin -> admin.dashboard, patient -> patient.dashboard)
                return redirect()->intended($user->getRedirectPath());
            } else {
                throw ValidationException::withMessages([
                    'email' => __('auth.failed'),
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
            'hospital@stjames.com' => 'admin',
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

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
