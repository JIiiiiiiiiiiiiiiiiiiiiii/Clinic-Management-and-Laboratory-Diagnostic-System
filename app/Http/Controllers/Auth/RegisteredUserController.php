<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Patient;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            // Note: role is NOT validated here - it's always set to 'patient' for security
        ]);

        // Store registration data in session
        $request->session()->put('registration_data', [
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
        ]);

        // Send OTP for email verification
        $otpService = new \App\Services\OtpService();
        $otp = $otpService->createAndSendOtp($request->email, 'register', $request->ip());

        // Store email and type in session for OTP verification
        $request->session()->put('otp_email', $request->email);
        $request->session()->put('otp_type', 'register');
            
        // In development, show OTP code if email is not configured
        $statusMessage = 'A verification code has been sent to your email address. Please verify to complete registration.';
        if (app()->environment('local', 'development') && config('mail.default') === 'log') {
            $statusMessage .= ' (Development Mode: Check logs for OTP code)';
            $request->session()->put('dev_otp_code', $otp->code);
        }

        return redirect()->route('otp.show')
            ->with('status', $statusMessage);
    }
}
