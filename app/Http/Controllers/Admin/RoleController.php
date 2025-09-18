<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $roles = Role::withCount('users')
            ->with('permissions')
            ->orderBy('name')
            ->get()
            ->map(function (Role $role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'description' => '',
                    'userCount' => $role->users_count ?? 0,
                    'permissions' => $role->permissions->pluck('name')->values()->all(),
                    'isActive' => true,
                    'createdAt' => optional($role->created_at)->toDateString(),
                ];
            });

        $users = User::query()
            ->select(['id','name','email'])
            ->with(['roles:id,name','permissions:id,name'])
            ->latest('id')
            ->limit(20)
            ->get()
            ->map(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => ($user->roles->first()->name ?? 'Unassigned'),
                    'status' => $user->is_active ? 'Active' : 'Inactive',
                    'lastLogin' => method_exists($user, 'getAttribute') ? (string) ($user->getAttribute('last_login_at') ?? '') : '',
                    'permissions' => $user->permissions->pluck('name')->implode(', '),
                ];
            });

        return Inertia::render('admin/roles/index', [
            'roles' => $roles,
            'users' => $users,
            'totalUsers' => User::count(),
            'activeUsers' => User::where('is_active', true)->count(),
            'systemPermissions' => Permission::count(),
            'availablePermissions' => Permission::orderBy('name')->pluck('name'),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/roles/create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255', Rule::unique('roles','name')->where('guard_name','web')],
            'permissions' => ['sometimes','array'],
            'permissions.*' => ['string', Rule::exists('permissions','name')->where('guard_name','web')],
        ]);

        $role = Role::create([
            'name' => $data['name'],
            'guard_name' => 'web',
        ]);

        if (array_key_exists('permissions', $data)) {
            $role->syncPermissions($data['permissions']);
        }

        return redirect()->route('admin.roles.index')->with('success','Role created');
    }

    public function edit(Role $role)
    {
        $allPermissions = Permission::orderBy('name')->pluck('name');
        $assigned = $role->permissions()->pluck('name');
        return Inertia::render('admin/roles/edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $assigned,
            ],
            'availablePermissions' => $allPermissions,
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255', Rule::unique('roles','name')->where('guard_name','web')->ignore($role->id)],
            'permissions' => ['sometimes','array'],
            'permissions.*' => ['string', Rule::exists('permissions','name')->where('guard_name','web')],
        ]);

        $role->update(['name' => $data['name']]);

        if (array_key_exists('permissions', $data)) {
            $role->syncPermissions($data['permissions']);
        }

        return redirect()->route('admin.roles.index')->with('success','Role updated');
    }

    public function destroy(Role $role)
    {
        if ($role->name === 'admin') {
            return back()->with('error','Cannot delete admin role');
        }
        $role->delete();
        return back()->with('success','Role deleted');
    }
}


