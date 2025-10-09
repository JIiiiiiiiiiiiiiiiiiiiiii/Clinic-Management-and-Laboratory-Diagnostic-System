import { Bell, CheckCircle, Clock, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NotificationProps {
    type: 'success' | 'info' | 'warning' | 'error';
    title: string;
    message: string;
    onClose?: () => void;
    autoClose?: boolean;
    duration?: number;
}

export default function AppointmentNotification({ 
    type, 
    title, 
    message, 
    onClose, 
    autoClose = true, 
    duration = 5000 
}: NotificationProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => onClose?.(), 300);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [autoClose, duration, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'info':
                return <Bell className="h-5 w-5 text-blue-600" />;
            case 'warning':
                return <Clock className="h-5 w-5 text-yellow-600" />;
            case 'error':
                return <X className="h-5 w-5 text-red-600" />;
            default:
                return <Bell className="h-5 w-5 text-gray-600" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'info':
                return 'bg-blue-50 border-blue-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${getBgColor()} border rounded-lg shadow-lg transform transition-all duration-300 ease-in-out`}>
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {getIcon()}
                    </div>
                    <div className="ml-3 w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">{title}</p>
                        <p className="mt-1 text-sm text-gray-500">{message}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={handleClose}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Hook for managing appointment notifications
export function useAppointmentNotifications() {
    const [notifications, setNotifications] = useState<Array<{
        id: string;
        type: 'success' | 'info' | 'warning' | 'error';
        title: string;
        message: string;
    }>>([]);

    const addNotification = (notification: Omit<typeof notifications[0], 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        setNotifications(prev => [...prev, { ...notification, id }]);
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const showBookingConfirmation = (doctorName: string, date: string, time: string) => {
        addNotification({
            type: 'success',
            title: 'Appointment Booked Successfully!',
            message: `Your appointment with ${doctorName} on ${date} at ${time} has been confirmed. You will receive an email confirmation shortly.`
        });
    };

    const showBookingReminder = (doctorName: string, date: string, time: string) => {
        addNotification({
            type: 'info',
            title: 'Appointment Reminder',
            message: `You have an appointment with ${doctorName} tomorrow (${date}) at ${time}. Please arrive 15 minutes early.`
        });
    };

    const showCancellationConfirmation = (doctorName: string, date: string) => {
        addNotification({
            type: 'warning',
            title: 'Appointment Cancelled',
            message: `Your appointment with ${doctorName} on ${date} has been cancelled. You can book a new appointment anytime.`
        });
    };

    const showRescheduleConfirmation = (doctorName: string, oldDate: string, newDate: string, time: string) => {
        addNotification({
            type: 'success',
            title: 'Appointment Rescheduled',
            message: `Your appointment with ${doctorName} has been moved from ${oldDate} to ${newDate} at ${time}.`
        });
    };

    return {
        notifications,
        addNotification,
        removeNotification,
        showBookingConfirmation,
        showBookingReminder,
        showCancellationConfirmation,
        showRescheduleConfirmation
    };
}
