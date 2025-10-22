<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DateValidationService
{
    /**
     * Validate and sanitize date string
     */
    public static function validateDate(?string $dateString): ?string
    {
        if (empty($dateString) || $dateString === 'null' || $dateString === '0000-00-00') {
            return null;
        }

        try {
            $date = Carbon::parse($dateString);
            
            // Check if date is valid and within reasonable range
            if (!$date || $date->year < 1900 || $date->year > 2100) {
                Log::warning('Invalid date detected', ['date' => $dateString]);
                return null;
            }

            return $date->format('Y-m-d');
        } catch (\Exception $e) {
            Log::warning('Date parsing failed', [
                'date' => $dateString,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Validate and sanitize time string
     */
    public static function validateTime(?string $timeString): ?string
    {
        if (empty($timeString) || $timeString === 'null' || $timeString === '00:00:00') {
            return null;
        }

        try {
            $time = Carbon::parse($timeString);
            
            if (!$time) {
                Log::warning('Invalid time detected', ['time' => $timeString]);
                return null;
            }

            return $time->format('H:i:s');
        } catch (\Exception $e) {
            Log::warning('Time parsing failed', [
                'time' => $timeString,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Validate appointment data
     */
    public static function validateAppointmentData(array $data): array
    {
        $validated = $data;

        // Validate appointment_date
        if (isset($data['appointment_date'])) {
            $validated['appointment_date'] = self::validateDate($data['appointment_date']);
        }

        // Validate appointment_time
        if (isset($data['appointment_time'])) {
            $validated['appointment_time'] = self::validateTime($data['appointment_time']);
        }

        return $validated;
    }

    /**
     * Validate transaction data
     */
    public static function validateTransactionData(array $data): array
    {
        $validated = $data;

        // Validate transaction_date
        if (isset($data['transaction_date'])) {
            $validated['transaction_date'] = self::validateDate($data['transaction_date']);
        }

        // Validate due_date
        if (isset($data['due_date'])) {
            $validated['due_date'] = self::validateDate($data['due_date']);
        }

        return $validated;
    }

    /**
     * Get safe date for display
     */
    public static function getSafeDate(?string $dateString): string
    {
        if (empty($dateString)) {
            return 'No date set';
        }

        try {
            $date = Carbon::parse($dateString);
            
            if (!$date || $date->year < 1900 || $date->year > 2100) {
                return 'Invalid date';
            }

            return $date->format('M j, Y');
        } catch (\Exception $e) {
            Log::warning('Date display formatting failed', [
                'date' => $dateString,
                'error' => $e->getMessage()
            ]);
            return 'Invalid date';
        }
    }

    /**
     * Get safe time for display
     */
    public static function getSafeTime(?string $timeString): string
    {
        if (empty($timeString)) {
            return 'No time set';
        }

        try {
            $time = Carbon::parse($timeString);
            
            if (!$time) {
                return 'Invalid time';
            }

            return $time->format('g:i A');
        } catch (\Exception $e) {
            Log::warning('Time display formatting failed', [
                'time' => $timeString,
                'error' => $e->getMessage()
            ]);
            return 'Invalid time';
        }
    }
}

