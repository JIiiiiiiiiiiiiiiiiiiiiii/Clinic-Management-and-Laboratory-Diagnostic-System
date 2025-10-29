/**
 * Custom hook for comprehensive date and time validation
 * Prevents "Invalid Date" issues across the application
 */

import { useCallback } from 'react';
import { safeFormatDate, safeFormatTime } from '@/utils/dateTime';

export interface DateValidationResult {
    isValid: boolean;
    formattedDate: string;
    formattedTime: string;
    error?: string;
}

export function useDateValidation() {
    /**
     * Validate and format appointment data with comprehensive error handling
     */
    const validateAppointmentData = useCallback((appointment: any): DateValidationResult => {
        try {
            const result: DateValidationResult = {
                isValid: true,
                formattedDate: safeFormatDate(appointment?.appointment_date),
                formattedTime: safeFormatTime(appointment?.appointment_time),
            };

            // Check if any formatting resulted in error states
            if (result.formattedDate === 'Invalid date' || result.formattedTime === 'Invalid time') {
                result.isValid = false;
                result.error = 'Invalid date or time data detected';
            }

            return result;
        } catch (error) {
            console.error('Date validation error:', error);
            return {
                isValid: false,
                formattedDate: 'Invalid date',
                formattedTime: 'Invalid time',
                error: 'Date validation failed'
            };
        }
    }, []);

    /**
     * Validate transaction data with comprehensive error handling
     */
    const validateTransactionData = useCallback((transaction: any): DateValidationResult => {
        try {
            const result: DateValidationResult = {
                isValid: true,
                formattedDate: safeFormatDate(transaction?.transaction_date),
                formattedTime: safeFormatTime(transaction?.transaction_date),
            };

            // Check if any formatting resulted in error states
            if (result.formattedDate === 'Invalid date' || result.formattedTime === 'Invalid time') {
                result.isValid = false;
                result.error = 'Invalid date or time data detected';
            }

            return result;
        } catch (error) {
            console.error('Transaction date validation error:', error);
            return {
                isValid: false,
                formattedDate: 'Invalid date',
                formattedTime: 'Invalid time',
                error: 'Transaction date validation failed'
            };
        }
    }, []);

    /**
     * Validate any date string with comprehensive error handling
     */
    const validateDateString = useCallback((dateString: string | null | undefined): DateValidationResult => {
        try {
            const result: DateValidationResult = {
                isValid: true,
                formattedDate: safeFormatDate(dateString),
                formattedTime: 'N/A',
            };

            if (result.formattedDate === 'Invalid date') {
                result.isValid = false;
                result.error = 'Invalid date string detected';
            }

            return result;
        } catch (error) {
            console.error('Date string validation error:', error);
            return {
                isValid: false,
                formattedDate: 'Invalid date',
                formattedTime: 'N/A',
                error: 'Date string validation failed'
            };
        }
    }, []);

    /**
     * Validate any time string with comprehensive error handling
     */
    const validateTimeString = useCallback((timeString: string | null | undefined): DateValidationResult => {
        try {
            const result: DateValidationResult = {
                isValid: true,
                formattedDate: 'N/A',
                formattedTime: safeFormatTime(timeString),
            };

            if (result.formattedTime === 'Invalid time') {
                result.isValid = false;
                result.error = 'Invalid time string detected';
            }

            return result;
        } catch (error) {
            console.error('Time string validation error:', error);
            return {
                isValid: false,
                formattedDate: 'N/A',
                formattedTime: 'Invalid time',
                error: 'Time string validation failed'
            };
        }
    }, []);

    return {
        validateAppointmentData,
        validateTransactionData,
        validateDateString,
        validateTimeString,
    };
}

