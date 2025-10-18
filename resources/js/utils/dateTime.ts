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
