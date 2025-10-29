<?php

namespace App\Helpers;

class ScheduleHelper
{
    public static function formatScheduleData($scheduleData)
    {
        $defaultSchedule = [
            'Monday' => ['start' => '8:00 AM', 'end' => '5:00 PM'],
            'Tuesday' => ['start' => '8:00 AM', 'end' => '5:00 PM'],
            'Wednesday' => ['start' => '8:00 AM', 'end' => '5:00 PM'],
            'Thursday' => ['start' => '8:00 AM', 'end' => '5:00 PM'],
            'Friday' => ['start' => '8:00 AM', 'end' => '5:00 PM'],
            'Saturday' => ['start' => 'Not Available', 'end' => 'Not Available'],
            'Sunday' => ['start' => 'Not Available', 'end' => 'Not Available']
        ];
        
        // If no schedule data, return default
        if (empty($scheduleData) || !is_array($scheduleData)) {
            return $defaultSchedule;
        }
        
        $formattedSchedule = [];
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        foreach ($days as $day) {
            $dayKey = strtolower($day);
            
            if (isset($scheduleData[$dayKey]) && is_array($scheduleData[$dayKey]) && !empty($scheduleData[$dayKey])) {
                $timeSlots = $scheduleData[$dayKey];
                
                // Handle different schedule data formats
                if (is_array($timeSlots) && count($timeSlots) > 0) {
                    // If it's an array of time slots, calculate start and end times
                    if (is_string($timeSlots[0])) {
                        // Format: ['08:00', '09:00', '10:00', ...]
                        $startTime = min($timeSlots);
                        $endTime = max($timeSlots);
                        
                        // Convert to 12-hour format
                        $formattedSchedule[$day] = [
                            'start' => self::convertTo12Hour($startTime),
                            'end' => self::convertTo12Hour($endTime)
                        ];
                    } elseif (is_array($timeSlots[0]) && isset($timeSlots[0]['start_time']) && isset($timeSlots[0]['end_time'])) {
                        // Format: [{'start_time': '08:00', 'end_time': '17:00'}]
                        $formattedSchedule[$day] = [
                            'start' => $timeSlots[0]['start_time'],
                            'end' => $timeSlots[0]['end_time']
                        ];
                    } else {
                        // Fallback to default
                        $formattedSchedule[$day] = $defaultSchedule[$day];
                    }
                } else {
                    // No slots for this day
                    $formattedSchedule[$day] = ['start' => 'Not Available', 'end' => 'Not Available'];
                }
            } else {
                // Use default schedule for this day
                $formattedSchedule[$day] = $defaultSchedule[$day];
            }
        }
        
        return $formattedSchedule;
    }
    
    /**
     * Convert 24-hour time to 12-hour format
     */
    private static function convertTo12Hour($time24)
    {
        if (empty($time24)) return '8:00 AM';
        
        // If already in 12-hour format, return as is
        if (strpos($time24, 'AM') !== false || strpos($time24, 'PM') !== false) {
            return $time24;
        }
        
        // Convert from 24-hour to 12-hour format
        $time = \Carbon\Carbon::createFromFormat('H:i', $time24);
        return $time->format('g:i A');
    }
}
