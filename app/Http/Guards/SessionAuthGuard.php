<?php

namespace App\Http\Guards;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class SessionAuthGuard implements Guard
{
    protected $user;
    protected $provider;
    protected $request;

    public function __construct(UserProvider $provider, Request $request)
    {
        $this->provider = $provider;
        $this->request = $request;
    }

    public function check(): bool
    {
        return !is_null($this->user());
    }

    public function guest(): bool
    {
        return !$this->check();
    }

    public function user(): ?Authenticatable
    {
        if (!is_null($this->user)) {
            return $this->user;
        }

        // Get user from session
        if (Session::has('auth.user') && Session::get('auth.login')) {
            $this->user = Session::get('auth.user');
        }

        return $this->user;
    }

    public function id()
    {
        $user = $this->user();
        return $user ? $user->getAuthIdentifier() : null;
    }

    public function validate(array $credentials = []): bool
    {
        return false; // We don't validate credentials in this guard
    }

    public function setUser(Authenticatable $user): void
    {
        $this->user = $user;
    }

    public function login(Authenticatable $user, $remember = false): void
    {
        Session::put('auth.user', $user);
        Session::put('auth.login', true);
        $this->user = $user;
    }

    public function logout(): void
    {
        Session::forget('auth.user');
        Session::forget('auth.login');
        $this->user = null;
    }
}
