import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Bell, Check, X, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { route } from 'ziggy-js';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: any;
}

interface RealtimeNotificationBellProps {
  initialNotifications?: Notification[];
  unreadCount?: number;
  userRole: 'admin' | 'patient';
}

export default function RealtimeNotificationBell({ 
  initialNotifications = [], 
  unreadCount = 0,
  userRole = 'admin'
}: RealtimeNotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [unreadCountState, setUnreadCountState] = useState(unreadCount);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for updates every 5 seconds
  useEffect(() => {
    const pollForUpdates = async () => {
      try {
        setIsLoading(true);
        const routeName = userRole === 'admin' ? 'admin.realtime.notifications' : 'patient.realtime.notifications';
        const response = await axios.get(route(routeName));
        const { notifications: newNotifications, unread_count, timestamp } = response.data;
        
        // Debug logging
        console.log('Received notifications:', {
          count: newNotifications?.length || 0,
          notifications: newNotifications,
          unread_count,
          timestamp
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
    try {
      const routeName = userRole === 'admin' ? 'admin.realtime.notifications.mark-read' : 'patient.realtime.notifications.mark-read';
      await axios.post(route(routeName, notificationId));
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCountState(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const routeName = userRole === 'admin' ? 'admin.realtime.notifications.mark-all-read' : 'patient.realtime.notifications.mark-all-read';
      await axios.post(route(routeName));
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCountState(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    console.log('Notification clicked:', notification);
    
    // Mark notification as read when clicked
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // For admin users, always redirect to pending appointments for appointment_request notifications
    if (userRole === 'admin' && notification.type === 'appointment_request') {
      // Try to get the specific pending appointment ID
      const pendingId = notification.data?.pending_appointment_id;
      console.log('Notification data:', notification.data);
      console.log('Pending ID:', pendingId);
      
      if (pendingId && pendingId !== 'undefined' && pendingId !== undefined) {
        console.log('Redirecting to specific pending appointment:', pendingId);
        window.location.href = `/admin/pending-appointments/${pendingId}`;
      } else {
        console.log('No specific ID, redirecting to pending appointments index');
        window.location.href = '/admin/pending-appointments';
      }
    } else {
      // For other notification types or patient users, use the general link generation
      const link = getNotificationLink(notification);
      console.log('Generated link:', link);
      
      if (link && link !== '#') {
        window.location.href = link;
      } else {
        console.warn('No valid link generated for notification:', notification);
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
      userRole
    });
    
    if (userRole === 'admin') {
      switch (notification.type) {
        case 'appointment':
          return `/admin/appointments/${notification.data?.appointment_id}`;
        case 'appointment_request':
          // Ensure we have the pending_appointment_id
          const pendingId = notification.data?.pending_appointment_id;
          if (pendingId && pendingId !== 'undefined' && pendingId !== undefined) {
            console.log('Found pending_appointment_id:', pendingId);
            return `/admin/pending-appointments/${pendingId}`;
          }
          // Fallback to pending appointments index if no specific ID
          console.log('No pending_appointment_id found, using fallback');
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
      const routeName = userRole === 'admin' ? 'admin.realtime.notifications' : 'patient.realtime.notifications';
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
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCountState > 99 ? '99+' : unreadCountState}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshNotifications}
              disabled={isLoading}
              className="h-6 px-2 text-xs"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            {unreadCountState > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-6 px-2 text-xs"
              >
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
              className="flex items-start space-x-3 p-4 hover:bg-blue-50 cursor-pointer transition-colors"
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="text-lg flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                    {notification.title}
                  </p>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                  {notification.message}
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  Click to view details →
                </p>
                <p className="text-xs text-gray-400">
                  {formatTimeAgo(notification.created_at)}
                </p>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 text-sm">
            No notifications
          </div>
        )}
        
        {notifications && notifications.length > 5 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={userRole === 'admin' ? "/admin/notifications" : "/patient/appointments"} className="text-center">
                View all notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
        
        {lastUpdate && (
          <div className="px-3 py-2 text-xs text-gray-400 border-t">
            Last updated: {formatTimeAgo(lastUpdate)}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
