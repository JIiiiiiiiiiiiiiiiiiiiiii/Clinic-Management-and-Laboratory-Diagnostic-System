/**
 * Safe date display component that prevents "Invalid Date" issues
 * Use this component anywhere dates are displayed
 */

import React from 'react';
import { safeFormatDate, safeFormatTime } from '@/utils/dateTime';
import { DateErrorBoundary } from './DateErrorBoundary';

interface SafeDateDisplayProps {
    date?: string | null;
    time?: string | null;
    showTime?: boolean;
    className?: string;
    fallbackText?: string;
}

export const SafeDateDisplay: React.FC<SafeDateDisplayProps> = ({
    date,
    time,
    showTime = false,
    className = '',
    fallbackText = 'No date set'
}) => {
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return fallbackText;
        return safeFormatDate(dateString);
    };

    const formatTime = (timeString?: string | null) => {
        if (!timeString) return 'No time set';
        return safeFormatTime(timeString);
    };

    return (
        <DateErrorBoundary>
            <div className={className}>
                <div className="date-display">
                    {formatDate(date)}
                </div>
                {showTime && time && (
                    <div className="time-display text-sm text-gray-500">
                        {formatTime(time)}
                    </div>
                )}
            </div>
        </DateErrorBoundary>
    );
};

interface SafeDateTimeDisplayProps {
    dateTime?: string | null;
    className?: string;
    fallbackText?: string;
}

export const SafeDateTimeDisplay: React.FC<SafeDateTimeDisplayProps> = ({
    dateTime,
    className = '',
    fallbackText = 'No date/time set'
}) => {
    const formatDateTime = (dateTimeString?: string | null) => {
        if (!dateTimeString) return fallbackText;
        
        const date = safeFormatDate(dateTimeString);
        const time = safeFormatTime(dateTimeString);
        
        if (date === 'Invalid date' || time === 'Invalid time') {
            return fallbackText;
        }
        
        return `${date} at ${time}`;
    };

    return (
        <DateErrorBoundary>
            <div className={className}>
                {formatDateTime(dateTime)}
            </div>
        </DateErrorBoundary>
    );
};

interface SafeAppointmentDisplayProps {
    appointment: {
        appointment_date?: string | null;
        appointment_time?: string | null;
        created_at?: string | null;
        updated_at?: string | null;
    };
    className?: string;
}

export const SafeAppointmentDisplay: React.FC<SafeAppointmentDisplayProps> = ({
    appointment,
    className = ''
}) => {
    return (
        <DateErrorBoundary>
            <div className={className}>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="font-medium">Appointment Date:</span>
                        <span>{safeFormatDate(appointment.appointment_date)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Appointment Time:</span>
                        <span>{safeFormatTime(appointment.appointment_time)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Created:</span>
                        <span>{safeFormatDate(appointment.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Last Updated:</span>
                        <span>{safeFormatDate(appointment.updated_at)}</span>
                    </div>
                </div>
            </div>
        </DateErrorBoundary>
    );
};

