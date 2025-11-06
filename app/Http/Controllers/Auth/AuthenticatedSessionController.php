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
            
            // Check if user exists and password is correct
            $isValidPassword = false;
            if ($user && \Hash::check($password, $user->password)) {
                $isValidPassword = true;
                } else {
            // Fallback to temporary credentials for development
            $validCredentials = $this->getTemporaryCredentials();
            if (isset($validCredentials[$email]) && $validCredentials[$email] === $password) {
                    $isValidPassword = true;
                }
            }
            
            if (!$isValidPassword) {
                $errorMessage = 'Invalid credentials. Please check your email and password.';
                if (!$user && !isset($this->getTemporaryCredentials()[$email])) {
                    $errorMessage = 'Email not found. Please use one of the valid email addresses.';
                } elseif ($user && !\Hash::check($password, $user->password)) {
                    $errorMessage = 'Incorrect password. Please try again.';
                }
                
                throw ValidationException::withMessages([
                    'email' => $errorMessage,
                ]);
            }
            
            // Determine user role for OTP bypass logic
            $userRole = null;
            if ($user) {
                $userRole = $user->getMappedRole();
            } else {
                // For temporary credentials, get role from email mapping
                $roleMap = [
                    'admin@clinic.com' => 'admin',
                    'doctor@clinic.com' => 'doctor',
                    'labtech@clinic.com' => 'laboratory_technologist',
                    'medtech@clinic.com' => 'medtech',
                    'cashier@clinic.com' => 'cashier',
                    'patient@clinic.com' => 'patient',
                    'ron@patient.com' => 'patient',
                    'hospital@stjames.com' => 'admin',
                ];
                $userRole = $roleMap[$email] ?? 'patient';
            }
            
            // Skip OTP verification for admin and staff (only require for patients)
            $staffRoles = [
                'admin',
                'doctor',
                'medtech',
                'cashier',
                'laboratory_technologist',
                'nurse',
                'hospital_admin',
                'hospital_staff'
            ];
            
            $isStaff = in_array($userRole, $staffRoles);
            
            if ($isStaff) {
                // Direct login for staff/admin - no OTP required
                $remember = $request->boolean('remember');
                
                if ($user) {
                    // Login real user
                    Auth::login($user, $remember);
                } else {
                    // Create temporary session for development credentials
                    $tempUser = $this->createTemporaryUser($email);
                    $request->session()->put('auth.user', $tempUser);
                    $request->session()->put('auth.login', true);
                    $request->session()->regenerate();
                }
                
                // Redirect based on role
                if ($userRole === 'patient') {
                    return redirect()->route('home');
                } else {
                    return redirect()->route('admin.dashboard');
                }
            }
            
            // For patients, require OTP verification
            $otpService = new \App\Services\OtpService();
            $otp = $otpService->createAndSendOtp($email, 'login', $request->ip());
            
            // Store email in session for OTP verification
            $request->session()->put('otp_email', $email);
            $request->session()->put('otp_type', 'login');
            $request->session()->put('login_remember', $request->boolean('remember'));
            
            // In development, show OTP code if email is not configured
            $statusMessage = 'A verification code has been sent to your email address.';
            if (app()->environment('local', 'development') && config('mail.default') === 'log') {
                $statusMessage .= ' (Development Mode: Check logs for OTP code or check your email configuration)';
                // Store OTP in session for development debugging (will be removed after verification)
                $request->session()->put('dev_otp_code', $otp->code);
            }
            
            return redirect()->route('otp.show')
                ->with('status', $statusMessage);
                
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            \Log::error('Authentication failed', [
                'email' => $request->email,
                'error' => $e->getMessage()
            ]);
            throw ValidationException::withMessages([
                'email' => 'An error occurred. Please try again.',
            ]);
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
