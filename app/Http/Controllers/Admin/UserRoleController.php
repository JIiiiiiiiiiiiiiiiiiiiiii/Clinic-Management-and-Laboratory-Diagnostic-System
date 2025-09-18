<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;

class UserRoleController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'email' => ['required','email','max:255','unique:users,email'],
            'password' => ['required','string','min:8','confirmed'],
            'role' => ['required','string', Rule::in(['admin','doctor','nurse','medtech','cashier','patient'])],
            'is_active' => ['sometimes','boolean'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
            'is_active' => $data['is_active'] ?? true,
        ]);
        $user->syncRoles([$data['role']]);

        return back()->with('success', 'User created');
    }
    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'role' => ['required','string', Rule::in(['admin','doctor','nurse','medtech','cashier','patient'])],
        ]);

        // sync to single role for simplicity
        $user->syncRoles([$data['role']]);
        // keep legacy role column in sync for redirects/middleware
        $user->role = $data['role'];
        $user->save();

        return back()->with('success', 'User role updated');
    }
}


