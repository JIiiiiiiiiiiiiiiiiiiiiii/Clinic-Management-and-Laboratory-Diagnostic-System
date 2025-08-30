<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
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
        ]);

        // Generate a username from the email prefix and ensure uniqueness
        $base = substr((string) str($request->email)->before('@')->slug('_'), 0, 50);
        $username = $base ?: substr((string) str($request->email)->slug('_'), 0, 50);
        if ($username === '') {
            $username = 'user_'.str()->random(6);
        }
        $original = $username;
        $i = 1;
        while (User::where('username', $username)->exists()) {
            $suffix = '_'.($i++);
            $username = substr($original, 0, max(1, 50 - strlen($suffix))).$suffix;
        }

        $user = User::create([
            'username' => $username,
            'full_name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            // Default role to Patient on self-registration
            'role' => 'Patient',
            // Optional fields left null
            'gender' => null,
            'contact_number' => null,
            'address' => null,
            'birth_date' => null,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
