import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Phone, Star, Heart, Shield, Users, Stethoscope, Award, Bell, CheckCircle, TrendingUp, Activity, UserCheck, AlertCircle, BarChart3 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import RealtimeNotificationBell from '@/components/RealtimeNotificationBell';

interface StJamesAdminDashboardProps {
    user: {
        name: string;
        email: string;
        role: string;
    };
    stats: {
        total_appointments: number;
        pending_appointments: number;
        confirmed_appointments: number;
        completed_appointments: number;
        total_patients: number;
        total_doctors: number;
        today_appointments: number;
        online_bookings: number;
    };
    recent_appointments: Array<{
        id: number;
        patient_name: string;
        specialist_name: string;
        appointment_type: string;
        appointment_date: string;
        appointment_time: string;
        status: string;
        booking_method: string;
    }>;
    today_appointments: Array<{
        id: number;
        patient_name: string;
        specialist_name: string;
        appointment_type: string;
        appointment_time: string;
        status: string;
    }>;
    notifications: Array<{
        id: number;
        type: string;
        title: string;
        message: string;
        read: boolean;
        created_at: string;
    }>;
}

export default function StJamesAdminDashboard({ 
    user, 
    stats, 
    recent_appointments, 
    today_appointments,
    notifications 
}: StJamesAdminDashboardProps) {
    return (
        <>
            <Head title="Admin Dashboard - St. James Hospital" />
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50">
                {/* Header with St. James Hospital Branding */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-white rounded-full p-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Stethoscope className="h-8 w-8 text-blue-600" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">St. James Hospital, Inc.</h1>
                                    <p className="text-green-100">Industrial Clinic and Diagnostic Center</p>
                                    <p className="text-sm text-green-200">Brgy. San Isidro, City of Cabuyao, Laguna</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <RealtimeNotificationBell 
                                    userRole="admin"
                                    initialNotifications={notifications}
                                    unreadCount={notifications.filter(n => !n.read).length}
                                />
                                <div className="text-right">
                                    <p className="text-sm text-green-100">Welcome back,</p>
                                    <p className="font-semibold">{user.name}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    {/* Welcome Hero Section */}
                    <div className="text-center mb-12">
                        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Admin Dashboard
                            </h2>
                            <p className="text-xl text-gray-600 mb-8">
                                Manage appointments, patients, and clinic operations efficiently.
                            </p>
                            <div className="flex justify-center gap-4">
                                <Link href={route('admin.appointments.index')}>
                                    <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg">
                                        <Calendar className="mr-2 h-5 w-5" />
                                        Manage Appointments
                                    </Button>
                                </Link>
                                <Link href={route('admin.patients.index')}>
                                    <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-green-600 text-green-600 hover:bg-green-50">
                                        <Users className="mr-2 h-5 w-5" />
                                        View Patients
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Key Statistics */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <Card className="text-center p-6 bg-white shadow-lg border-0 rounded-xl">
                            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-green-600 mb-2">{stats.total_appointments}</h3>
                            <p className="text-gray-600">Total Appointments</p>
                        </Card>

                        <Card className="text-center p-6 bg-white shadow-lg border-0 rounded-xl">
                            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock className="h-8 w-8 text-yellow-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-yellow-600 mb-2">{stats.pending_appointments}</h3>
                            <p className="text-gray-600">Pending Appointments</p>
                        </Card>

                        <Card className="text-center p-6 bg-white shadow-lg border-0 rounded-xl">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserCheck className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-blue-600 mb-2">{stats.total_patients}</h3>
                            <p className="text-gray-600">Total Patients</p>
                        </Card>

                        <Card className="text-center p-6 bg-white shadow-lg border-0 rounded-xl">
                            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Stethoscope className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-purple-600 mb-2">{stats.total_doctors}</h3>
                            <p className="text-gray-600">Available Doctors</p>
                        </Card>
                    </div>

                    {/* Today's Appointments */}
                    {today_appointments.length > 0 && (
                        <Card className="mb-8 p-6 bg-white shadow-lg border-0 rounded-xl">
                            <h3 className="text-2xl font-bold mb-6 flex items-center">
                                <Calendar className="mr-3 h-6 w-6 text-green-600" />
                                Today's Appointments ({today_appointments.length})
                            </h3>
                            <div className="space-y-4">
                                {today_appointments.map((appointment) => (
                                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-lg">{appointment.patient_name}</h4>
                                            <p className="text-gray-600">with {appointment.specialist_name}</p>
                                            <p className="text-sm text-gray-500">{appointment.appointment_type} at {appointment.appointment_time}</p>
                                        </div>
                                        <Badge variant="outline" className="bg-green-100 text-green-800">
                                            {appointment.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Recent Appointments */}
                    {recent_appointments.length > 0 && (
                        <Card className="mb-8 p-6 bg-white shadow-lg border-0 rounded-xl">
                            <h3 className="text-2xl font-bold mb-6 flex items-center">
                                <Clock className="mr-3 h-6 w-6 text-blue-600" />
                                Recent Appointments
                            </h3>
                            <div className="space-y-4">
                                {recent_appointments.map((appointment) => (
                                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-lg">{appointment.patient_name}</h4>
                                            <p className="text-gray-600">with {appointment.specialist_name}</p>
                                            <p className="text-sm text-gray-500">{appointment.appointment_date} at {appointment.appointment_time}</p>
                                            <p className="text-sm text-gray-500">Type: {appointment.appointment_type}</p>
                                        </div>
                                        <div className="flex flex-col items-end space-y-2">
                                            <Badge variant="outline" className="text-xs">
                                                {appointment.status}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                {appointment.booking_method}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        <Card className="p-6 border-0 rounded-xl bg-white shadow-lg">
                            <div className="flex items-center mb-4">
                                <div className="bg-green-100 p-3 rounded-lg mr-4">
                                    <Calendar className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Appointments</h3>
                                    <p className="text-gray-600">Manage all appointments</p>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-4">
                                View, edit, and manage patient appointments. Handle online bookings and confirmations.
                            </p>
                            <Link href={route('admin.appointments.index')}>
                                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Manage Appointments
                                </Button>
                            </Link>
                        </Card>

                        <Card className="p-6 border-0 rounded-xl bg-white shadow-lg">
                            <div className="flex items-center mb-4">
                                <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Pending Requests</h3>
                                    <p className="text-gray-600">Review appointment requests</p>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-4">
                                Review and approve patient appointment requests. Confirm or reject pending bookings.
                            </p>
                            <Link href={route('admin.pending-appointments.index')}>
                                <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    Review Requests
                                </Button>
                            </Link>
                        </Card>

                        <Card className="p-6 border-0 rounded-xl bg-white shadow-lg">
                            <div className="flex items-center mb-4">
                                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Patients</h3>
                                    <p className="text-gray-600">Patient management</p>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-4">
                                Access patient records, medical history, and manage patient information.
                            </p>
                            <Link href={route('admin.patients.index')}>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                    <Users className="mr-2 h-4 w-4" />
                                    Manage Patients
                                </Button>
                            </Link>
                        </Card>

                        <Card className="p-6 border-0 rounded-xl bg-white shadow-lg">
                            <div className="flex items-center mb-4">
                                <div className="bg-purple-100 p-3 rounded-lg mr-4">
                                    <Stethoscope className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Specialists</h3>
                                    <p className="text-gray-600">Doctor management</p>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-4">
                                Manage doctors, specialists, and medical staff. Set availability and schedules.
                            </p>
                            <Link href={route('admin.specialists.index')}>
                                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                                    <Stethoscope className="mr-2 h-4 w-4" />
                                    Manage Specialists
                                </Button>
                            </Link>
                        </Card>

                        <Card className="p-6 border-0 rounded-xl bg-white shadow-lg">
                            <div className="flex items-center mb-4">
                                <div className="bg-orange-100 p-3 rounded-lg mr-4">
                                    <Bell className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Notifications</h3>
                                    <p className="text-gray-600">System notifications</p>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-4">
                                View and manage system notifications. Handle appointment requests and updates.
                            </p>
                            <Link href={route('admin.notifications.index')}>
                                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                                    <Bell className="mr-2 h-4 w-4" />
                                    View Notifications
                                </Button>
                            </Link>
                        </Card>

                        <Card className="p-6 border-0 rounded-xl bg-white shadow-lg">
                            <div className="flex items-center mb-4">
                                <div className="bg-red-100 p-3 rounded-lg mr-4">
                                    <BarChart3 className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Reports</h3>
                                    <p className="text-gray-600">Analytics & reports</p>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-4">
                                Generate reports, view analytics, and export data for clinic operations.
                            </p>
                            <Link href={route('admin.reports.index')}>
                                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    View Reports
                                </Button>
                            </Link>
                        </Card>

                        <Card className="p-6 border-0 rounded-xl bg-white shadow-lg">
                            <div className="flex items-center mb-4">
                                <div className="bg-gray-100 p-3 rounded-lg mr-4">
                                    <Shield className="h-6 w-6 text-gray-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Settings</h3>
                                    <p className="text-gray-600">System settings</p>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-4">
                                Configure system settings, user roles, and clinic preferences.
                            </p>
                            <Link href={route('admin.settings.index')}>
                                <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white">
                                    <Shield className="mr-2 h-4 w-4" />
                                    System Settings
                                </Button>
                            </Link>
                        </Card>
                    </div>

                    {/* System Status */}
                    <Card className="p-6 border-0 rounded-xl bg-white shadow-lg">
                        <h3 className="text-2xl font-bold mb-6 flex items-center">
                            <Activity className="mr-3 h-6 w-6 text-green-600" />
                            System Status
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span className="font-medium">Online Bookings</span>
                                </div>
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span className="font-medium">Notifications</span>
                                </div>
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span className="font-medium">Database</span>
                                </div>
                                <Badge className="bg-green-100 text-green-800">Connected</Badge>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <span className="font-medium">Real-time Updates</span>
                                </div>
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}
