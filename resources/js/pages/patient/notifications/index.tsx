import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SharedNavigation from '@/components/SharedNavigation';
import { Head, router, Link } from '@inertiajs/react';
import { Bell, CheckCircle, Clock, Calendar, AlertCircle, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    read: boolean;
    read_at: string | null;
    created_at: string;
    data: any;
    related_id: number | null;
}

interface PatientNotificationsProps {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    patient?: {
        id: number;
        first_name: string;
        last_name: string;
        patient_no: string;
    };
    notifications: Notification[];
    unreadCount: number;
}

export default function PatientNotifications({ 
    user, 
    patient, 
    notifications: initialNotifications = [], 
    unreadCount: initialUnreadCount = 0 
}: PatientNotificationsProps) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const [isLoading, setIsLoading] = useState(false);

    const markAsRead = async (notificationId: number) => {
        // Optimistic update
        setNotifications(prev => 
            prev.map(notif => 
                notif.id === notificationId 
                    ? { ...notif, read: true, read_at: notif.read_at || new Date().toISOString() }
                    : notif
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            await axios.post(route('patient.realtime.notifications.mark-read', notificationId));
        } catch (error) {
            console.error('Error marking notification as read:', error);
            router.reload({ only: ['notifications', 'unreadCount'] });
        }
    };

    const markAllAsRead = async () => {
        // Optimistic update
        setNotifications(prev => 
            prev.map(notif => ({ 
                ...notif, 
                read: true, 
                read_at: notif.read_at || new Date().toISOString() 
            }))
        );
        setUnreadCount(0);

        try {
            await axios.post(route('patient.realtime.notifications.mark-all-read'));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            router.reload({ only: ['notifications', 'unreadCount'] });
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        console.log('Notification clicked:', notification);

        // Mark notification as read when clicked
        if (!notification.read) {
            await markAsRead(notification.id);
        }

        // Handle different notification types for patients
        // Always navigate to safe patient routes to avoid access denied errors
        let targetUrl = '/patient/appointments';

        switch (notification.type) {
            case 'appointment':
            case 'appointment_approved':
            case 'appointment_status_update':
                // Always navigate to appointments list instead of specific appointment
                // to avoid permission issues when trying to access specific appointments
                targetUrl = '/patient/appointments';
                break;
            case 'billing':
            case 'payment':
                targetUrl = '/patient/billing';
                break;
            case 'lab_result':
            case 'test_result':
                targetUrl = '/patient/test-results';
                break;
            case 'medical_record':
            case 'record':
                targetUrl = '/patient/records';
                break;
            default:
                targetUrl = '/patient/appointments';
        }

        // Navigate to the target URL with error handling
        if (targetUrl && targetUrl.startsWith('/patient/')) {
            router.visit(targetUrl, {
                onError: (errors) => {
                    console.warn('Error accessing notification link, redirecting to dashboard:', errors);
                    // If there's an error, redirect to dashboard as safe fallback
                    router.visit('/patient/dashboard');
                },
            });
        } else {
            // Fallback to dashboard if no valid patient link
            router.visit('/patient/dashboard');
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'appointment':
            case 'appointment_approved':
                return <Calendar className="h-5 w-5 text-blue-500" />;
            case 'appointment_status_update':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'billing':
            case 'payment':
                return <AlertCircle className="h-5 w-5 text-green-500" />;
            default:
                return <Bell className="h-5 w-5 text-gray-500" />;
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

    return (
        <SharedNavigation user={user} patient={patient} unreadCount={unreadCount}>
            <Head title="Notifications" />
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/patient/appointments"
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                            <p className="text-gray-600 mt-1">
                                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                            </p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <Button 
                            onClick={markAllAsRead}
                            variant="outline"
                            size="sm"
                            disabled={isLoading}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                            <p className="text-gray-600">You're all caught up! No new notifications.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <Card 
                                key={notification.id}
                                className={`cursor-pointer transition-all hover:shadow-md ${
                                    !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
                                }`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                            {notification.title}
                                                        </h3>
                                                        {!notification.read && (
                                                            <Badge variant="default" className="bg-blue-500 text-white text-xs">
                                                                New
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <span>{formatTimeAgo(notification.created_at)}</span>
                                                        {notification.read && notification.read_at && (
                                                            <span className="flex items-center gap-1">
                                                                <CheckCircle className="h-3 w-3" />
                                                                Read {formatTimeAgo(notification.read_at)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </SharedNavigation>
    );
}

