<?php

namespace App\Rules;

use Carbon\Carbon;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidTime implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (empty($value) || $value === 'null' || $value === '00:00:00') {
            return; // Allow null/empty values
        }

        try {
            $time = Carbon::parse($value);
            
            if (!$time) {
                $fail("The {$attribute} must be a valid time format.");
            }
        } catch (\Exception $e) {
            $fail("The {$attribute} must be a valid time format.");
        }
    }
}

