<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\OtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OtpController extends Controller
{
    protected OtpService $otpService;

    public function __construct(OtpService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * Show OTP verification page
     */
    public function show(Request $request): Response
    {
        $email = $request->session()->get('otp_email');
        $type = $request->session()->get('otp_type');

        if (!$email || !$type) {
            return redirect()->route('login')
                ->withErrors(['email' => 'OTP session expired. Please try again.']);
        }

        // Get dev OTP code if in development mode
        // Check both log mailer and if email sending might have failed
        $devOtpCode = null;
        if (app()->environment('local', 'development')) {
            // Show dev code if using log mailer OR if it's stored in session (from failed email)
            $devOtpCode = $request->session()->get('dev_otp_code');
            
            // Also check the latest OTP from database if dev code not in session
            if (!$devOtpCode) {
                $latestOtp = $this->otpService->getLatestOtp($email, $type);
                if ($latestOtp && !$latestOtp->is_used) {
                    // Only show in log mode or if we want to debug
                    if (config('mail.default') === 'log') {
                        $devOtpCode = $latestOtp->code;
                    }
                }
            }
        }

        return Inertia::render('auth/verify-otp', [
            'email' => $email,
            'type' => $type,
            'status' => $request->session()->get('status'),
            'devOtpCode' => $devOtpCode,
        ]);
    }

    /**
     * Verify OTP code
     */
    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $email = $request->session()->get('otp_email');
        $type = $request->session()->get('otp_type');

        if (!$email || !$type) {
            throw ValidationException::withMessages([
                'code' => ['OTP session expired. Please try again.'],
            ]);
        }

        // Rate limiting
        $key = 'otp-verify:' . $request->ip() . ':' . $email;
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'code' => ["Too many attempts. Please try again in {$seconds} seconds."],
            ]);
        }

        $isValid = $this->otpService->verifyOtp($email, $request->code, $type);

        if (!$isValid) {
            RateLimiter::hit($key, 60);
            throw ValidationException::withMessages([
                'code' => ['Invalid or expired OTP code.'],
            ]);
        }

        RateLimiter::clear($key);

        // Clear OTP session data
        $request->session()->forget(['otp_email', 'otp_type']);

        // Handle different OTP types
        return match($type) {
            'login' => $this->handleLoginVerification($request, $email),
            'register' => $this->handleRegisterVerification($request, $email),
            'password_reset' => $this->handlePasswordResetVerification($request, $email),
            default => redirect()->route('login')->withErrors(['code' => 'Invalid OTP type.']),
        };
    }

    /**
     * Resend OTP
     */
    public function resend(Request $request): RedirectResponse
    {
        $email = $request->session()->get('otp_email');
        $type = $request->session()->get('otp_type');

        if (!$email || !$type) {
            return back()->withErrors(['email' => 'OTP session expired. Please try again.']);
        }

        // Rate limiting for resend
        $key = 'otp-resend:' . $request->ip() . ':' . $email;
        if (RateLimiter::tooManyAttempts($key, 3)) {
            $seconds = RateLimiter::availableIn($key);
            return back()->withErrors(['email' => "Too many resend attempts. Please try again in {$seconds} seconds."]);
        }

        if (!$this->otpService->canRequestNewOtp($email, $type)) {
            return back()->withErrors(['email' => 'Please wait before requesting a new code.']);
        }

        try {
            $otp = $this->otpService->resendOtp($email, $type, $request->ip());
            RateLimiter::hit($key, 60);

            // In development, store OTP code in session for debugging
            $statusMessage = 'A new verification code has been sent to your email.';
            if (app()->environment('local', 'development') && config('mail.default') === 'log') {
                $statusMessage .= ' (Development Mode: Check logs for OTP code)';
                $request->session()->put('dev_otp_code', $otp->code);
            }

            return back()->with('status', $statusMessage);
        } catch (\Exception $e) {
            \Log::error('Failed to resend OTP', [
                'email' => $email,
                'type' => $type,
                'error' => $e->getMessage(),
            ]);
            
            return back()->withErrors(['email' => 'Failed to send OTP. Please try again.']);
        }
    }

    /**
     * Handle login verification
     */
    protected function handleLoginVerification(Request $request, string $email): RedirectResponse
    {
        $user = \App\Models\User::where('email', $email)->first();

        if (!$user) {
            // Check for temporary credentials
            $validCredentials = [
                'admin@clinic.com' => 'password',
                'doctor@clinic.com' => 'password',
                'labtech@clinic.com' => 'password',
                'medtech@clinic.com' => 'password',
                'cashier@clinic.com' => 'password',
                'patient@clinic.com' => 'password',
                'ron@patient.com' => 'password',
                'hospital@stjames.com' => 'password',
            ];
            
            if (!isset($validCredentials[$email])) {
                return redirect()->route('login')
                    ->withErrors(['email' => 'User not found.']);
            }
            
            // Create temporary user session
            $tempUser = new \App\Models\SimpleUser($email, $this->getRoleFromEmail($email));
            $request->session()->put('auth.user', $tempUser);
            $request->session()->put('auth.login', true);
            $request->session()->regenerate();
            
            return redirect($tempUser->getRedirectPath());
        }

        $remember = $request->session()->get('login_remember', false);
        \Illuminate\Support\Facades\Auth::login($user, $remember);
        $request->session()->forget('login_remember');

        // Redirect based on role
        if ($user->role === 'patient') {
            return redirect()->route('home');
        } else {
            return redirect()->route('admin.dashboard');
        }
    }
    
    /**
     * Get role from email for temporary users
     */
    protected function getRoleFromEmail(string $email): string
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
        
        return $roleMap[$email] ?? 'admin';
    }

    /**
     * Handle registration verification
     */
    protected function handleRegisterVerification(Request $request, string $email): RedirectResponse
    {
        // Get registration data from session
        $registrationData = $request->session()->get('registration_data');

        if (!$registrationData) {
            return redirect()->route('register')
                ->withErrors(['email' => 'Registration session expired. Please register again.']);
        }

        // Create user
        $user = \App\Models\User::create([
            'name' => $registrationData['name'],
            'email' => $email,
            'password' => \Illuminate\Support\Facades\Hash::make($registrationData['password']),
            'role' => 'patient',
            'is_active' => true,
            'email_verified_at' => now(), // Mark email as verified
        ]);

        // Create patient record
        try {
            $nameParts = explode(' ', trim($registrationData['name']));
            $firstName = $nameParts[0] ?? $registrationData['name'];
            $lastName = isset($nameParts[1]) ? implode(' ', array_slice($nameParts, 1)) : $firstName;

            \App\Models\Patient::create([
                'user_id' => $user->id,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'birthdate' => now()->subYears(25)->toDateString(),
                'age' => 25,
                'sex' => 'male',
                'civil_status' => 'single',
                'present_address' => 'To be completed',
                'mobile_no' => '000000000',
                'emergency_name' => 'To be completed',
                'emergency_relation' => 'To be completed',
                'attending_physician' => 'To be assigned',
                'arrival_date' => now()->toDateString(),
                'arrival_time' => now()->format('H:i:s'),
                'time_seen' => now()->format('H:i:s'),
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to create patient record during registration', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }

        // Clear registration data
        $request->session()->forget('registration_data');

        \Illuminate\Support\Facades\Auth::login($user);

        return redirect()->route('patient.online.appointment')
            ->with('success', 'Account created and verified successfully! Please complete your profile and book your first appointment.');
    }

    /**
     * Handle password reset verification
     */
    protected function handlePasswordResetVerification(Request $request, string $email): RedirectResponse
    {
        // Store email in session for password reset
        $request->session()->put('password_reset_email', $email);
        $request->session()->put('otp_verified', true);

        return redirect()->route('password.reset');
    }
}

