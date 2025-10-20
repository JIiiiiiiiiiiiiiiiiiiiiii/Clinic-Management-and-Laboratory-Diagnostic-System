<?php

namespace App\Http\Controllers\Hospital;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class HospitalUserController extends Controller
{
    /**
     * Display a listing of hospital users.
     */
    public function index(Request $request): Response
    {
        $users = User::whereIn('role', ['hospital_admin', 'hospital_staff'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'is_active' => $user->is_active ?? true,
                    'created_at' => $user->created_at,
                ];
            });

        $stats = [
            'total_users' => User::whereIn('role', ['hospital_admin', 'hospital_staff'])->count(),
            'active_users' => User::whereIn('role', ['hospital_admin', 'hospital_staff'])->where('is_active', true)->count(),
            'admin_users' => User::where('role', 'hospital_admin')->count(),
            'staff_users' => User::where('role', 'hospital_staff')->count(),
        ];

        return Inertia::render('Hospital/Users/Index', [
            'users' => $users,
            'stats' => $stats
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Hospital/Users/Create', [
            'user' => $user
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:hospital_admin,hospital_staff',
            'is_active' => 'boolean',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('hospital.users.index')->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(Request $request, $id): Response
    {
        $user = User::findOrFail($id);

        return Inertia::render('Hospital/Users/Show', [
            'userData' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_active' => $user->is_active ?? true,
                'created_at' => $user->created_at,
                'last_login' => $user->last_login_at ?? 'Never',
            ]
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(Request $request, $id): Response
    {
        $user = User::findOrFail($id);

        return Inertia::render('Hospital/Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_active' => $user->is_active ?? true,
            ]
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:8',
            'role' => 'required|in:hospital_admin,hospital_staff',
            'is_active' => 'boolean',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'is_active' => $validated['is_active'] ?? true,
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return redirect()->route('hospital.users.show', $user)->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return redirect()->route('hospital.users.index')->with('success', 'User deleted successfully.');
    }
}
