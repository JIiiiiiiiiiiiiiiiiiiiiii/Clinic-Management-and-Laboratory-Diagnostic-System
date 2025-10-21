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
            return route('patient.dashboard');
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
}
