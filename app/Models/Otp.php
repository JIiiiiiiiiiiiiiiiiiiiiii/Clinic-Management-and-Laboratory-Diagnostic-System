<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Otp extends Model
{
    protected $fillable = [
        'email',
        'code',
        'type',
        'expires_at',
        'verified_at',
        'is_used',
        'ip_address',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'verified_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    /**
     * Check if OTP is valid (not expired and not used)
     */
    public function isValid(): bool
    {
        return !$this->is_used 
            && $this->expires_at->isFuture()
            && is_null($this->verified_at);
    }

    /**
     * Mark OTP as verified
     */
    public function markAsVerified(): void
    {
        $this->update([
            'verified_at' => now(),
            'is_used' => true,
        ]);
    }

    /**
     * Scope to get valid OTPs
     */
    public function scopeValid($query)
    {
        return $query->where('is_used', false)
            ->where('expires_at', '>', now())
            ->whereNull('verified_at');
    }

    /**
     * Scope to get OTPs by email and type
     */
    public function scopeForEmailAndType($query, string $email, string $type)
    {
        return $query->where('email', $email)
            ->where('type', $type);
    }

    /**
     * Clean up expired OTPs
     */
    public static function cleanupExpired(): int
    {
        return self::where('expires_at', '<', now())
            ->orWhere(function ($query) {
                $query->where('is_used', true)
                    ->where('created_at', '<', now()->subDays(1));
            })
            ->delete();
    }
}
