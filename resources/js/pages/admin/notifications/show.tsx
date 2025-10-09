import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, User, CheckCircle, XCircle, Bell, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Notifications', href: '/admin/notifications' },
    { title: 'View Notification', href: '#' },
];

interface NotificationShowProps {
    notification: {
        id: number;
        type: string;
        title: string;
        message: string;
        read: boolean;
        created_at: string;
        data: any;
    };
    appointment?: {
        id: number;
        patient_name: string;
        patient_id: string;
        appointment_type: string;
        specialist_name: string;
        appointment_date: string;
        appointment_time: string;
        status: string;
        notes?: string;
        special_requirements?: string;
        price: number;
    };
}

export default function NotificationShow({ notification, appointment }: NotificationShowProps) {
    const [showApproveForm, setShowApproveForm] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);

    const { data: approveData, setData: setApproveData, post: approvePost, processing: approveProcessing } = useForm({
        appointment_date: appointment?.appointment_date || '',
        appointment_time: appointment?.appointment_time || '',
        notes: appointment?.notes || '',
    });

    const { data: rejectData, setData: setRejectData, post: rejectPost, processing: rejectProcessing } = useForm({
        rejection_reason: '',
    });

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        approvePost(route('admin.notifications.approve-appointment', appointment?.id), {
            onSuccess: () => {
                setShowApproveForm(false);
            },
        });
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        rejectPost(route('admin.notifications.reject-appointment', appointment?.id), {
            onSuccess: () => {
                setShowRejectForm(false);
            },
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notification Details" />
            <div className="min-h-screen bg-gray-50 p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href={route('admin.notifications.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Notifications
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Notification Details</h1>
                            <p className="text-gray-600">Review and manage appointment requests</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Notification Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-blue-600" />
                                {notification.title}
                            </CardTitle>
                            <CardDescription>
                                Received on {formatDate(notification.created_at)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700 mb-4">{notification.message}</p>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    notification.read 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {notification.read ? 'Read' : 'Unread'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appointment Details */}
                    {appointment && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-green-600" />
                                    Appointment Request Details
                                </CardTitle>
                                <CardDescription>
                                    Review the appointment request before approving or rejecting
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Patient Name</Label>
                                            <p className="text-lg font-semibold">{appointment.patient_name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Patient ID</Label>
                                            <p className="text-lg font-semibold">{appointment.patient_id}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Appointment Type</Label>
                                            <p className="text-lg font-semibold">{appointment.appointment_type}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Specialist</Label>
                                            <p className="text-lg font-semibold">{appointment.specialist_name}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Requested Date</Label>
                                            <p className="text-lg font-semibold">{formatDate(appointment.appointment_date)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Requested Time</Label>
                                            <p className="text-lg font-semibold">{formatTime(appointment.appointment_time)}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Status</Label>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                appointment.status === 'Pending' 
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : appointment.status === 'Confirmed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {appointment.status}
                                            </span>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-600">Estimated Cost</Label>
                                            <p className="text-lg font-semibold text-green-600">₱{appointment.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {appointment.notes && (
                                    <div className="mt-6">
                                        <Label className="text-sm font-medium text-gray-600">Notes</Label>
                                        <p className="mt-1 p-3 bg-gray-50 rounded-lg">{appointment.notes}</p>
                                    </div>
                                )}

                                {appointment.special_requirements && (
                                    <div className="mt-4">
                                        <Label className="text-sm font-medium text-gray-600">Special Requirements</Label>
                                        <p className="mt-1 p-3 bg-blue-50 rounded-lg">{appointment.special_requirements}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    {appointment && appointment.status === 'Pending' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-orange-600" />
                                    Take Action
                                </CardTitle>
                                <CardDescription>
                                    Approve or reject this appointment request
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    <Button
                                        onClick={() => setShowApproveForm(true)}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve Appointment
                                    </Button>
                                    <Button
                                        onClick={() => setShowRejectForm(true)}
                                        variant="destructive"
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject Appointment
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Approve Form Modal */}
                    {showApproveForm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <Card className="w-full max-w-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        Approve Appointment
                                    </CardTitle>
                                    <CardDescription>
                                        Confirm the appointment details and approve the request
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleApprove} className="space-y-4">
                                        <div>
                                            <Label htmlFor="appointment_date">Appointment Date *</Label>
                                            <Input
                                                id="appointment_date"
                                                type="date"
                                                value={approveData.appointment_date}
                                                onChange={(e) => setApproveData('appointment_date', e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="appointment_time">Appointment Time *</Label>
                                            <Input
                                                id="appointment_time"
                                                type="time"
                                                value={approveData.appointment_time}
                                                onChange={(e) => setApproveData('appointment_time', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="notes">Additional Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={approveData.notes}
                                                onChange={(e) => setApproveData('notes', e.target.value)}
                                                placeholder="Any additional notes for the patient..."
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setShowApproveForm(false)}
                                                className="flex-1"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={approveProcessing}
                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                            >
                                                {approveProcessing ? 'Approving...' : 'Approve Appointment'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Reject Form Modal */}
                    {showRejectForm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <Card className="w-full max-w-md">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <XCircle className="h-5 w-5 text-red-600" />
                                        Reject Appointment
                                    </CardTitle>
                                    <CardDescription>
                                        Provide a reason for rejecting this appointment request
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleReject} className="space-y-4">
                                        <div>
                                            <Label htmlFor="rejection_reason">Reason for Rejection *</Label>
                                            <Textarea
                                                id="rejection_reason"
                                                value={rejectData.rejection_reason}
                                                onChange={(e) => setRejectData('rejection_reason', e.target.value)}
                                                placeholder="Please provide a reason for rejecting this appointment..."
                                                rows={4}
                                                required
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setShowRejectForm(false)}
                                                className="flex-1"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={rejectProcessing}
                                                variant="destructive"
                                                className="flex-1"
                                            >
                                                {rejectProcessing ? 'Rejecting...' : 'Reject Appointment'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}