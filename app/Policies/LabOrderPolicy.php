<?php

namespace App\Policies;

use App\Models\User;
use App\Models\LabOrder;

class LabOrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin','doctor','medtech','nurse']);
    }

    public function view(User $user, LabOrder $order): bool
    {
        if ($user->isAdmin()) return true;
        return $user->hasAnyRole(['doctor','medtech','nurse']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin','doctor']);
    }

    public function update(User $user, LabOrder $order): bool
    {
        if ($user->isAdmin()) return true;
        return $user->hasAnyRole(['doctor']);
    }

    public function delete(User $user, LabOrder $order): bool
    {
        return $user->isAdmin();
    }
}


