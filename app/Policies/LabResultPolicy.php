<?php

namespace App\Policies;

use App\Models\User;
use App\Models\LabResult;

class LabResultPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin','doctor','medtech','nurse']);
    }

    public function view(User $user, LabResult $result): bool
    {
        if ($user->isAdmin()) return true;
        return $user->hasAnyRole(['doctor','medtech','nurse']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin','medtech']);
    }

    public function update(User $user, LabResult $result): bool
    {
        if ($user->isAdmin()) return true;
        return $user->hasAnyRole(['medtech']);
    }

    public function verify(User $user, LabResult $result): bool
    {
        if ($user->isAdmin()) return true;
        return $user->hasAnyRole(['doctor']);
    }
}


