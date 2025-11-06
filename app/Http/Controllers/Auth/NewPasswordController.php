<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    /**
     * Show the password reset page.
     */
    public function create(Request $request): Response
    {
        // Check if OTP was verified
        if (!$request->session()->get('otp_verified')) {
            return redirect()->route('password.request')
                ->withErrors(['email' => 'Please verify your email with OTP first.']);
        }

        $email = $request->session()->get('password_reset_email');
        
        if (!$email) {
            return redirect()->route('password.request')
                ->withErrors(['email' => 'Password reset session expired. Please try again.']);
        }

        return Inertia::render('auth/reset-password', [
            'email' => $email,
            'token' => 'otp-verified', // Placeholder since we're using OTP
        ]);
    }

    /**
     * Handle an incoming new password request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Check if OTP was verified
        if (!$request->session()->get('otp_verified')) {
            throw ValidationException::withMessages([
                'email' => ['Please verify your email with OTP first.'],
            ]);
        }

        $email = $request->session()->get('password_reset_email');
        
        if (!$email || $email !== $request->email) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email for password reset.'],
            ]);
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['User not found.'],
            ]);
        }

        // Reset password
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));

        // Clear session data
        $request->session()->forget(['otp_verified', 'password_reset_email']);

        return to_route('login')->with('status', 'Your password has been reset successfully.');
    }
}
