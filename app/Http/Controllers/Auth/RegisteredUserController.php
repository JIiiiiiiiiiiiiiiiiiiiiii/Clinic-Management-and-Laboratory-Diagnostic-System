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

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'patient', // ALWAYS patient role for new registrations
            'is_active' => true,
        ]);

        // Ensure role is set to patient (additional safeguard)
        $user->role = 'patient';
        $user->save();

        try {
            // Create a basic patient record for the new user
            // Split name into first and last name
            $nameParts = explode(' ', trim($request->name));
            $firstName = $nameParts[0] ?? $request->name;
            $lastName = isset($nameParts[1]) ? implode(' ', array_slice($nameParts, 1)) : '';
            
            // If no last name, use first name for both (temporary - user will update in online appointment form)
            if (empty($lastName)) {
                $lastName = $firstName;
            }

            $patient = Patient::create([
                'user_id' => $user->id,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'birthdate' => now()->subYears(25)->toDateString(), // Placeholder - will be updated in online appointment form
                'age' => 25, // Placeholder
                'sex' => 'male', // Placeholder
                'civil_status' => 'single', // Placeholder
                'present_address' => 'To be completed',
                'mobile_no' => '000000000',
                'emergency_name' => 'To be completed',
                'emergency_relation' => 'To be completed',
                'attending_physician' => 'To be assigned',
                'arrival_date' => now()->toDateString(),
                'arrival_time' => now()->format('H:i:s'),
                'time_seen' => now()->format('H:i:s'),
            ]);

            \Log::info('Patient record created during registration', [
                'user_id' => $user->id,
                'patient_id' => $patient->id,
                'patient_no' => $patient->patient_no
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to create patient record during registration', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Don't fail the registration if patient creation fails
            // User can still login and complete their profile via online appointment form
        }

        event(new Registered($user));

        Auth::login($user);

        // Redirect to online appointment page for new users to complete their profile
        return redirect()->route('patient.online.appointment')
            ->with('success', 'Account created successfully! Please complete your profile and book your first appointment.');
    }
}
