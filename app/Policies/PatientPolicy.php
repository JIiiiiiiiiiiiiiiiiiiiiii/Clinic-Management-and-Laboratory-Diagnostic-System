<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Patient;

class PatientPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin','doctor','nurse','medtech','cashier']);
    }

    public function view(User $user, Patient $patient): bool
    {
        if ($user->isAdmin()) return true;
        if ($user->hasAnyRole(['doctor','nurse','medtech','cashier'])) return true;
        if ($user->isPatient()) {
            return (string) $patient->id === (string) $user->id; // adjust if linking patient->user exists
        }
        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin','doctor','nurse']);
    }

    public function update(User $user, Patient $patient): bool
    {
        if ($user->isAdmin()) return true;
        return $user->hasAnyRole(['doctor','nurse']);
    }

    public function delete(User $user, Patient $patient): bool
    {
        return $user->isAdmin();
    }
}


