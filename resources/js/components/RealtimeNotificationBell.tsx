import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { Bell, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { route } from 'ziggy-js';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
    data?: any;
    related_id?: number | null;
    related_type?: string | null;
}

interface RealtimeNotificationBellProps {
    initialNotifications?: Notification[];
    unreadCount?: number;
    userRole: 'admin' | 'patient' | 'doctor' | 'nurse';
}

export default function RealtimeNotificationBell({ initialNotifications = [], unreadCount = 0, userRole = 'admin' }: RealtimeNotificationBellProps) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [unreadCountState, setUnreadCountState] = useState(unreadCount);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<string>('');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Sync unreadCountState when prop changes (e.g., when notifications are marked as read on another page)
    useEffect(() => {
        setUnreadCountState(unreadCount);
    }, [unreadCount]);

    // Poll for updates every 5 seconds
    useEffect(() => {
        const pollForUpdates = async () => {
            try {
                setIsLoading(true);
                // Admin, doctor, and nurse all use the same admin notification route
                const routeName =
                    userRole === 'admin' || userRole === 'doctor' || userRole === 'nurse'
                        ? 'admin.realtime.notifications'
                        : 'patient.realtime.notifications';
                const response = await axios.get(route(routeName));
                const { notifications: newNotifications, unread_count, timestamp } = response.data;

                // Debug logging
                console.log('Received notifications:', {
                    count: newNotifications?.length || 0,
                    notifications: newNotifications,
                    unread_count,
                    timestamp,
                });

                setNotifications(newNotifications);
                setUnreadCountState(unread_count);
                setLastUpdate(timestamp);
            } catch (error) {
                console.error('Failed to fetch notification updates:', error);
            } finally {
                setIsLoading(false);
            }
        };

        // Initial poll
        pollForUpdates();

        // Set up polling interval
        intervalRef.current = setInterval(pollForUpdates, 5000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const markAsRead = async (notificationId: number) => {
        // Optimistic update: update UI immediately
        setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)));
        setUnreadCountState((prev) => Math.max(0, prev - 1));

        try {
            const routeName =
                userRole === 'admin' || userRole === 'doctor' || userRole === 'nurse'
                    ? 'admin.realtime.notifications.mark-read'
                    : 'patient.realtime.notifications.mark-read';
            await axios.post(route(routeName, notificationId));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            // Revert on error by triggering a refresh
            const pollForUpdates = async () => {
                try {
                    const routeName =
                        userRole === 'admin' || userRole === 'doctor' || userRole === 'nurse'
                            ? 'admin.realtime.notifications'
                            : 'patient.realtime.notifications';
                    const response = await axios.get(route(routeName));
                    const { notifications: newNotifications, unread_count } = response.data;
                    setNotifications(newNotifications);
                    setUnreadCountState(unread_count);
                } catch (refreshError) {
                    console.error('Failed to refresh notifications:', refreshError);
                }
            };
            pollForUpdates();
        }
    };

    const markAllAsRead = async () => {
        // Optimistic update: mark all as read immediately
        setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
        setUnreadCountState(0);

        try {
            const routeName =
                userRole === 'admin' || userRole === 'doctor' || userRole === 'nurse'
                    ? 'admin.realtime.notifications.mark-all-read'
                    : 'patient.realtime.notifications.mark-all-read';
            await axios.post(route(routeName));
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            // Revert on error by triggering a refresh
            const pollForUpdates = async () => {
                try {
                    const routeName =
                        userRole === 'admin' || userRole === 'doctor' || userRole === 'nurse'
                            ? 'admin.realtime.notifications'
                            : 'patient.realtime.notifications';
                    const response = await axios.get(route(routeName));
                    const { notifications: newNotifications, unread_count } = response.data;
                    setNotifications(newNotifications);
                    setUnreadCountState(unread_count);
                } catch (refreshError) {
                    console.error('Failed to refresh notifications:', refreshError);
                }
            };
            pollForUpdates();
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        console.log('Notification clicked:', notification);

        // Mark notification as read when clicked
        if (!notification.read) {
            await markAsRead(notification.id);
        }

        // For admin, doctor, and nurse users, always redirect to pending appointments for appointment_request notifications
        if ((userRole === 'admin' || userRole === 'doctor' || userRole === 'nurse') && notification.type === 'appointment_request') {
            // Try to get the specific pending appointment ID from data or related_id
            const pendingId = notification.data?.pending_appointment_id || notification.related_id;
            console.log('Notification data:', notification.data);
            console.log('Pending ID from data:', notification.data?.pending_appointment_id);
            console.log('Related ID:', notification.related_id);
            console.log('Final Pending ID:', pendingId);

            // Validate that we have a valid ID before redirecting
            // If ID is invalid, null, undefined, or 'undefined', redirect to index
            if (pendingId && pendingId !== 'undefined' && pendingId !== undefined && pendingId !== null && !isNaN(Number(pendingId))) {
                // Verify the pending appointment exists before redirecting
                try {
                    const response = await axios.get(route('admin.pending-appointments.show', pendingId), {
                        validateStatus: (status) => status < 500, // Don't throw on 404
                    });

                    if (response.status === 200 || response.status === 404) {
                        // If 404, the pending appointment doesn't exist, redirect to index
                        if (response.status === 404) {
                            console.warn('Pending appointment not found, redirecting to index');
                            window.location.href = '/admin/pending-appointments';
                        } else {
                            console.log('Redirecting to specific pending appointment:', pendingId);
                            window.location.href = `/admin/pending-appointments/${pendingId}`;
                        }
                    } else {
                        // For other errors, redirect to index as fallback
                        console.warn('Error checking pending appointment, redirecting to index');
                        window.location.href = '/admin/pending-appointments';
                    }
                } catch (error: any) {
                    // If there's an error (like 404), redirect to index page
                    console.warn('Failed to verify pending appointment, redirecting to index:', error);
                    window.location.href = '/admin/pending-appointments';
                }
            } else {
                console.log('No valid ID found, redirecting to pending appointments index');
                window.location.href = '/admin/pending-appointments';
            }
        } else {
            // For patient users, handle notification clicks with proper validation
            if (userRole === 'patient') {
                // For appointment approval notifications, always navigate to appointments list
                // to avoid permission issues when trying to access specific appointments
                if (notification.type === 'appointment_approved' || notification.type === 'appointment_status_update') {
                    console.log('Appointment approved/status update notification, redirecting to appointments list');
                    router.visit('/patient/appointments');
                    return;
                }
                
                const link = getNotificationLink(notification);
                console.log('Generated link for patient:', link);

                if (link && link !== '#') {
                    // For other appointment notifications, verify the appointment exists and belongs to the patient
                    if (notification.type === 'appointment' && link.includes('/patient/appointments/')) {
                        const appointmentId = notification.data?.appointment_id || notification.related_id;
                        if (appointmentId) {
                            try {
                                // Use Inertia router to navigate, which will handle 403 errors gracefully
                                router.visit(link, {
                                    onError: (errors) => {
                                        console.warn('Error accessing appointment, redirecting to appointments list:', errors);
                                        router.visit('/patient/appointments');
                                    },
                                });
                            } catch (error) {
                                console.warn('Error navigating to appointment, redirecting to appointments list:', error);
                                router.visit('/patient/appointments');
                            }
                        } else {
                            router.visit('/patient/appointments');
                        }
                    } else {
                        // For other notification types, navigate directly
                        router.visit(link);
                    }
                } else {
                    // Fallback to appointments page if no valid link
                    console.warn('No valid link generated for notification, redirecting to appointments:', notification);
                    router.visit('/patient/appointments');
                }
            } else {
                // For other notification types or non-patient users, use the general link generation
                const link = getNotificationLink(notification);
                console.log('Generated link:', link);

                if (link && link !== '#') {
                    window.location.href = link;
                } else {
                    console.warn('No valid link generated for notification:', notification);
                }
            }
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'appointment':
                return '📅';
            case 'appointment_request':
                return '⏳';
            case 'transfer':
                return '🔄';
            case 'billing':
                return '💳';
            default:
                return '🔔';
        }
    };

    const getNotificationLink = (notification: Notification) => {
        console.log('Generating link for notification:', {
            type: notification.type,
            data: notification.data,
            dataType: typeof notification.data,
            dataKeys: notification.data ? Object.keys(notification.data) : 'no data',
            userRole,
        });

        if (userRole === 'admin' || userRole === 'doctor' || userRole === 'nurse') {
            switch (notification.type) {
                case 'appointment':
                    return `/admin/appointments/${notification.data?.appointment_id}`;
                case 'appointment_request':
                    // Try to get pending_appointment_id from data or related_id
                    const pendingId = notification.data?.pending_appointment_id || notification.related_id;
                    // Validate the ID is valid before using it
                    if (pendingId && pendingId !== 'undefined' && pendingId !== undefined && pendingId !== null && !isNaN(Number(pendingId))) {
                        console.log('Found valid pending_appointment_id:', pendingId);
                        // Note: We don't validate existence here since this is just for link generation
                        // The actual validation happens in handleNotificationClick
                        return `/admin/pending-appointments/${pendingId}`;
                    }
                    // Fallback to pending appointments index if no valid ID
                    console.log('No valid pending_appointment_id found, using fallback');
                    return `/admin/pending-appointments`;
                case 'transfer':
                    return `/admin/patients`;
                case 'billing':
                    return `/admin/billing`;
                default:
                    return '#';
            }
        } else {
            switch (notification.type) {
                case 'appointment':
                case 'appointment_approved':
                    return `/patient/appointments/${notification.data?.appointment_id}`;
                default:
                    return '/patient/appointments';
            }
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const refreshNotifications = async () => {
        try {
            setIsLoading(true);
            const routeName =
                userRole === 'admin' || userRole === 'doctor' || userRole === 'nurse'
                    ? 'admin.realtime.notifications'
                    : 'patient.realtime.notifications';
            const response = await axios.get(route(routeName));
            const { notifications: newNotifications, unread_count, timestamp } = response.data;

            setNotifications(newNotifications);
            setUnreadCountState(unread_count);
            setLastUpdate(timestamp);
        } catch (error) {
            console.error('Failed to refresh notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadCountState > 0 && (
                        <Badge variant="destructive" className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center p-0 text-xs">
                            {unreadCountState > 99 ? '99+' : unreadCountState}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={refreshNotifications} disabled={isLoading} className="h-6 px-2 text-xs">
                            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                        {unreadCountState > 0 && (
                            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-6 px-2 text-xs">
                                Mark all read
                            </Button>
                        )}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {notifications && notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notification) => (
                        <DropdownMenuItem
                            key={notification.id}
                            className="flex cursor-pointer items-start space-x-3 p-4 transition-colors hover:bg-blue-50"
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="flex-shrink-0 text-lg">{getNotificationIcon(notification.type)}</div>
                            <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center justify-between">
                                    <p className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                        {notification.title}
                                    </p>
                                    {!notification.read && <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />}
                                </div>
                                <p className="mb-2 text-sm leading-relaxed text-gray-600">{notification.message}</p>
                                <p className="text-xs font-medium text-blue-600">Click to view details →</p>
                                <p className="text-xs text-gray-400">{formatTimeAgo(notification.created_at)}</p>
                            </div>
                        </DropdownMenuItem>
                    ))
                ) : (
                    <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                )}

                {notifications && notifications.length > 5 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link
                                href={
                                    userRole === 'admin' || userRole === 'doctor' || userRole === 'nurse'
                                        ? '/admin/notifications'
                                        : '/patient/appointments'
                                }
                                className="text-center"
                            >
                                View all notifications
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}

                {lastUpdate && <div className="border-t px-3 py-2 text-xs text-gray-400">Last updated: {formatTimeAgo(lastUpdate)}</div>}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
