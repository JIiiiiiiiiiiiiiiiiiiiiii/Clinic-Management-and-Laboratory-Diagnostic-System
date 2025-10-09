import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
    Calendar, 
    Clock, 
    Heart, 
    Stethoscope, 
    Plus,
    Bell
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patient Dashboard',
        href: '/patient/dashboard',
    },
];

interface WorkingAdminDashboardProps {
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

export default function WorkingAdminDashboard({ 
    user, 
    patient, 
    stats, 
    recent_appointments, 
    upcoming_appointments, 
    recent_lab_orders, 
    recent_visits,
    notifications,
    unreadCount
}: WorkingAdminDashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patient Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
                            <p className="text-gray-600">Welcome back, {user.name}! Manage your health appointments and records.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" className="relative">
                                <Bell className="h-4 w-4 mr-2" />
                                Notifications
                                {unreadCount > 0 && (
                                    <Badge className="ml-2 bg-red-500 text-white">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </Button>
                            <Link href="/patient/appointments/create">
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Book Appointment
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_appointments}</div>
                                <p className="text-xs text-muted-foreground">
                                    All time appointments
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.upcoming_appointments}</div>
                                <p className="text-xs text-muted-foreground">
                                    Scheduled appointments
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Lab Results</CardTitle>
                                <Heart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.pending_lab_results}</div>
                                <p className="text-xs text-muted-foreground">
                                    Pending results
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.total_visits}</div>
                                <p className="text-xs text-muted-foreground">
                                    Medical visits
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Upcoming Appointments */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
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
                                            <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="space-y-1">
                                                    <p className="font-medium">{appointment.type}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        with {appointment.specialist}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {appointment.date} at {appointment.time}
                                                    </p>
                                                </div>
                                                <Badge variant={appointment.is_today ? "default" : "secondary"}>
                                                    {appointment.is_today ? "Today" : appointment.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No Upcoming Appointments</h3>
                                        <p className="text-muted-foreground mb-4">Book your next appointment</p>
                                        <Link href="/patient/appointments/create">
                                            <Button>
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
                                    <Clock className="h-5 w-5" />
                                    Recent Appointments
                                </CardTitle>
                                <CardDescription>
                                    Your recent medical visits
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recent_appointments.length > 0 ? (
                                    <div className="space-y-4">
                                        {recent_appointments.slice(0, 3).map((appointment) => (
                                            <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="space-y-1">
                                                    <p className="font-medium">{appointment.type}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        with {appointment.specialist}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {appointment.date} at {appointment.time}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end space-y-1">
                                                    <Badge variant="outline">
                                                        {appointment.status}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        {appointment.billing_status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No Recent Appointments</h3>
                                        <p className="text-muted-foreground">Your appointment history will appear here</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Lab Orders */}
                    {recent_lab_orders.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Heart className="h-5 w-5" />
                                    Recent Lab Orders
                                </CardTitle>
                                <CardDescription>
                                    Your laboratory test orders and results
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recent_lab_orders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-1">
                                                <p className="font-medium">Order #{order.id}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {order.tests.join(', ')}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {order.created_at}
                                                </p>
                                            </div>
                                            <Badge variant={order.status === 'Completed' ? "default" : "secondary"}>
                                                {order.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Stethoscope className="h-5 w-5" />
                                Quick Actions
                            </CardTitle>
                            <CardDescription>
                                Common tasks and shortcuts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Link href="/patient/appointments/create">
                                    <Button variant="outline" className="h-16 w-full">
                                        <Calendar className="mr-2 h-5 w-5" />
                                        Book New Appointment
                                    </Button>
                                </Link>
                                <Link href="/patient/appointments">
                                    <Button variant="outline" className="h-16 w-full">
                                        <Clock className="mr-2 h-5 w-5" />
                                        View All Appointments
                                    </Button>
                                </Link>
                                <Link href="/patient/records">
                                    <Button variant="outline" className="h-16 w-full">
                                        <Stethoscope className="mr-2 h-5 w-5" />
                                        Medical Records
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
