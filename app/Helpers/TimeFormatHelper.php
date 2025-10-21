<?php

namespace App\Helpers;

use Carbon\Carbon;

class TimeFormatHelper
{
    /**
     * Convert 12-hour time format to 24-hour format for database storage
     * 
     * @param string $timeString - Time in format "3:30 PM" or "15:30"
     * @return string - Time in format "15:30:00"
     */
    public static function formatTimeForDatabase($timeString)
    {
        if (empty($timeString)) {
            return '09:00:00'; // Default to 9 AM
        }

        try {
            // Try 12-hour format first (3:30 PM)
            if (preg_match('/\d{1,2}:\d{2}\s*(AM|PM)/i', $timeString)) {
                $time = Carbon::createFromFormat('g:i A', $timeString);
                return $time->format('H:i:s');
            }
            
            // Try 24-hour format (15:30)
            if (preg_match('/\d{1,2}:\d{2}/', $timeString)) {
                $time = Carbon::createFromFormat('H:i', $timeString);
                return $time->format('H:i:s');
            }
            
            // Fallback to current time
            return now()->format('H:i:s');
            
        } catch (\Exception $e) {
            \Log::warning("Time format conversion failed for: {$timeString}", ['error' => $e->getMessage()]);
            return '09:00:00'; // Default fallback
        }
    }

    /**
     * Convert database time format to 12-hour format for display
     * 
     * @param string $timeString - Time in format "15:30:00"
     * @return string - Time in format "3:30 PM"
     */
    public static function formatTimeForDisplay($timeString)
    {
        if (empty($timeString)) {
            return 'No time set';
        }

        try {
            $time = Carbon::createFromFormat('H:i:s', $timeString);
            return $time->format('g:i A');
        } catch (\Exception $e) {
            \Log::warning("Time display conversion failed for: {$timeString}", ['error' => $e->getMessage()]);
            return 'Invalid time';
        }
    }

    /**
     * Format datetime for display
     * 
     * @param string $datetime - Datetime string
     * @return string - Formatted datetime
     */
    public static function formatDateTimeForDisplay($datetime)
    {
        if (empty($datetime)) {
            return 'No date/time set';
        }

        try {
            $date = Carbon::parse($datetime);
            return $date->format('M d, Y g:i A');
        } catch (\Exception $e) {
            \Log::warning("DateTime display conversion failed for: {$datetime}", ['error' => $e->getMessage()]);
            return 'Invalid date/time';
        }
    }

    /**
     * Get current time in database format
     * 
     * @return string - Current time in "H:i:s" format
     */
    public static function getCurrentTimeForDatabase()
    {
        return now()->format('H:i:s');
    }

    /**
     * Get current date in database format
     * 
     * @return string - Current date in "Y-m-d" format
     */
    public static function getCurrentDateForDatabase()
    {
        return now()->format('Y-m-d');
    }

    /**
     * Validate time string format
     * 
     * @param string $timeString
     * @return bool
     */
    public static function isValidTime($timeString)
    {
        if (empty($timeString)) {
            return false;
        }

        try {
            Carbon::createFromFormat('H:i:s', $timeString);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get available time slots for appointments
     * 
     * @param string $date - Date in Y-m-d format
     * @param int $specialistId - Specialist ID
     * @return array - Available time slots
     */
    public static function getAvailableTimeSlots($date, $specialistId = null)
    {
        $availableTimes = [];
        $startTime = Carbon::createFromTime(9, 0); // 9 AM
        $endTime = Carbon::createFromTime(17, 0);  // 5 PM

        while ($startTime->lte($endTime)) {
            $timeString = $startTime->format('H:i:s');
            $displayTime = $startTime->format('g:i A');
            
            $availableTimes[] = [
                'value' => $timeString,
                'label' => $displayTime,
                'formatted' => $displayTime
            ];
            
            $startTime->addMinutes(30);
        }

        return $availableTimes;
    }

    /**
     * Fix all time-related issues in the system
     * 
     * @return array - Summary of fixes applied
     */
    public static function fixAllTimeIssues()
    {
        $fixes = [
            'appointments' => 0,
            'visits' => 0,
            'patients' => 0,
            'transactions' => 0
        ];

        try {
            // Fix appointments with invalid times
            $appointments = \App\Models\Appointment::whereNull('appointment_time')
                ->orWhere('appointment_time', '')
                ->orWhere('appointment_time', '00:00:00')
                ->get();

            foreach($appointments as $appointment) {
                $appointment->update(['appointment_time' => self::getCurrentTimeForDatabase()]);
                $fixes['appointments']++;
            }

            // Fix visits with invalid times
            $visits = \App\Models\Visit::whereNull('visit_date_time')->get();
            foreach($visits as $visit) {
                $visit->update(['visit_date_time' => now()]);
                $fixes['visits']++;
            }

            // Fix patients with invalid arrival times
            $patients = \App\Models\Patient::whereNull('arrival_time')->get();
            foreach($patients as $patient) {
                $patient->update([
                    'arrival_time' => self::getCurrentTimeForDatabase(),
                    'time_seen' => self::getCurrentTimeForDatabase()
                ]);
                $fixes['patients']++;
            }

            // Fix transactions with invalid times
            $transactions = \App\Models\BillingTransaction::whereNull('transaction_date')->get();
            foreach($transactions as $transaction) {
                $transaction->update(['transaction_date' => now()]);
                $fixes['transactions']++;
            }

        } catch (\Exception $e) {
            \Log::error("Error fixing time issues: " . $e->getMessage());
        }

        return $fixes;
    }
}
