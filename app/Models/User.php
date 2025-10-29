<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    protected $guard_name = 'session';

    /**
     * Get the guard name for the model.
     */
    public function getGuardName(): string
    {
        return 'session';
    }

    /**
     * Override the guard name for Spatie permissions
     */
    public function getGuardNameAttribute(): string
    {
        return 'session';
    }

    /**
     * Get the guard name for Spatie permissions
     */
    public function getGuardNameForSpatie(): string
    {
        return 'session';
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'role_id',
        'is_active',
        'employee_id',
        'specialization',
        'license_number',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the appropriate redirect path based on role
     */
    public function getRedirectPath(): string
    {
        $mappedRole = $this->getMappedRole();

        if ($mappedRole === 'patient') {
            return route('home');
        }

        // All other roles (staff) go to admin dashboard
        return route('admin.dashboard');
    }

    /**
     * Map existing database roles to new role system
     */
    public function getMappedRole(): string
    {
        $existingRole = $this->role;

        // If the role is already in the correct format, return it directly
        $validRoles = [
            'admin',
            'laboratory_technologist',
            'medtech',
            'cashier',
            'doctor',
            'nurse',
            'patient',
            'hospital_admin',
            'hospital_staff'
        ];

        if (in_array($existingRole, $validRoles)) {
            return $existingRole;
        }

        // Map legacy database roles to new role system (if any exist)
        $roleMap = [
            'Admin' => 'admin',
            'Staff' => 'cashier',
            'Doctor' => 'doctor',
            'LaboratoryTech' => 'laboratory_technologist',
            'Patient' => 'patient',
        ];

        return $roleMap[$existingRole] ?? 'patient';
    }

    /**
     * Check if user has a specific role (using mapped roles)
     */
    public function hasRole(string $role): bool
    {
        return $this->getMappedRole() === $role;
    }

    /**
     * Check if user has any of the specified roles (using mapped roles)
     */
    public function hasAnyRole(array $roles): bool
    {
        $mappedRole = $this->getMappedRole();
        return in_array($mappedRole, $roles);
    }

    /**
     * Check if user is a patient (using mapped roles)
     */
    public function isPatient(): bool
    {
        return $this->getMappedRole() === 'patient';
    }

    /**
     * Check if user is clinic staff (using mapped roles)
     */
    public function isStaff(): bool
    {
        $mappedRole = $this->getMappedRole();
        return in_array($mappedRole, [
            'laboratory_technologist',
            'medtech',
            'cashier',
            'doctor',
            'admin'
        ]);
    }

    /**
     * Check if user is admin (using mapped roles)
     */
    public function isAdmin(): bool
    {
        return $this->getMappedRole() === 'admin';
    }

    // Relationship to patient record
    public function patient()
    {
        return $this->hasOne(Patient::class);
    }

    /**
     * Get the user's role
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Check if user has a specific permission using role-based logic
     */
    public function hasModulePermission(string $module, string $action): bool
    {
        if ($this->isAdmin()) {
            return true; // Admin has all permissions
        }

        $userRole = $this->getMappedRole();
        
        // Define role-based permissions
        switch ($userRole) {
            case 'doctor':
                if ($module === 'patients') {
                    return in_array($action, ['create', 'read', 'update', 'delete', 'transfer']);
                }
                if ($module === 'laboratory') {
                    return in_array($action, ['create', 'read', 'update', 'delete']);
                }
                if ($module === 'reports') {
                    return in_array($action, ['read', 'export']); // Full access to all reports including financial
                }
                if ($module === 'appointments') {
                    return in_array($action, ['create', 'read', 'update', 'delete']);
                }
                if ($module === 'inventory') {
                    return in_array($action, ['create', 'read', 'update', 'delete']); // Full access for doctors
                }
                return false;
            case 'nurse':
                if ($module === 'patients') {
                    return in_array($action, ['create', 'read', 'update', 'delete', 'transfer']);
                }
                if ($module === 'appointments') {
                    return in_array($action, ['create', 'read', 'update', 'delete']); // Full access to all appointment modules
                }
                if ($module === 'visits') {
                    return in_array($action, ['create', 'read', 'update', 'delete']); // Grant access to visits
                }
                if ($module === 'inventory') {
                    return in_array($action, ['create', 'read', 'update', 'delete']);
                }
                if ($module === 'reports') {
                    return in_array($action, ['read', 'export']); // Full access to all reports
                }
                return false;
            case 'medtech':
                if ($module === 'laboratory') {
                    return in_array($action, ['create', 'read', 'update', 'delete']);
                }
                if ($module === 'inventory') {
                    return in_array($action, ['create', 'read', 'update', 'delete']);
                }
                if ($module === 'reports') {
                    return in_array($action, ['read', 'export']); // Full access to all reports including financial
                }
                if ($module === 'patients') {
                    return in_array($action, ['read']); // Read-only access for medtech
                }
                if ($module === 'visits') {
                    return in_array($action, ['create', 'read', 'update', 'delete']); // Grant access to visits
                }
                return false;
            case 'cashier':
                if ($module === 'billing') {
                    return in_array($action, ['create', 'read', 'update', 'delete']);
                }
                if ($module === 'reports') {
                    return in_array($action, ['read', 'export']);
                }
                return false;
            case 'hospital_staff':
            case 'hospital_admin':
                if ($module === 'patients') {
                    return in_array($action, ['create', 'read', 'update', 'delete', 'transfer']); // Full access to Patient Management
                }
                if ($module === 'reports') {
                    return in_array($action, ['read', 'export']); // Full access to Reports
                }
                return false;
            case 'patient':
                if ($module === 'patients') {
                    return in_array($action, ['read']); // Read-only access to own data
                }
                return false;
            default:
                return false;
        }
    }

    /**
     * Check if user can access a module
     */
    public function canAccessModule(string $module): bool
    {
        if ($this->isAdmin()) {
            return true; // Admin has access to all modules
        }

        $userRole = $this->getMappedRole();
        
        // Define role-based module access
        switch ($userRole) {
            case 'doctor':
                return in_array($module, ['patients', 'laboratory', 'reports', 'appointments', 'inventory', 'visits']);
            case 'nurse':
                return in_array($module, ['patients', 'appointments', 'inventory', 'reports', 'visits']); // Full access to all appointment modules
            case 'medtech':
                return in_array($module, ['laboratory', 'inventory', 'reports', 'patients', 'visits']);
            case 'cashier':
                return in_array($module, ['billing', 'reports']);
            case 'hospital_staff':
            case 'hospital_admin':
                return in_array($module, ['patients', 'reports', 'billing', 'inventory']);
            case 'patient':
                return in_array($module, ['patients']);
            default:
                return false;
        }
    }

    /**
     * Get user's permissions for a specific module
     */
    public function getModulePermissions(string $module): array
    {
        if ($this->isAdmin()) {
            return ['create', 'read', 'update', 'delete', 'export', 'transfer'];
        }

        $userRole = $this->getMappedRole();
        
        // Define role-based permissions for each module
        switch ($userRole) {
            case 'doctor':
                if ($module === 'patients') {
                    return ['create', 'read', 'update', 'delete', 'transfer'];
                }
                if ($module === 'laboratory') {
                    return ['create', 'read', 'update', 'delete'];
                }
                if ($module === 'reports') {
                    return ['read', 'export'];
                }
                if ($module === 'appointments') {
                    return ['create', 'read', 'update', 'delete'];
                }
                if ($module === 'inventory') {
                    return ['create', 'read', 'update', 'delete']; // Full access for doctors
                }
                return [];
            case 'nurse':
                if ($module === 'patients') {
                    return ['create', 'read', 'update', 'delete', 'transfer'];
                }
                if ($module === 'appointments') {
                    return ['create', 'read', 'update', 'delete']; // Full access to all appointment modules
                }
                if ($module === 'visits') {
                    return ['create', 'read', 'update', 'delete']; // Grant access to visits
                }
                if ($module === 'inventory') {
                    return ['create', 'read', 'update', 'delete'];
                }
                if ($module === 'reports') {
                    return ['read', 'export']; // Full access to all reports
                }
                return [];
            case 'medtech':
                if ($module === 'laboratory') {
                    return ['create', 'read', 'update', 'delete'];
                }
                if ($module === 'inventory') {
                    return ['create', 'read', 'update', 'delete'];
                }
                if ($module === 'reports') {
                    return ['read', 'export']; // Full access to all reports including financial
                }
                if ($module === 'patients') {
                    return ['read']; // Read-only access for medtech
                }
                if ($module === 'visits') {
                    return ['create', 'read', 'update', 'delete']; // Grant access to visits
                }
                return [];
            case 'cashier':
                if ($module === 'billing') {
                    return ['create', 'read', 'update', 'delete'];
                }
                if ($module === 'reports') {
                    return ['read', 'export'];
                }
                return [];
            case 'hospital_staff':
            case 'hospital_admin':
                if ($module === 'patients') {
                    return ['create', 'read', 'update', 'delete', 'transfer']; // Full access to Patient Management
                }
                if ($module === 'reports') {
                    return ['read', 'export']; // Full access to Reports
                }
                if ($module === 'billing') {
                    return ['read', 'export']; // Read access to billing for financial reports
                }
                if ($module === 'inventory') {
                    return ['create', 'read', 'update', 'delete']; // Full access to inventory management
                }
                return [];
            case 'patient':
                if ($module === 'patients') {
                    return ['read']; // Read-only access to own data
                }
                return [];
            default:
                return [];
        }
    }
}
