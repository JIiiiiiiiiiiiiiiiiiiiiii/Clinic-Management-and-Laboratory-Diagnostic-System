<?php

namespace App\Rules;

use Carbon\Carbon;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidDate implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (empty($value) || $value === 'null') {
            return; // Allow null/empty values
        }

        try {
            $date = Carbon::parse($value);
            
            if (!$date || $date->year < 1900 || $date->year > 2100) {
                $fail("The {$attribute} must be a valid date between 1900 and 2100.");
            }
        } catch (\Exception $e) {
            $fail("The {$attribute} must be a valid date format.");
        }
    }
}

