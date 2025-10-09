import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Phone, Star, Heart, Shield, Users, Stethoscope, Award, Bell, CheckCircle, TrendingUp, Activity, Plus } from 'lucide-react';
import { Link } from '@inertiajs/react';
import RealtimeNotificationBell from '@/components/RealtimeNotificationBell';

interface PatientDashboardProps {
    user: {
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
    stats: {
        total_appointments: number;
        upcoming_appointments: number;
        completed_appointments: number;
        pending_lab_results: number;
        total_visits: number;
    };
    recent_appointments: Array<{
        id: number;
        type: string;
        specialist: string;
        date: string;
        time: string;
        status: string;
        status_color: string;
        price: string;
        billing_status: string;
    }>;
    upcoming_appointments: Array<{
        id: number;
        type: string;
        specialist: string;
        date: string;
        time: string;
        status: string;
        is_today: boolean;
        is_upcoming: boolean;
    }>;
    recent_lab_orders: Array<{
        id: number;
        created_at: string;
        tests: string[];
        has_results: boolean;
        status: string;
    }>;
    recent_visits: Array<{
        id: number;
        visit_date: string;
        chief_complaint: string;
        diagnosis: string;
        treatment: string;
    }>;
    notifications: Array<{
        id: number;
        type: string;
        title: string;
        message: string;
        read: boolean;
        created_at: string;
        data: any;
    }>;
    unreadCount: number;
}

export default function PatientDashboard({ 
    user, 
    patient, 
    stats, 
    recent_appointments, 
    upcoming_appointments, 
    recent_lab_orders, 
    recent_visits,
    notifications,
    unreadCount
}: PatientDashboardProps) {
    
    return (
        <>
            <Head title="Patient Dashboard" />
            <div className="min-h-screen bg-gray-50">
                <div className="flex">
                    {/* Sidebar */}
                    <div className="w-64 bg-white shadow-lg">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
                                    <Stethoscope className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">St. James Clinic</h2>
                                    <p className="text-sm text-gray-600">Patient Portal</p>
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="space-y-2">
                                <Link
                                    href={route('patient.dashboard')}
                                    className="flex items-center gap-3 px-4 py-3 text-gray-700 bg-blue-50 rounded-lg border-l-4 border-blue-600"
                                >
                                    <Activity className="h-5 w-5" />
                                    <span className="font-medium">Dashboard</span>
                                </Link>
                                
                                <Link
                                    href={route('patient.appointments')}
                                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <Calendar className="h-5 w-5" />
                                    <span>My Appointments</span>
                                </Link>
                                
                                <Link
                                    href={route('patient.appointments.create')}
                                    className="flex items-center gap-3 px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                >
                                    <Plus className="h-5 w-5" />
                                    <span>Book Appointment</span>
                                </Link>
                            </nav>
                        </div>

                        {/* User Info */}
                        <div className="p-6 border-t border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-700">
                                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-600">Patient</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-8">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Welcome back, {user.name}!
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Manage your appointments and health records
                                </p>
                            </div>
                            
                            {/* Notification Bell */}
                            <RealtimeNotificationBell 
                                initialNotifications={notifications}
                                unreadCount={unreadCount}
                                userRole="patient"
                            />
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <Card className="text-center p-6 bg-white shadow-lg">
                                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-blue-600 mb-2">{stats.total_appointments}</h3>
                                <p className="text-gray-600">Total Appointments</p>
                            </Card>

                            <Card className="text-center p-6 bg-white shadow-lg">
                                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-green-600 mb-2">{stats.upcoming_appointments}</h3>
                                <p className="text-gray-600">Upcoming</p>
                            </Card>

                            <Card className="text-center p-6 bg-white shadow-lg">
                                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="h-8 w-8 text-purple-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-purple-600 mb-2">{stats.completed_appointments}</h3>
                                <p className="text-gray-600">Completed</p>
                            </Card>

                            <Card className="text-center p-6 bg-white shadow-lg">
                                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Heart className="h-8 w-8 text-orange-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-orange-600 mb-2">{stats.pending_lab_results}</h3>
                                <p className="text-gray-600">Pending Results</p>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <div className="mb-8">
                            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">Need to see a doctor?</h3>
                                            <p className="text-blue-100">Book your appointment online in just a few clicks</p>
                                        </div>
                                        <Link href={route('patient.appointments.create')}>
                                            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50">
                                                <Plus className="mr-2 h-5 w-5" />
                                                Book Now
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Upcoming Appointments */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                        Upcoming Appointments
                                    </CardTitle>
                                    <CardDescription>
                                        Your scheduled appointments
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {upcoming_appointments.length > 0 ? (
                                        <div className="space-y-4">
                                            {upcoming_appointments.map((appointment) => (
                                                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <h4 className="font-semibold">{appointment.type}</h4>
                                                        <p className="text-sm text-gray-600">{appointment.specialist}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {appointment.date} at {appointment.time}
                                                        </p>
                                                    </div>
                                                    <Badge 
                                                        variant={appointment.status === 'Confirmed' ? 'default' : 'secondary'}
                                                        className={appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' : ''}
                                                    >
                                                        {appointment.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming appointments</h3>
                                            <p className="text-gray-600 mb-4">Book your first appointment to get started</p>
                                            <Link href={route('patient.appointments.create')}>
                                                <Button className="bg-blue-600 hover:bg-blue-700">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Book Appointment
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recent Appointments */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-green-600" />
                                        Recent Appointments
                                    </CardTitle>
                                    <CardDescription>
                                        Your latest appointment history
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {recent_appointments.length > 0 ? (
                                        <div className="space-y-4">
                                            {recent_appointments.slice(0, 3).map((appointment) => (
                                                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <h4 className="font-semibold">{appointment.type}</h4>
                                                        <p className="text-sm text-gray-600">{appointment.specialist}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {appointment.date} at {appointment.time}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge 
                                                            variant="outline"
                                                            className={appointment.status_color}
                                                        >
                                                            {appointment.status}
                                                        </Badge>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {appointment.price}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent appointments</h3>
                                            <p className="text-gray-600">Your appointment history will appear here</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
