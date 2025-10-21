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
        // Handle both time strings (HH:MM:SS) and datetime strings
        let date: Date;
        
        // If it's already a time string (HH:MM:SS), create a date with today's date
        if (typeof timeString === 'string' && timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
            const today = new Date();
            const [hours, minutes, seconds] = timeString.split(':');
            date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 
                          parseInt(hours), parseInt(minutes), parseInt(seconds));
        } else {
            // Handle datetime strings
            date = new Date(timeString);
        }
        
        if (isNaN(date.getTime())) {
            return 'Invalid time';
        }
        
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
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
