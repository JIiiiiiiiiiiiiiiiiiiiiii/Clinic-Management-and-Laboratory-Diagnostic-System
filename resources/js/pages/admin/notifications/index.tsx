import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell, Search, Eye, CheckCircle, XCircle, Clock, Calendar, User, Stethoscope } from 'lucide-react';
import AdminLayout from '@/layouts/admin-layout';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    data: any;
    read: boolean;
    read_at: string | null;
    created_at: string;
    related_id: number | null;
    related_type: string | null;
}

interface NotificationsIndexProps {
    notifications: {
        data: Notification[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    unreadCount: number;
}

export default function NotificationsIndex({ notifications, unreadCount }: NotificationsIndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const filteredNotifications = notifications.data.filter(notification => {
        const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            notification.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || notification.type === filterType;
        return matchesSearch && matchesType;
    });

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'appointment':
                return <Calendar className="w-5 h-5 text-blue-600" />;
            case 'transfer':
                return <User className="w-5 h-5 text-green-600" />;
            case 'billing':
                return <Stethoscope className="w-5 h-5 text-purple-600" />;
            default:
                return <Bell className="w-5 h-5 text-gray-600" />;
        }
    };

    const getNotificationBadge = (type: string) => {
        switch (type) {
            case 'appointment':
                return 'bg-blue-100 text-blue-800';
            case 'transfer':
                return 'bg-green-100 text-green-800';
            case 'billing':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const markAsRead = async (notificationId: number) => {
        try {
            await fetch(`/admin/notifications/${notificationId}/mark-read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            
            // Refresh the page to update the notification status
            router.reload();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/admin/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            
            router.reload();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    return (
        <AdminLayout>
            <Head title="Notifications" />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                                <p className="text-gray-600 mt-2">
                                    Manage and respond to system notifications
                                    {unreadCount > 0 && (
                                        <Badge className="ml-2 bg-red-100 text-red-800">
                                            {unreadCount} unread
                                        </Badge>
                                    )}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                {unreadCount > 0 && (
                                    <Button
                                        onClick={markAllAsRead}
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Mark All as Read
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search notifications..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Types</option>
                                    <option value="appointment">Appointments</option>
                                    <option value="transfer">Transfers</option>
                                    <option value="billing">Billing</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notifications List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                Notifications ({filteredNotifications.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {filteredNotifications.length === 0 ? (
                                <div className="text-center py-12">
                                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                                    <p className="text-gray-600">You're all caught up!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {filteredNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-6 hover:bg-gray-50 transition-colors ${
                                                !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-4 flex-1">
                                                    <div className="flex-shrink-0">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="text-lg font-medium text-gray-900">
                                                                {notification.title}
                                                            </h3>
                                                            <Badge className={getNotificationBadge(notification.type)}>
                                                                {notification.type}
                                                            </Badge>
                                                            {!notification.read && (
                                                                <Badge className="bg-red-100 text-red-800">
                                                                    New
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-600 mb-3">
                                                            {notification.message}
                                                        </p>
                                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4" />
                                                                {formatDate(notification.created_at)}
                                                            </span>
                                                            {notification.data?.appointment_date && (
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-4 h-4" />
                                                                    {new Date(notification.data.appointment_date).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 ml-4">
                                                    {!notification.read && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-1" />
                                                            Mark Read
                                                        </Button>
                                                    )}
                                                    <Link
                                                        href={`/admin/notifications/${notification.id}`}
                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                                    >
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        View
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
