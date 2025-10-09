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
        $this->id = 1;
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
            return route('patient.dashboard');
        }
        return route('admin.dashboard');
    }
}
