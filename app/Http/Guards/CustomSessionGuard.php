<?php

namespace App\Http\Guards;

use Illuminate\Auth\SessionGuard;
use Illuminate\Contracts\Auth\Authenticatable;

class CustomSessionGuard extends SessionGuard
{
    /**
     * Get the currently authenticated user.
     */
    public function user(): ?Authenticatable
    {
        if ($this->loggedOut) {
            return null;
        }

        if (! is_null($this->user)) {
            return $this->user;
        }

        $id = $this->session->get($this->getName());

        if (! is_null($id) && $this->user = $this->retrieveUserFromSession($id)) {
            $this->fireAuthenticatedEvent($this->user);
        }

        if (is_null($this->user) && ! is_null($recaller = $this->recaller())) {
            $this->user = $this->userFromRecaller($recaller);

            if ($this->user) {
                $this->updateSession($this->user->getAuthIdentifier());
                $this->fireLoginEvent($this->user, true);
            }
        }

        return $this->user;
    }

    /**
     * Retrieve user from session (custom implementation)
     */
    protected function retrieveUserFromSession($id): ?Authenticatable
    {
        $user = $this->session->get('auth.user');
        if ($user && $this->session->get('auth.login')) {
            return $user;
        }
        return null;
    }
}


