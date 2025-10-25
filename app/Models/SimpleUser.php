<?php

namespace App\Models;

use Illuminate\Contracts\Auth\Authenticatable;

class SimpleUser implements Authenticatable
{
    public $id;
    public $email;
    public $role;
    public $name;
    public $remember_token;

    public function __construct($email, $role)
    {
        // Use the actual user ID from database for patient@clinic.com
        if ($email === 'patient@clinic.com') {
            $this->id = 6; // Match the patient record's user_id
        } else {
            $this->id = 1; // Default for other users
        }
        $this->email = $email;
        $this->role = $role;
        $this->name = ucfirst($role) . ' User';
        $this->remember_token = null;
    }

    public function getAuthIdentifierName(): string
    {
        return 'id';
    }

    public function getAuthIdentifier()
    {
        return $this->id;
    }

    public function getAuthPassword(): string
    {
        return '';
    }

    public function getAuthPasswordName(): string
    {
        return 'password';
    }

    public function getRememberToken(): ?string
    {
        return $this->remember_token;
    }

    public function setRememberToken($value): void
    {
        $this->remember_token = $value;
    }

    public function getRememberTokenName(): string
    {
        return 'remember_token';
    }

    public function getMappedRole(): string
    {
        return $this->role;
    }

    public function getRedirectPath(): string
    {
        if ($this->role === 'patient') {
            return route('home');
        }
        return route('admin.dashboard');
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user has any of the specified roles
     */
    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles);
    }

    /**
     * Get all permissions for the user (compatible with Spatie)
     */
    public function getAllPermissions()
    {
        // Return a collection-like object that has pluck method
        return new class($this->role) {
            private $role;
            
            public function __construct($role)
            {
                $this->role = $role;
            }
            
            public function pluck($key)
            {
                // Return permissions based on role
                $permissions = $this->getRolePermissions($this->role);
                return collect($permissions);
            }
            
            private function getRolePermissions($role)
            {
                $rolePermissions = [
                    'admin' => [
                        'patients.create', 'patients.read', 'patients.update', 'patients.delete',
                        'appointments.create', 'appointments.read', 'appointments.update', 'appointments.delete',
                        'laboratory.create', 'laboratory.read', 'laboratory.update', 'laboratory.delete',
                        'inventory.create', 'inventory.read', 'inventory.update', 'inventory.delete',
                        'billing.create', 'billing.read', 'billing.update', 'billing.delete',
                        'reports.read', 'reports.export',
                        'settings.read', 'settings.update',
                        'users.create', 'users.read', 'users.update', 'users.delete',
                    ],
                    'doctor' => [
                        'patients.read', 'patients.update',
                        'appointments.create', 'appointments.read', 'appointments.update',
                        'laboratory.read',
                        'reports.read',
                    ],
                    'nurse' => [
                        'patients.create', 'patients.read', 'patients.update',
                        'appointments.create', 'appointments.read', 'appointments.update',
                        'inventory.read',
                    ],
                    'medtech' => [
                        'laboratory.create', 'laboratory.read', 'laboratory.update',
                        'inventory.read',
                        'reports.read', 'reports.export',
                    ],
                    'cashier' => [
                        'billing.create', 'billing.read', 'billing.update',
                        'reports.read', 'reports.export',
                    ],
                    'hospital_staff' => [
                        'patients.read',
                        'reports.read', 'reports.export',
                    ],
                    'patient' => [
                        'patients.read',
                    ],
                ];
                
                return $rolePermissions[$role] ?? [];
            }
        };
    }

    /**
     * Check if user has a specific permission (compatible with Spatie)
     */
    public function hasPermissionTo(string $permission): bool
    {
        $permissions = $this->getAllPermissions()->pluck('name')->toArray();
        return in_array($permission, $permissions);
    }

    /**
     * Check if user can access a module
     */
    public function canAccessModule(string $module): bool
    {
        if ($this->role === 'admin') {
            return true; // Admin has access to all modules
        }

        // Check if user has any permission for this module
        $permissions = [
            $module . '.create',
            $module . '.read',
            $module . '.update',
            $module . '.delete',
        ];

        foreach ($permissions as $permission) {
            if ($this->hasPermissionTo($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user has a specific module permission
     */
    public function hasModulePermission(string $module, string $action): bool
    {
        if ($this->role === 'admin') {
            return true; // Admin has all permissions
        }

        $permission = $module . '.' . $action;
        return $this->hasPermissionTo($permission);
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
