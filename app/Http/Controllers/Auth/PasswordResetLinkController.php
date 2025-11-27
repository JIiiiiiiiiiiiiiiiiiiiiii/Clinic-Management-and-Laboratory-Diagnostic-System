<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Show the password reset link request page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = trim(strtolower($request->input('email')));
        
        // Check if user exists
        $user = \App\Models\User::where('email', $email)->first();
        
        if (!$user) {
            // Still show success message for security (don't reveal if email exists)
            return back()->with('status', __('A reset code will be sent if the account exists.'));
        }

        // Send OTP instead of reset link
        $otpService = new \App\Services\OtpService();
        $otp = $otpService->createAndSendOtp($email, 'password_reset', $request->ip());

        // Store email and type in session for OTP verification
        $request->session()->put('otp_email', $email);
        $request->session()->put('otp_type', 'password_reset');

        // In development, show OTP code if email is not configured
        $statusMessage = __('A verification code has been sent to your email address.');
        if (app()->environment('local', 'development') && config('mail.default') === 'log') {
            $statusMessage .= ' (Development Mode: Check logs for OTP code)';
            $request->session()->put('dev_otp_code', $otp->code);
        }

        return redirect()->route('otp.show')
            ->with('status', $statusMessage);
    }
}
