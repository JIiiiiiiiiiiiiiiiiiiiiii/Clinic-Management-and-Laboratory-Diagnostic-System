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
            return route('patient.dashboard.simple');
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
}
