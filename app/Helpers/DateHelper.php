<?php

namespace App\Helpers;

use Carbon\Carbon;

class DateHelper
{
    /**
     * Safely format date for display
     */
    public static function safeFormatDate(?string $dateString): string
    {
        if (empty($dateString) || $dateString === 'null' || $dateString === '0000-00-00') {
            return 'No date set';
        }

        try {
            $date = Carbon::parse($dateString);
            
            if (!$date || $date->year < 1900 || $date->year > 2100) {
                return 'Invalid date';
            }

            return $date->format('M j, Y');
        } catch (\Exception $e) {
            \Log::warning('Date formatting failed', [
                'date' => $dateString,
                'error' => $e->getMessage()
            ]);
            return 'Invalid date';
        }
    }

    /**
     * Safely format time for display
     */
    public static function safeFormatTime(?string $timeString): string
    {
        if (empty($timeString) || $timeString === 'null' || $timeString === '00:00:00') {
            return 'No time set';
        }

        try {
            $time = Carbon::parse($timeString);
            
            if (!$time) {
                return 'Invalid time';
            }

            return $time->format('g:i A');
        } catch (\Exception $e) {
            \Log::warning('Time formatting failed', [
                'time' => $timeString,
                'error' => $e->getMessage()
            ]);
            return 'Invalid time';
        }
    }

    /**
     * Safely format datetime for display
     */
    public static function safeFormatDateTime(?string $dateTimeString): string
    {
        if (empty($dateTimeString) || $dateTimeString === 'null') {
            return 'No date/time set';
        }

        try {
            $dateTime = Carbon::parse($dateTimeString);
            
            if (!$dateTime || $dateTime->year < 1900 || $dateTime->year > 2100) {
                return 'Invalid date/time';
            }

            return $dateTime->format('M j, Y g:i A');
        } catch (\Exception $e) {
            \Log::warning('DateTime formatting failed', [
                'datetime' => $dateTimeString,
                'error' => $e->getMessage()
            ]);
            return 'Invalid date/time';
        }
    }

    /**
     * Validate date string
     */
    public static function isValidDate(?string $dateString): bool
    {
        if (empty($dateString) || $dateString === 'null' || $dateString === '0000-00-00') {
            return false;
        }

        try {
            $date = Carbon::parse($dateString);
            return $date && $date->year >= 1900 && $date->year <= 2100;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Validate time string
     */
    public static function isValidTime(?string $timeString): bool
    {
        if (empty($timeString) || $timeString === 'null' || $timeString === '00:00:00') {
            return false;
        }

        try {
            $time = Carbon::parse($timeString);
            return $time !== false;
        } catch (\Exception $e) {
            return false;
        }
    }
}

