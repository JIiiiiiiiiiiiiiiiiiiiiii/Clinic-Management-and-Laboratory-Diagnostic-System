<?php

namespace App\Http\Controllers\Hospital;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HospitalUserController extends Controller
{
    /**
     * Display a listing of hospital users.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        return Inertia::render('Hospital/Users/Index', [
            'user' => $user
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
        // Implementation for creating users
        return redirect()->route('hospital.users.index')->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(Request $request, $id): Response
    {
        $user = $request->user();
        
        return Inertia::render('Hospital/Users/Show', [
            'user' => $user,
            'userId' => $id
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(Request $request, $id): Response
    {
        $user = $request->user();
        
        return Inertia::render('Hospital/Users/Edit', [
            'user' => $user,
            'userId' => $id
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, $id)
    {
        // Implementation for updating users
        return redirect()->route('hospital.users.index')->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy($id)
    {
        // Implementation for deleting users
        return redirect()->route('hospital.users.index')->with('success', 'User deleted successfully.');
    }
}
