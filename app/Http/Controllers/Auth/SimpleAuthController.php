<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;

class SimpleAuthController extends Controller
{
    /**
     * Show the login page.
     */
    public function showLogin(): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => false,
            'status' => Session::get('status'),
        ]);
    }

    /**
     * Handle login request.
     */
    public function login(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');

        // Use Laravel's built-in authentication with database
        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            
            $user = Auth::user();
            return $this->redirectBasedOnRole($user);
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ]);
    }

    /**
     * Handle logout.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }


    /**
     * Redirect based on user role.
     */
    private function redirectBasedOnRole($user): RedirectResponse
    {
        // Use the mapped role from the User model
        $mappedRole = $user->getMappedRole();
        
        if ($mappedRole === 'patient') {
            return redirect()->route('patient.dashboard');
        }
        
        if ($mappedRole === 'hospital_admin' || $mappedRole === 'hospital_staff') {
            return redirect()->route('hospital.dashboard');
        }
        
        return redirect()->route('admin.dashboard');
    }
}
