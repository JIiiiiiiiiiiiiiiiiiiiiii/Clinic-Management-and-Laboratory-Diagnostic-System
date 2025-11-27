/**
 * Utility functions for date and time formatting
 */

/**
 * Format appointment time to a readable time string
 * @param timeString - The time string from the database
 * @returns Formatted time string or fallback text
 */
export function formatAppointmentTime(timeString: string | null | undefined): string {
    if (!timeString) {
        return 'No time set';
    }
    
    try {
        // Handle different time formats
        if (timeString.includes('T')) {
            // Handle datetime strings (ISO format)
            const timePart = timeString.split('T')[1];
            if (timePart) {
                const time = new Date(`2000-01-01T${timePart}`);
                return isNaN(time.getTime()) ? 'Invalid time' : time.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                });
            }
            return 'Invalid time';
        } else if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
            // Handle time strings (HH:MM:SS)
            const [hours, minutes] = timeString.split(':');
            const time = new Date(`2000-01-01T${hours}:${minutes}:00`);
            return isNaN(time.getTime()) ? 'Invalid time' : time.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
        } else if (timeString.match(/^\d{2}:\d{2}$/)) {
            // Handle time strings (HH:MM)
            const time = new Date(`2000-01-01T${timeString}:00`);
            return isNaN(time.getTime()) ? 'Invalid time' : time.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
        } else {
            // Try to parse as a general datetime
            const date = new Date(timeString);
            if (isNaN(date.getTime())) {
                return 'Invalid time';
            }
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
        }
    } catch (error) {
        console.error('Error formatting appointment time:', error);
        return 'Invalid time';
    }
}

/**
 * Format time for database storage (12-hour to 24-hour conversion)
 * @param timeString - Time in format "3:30 PM"
 * @returns Time in format "15:30:00"
 */
export function formatTimeForDatabase(timeString: string): string {
    if (!timeString) {
        return '09:00:00'; // Default to 9 AM
    }
    
    try {
        // Handle 12-hour format (3:30 PM)
        if (timeString.match(/\d{1,2}:\d{2}\s*(AM|PM)/i)) {
            const date = new Date(`2000-01-01 ${timeString}`);
            return date.toTimeString().slice(0, 8); // Get HH:MM:SS part
        }
        
        // Handle 24-hour format (15:30)
        if (timeString.match(/^\d{1,2}:\d{2}$/)) {
            return `${timeString}:00`;
        }
        
        // Return as-is if already in correct format
        return timeString;
    } catch (error) {
        console.error('Error formatting time for database:', error);
        return '09:00:00'; // Default fallback
    }
}

/**
 * Format datetime for display
 * @param datetime - Datetime string
 * @returns Formatted datetime string
 */
export function formatDateTimeForDisplay(datetime: string | null | undefined): string {
    if (!datetime) {
        return 'No date/time set';
    }
    
    try {
        const date = new Date(datetime);
        if (isNaN(date.getTime())) {
            return 'Invalid date/time';
        }
        
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error('Error formatting datetime:', error);
        return 'Invalid date/time';
    }
}

/**
 * Get current time in database format
 * @returns Current time in "HH:MM:SS" format
 */
export function getCurrentTimeForDatabase(): string {
    const now = new Date();
    return now.toTimeString().slice(0, 8);
}

/**
 * Get current date in database format
 * @returns Current date in "YYYY-MM-DD" format
 */
export function getCurrentDateForDatabase(): string {
    const now = new Date();
    return now.toISOString().slice(0, 10);
}

/**
 * Validate time string format
 * @param timeString - Time string to validate
 * @returns True if valid time format
 */
export function isValidTime(timeString: string): boolean {
    if (!timeString) {
        return false;
    }
    
    try {
        const date = new Date(`2000-01-01 ${timeString}`);
        return !isNaN(date.getTime());
    } catch (error) {
        return false;
    }
}

/**
 * Format appointment date to a readable date string
 * @param dateString - The date string from the database
 * @returns Formatted date string or fallback text
 */
export function formatAppointmentDate(dateString: string | null | undefined): string {
    if (!dateString) {
        return 'No date set';
    }
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting appointment date:', error);
        return 'Invalid date';
    }
}

/**
 * Safely format a date string with comprehensive validation and error handling
 * @param dateString - The date string from the database
 * @returns Formatted date string or fallback text
 */
export function safeFormatDate(dateString: string | null | undefined): string {
    // Handle null, undefined, or empty values
    if (!dateString || dateString.trim() === '') {
        return 'No date set';
    }
    
    try {
        // Pre-validate the string format
        const trimmedDate = dateString.trim();
        
        // Check for common invalid patterns
        if (trimmedDate === '0000-00-00' || trimmedDate === '0000-00-00 00:00:00') {
            return 'No date set';
        }
        
        // Create date object
        const date = new Date(trimmedDate);
        
        // Validate the date
        if (isNaN(date.getTime())) {
            console.warn('Invalid date string detected:', dateString);
            return 'Invalid date';
        }
        
        // Additional validation for reasonable date ranges
        const year = date.getFullYear();
        if (year < 1900 || year > 2100) {
            console.warn('Date out of reasonable range:', dateString);
            return 'Invalid date';
        }
        
        return date.toLocaleDateString();
    } catch (error) {
        console.error('Error formatting date:', error, 'Input:', dateString);
        return 'Invalid date';
    }
}

/**
 * Safely format a time string with comprehensive validation and error handling
 * @param timeString - The time string from the database
 * @returns Formatted time string or fallback text
 */
export function safeFormatTime(timeString: string | null | undefined): string {
    // Handle null, undefined, or empty values
    if (!timeString || timeString.trim() === '') {
        return 'No time set';
    }
    
    try {
        const trimmedTime = timeString.trim();
        
        // Check for common invalid patterns
        if (trimmedTime === '00:00:00' || trimmedTime === '00:00') {
            return 'No time set';
        }
        
        // Handle different time formats with strict validation
        // Handle datetime strings with space (e.g., "2025-11-21 08:00:00")
        if (trimmedTime.includes(' ') && !trimmedTime.includes('T')) {
            try {
                // Convert "YYYY-MM-DD HH:MM:SS" to ISO format
                const dateStr = trimmedTime.replace(' ', 'T');
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) {
                    console.warn('Invalid datetime format:', timeString);
                    return 'Invalid time';
                }
                return date.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                });
            } catch (error) {
                console.warn('Error parsing datetime:', timeString, error);
                return 'Invalid time';
            }
        }
        
        if (trimmedTime.includes('T')) {
            const timePart = trimmedTime.split('T')[1];
            if (timePart) {
                const time = new Date(`2000-01-01T${timePart}`);
                if (isNaN(time.getTime())) {
                    console.warn('Invalid time string detected:', timeString);
                    return 'Invalid time';
                }
                return time.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                });
            }
            return 'Invalid time';
        } else if (trimmedTime.match(/^\d{2}:\d{2}:\d{2}$/)) {
            const [hours, minutes] = trimmedTime.split(':');
            const hourNum = parseInt(hours);
            const minuteNum = parseInt(minutes);
            
            // Validate time ranges
            if (hourNum < 0 || hourNum > 23 || minuteNum < 0 || minuteNum > 59) {
                console.warn('Time out of valid range:', timeString);
                return 'Invalid time';
            }
            
            const time = new Date(`2000-01-01T${hours}:${minutes}:00`);
            return isNaN(time.getTime()) ? 'Invalid time' : time.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
        } else if (trimmedTime.match(/^\d{2}:\d{2}$/)) {
            const [hours, minutes] = trimmedTime.split(':');
            const hourNum = parseInt(hours);
            const minuteNum = parseInt(minutes);
            
            // Validate time ranges
            if (hourNum < 0 || hourNum > 23 || minuteNum < 0 || minuteNum > 59) {
                console.warn('Time out of valid range:', timeString);
                return 'Invalid time';
            }
            
            const time = new Date(`2000-01-01T${trimmedTime}:00`);
            return isNaN(time.getTime()) ? 'Invalid time' : time.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
        } else {
            // Try to parse as general time format
            const time = new Date(`2000-01-01T${trimmedTime}`);
            if (isNaN(time.getTime())) {
                console.warn('Invalid time format:', timeString);
                return 'Invalid time';
            }
            return time.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
        }
    } catch (error) {
        console.error('Error formatting time:', error, 'Input:', timeString);
        return 'Invalid time';
    }
}

/**
 * Format appointment date to a short date string
 * @param dateString - The date string from the database
 * @returns Short formatted date string or fallback text
 */
export function formatAppointmentDateShort(dateString: string | null | undefined): string {
    if (!dateString) {
        return 'No date set';
    }
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }
        
        return date.toLocaleDateString();
    } catch (error) {
        console.error('Error formatting appointment date:', error);
        return 'Invalid date';
    }
}
