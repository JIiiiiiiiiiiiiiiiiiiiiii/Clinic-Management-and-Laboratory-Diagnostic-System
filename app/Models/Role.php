<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'permissions',
        'is_active'
    ];

    protected $casts = [
        'permissions' => 'array',
        'is_active' => 'boolean'
    ];

    /**
     * Get users with this role
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Check if role has a specific permission
     */
    public function hasPermission(string $module, string $action): bool
    {
        if (!$this->permissions) {
            return false;
        }

        return isset($this->permissions[$module]) && 
               in_array($action, $this->permissions[$module]);
    }

    /**
     * Check if role can access a module
     */
    public function canAccessModule(string $module): bool
    {
        if (!$this->permissions) {
            return false;
        }

        return isset($this->permissions[$module]);
    }

    /**
     * Get all permissions for a module
     */
    public function getModulePermissions(string $module): array
    {
        if (!$this->permissions || !isset($this->permissions[$module])) {
            return [];
        }

        return $this->permissions[$module];
    }

    /**
     * Scope for active roles
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}