<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    public function index()
    {
        $permissions = Permission::query()->orderBy('name')->get(['id','name','guard_name','created_at']);
        return Inertia::render('admin/permissions/index', [
            'permissions' => $permissions->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'guard_name' => $p->guard_name,
                    'createdAt' => optional($p->created_at)->toDateString(),
                ];
            }),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/permissions/create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255', Rule::unique('permissions','name')->where('guard_name','web')],
        ]);

        Permission::create(['name' => $data['name'], 'guard_name' => 'web']);
        return redirect()->route('admin.permissions.index')->with('success','Permission created');
    }

    public function edit(Permission $permission)
    {
        return Inertia::render('admin/permissions/edit', [
            'permission' => [
                'id' => $permission->id,
                'name' => $permission->name,
            ],
        ]);
    }

    public function update(Request $request, Permission $permission)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255', Rule::unique('permissions','name')->where('guard_name','web')->ignore($permission->id)],
        ]);
        $permission->update(['name' => $data['name']]);
        return redirect()->route('admin.permissions.index')->with('success','Permission updated');
    }

    public function destroy(Permission $permission)
    {
        $permission->delete();
        return back()->with('success','Permission deleted');
    }
}


