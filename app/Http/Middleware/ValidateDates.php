<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateDates
{
    /**
     * Handle an incoming request and validate date fields
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Validate date fields in the request
        $this->validateDateFields($request);

        return $next($request);
    }

    /**
     * Validate date fields in the request
     */
    private function validateDateFields(Request $request): void
    {
        $dateFields = [
            'appointment_date',
            'appointment_time',
            'transaction_date',
            'due_date',
            'created_at',
            'updated_at'
        ];

        foreach ($dateFields as $field) {
            if ($request->has($field) && $request->input($field)) {
                $value = $request->input($field);
                
                // Skip validation for null or empty values
                if (empty($value) || $value === 'null') {
                    continue;
                }

                // Validate date format
                if (str_contains($field, 'date') && !str_contains($field, 'time')) {
                    $this->validateDate($value, $field);
                }

                // Validate time format
                if (str_contains($field, 'time')) {
                    $this->validateTime($value, $field);
                }
            }
        }
    }

    /**
     * Validate date format
     */
    private function validateDate(string $date, string $field): void
    {
        try {
            $parsedDate = \Carbon\Carbon::parse($date);
            
            // Check if date is valid
            if (!$parsedDate || $parsedDate->year < 1900 || $parsedDate->year > 2100) {
                throw new \InvalidArgumentException("Invalid date format for field: {$field}");
            }
        } catch (\Exception $e) {
            throw new \InvalidArgumentException("Invalid date format for field: {$field}. Error: " . $e->getMessage());
        }
    }

    /**
     * Validate time format
     */
    private function validateTime(string $time, string $field): void
    {
        try {
            $parsedTime = \Carbon\Carbon::parse($time);
            
            // Check if time is valid
            if (!$parsedTime) {
                throw new \InvalidArgumentException("Invalid time format for field: {$field}");
            }
        } catch (\Exception $e) {
            throw new \InvalidArgumentException("Invalid time format for field: {$field}. Error: " . $e->getMessage());
        }
    }
}

