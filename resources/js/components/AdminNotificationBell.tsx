import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle } from 'lucide-react';

interface AdminNotificationBellProps {
    initialUnreadCount?: number;
}

export default function AdminNotificationBell({ initialUnreadCount = 0 }: AdminNotificationBellProps) {
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch unread count periodically
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const response = await fetch('/admin/notifications/unread-count');
                const data = await response.json();
                setUnreadCount(data.count);
            } catch (error) {
                console.error('Error fetching unread count:', error);
            }
        };

        // Fetch immediately
        fetchUnreadCount();

        // Set up polling every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(interval);
    }, []);

    const markAllAsRead = async () => {
        setIsLoading(true);
        try {
            await fetch('/admin/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {unreadCount > 0 && (
                <Button
                    onClick={markAllAsRead}
                    disabled={isLoading}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {isLoading ? 'Marking...' : 'Mark All Read'}
                </Button>
            )}
            
            <Link
                href="/admin/notifications"
                className="relative inline-flex items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <Badge 
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                )}
            </Link>
        </div>
    );
}
