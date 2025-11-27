<?php

namespace App\Services;

use App\Models\Otp;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class OtpService
{
    /**
     * Generate a 6-digit OTP code
     * Uses cryptographically secure random number generation
     * Ensures code is always 6 digits (100000-999999)
     */
    public function generateCode(): string
    {
        // Use cryptographically secure random_bytes for true randomness
        // Generate 3 random bytes (24 bits) for better distribution
        $randomBytes = random_bytes(3);
        
        // Convert to integer (big-endian, unsigned)
        $randomInt = unpack('N', "\x00" . $randomBytes)[1];
        
        // Ensure we get a 6-digit number (100000 to 999999)
        // This guarantees no leading zeros and proper 6-digit format
        $code = 100000 + ($randomInt % 900000);
        
        // Double-check: ensure it's exactly 6 digits
        $codeString = (string) $code;
        if (strlen($codeString) !== 6) {
            // Fallback: regenerate if somehow not 6 digits
            return $this->generateCode();
        }
        
        return $codeString;
    }

    /**
     * Create and send OTP
     */
    public function createAndSendOtp(string $email, string $type, ?string $ipAddress = null): ?Otp
    {
        // Invalidate any existing OTPs for this email and type
        Otp::forEmailAndType($email, $type)
            ->where('is_used', false)
            ->update(['is_used' => true]);

        // Generate new OTP
        $code = $this->generateCode();
        $expiresAt = Carbon::now()->addMinutes(10); // OTP expires in 10 minutes

        $otp = Otp::create([
            'email' => strtolower(trim($email)),
            'code' => $code,
            'type' => $type,
            'expires_at' => $expiresAt,
            'ip_address' => $ipAddress,
        ]);

        // Send OTP via email
        try {
            $this->sendOtpEmail($email, $code, $type);
            Log::info('OTP email sent successfully', [
                'email' => $email,
                'type' => $type,
                'code' => $code,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send OTP email', [
                'email' => $email,
                'type' => $type,
                'error' => $e->getMessage(),
                'mailer' => config('mail.default'),
                'trace' => $e->getTraceAsString(),
            ]);
            
            // In development, log the OTP code so developers can test
            if (app()->environment('local', 'development')) {
                Log::warning('OTP Email Failed - Code for testing', [
                    'email' => $email,
                    'otp_code' => $code,
                    'type' => $type,
                    'note' => 'Email not configured. Use this code to test: ' . $code,
                ]);
                // In development, we still return the OTP even if email fails
                // This allows testing without full email configuration
            } else {
                // In production, throw exception to ensure emails are sent
                throw new \Exception('Failed to send OTP email. Please check your email configuration.');
            }
        }

        return $otp;
    }

    /**
     * Verify OTP code
     */
    public function verifyOtp(string $email, string $code, string $type): bool
    {
        $otp = Otp::forEmailAndType($email, $type)
            ->valid()
            ->where('code', $code)
            ->first();

        if (!$otp) {
            return false;
        }

        // Mark as verified
        $otp->markAsVerified();
        return true;
    }

    /**
     * Resend OTP (creates a new one)
     */
    public function resendOtp(string $email, string $type, ?string $ipAddress = null): ?Otp
    {
        return $this->createAndSendOtp($email, $type, $ipAddress);
    }

    /**
     * Send OTP email
     */
    protected function sendOtpEmail(string $email, string $code, string $type): void
    {
        try {
            // Use Mailable class for better email formatting
            Mail::to($email)->send(new \App\Mail\OtpMail($code, $type));
            
            // Only log success once (not duplicated in createAndSendOtp)
            // Log::info is already called in createAndSendOtp after successful send
        } catch (\Exception $e) {
            Log::error('Failed to send OTP email in sendOtpEmail', [
                'email' => $email,
                'type' => $type,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            // Re-throw the exception so the calling code knows email failed
            throw $e;
        }
    }

    /**
     * Get the latest valid OTP for email and type
     */
    public function getLatestOtp(string $email, string $type): ?Otp
    {
        return Otp::forEmailAndType($email, $type)
            ->valid()
            ->latest()
            ->first();
    }

    /**
     * Check if user can request new OTP (rate limiting)
     */
    public function canRequestNewOtp(string $email, string $type, int $maxAttempts = 3, int $minutes = 5): bool
    {
        $recentOtps = Otp::forEmailAndType($email, $type)
            ->where('created_at', '>=', Carbon::now()->subMinutes($minutes))
            ->count();

        return $recentOtps < $maxAttempts;
    }
}

